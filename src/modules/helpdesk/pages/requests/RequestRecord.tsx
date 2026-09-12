import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Edit,
} from "lucide-react";
import {
  requestApi,
  type Request,
  type RequestedItem,
  type CatalogTask,
  type RequestApproval,
} from "../../services/requests/requestApi";

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-800",
  work_in_progress: "bg-yellow-100 text-yellow-800",
  closed_complete: "bg-green-100 text-green-800",
  closed_incomplete: "bg-orange-100 text-orange-800",
  closed_canceled: "bg-red-100 text-red-800",
  pending_approval: "bg-purple-100 text-purple-800",
  pending: "bg-purple-100 text-purple-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  not_started: "bg-gray-100 text-gray-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  complete: "bg-green-100 text-green-800",
  partial: "bg-orange-100 text-orange-800",
  failed: "bg-red-100 text-red-800",
};

export default function RequestRecord() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<Request | null>(null);
  const [ritms, setRitms] = useState<RequestedItem[]>([]);
  const [tasks, setTasks] = useState<CatalogTask[]>([]);
  const [approvals, setApprovals] = useState<RequestApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [reqRes, ritmRes] = await Promise.all([
        requestApi.getRequest(id),
        requestApi.listRITMs({ requestId: id, limit: 100 }),
      ]);
      setRequest(reqRes.data.data);
      setRitms(ritmRes.data.data.items || []);
      // Load tasks and approvals for each RITM
      const allTasks: CatalogTask[] = [];
      const allApprovals: RequestApproval[] = [];
      for (const ritm of ritmRes.data.data.items || []) {
        const [taskRes, approvalRes] = await Promise.all([
          requestApi.listCatalogTasks({ requestedItemId: ritm._id }),
          requestApi.listRequestApprovals({ requestedItemId: ritm._id }),
        ]);
        allTasks.push(...(taskRes.data.data || []));
        allApprovals.push(...(approvalRes.data.data || []));
      }
      setTasks(allTasks);
      setApprovals(allApprovals);
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const handleTransition = async (status: string) => {
    if (!id) return;
    try {
      await requestApi.transitionRequest(id, { status });
      loadData();
    } catch {
      // Error handled silently
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">Loading...</div>
    );
  if (!request)
    return (
      <div className="flex items-center justify-center h-64">
        Request not found
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/requests")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{request.number}</h1>
          <p className="text-muted-foreground">{request.title}</p>
        </div>
        <Badge className={statusColors[request.status] || "bg-gray-100"}>
          {request.status.replace(/_/g, " ").toUpperCase()}
        </Badge>
        {request.status === "open" && (
          <Button onClick={() => handleTransition("work_in_progress")}>
            Start Work
          </Button>
        )}
        {request.status === "work_in_progress" && (
          <Button onClick={() => handleTransition("closed_complete")}>
            Complete
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="ritms">
            Requested Items ({ritms.length})
          </TabsTrigger>
          <TabsTrigger value="tasks">
            Fulfillment Tasks ({tasks.length})
          </TabsTrigger>
          <TabsTrigger value="approvals">
            Approvals ({approvals.length})
          </TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Request Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Number</span>
                <p className="font-medium">{request.number}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Status</span>
                <p>
                  <Badge className={statusColors[request.status]}>
                    {request.status.replace(/_/g, " ")}
                  </Badge>
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Requester</span>
                <p className="font-medium">{request.requester?.name}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Requested For
                </span>
                <p className="font-medium">{request.requestedFor?.name}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Priority</span>
                <p className="font-medium capitalize">{request.priority}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Source</span>
                <p className="font-medium capitalize">{request.source}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Total Cost
                </span>
                <p className="font-medium">${request.totalCost?.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Items</span>
                <p className="font-medium">{request.itemCount}</p>
              </div>
              {request.description && (
                <div className="col-span-2">
                  <span className="text-sm text-muted-foreground">
                    Description
                  </span>
                  <p>{request.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ritms" className="space-y-4">
          {ritms.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No requested items
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {ritms.map((ritm) => (
                <Card
                  key={ritm._id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/ritms/${ritm._id}`)}
                >
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {ritm.number} — {ritm.catalogItemName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {ritm.quantity} | ${ritm.totalPrice?.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[ritm.status]}>
                        {ritm.status.replace(/_/g, " ")}
                      </Badge>
                      <Badge className={statusColors[ritm.fulfillmentStatus]}>
                        {ritm.fulfillmentStatus.replace(/_/g, " ")}
                      </Badge>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No fulfillment tasks
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {tasks
                .sort((a, b) => a.order - b.order)
                .map((task) => (
                  <Card key={task._id}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        {task.status === "closed_complete" ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : task.status === "work_in_progress" ? (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        ) : task.status === "closed_skipped" ? (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium">
                            {task.number} — {task.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Step {task.order} |{" "}
                            {task.assignedTo?.name || "Unassigned"}
                          </p>
                        </div>
                      </div>
                      <Badge className={statusColors[task.status]}>
                        {task.status.replace(/_/g, " ")}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          {approvals.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No approvals pending
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {approvals.map((approval) => (
                <Card key={approval._id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">
                          Approval for {approval.mode} chain
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {approval.approvalCount}/{approval.requiredApprovals}{" "}
                          approvals received
                        </p>
                      </div>
                      <Badge className={statusColors[approval.status]}>
                        {approval.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {approval.approvers.map((a, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm"
                        >
                          <span>Approver #{idx + 1}</span>
                          <Badge className={statusColors[a.status]}>
                            {a.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Activity timeline coming soon
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

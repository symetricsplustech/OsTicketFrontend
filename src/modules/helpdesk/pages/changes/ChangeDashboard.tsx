import React, { useState, useEffect } from "react";
import {
  changeApi,
  Change,
} from "@modules/helpdesk/services/changes/changeApi";
import { formatDate } from "@shared/lib/format";
import { useNavigate } from "react-router-dom";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  assess: "bg-yellow-100 text-yellow-800",
  authorize: "bg-purple-100 text-purple-800",
  scheduled: "bg-cyan-100 text-cyan-800",
  implement: "bg-orange-100 text-orange-800",
  review: "bg-indigo-100 text-indigo-800",
  closed: "bg-gray-100 text-gray-800",
  canceled: "bg-red-100 text-red-800",
};

export default function ChangeDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    authorized: 0,
    scheduled: 0,
    implementing: 0,
  });
  const [recentChanges, setRecentChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await changeApi.list({ limit: 10 });
        const items = res.data.items || [];
        setRecentChanges(items);
        setStats({
          total: res.data.total || 0,
          draft: items.filter((c: Change) =>
            ["new", "assess"].includes(c.status),
          ).length,
          authorized: items.filter((c: Change) => c.status === "authorize")
            .length,
          scheduled: items.filter((c: Change) => c.status === "scheduled")
            .length,
          implementing: items.filter((c: Change) =>
            ["implement", "review"].includes(c.status),
          ).length,
        });
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Change Dashboard</h1>
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-gray-900" },
          { label: "Draft", value: stats.draft, color: "text-blue-600" },
          {
            label: "Authorized",
            value: stats.authorized,
            color: "text-purple-600",
          },
          {
            label: "Scheduled",
            value: stats.scheduled,
            color: "text-cyan-600",
          },
          {
            label: "Implementing",
            value: stats.implementing,
            color: "text-orange-600",
          },
        ].map((card) => (
          <div key={card.label} className="card p-4 text-center">
            <div className={`text-3xl font-bold ${card.color}`}>
              {card.value}
            </div>
            <div className="text-sm text-gray-500 mt-1">{card.label}</div>
          </div>
        ))}
      </div>
      <div className="card p-6">
        <h2 className="font-semibold mb-4">Recent Changes</h2>
        <div className="space-y-2">
          {recentChanges.map((chg) => (
            <div
              key={chg._id}
              className="flex items-center justify-between border rounded p-3 hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/changes/${chg._id}`)}
            >
              <div>
                <span className="font-medium">
                  {chg.number}: {chg.title}
                </span>
                <span className="ml-2 text-xs text-gray-500">
                  {formatDate(chg.createdAt)}
                </span>
              </div>
              <div className="flex gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs ${STATUS_COLORS[chg.status] || "bg-gray-100"}`}
                >
                  {chg.status}
                </span>
                <span className="text-xs text-gray-500">
                  {chg.type} | {chg.risk}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

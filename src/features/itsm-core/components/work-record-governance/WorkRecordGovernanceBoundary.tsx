import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, LockKeyhole, Search } from "lucide-react";
import type { AuditEvent } from "../../api/auditApi";
import type { ScreenDefinition } from "../../models/screen";
import { WorkRecordAccessBanner, type WorkRecordView } from "./WorkRecordAccessBanner";
import { WorkRecordContextPanel } from "./WorkRecordContextPanel";
import { WorkRecordLoadingState, WorkRecordStatusState } from "./WorkRecordStatusState";

type Route = ScreenDefinition & { group: string };

export function WorkRecordGovernanceBoundary({ screen, routes, scope, events, children }: {
  screen: ScreenDefinition;
  routes: Route[];
  scope: string;
  events: AuditEvent[];
  children: ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (new URLSearchParams(location.search).get("view") as WorkRecordView | null) ?? "ready";
  const setState = (value: WorkRecordView) => {
    const params = new URLSearchParams(location.search);
    value === "ready" ? params.delete("view") : params.set("view", value);
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  };
  const body = state === "loading"
    ? <WorkRecordLoadingState scope={scope} />
    : state === "empty"
      ? <WorkRecordStatusState icon={Search} title={`No ${scope.toLowerCase()} data`} detail="No records match the active scope." action="Show data" onAction={() => setState("ready")} />
      : state === "error"
        ? <WorkRecordStatusState icon={AlertCircle} title={`${scope} data unavailable`} detail="Retry without losing the current route." action="Retry" onAction={() => setState("ready")} />
        : state === "denied"
          ? <WorkRecordStatusState icon={LockKeyhole} title="Permission required" detail={`Your backend role cannot access ${screen.title}.`} action="Return home" onAction={() => navigate(routes[0].path.replace(":instanceId", location.pathname.split("/")[2] || "demo"))} />
          : <div className="space-y-6">{children}<WorkRecordContextPanel screen={screen} routes={routes} scope={scope} events={events} /></div>;
  return <div className="space-y-4"><WorkRecordAccessBanner scope={scope} state={state} setState={setState} />{body}</div>;
}

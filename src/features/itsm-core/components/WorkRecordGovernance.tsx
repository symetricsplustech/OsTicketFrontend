import { createContext, type ReactNode, useContext } from "react";
import toast from "react-hot-toast";
import { selectPermissions } from "@shared/auth/authSlice";
import { useAppSelector } from "@shared/store/hooks";
import { useListAuditEventsQuery } from "../api/auditApi";
import { canWriteWorkRecord } from "../authorization/workRecordPermissions";
import type { ScreenDefinition } from "../models/screen";
import { WorkRecordGovernanceBoundary } from "./work-record-governance/WorkRecordGovernanceBoundary";

type Route = ScreenDefinition & { group: string };
type Access = {
  canWrite: boolean;
  authorize: (action: string, target: string) => boolean;
  audit: (action: string, target: string) => void;
};

const AccessContext = createContext<Access>({
  canWrite: false,
  authorize: () => false,
  audit: () => undefined,
});

export function WorkRecordGovernance({ screen, routes, scope, children }: {
  screen: ScreenDefinition;
  routes: Route[];
  namespace: string;
  scope: string;
  children: ReactNode;
}) {
  const permissions = useAppSelector(selectPermissions);
  const canWrite = canWriteWorkRecord(permissions, screen);
  const { data: events = [], refetch } = useListAuditEventsQuery({
    entityType: screen.module,
    limit: 50,
  });
  const authorize = (action: string, target: string) => {
    if (canWrite) return true;
    toast.error(`Permission denied: ${action} on ${target}`);
    return false;
  };
  const audit = () => void refetch();

  return (
    <AccessContext.Provider value={{ canWrite, authorize, audit }}>
      <WorkRecordGovernanceBoundary screen={screen} routes={routes} scope={scope} events={events}>
        {children}
      </WorkRecordGovernanceBoundary>
    </AccessContext.Provider>
  );
}

export function useWorkRecordAccess() {
  return useContext(AccessContext);
}

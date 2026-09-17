import api from "@shared/lib/api";
import type { OperationalRecord } from "../types/OperationalRecord";

export type OperationalDepartment = OperationalRecord;

const base = () => {
  const instanceId = localStorage.getItem("activeInstanceId");
  if (!instanceId) throw new Error("Select an instance first");
  return `/instances/${instanceId}/departments`;
};

export const instanceDepartmentApi = {
  list: async () => (await api.get<{ items: OperationalDepartment[] }>(base())).data.items,
  linkUnit: async (departmentId: string, organizationUnit: string | null) =>
    api.put(`${base()}/${departmentId}/organization-unit`, { organizationUnit }),
};

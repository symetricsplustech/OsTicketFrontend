import api from "@shared/lib/api";
import type { OperationalRecord } from "../types/OperationalRecord";

const base = () => {
  const instanceId = localStorage.getItem("activeInstanceId");
  if (!instanceId) throw new Error("Select an instance first");
  return `/instances/${instanceId}/teams`;
};

export const instanceTeamApi = {
  list: async () => (await api.get<{ items: OperationalRecord[] }>(base())).data.items,
  linkUnit: async (teamId: string, organizationUnit: string | null) =>
    api.put(`${base()}/${teamId}/organization-unit`, { organizationUnit }),
};

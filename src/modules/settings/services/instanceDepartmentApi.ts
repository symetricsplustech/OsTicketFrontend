import api from "@shared/lib/api";

export type OperationalDepartment = {
  _id: string;
  name: string;
  organizationUnit?: { _id: string; name: string; type: string } | null;
};

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

import api from "@shared/lib/api";

export type InstanceMember = {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  organizationUnit: string | null;
};

const base = () => {
  const id = localStorage.getItem("activeInstanceId");
  if (!id) throw new Error("Select an instance first");
  return `/instances/${id}/members`;
};

export const instanceMemberApi = {
  list: async () => (await api.get<{ items: InstanceMember[] }>(base())).data.items,
  place: async (userId: string, organizationUnit: string | null) =>
    api.put(`${base()}/${userId}/organization-unit`, { organizationUnit }),
};

import api from "@shared/lib/api";

export type InstanceCompany = {
  _id: string;
  name: string;
  domain: string;
  email: string;
  phone: string;
  address: string;
  status: "active" | "inactive";
  isPrimary: boolean;
};

export type CompanyInput = Pick<InstanceCompany, "name" | "domain" | "email" | "phone" | "address">;

const base = () => {
  const instanceId = localStorage.getItem("activeInstanceId");
  if (!instanceId) throw new Error("Select an instance first");
  return `/instances/${instanceId}/companies`;
};

export const instanceCompanyApi = {
  list: async () => (await api.get<{ items: InstanceCompany[] }>(base())).data.items,
  create: async (input: CompanyInput) =>
    (await api.post<{ item: InstanceCompany }>(base(), input)).data.item,
  update: async (id: string, input: Partial<CompanyInput> & { status?: InstanceCompany["status"] }) =>
    (await api.put<{ item: InstanceCompany }>(`${base()}/${id}`, input)).data.item,
};

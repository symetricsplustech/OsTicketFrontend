import api from "@shared/lib/api";

export type UnitType = { type: string; label: string; legacy?: boolean };
export type Unit = {
  _id: string;
  name: string;
  type: string;
  parent?: { _id: string; name: string } | null;
  instanceCompany?: { _id: string; name: string; isPrimary: boolean } | null;
};

export const organizationHierarchyApi = {
  listTypes: async () => (await api.get<{ items: UnitType[] }>(`${base()}/organization-unit-types`)).data.items,
  createType: async (input: { type: string; label: string }) =>
    api.post(`${base()}/organization-unit-types`, input),
  listUnits: async () => (await api.get<{ items: Unit[] }>(`${base()}/organization-units`)).data.items,
  createUnit: async (input: { name: string; type: string; parent: string | null; instanceCompany: string }) =>
    api.post(`${base()}/organization-units`, input),
  updateUnit: async (id: string, input: { parent: string | null; instanceCompany: string }) =>
    api.put(`${base()}/organization-units/${id}`, input),
  removeUnit: async (id: string) => api.delete(`${base()}/organization-units/${id}`),
};

function base() {
  const instanceId = localStorage.getItem("activeInstanceId");
  if (!instanceId) throw new Error("Select an instance first");
  return `/instances/${instanceId}`;
}

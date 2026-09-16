import api from "@shared/lib/api";

export type InstanceMembership = {
  _id: string;
  name: string;
  domain: string;
  instanceStatus: string;
  membershipStatus: string;
  role: string;
};
type Selection = {
  token: string;
  role: string;
  instance: { _id: string; name: string; status: string };
  moduleKeys: string[];
};

export const instanceApi = {
  list: async () => (await api.get<{ instances: InstanceMembership[] }>("/instances/my-instances")).data.instances,
  create: async (name: string, domain: string) =>
    (await api.post<{ instance: { _id: string } }>("/instances", { name, domain })).data.instance,
  select: async (id: string) => (await api.post<Selection>(`/instances/${id}/select`, {})).data,
  accept: async (id: string, token: string) =>
    api.post(`/instances/${id}/accept-invitation`, { token }),
};

export function enterInstance(selection: Selection) {
  localStorage.setItem("token", selection.token);
  localStorage.setItem("activeInstanceId", selection.instance._id);
  const stored = JSON.parse(localStorage.getItem("user") || "{}");
  localStorage.setItem("user", JSON.stringify({
    user: { ...stored.user, instanceRole: selection.role }, tenant: selection.instance,
  }));
  window.location.assign("/");
}

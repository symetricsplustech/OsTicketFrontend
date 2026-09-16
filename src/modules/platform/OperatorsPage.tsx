import { useEffect, useState } from "react";
import api from "@shared/lib/api";

type Operator = {
  _id: string;
  name: string;
  email: string;
  platformRole: string;
  isActive: boolean;
};
const roles = [
  "platform_owner",
  "platform_administrator",
  "platform_operations_administrator",
  "platform_support_administrator",
  "platform_security_administrator",
  "platform_auditor",
];

export default function OperatorsPage() {
  const [items, setItems] = useState<Operator[]>([]);
  const [error, setError] = useState("");
  const load = async () => {
    try {
      const response = await api.get<{ operators: Operator[] }>(
        "/platform/operators",
      );
      setItems(response.data.operators);
    } catch {
      setError("Unable to load platform operators.");
    }
  };
  useEffect(() => {
    load();
  }, []);
  const add = async () => {
    const name = window.prompt("Operator name");
    const email = window.prompt("Operator email");
    const password = window.prompt("Temporary password");
    if (!name || !email || !password) return;
    try {
      await api.post("/platform/operators", {
        name,
        email,
        password,
        platformRole: "platform_support_administrator",
      });
      await load();
    } catch {
      setError("Unable to create operator.");
    }
  };
  const changeRole = async (item: Operator, platformRole: string) => {
    try {
      await api.patch(`/platform/operators/${item._id}`, { platformRole });
      await load();
    } catch {
      setError("Unable to update operator.");
    }
  };
  const toggle = async (item: Operator) => {
    try {
      await api.patch(`/platform/operators/${item._id}`, {
        isActive: !item.isActive,
      });
      await load();
    } catch {
      setError("Unable to update operator.");
    }
  };
  const remove = async (item: Operator) => {
    if (!window.confirm(`Delete ${item.name}?`)) return;
    try {
      await api.delete(`/platform/operators/${item._id}`);
      await load();
    } catch {
      setError("Unable to delete operator.");
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-brand-600">
            Access governance
          </p>
          <h1 className="mt-1 text-2xl font-bold">Platform operators</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage the people who can administer the SaaS platform.
          </p>
        </div>
        <button
          onClick={add}
          className="rounded bg-brand-600 px-4 py-2 text-sm text-white"
        >
          Add operator
        </button>
      </div>
      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="rounded-lg border bg-white shadow-sm divide-y">
        {items.map((item) => (
          <div
            key={item._id}
            className="flex flex-wrap items-center justify-between gap-4 p-5"
          >
            <div>
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-gray-500">{item.email}</div>
            </div>
            <select
              value={item.platformRole}
              onChange={(e) => changeRole(item, e.target.value)}
              className="rounded border px-2 py-1 text-sm"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <span
              className={
                item.isActive
                  ? "text-sm text-green-700"
                  : "text-sm text-gray-500"
              }
            >
              {item.isActive ? "Active" : "Inactive"}
            </span>
            <button
              onClick={() => toggle(item)}
              className="text-sm text-brand-600"
            >
              {item.isActive ? "Deactivate" : "Activate"}
            </button>
            <button
              onClick={() => remove(item)}
              className="text-sm text-red-600"
            >
              Delete
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="p-5 text-sm text-gray-500">
            No platform operators found.
          </p>
        )}
      </div>
    </div>
  );
}

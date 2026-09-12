import React, { useMemo, useState } from "react";
import { Search, ShieldAlert } from "lucide-react";
import { ITSM_MODULES } from "@shared/permissions";

interface Props {
  value: string[];
  onChange: (permissions: string[]) => void;
  disabled?: boolean;
}

const HIGH_RISK =
  /(?:delete|export|override|approve|reject|demote|bulk_|manage_access|break_glass|revoke|unmask)/;

function resourceName(permission: string, moduleKey: string) {
  const remainder = permission.slice(`itsm.${moduleKey}.`.length);
  const parts = remainder.split(".");
  return parts.length > 1 ? parts[0] : "workflow actions";
}

function labelFor(permission: string, moduleKey: string) {
  return permission
    .slice(`itsm.${moduleKey}.`.length)
    .replace(/\./g, " › ")
    .replace(/_/g, " ");
}

export default function ItsmPermissionPicker({
  value,
  onChange,
  disabled = false,
}: Props) {
  const [moduleNumber, setModuleNumber] = useState(1);
  const [query, setQuery] = useState("");
  const active = ITSM_MODULES.find((module) => module.number === moduleNumber)!;
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle
      ? active.permissions.filter((permission) => permission.includes(needle))
      : active.permissions;
  }, [active, query]);
  const groups = useMemo(() => {
    const result = new Map<string, string[]>();
    visible.forEach((permission) => {
      const resource = resourceName(permission, active.key);
      result.set(resource, [...(result.get(resource) || []), permission]);
    });
    return [...result.entries()];
  }, [active, visible]);
  const selectedInModule = active.permissions.filter((permission) =>
    value.includes(permission),
  ).length;

  const toggle = (permission: string, checked: boolean) => {
    onChange(
      checked
        ? [...new Set([...value, permission])]
        : value.filter((key) => key !== permission),
    );
  };
  const replaceModule = (selected: boolean) => {
    const withoutModule = value.filter(
      (key) => !active.permissions.includes(key as never),
    );
    onChange(
      selected ? [...withoutModule, ...active.permissions] : withoutModule,
    );
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50">
      <div className="flex gap-1 overflow-x-auto border-b bg-white p-2">
        {ITSM_MODULES.map((module) => {
          const count = module.permissions.filter((permission) =>
            value.includes(permission),
          ).length;
          return (
            <button
              key={module.number}
              type="button"
              onClick={() => {
                setModuleNumber(module.number);
                setQuery("");
              }}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium ${module.number === moduleNumber ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
            >
              {module.number}. {module.label}{" "}
              {count > 0 && <span className="ml-1 opacity-75">({count})</span>}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b p-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Module {active.number}: {active.label}
          </p>
          <p className="text-xs text-gray-500">
            {selectedInModule} of {active.permissions.length} permissions
            selected
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter permissions"
              className="rounded-lg border py-2 pl-8 pr-3 text-sm"
            />
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={() => replaceModule(true)}
            className="text-xs font-medium text-brand-600 disabled:opacity-50"
          >
            Select module
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => replaceModule(false)}
            className="text-xs text-gray-500 disabled:opacity-50"
          >
            Clear module
          </button>
        </div>
      </div>
      <div className="max-h-[30rem] overflow-y-auto p-3">
        {groups.map(([resource, permissions]) => (
          <section
            key={resource}
            className="mb-4 rounded-lg border bg-white p-3"
          >
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
              {resource.replace(/_/g, " ")}
            </h4>
            <div className="grid gap-1 md:grid-cols-2 xl:grid-cols-3">
              {permissions.map((permission) => (
                <label
                  key={permission}
                  className="flex items-start gap-2 rounded px-2 py-1.5 hover:bg-gray-50"
                  title={permission}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded border-gray-300 text-brand-600"
                    disabled={disabled}
                    checked={value.includes(permission)}
                    onChange={(event) =>
                      toggle(permission, event.target.checked)
                    }
                  />
                  <span className="min-w-0 text-xs text-gray-700">
                    <span className="break-words">
                      {labelFor(permission, active.key)}
                    </span>
                    {HIGH_RISK.test(permission) && (
                      <ShieldAlert
                        className="ml-1 inline h-3 w-3 text-amber-500"
                        aria-label="High-risk permission"
                      />
                    )}
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}
        {groups.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-500">
            No permissions match this filter.
          </p>
        )}
      </div>
    </div>
  );
}

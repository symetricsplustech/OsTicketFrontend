import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { AlertCircle, RotateCcw, Save } from "lucide-react";
import { SaasAdminScreen } from "../SaasAdminScreen";
import { StatCard } from "../ui";
import { Button } from "@components/common/ui";
import { apiErrorMessage } from "@services/saasadmin";
import type { ConfigPanelConfig } from "./types";
import { extractValue } from "./helpers";
import { FormGrid, validateRequiredFields } from "./FormFields";
import { MutationBridge } from "./MutationBridge";

interface ConfigPanelScreenProps {
  config: ConfigPanelConfig;
}

export function ConfigPanelScreen({ config }: ConfigPanelScreenProps) {
  const structureKey = `${config.path}:${config.useUpdate ? "update" : "readonly"}`;
  return <ConfigPanelContent key={structureKey} config={config} />;
}

function ConfigPanelContent({ config }: ConfigPanelScreenProps) {
  const result = config.useGet(undefined);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [initialForm, setInitialForm] = useState<Record<string, unknown>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const updateTriggerRef = useRef<
    ((body?: unknown) => Promise<unknown>) | null
  >(null);

  const value = useMemo(() => extractValue(result.data), [result.data]);

  useEffect(() => {
    if (!initialized && value !== undefined && value !== null) {
      const values = config.getValues(value);
      setForm(values);
      setInitialForm(values);
      setInitialized(true);
    }
  }, [value, initialized, config]);

  const dirty = useMemo(
    () => initialized && JSON.stringify(form) !== JSON.stringify(initialForm),
    [form, initialForm, initialized],
  );

  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const reset = useCallback(() => {
    setForm(initialForm);
    setFormErrors({});
  }, [initialForm]);

  const save = async () => {
    if (!updateTriggerRef.current) return;
    const errors = validateRequiredFields(config.fields, form);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSaving(true);
    try {
      await updateTriggerRef.current(config.buildBody(form));
      setInitialForm(form);
      toast.success(config.savedMessage ?? `${config.title} saved.`);
    } catch (cause) {
      toast.error(apiErrorMessage((cause as { data?: unknown }).data));
    } finally {
      setSaving(false);
    }
  };

  const version = config.getVersion?.(value);

  const breadcrumbs = [
    { label: "SaaS Admin" },
    { label: config.sectionLabel },
    { label: config.title },
  ];

  const stats = config.stats?.(value) ?? [];

  return (
    <SaasAdminScreen
      title={config.title}
      description={config.description}
      breadcrumbs={breadcrumbs}
      backTo={config.backTo}
      backLabel={config.backLabel}
      actions={
        config.useUpdate ? (
          <div className="flex items-center gap-2">
            {dirty ? (
              <Button variant="ghost" onClick={reset} disabled={saving}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            ) : null}
            <Button onClick={save} disabled={saving || !dirty}>
              <Save className="h-4 w-4 mr-1" />
              {saving ? "Saving…" : (config.saveLabel ?? "Save Changes")}
            </Button>
          </div>
        ) : undefined
      }
    >
      {config.useUpdate ? (
        <MutationBridge
          hook={config.useUpdate}
          onReady={(t) => (updateTriggerRef.current = t)}
        />
      ) : null}

      {version !== undefined && version !== null ? (
        <p className="text-xs text-slate-500">
          Configuration version:{" "}
          <span className="font-medium text-slate-700">{String(version)}</span>
        </p>
      ) : null}

      {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <StatCard
              key={`${stat.label}-${i}`}
              label={stat.label}
              value={stat.value}
              color={stat.color}
            />
          ))}
        </div>
      )}

      {Boolean(result.error) && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            {apiErrorMessage((result.error as { data?: unknown }).data)}
          </span>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        {result.isLoading && !initialized ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded bg-slate-100"
              />
            ))}
          </div>
        ) : (
          <FormGrid
            fields={config.fields}
            values={form}
            errors={formErrors}
            onChange={(key, v) => {
              setForm((prev) => ({ ...prev, [key]: v }));
              setFormErrors((prev) => {
                if (!prev[key]) return prev;
                const next = { ...prev };
                delete next[key];
                return next;
              });
            }}
          />
        )}
      </div>
    </SaasAdminScreen>
  );
}

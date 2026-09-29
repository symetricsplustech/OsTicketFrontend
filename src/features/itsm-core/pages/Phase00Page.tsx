import { WorkRecordGovernance } from "@features/itsm-core/components/WorkRecordGovernance";
import { WorkRecordWorkspace } from "@features/itsm-core/components/WorkRecordWorkspace";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { incidentRoutes } from "../model/incidentRoutes";
import { instanceApi } from "../api/instanceApi";
import { useGetInstanceHomeQuery, useGetInstanceProfileQuery, useGetInstanceSettingsQuery, useUpdateInstanceSettingsMutation, useGetBrandingQuery, useUpdateBrandingMutation, useGetLocaleTimezoneQuery, useUpdateLocaleTimezoneMutation, useGetFeatureEntitlementsQuery, useGetModuleActivationQuery, useGetInstanceHealthQuery, useGetInstanceAuditQuery } from "../api/instanceApi";

export function Phase00Page({ screen }: { screen: ScreenDefinition }) {
  const { data: instanceHome, isLoading } = useGetInstanceHomeQuery();
  const { data: instanceProfile } = useGetInstanceProfileQuery(screen.id ?? "");
  const { data: instanceSettings } = useGetInstanceSettingsQuery();
  const { data: branding } = useGetBrandingQuery();
  const { data: localeTimezone } = useGetLocaleTimezoneQuery();
  const { data: featureEntitlements } = useGetFeatureEntitlementsQuery();
  const { data: moduleActivation } = useGetModuleActivationQuery();
  const { data: instanceHealth } = useGetInstanceHealthQuery();
  const { data: instanceAudit } = useGetInstanceAuditQuery();

  return (
    <WorkRecordGovernance screen={screen} routes={incidentRoutes} namespace="phase00" scope="Core Platform">
      <WorkRecordWorkspace screen={screen} />
      {screen.screenId && screen.screenId.startsWith("L00445") && instanceHome && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* KPI cards summary */}
        </div>
      )}
      {screen.screenId && screen.screenId.startsWith("L00461") && instanceProfile && (
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">{instanceProfile.title || "Instance Profile"}</h2>
          <p className="text-gray-600">{instanceProfile.description || ""}</p>
          <div className="mt-4">
            {/* Profile details */}
          </div>
        </div>
      )}
      {screen.screenId && screen.screenId.startsWith("L00479") && (
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Instance Settings</h2>
          {/* Settings form */}
        </div>
      )}
      {screen.screenId && screen.screenId.startsWith("L00497") && (
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Branding</h2>
          {/* Branding form */}
        </div>
      )}
      {screen.screenId && screen.screenId.startsWith("L00515") && (
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Locale & Time Zone</h2>
          {/* Locale form */}
        </div>
      )}
      {screen.screenId && screen.screenId.startsWith("L00533") && (
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Feature Entitlements</h2>
          {/* Feature entitlements */}
        </div>
      )}
      {screen.screenId && screen.screenId.startsWith("L00551") && (
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Module Activation</h2>
          {/* Module activation */}
        </div>
      )}
      {screen.screenId && screen.screenId.startsWith("L00569") && (
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Instance Health</h2>
          {/* Health status */}
        </div>
      )}
      {screen.screenId && screen.screenId.startsWith("L00587") && (
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Instance Audit</h2>
          {/* Audit list */}
        </div>
      )}
    </WorkRecordGovernance>
  );
}
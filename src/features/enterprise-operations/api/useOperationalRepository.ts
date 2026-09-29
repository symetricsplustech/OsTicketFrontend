import { useMemo } from "react";
import type { ScreenDefinition } from "@features/itsm-core/models/screen";
import { useCreateAssignmentResourceMutation, useDeleteAssignmentResourceMutation, useListAssignmentResourcesQuery, useUpdateAssignmentResourceMutation } from "@features/assignment-routing/api/assignmentRoutingApi";
import { useCreateApprovalResourceMutation, useDeleteApprovalResourceMutation, useListApprovalResourcesQuery, useUpdateApprovalResourceMutation } from "@features/approval-management/api/approvalManagementApi";
import { useCreateConfigurationResourceMutation, useDeleteConfigurationResourceMutation, useListConfigurationResourcesQuery, useUpdateConfigurationResourceMutation } from "@features/configuration-management/api/configurationManagementApi";
import { isCrudResource, useCreateAssetMutation, useCreateAssetRecordMutation, useDeleteAssetMutation, useDeleteAssetRecordMutation, useListAssetRecordsQuery, useListAssetsQuery, useUpdateAssetMutation, useUpdateAssetRecordMutation } from "@features/asset-management/api/assetManagementApi";
import { useCreateOutageMutation, useDeleteOutageMutation, useListOutagesQuery, useListStatusPagesQuery, useTransitionOutageMutation, useUpdateOutageMutation } from "@features/outage-management/api/outageManagementApi";
import { useCreateOnCallResourceMutation, useDeleteOnCallResourceMutation, useListOnCallResourcesQuery, useUpdateOnCallResourceMutation } from "@features/on-call-management/api/onCallManagementApi";
import { useCreateWalkUpResourceMutation, useDeleteWalkUpResourceMutation, useListWalkUpResourcesQuery, useUpdateWalkUpResourceMutation } from "@features/walk-up-experience/api/walkUpExperienceApi";
import { useCreateDigitalPortfolioMutation, useDeleteDigitalPortfolioMutation, useListDigitalPortfoliosQuery, useUpdateDigitalPortfolioMutation } from "@features/digital-portfolio/api/digitalPortfolioApi";
import { useCreateReleaseResourceMutation, useDeleteReleaseResourceMutation, useListReleaseResourcesQuery, useUpdateReleaseResourceMutation } from "@features/release-management/api/releaseManagementApi";
import { operationalRows } from "./operationalTypes";
import { operationalDomain, operationalTarget } from "../model/operationalDomain";
import { operationalCapabilities } from "../model/operationalCapabilities";

export function useOperationalRepository(screen: ScreenDefinition) {
  const domain = operationalDomain(screen);
  const target = operationalTarget(screen);
  const resource = target.resource;
  // A screen with no backend surface must not fall through to another module's
  // list, so its query is skipped and the screen renders empty by design.
  const missing = target.unavailable;
  const capabilities = operationalCapabilities(domain, resource, target.readOnly);
  const args = { resource, search: undefined };
  // Phase 15 reads two different backends: the register (15.1 and the 15.7
  // lifecycle screens) stays on the platform asset API, and every other
  // collection comes from the /core/assets router.
  const usesRegister = domain === "asset" && resource === "assets";
  const crudResource = isCrudResource(resource) ? resource : "models";
  const assignment = useListAssignmentResourcesQuery(args, { skip: domain !== "assignment" });
  const approval = useListApprovalResourcesQuery(args, { skip: domain !== "approval" });
  const configuration = useListConfigurationResourcesQuery(args, { skip: domain !== "configuration" && domain !== "service-portfolio" });
  const assets = useListAssetsQuery({ ...args, status: target.status }, { skip: !usesRegister });
  const assetRecords = useListAssetRecordsQuery({ resource: crudResource, search: undefined, filters: target.status ? { status: target.status } : undefined }, { skip: domain !== "asset" || usesRegister });
  const assetActive = usesRegister ? assets : assetRecords;
  const isStatusPage = domain === "outage" && resource === "status-pages";
  const outages = useListOutagesQuery(args, { skip: domain !== "outage" || isStatusPage || missing !== undefined });
  const statusPages = useListStatusPagesQuery(args, { skip: !isStatusPage });
  const onCall = useListOnCallResourcesQuery(args, { skip: domain !== "on-call" });
  const walkUp = useListWalkUpResourcesQuery(args, { skip: domain !== "walk-up" });
  const portfolios = useListDigitalPortfoliosQuery(args, { skip: domain !== "portfolio" });
  const releases = useListReleaseResourcesQuery(args, { skip: domain !== "release" });
  const [createAssignment] = useCreateAssignmentResourceMutation(); const [updateAssignment] = useUpdateAssignmentResourceMutation(); const [deleteAssignment] = useDeleteAssignmentResourceMutation();
  const [createApproval] = useCreateApprovalResourceMutation(); const [updateApproval] = useUpdateApprovalResourceMutation(); const [deleteApproval] = useDeleteApprovalResourceMutation();
  const [createConfiguration] = useCreateConfigurationResourceMutation(); const [updateConfiguration] = useUpdateConfigurationResourceMutation(); const [deleteConfiguration] = useDeleteConfigurationResourceMutation();
  const [createAsset] = useCreateAssetMutation(); const [updateAsset] = useUpdateAssetMutation(); const [deleteAsset] = useDeleteAssetMutation();
  const [createAssetRecord] = useCreateAssetRecordMutation(); const [updateAssetRecord] = useUpdateAssetRecordMutation(); const [deleteAssetRecord] = useDeleteAssetRecordMutation();
  const [createOutage] = useCreateOutageMutation(); const [updateOutage] = useUpdateOutageMutation(); const [transitionOutage] = useTransitionOutageMutation(); const [deleteOutage] = useDeleteOutageMutation();
  const [createOnCall] = useCreateOnCallResourceMutation(); const [updateOnCall] = useUpdateOnCallResourceMutation(); const [deleteOnCall] = useDeleteOnCallResourceMutation();
  const [createWalkUp] = useCreateWalkUpResourceMutation(); const [updateWalkUp] = useUpdateWalkUpResourceMutation(); const [deleteWalkUp] = useDeleteWalkUpResourceMutation();
  const [createPortfolio] = useCreateDigitalPortfolioMutation(); const [updatePortfolio] = useUpdateDigitalPortfolioMutation(); const [deletePortfolio] = useDeleteDigitalPortfolioMutation();
  const [createRelease] = useCreateReleaseResourceMutation(); const [updateRelease] = useUpdateReleaseResourceMutation(); const [deleteRelease] = useDeleteReleaseResourceMutation();
  const assetCreate = (body: Record<string, unknown>) => (usesRegister ? createAsset({ resource, body }) : createAssetRecord({ resource: crudResource, body })).unwrap();
  const assetUpdate = (id: string, body: Record<string, unknown>) => (usesRegister ? updateAsset({ resource, id, body }) : updateAssetRecord({ resource: crudResource, id, body })).unwrap();
  const assetDelete = (id: string) => (usesRegister ? deleteAsset({ resource, id }) : deleteAssetRecord({ resource: crudResource, id })).unwrap();
  const active = domain === "assignment" ? assignment : domain === "approval" ? approval : domain === "configuration" || domain === "service-portfolio" ? configuration : domain === "asset" ? assetActive : domain === "outage" ? (isStatusPage ? statusPages : outages) : domain === "on-call" ? onCall : domain === "walk-up" ? walkUp : domain === "portfolio" ? portfolios : releases;
  const records = useMemo(() => operationalRows(active.data), [active.data]);
  const create = (body: Record<string, unknown>) => domain === "assignment" ? createAssignment({ resource, body }).unwrap() : domain === "approval" ? createApproval({ resource, body }).unwrap() : domain === "configuration" || domain === "service-portfolio" ? createConfiguration({ resource, body }).unwrap() : domain === "asset" ? assetCreate(body) : domain === "outage" ? createOutage({ body }).unwrap() : domain === "on-call" ? createOnCall({ resource, body }).unwrap() : domain === "walk-up" ? createWalkUp({ resource, body }).unwrap() : domain === "portfolio" ? createPortfolio({ resource, body }).unwrap() : createRelease({ resource, body }).unwrap();
  const update = (id: string, body: Record<string, unknown>) => domain === "assignment" ? updateAssignment({ resource, id, body }).unwrap() : domain === "approval" ? updateApproval({ resource, id, body }).unwrap() : domain === "configuration" || domain === "service-portfolio" ? updateConfiguration({ resource, id, body }).unwrap() : domain === "asset" ? assetUpdate(id, body) : domain === "outage" ? updateOutage({ id, body }).unwrap() : domain === "on-call" ? updateOnCall({ resource, id, body }).unwrap() : domain === "walk-up" ? updateWalkUp({ resource, id, body }).unwrap() : domain === "portfolio" ? updatePortfolio({ resource, id, body }).unwrap() : updateRelease({ resource, id, body }).unwrap();
  const remove = (id: string) => domain === "assignment" ? deleteAssignment({ resource, id }).unwrap() : domain === "approval" ? deleteApproval({ resource, id }).unwrap() : domain === "configuration" || domain === "service-portfolio" ? deleteConfiguration({ resource, id }).unwrap() : domain === "asset" ? assetDelete(id) : domain === "outage" ? deleteOutage({ id }).unwrap() : domain === "on-call" ? deleteOnCall({ resource, id }).unwrap() : domain === "walk-up" ? deleteWalkUp({ resource, id }).unwrap() : domain === "portfolio" ? deletePortfolio({ resource, id }).unwrap() : deleteRelease({ resource, id }).unwrap();
  const transition = (id: string, status: string) => domain === "outage" ? transitionOutage({ id, body: { status } }).unwrap() : update(id, { status });
  return {
    domain,
    resource,
    capabilities,
    records,
    create,
    update,
    remove,
    transition,
    isLoading: active.isLoading,
    isError: active.isError,
    refetch: active.refetch,
    missing,
  };
}

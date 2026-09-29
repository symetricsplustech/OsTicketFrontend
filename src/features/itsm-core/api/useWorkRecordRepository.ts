import { useMemo } from "react";
import { useCreateCatalogRecordMutation, useDeleteCatalogRecordMutation, useListCatalogRecordsQuery, useUpdateCatalogRecordMutation } from "@features/catalog-management/api/catalogApi";
import { useCreateChangeMutation, useListChangesQuery, useTransitionChangeMutation, useUpdateChangeMutation } from "@features/change-management/api/changeApi";
import { useCreateIncidentMutation, useListIncidentsQuery, useTransitionIncidentMutation, useUpdateIncidentMutation } from "@features/incident-management/api/incidentApi";
import { useCreateKnowledgeRecordMutation, useDeleteKnowledgeRecordMutation, useListKnowledgeRecordsQuery, useTransitionKnowledgeArticleMutation, useUpdateKnowledgeRecordMutation } from "@features/knowledge-management/api/knowledgeApi";
import { useCreateProblemMutation, useListProblemsQuery, useTransitionProblemMutation, useUpdateProblemMutation } from "@features/problem-management/api/problemApi";
import { useListRequestRecordsQuery, useTransitionRequestRecordMutation } from "@features/request-management/api/requestApi";
import { useCreateServiceLevelRecordMutation, useDeleteServiceLevelRecordMutation, useListServiceLevelRecordsQuery, useUpdateServiceLevelRecordMutation } from "@features/service-level-management/api/serviceLevelApi";
import { useCancelInteractionMutation, useCompleteInteractionMutation, useCreateInteractionMutation, useListInteractionsQuery, useUpdateInteractionMutation } from "@features/service-desk/api/interactionApi";
import { useCreateUniversalRequestMutation, useDeleteUniversalRequestMutation, useListUniversalRequestsQuery, useTransitionUniversalRequestMutation, useUpdateUniversalRequestMutation } from "@features/universal-request-management/api/universalRequestApi";
import { apiRows, type ApiListResponse } from "@shared/api/itsmTypes";
import type { ScreenDefinition } from "../models/screen";
import { workRecordFromApi, workRecordToApi } from "../model/workRecordAdapter";
import type { WorkRecord } from "../model/workRecord";
import { domainForScreen, resourceForScreen } from "./workRecordResource";

export function useWorkRecordRepository(screen: ScreenDefinition) {
  const domain = domainForScreen(screen);
  const target = resourceForScreen(screen, domain);
  const common = { limit: 100 };
  const interactions = useListInteractionsQuery(common, { skip: domain !== "interaction" });
  const incident = useListIncidentsQuery({ ...common, major: domain === "major" }, { skip: domain !== "major" && domain !== "incident" });
  const problems = useListProblemsQuery(common, { skip: domain !== "problem" });
  const changes = useListChangesQuery(common, { skip: domain !== "change" });
  const requests = useListRequestRecordsQuery({ ...common, resource: target.domain === "request" ? target.resource : "reqs" }, { skip: domain !== "request" });
  const catalog = useListCatalogRecordsQuery({ ...common, resource: target.domain === "catalog" ? target.resource : "items" }, { skip: domain !== "catalog" });
  const knowledge = useListKnowledgeRecordsQuery({ ...common, resource: target.domain === "knowledge" ? target.resource : "articles" }, { skip: domain !== "knowledge" });
  const serviceLevel = useListServiceLevelRecordsQuery({ ...common, resource: target.domain === "sla" ? target.resource : "plans" }, { skip: domain !== "sla" });
  const universalRequests = useListUniversalRequestsQuery(common, { skip: domain !== "universal-request" });
  const [createIncident] = useCreateIncidentMutation(); const [updateIncident] = useUpdateIncidentMutation(); const [transitionIncident] = useTransitionIncidentMutation();
  const [createProblem] = useCreateProblemMutation(); const [updateProblem] = useUpdateProblemMutation(); const [transitionProblem] = useTransitionProblemMutation();
  const [createChange] = useCreateChangeMutation(); const [updateChange] = useUpdateChangeMutation(); const [transitionChange] = useTransitionChangeMutation();
  const [transitionRequest] = useTransitionRequestRecordMutation();
  const [createCatalog] = useCreateCatalogRecordMutation(); const [updateCatalog] = useUpdateCatalogRecordMutation(); const [deleteCatalog] = useDeleteCatalogRecordMutation();
  const [createKnowledge] = useCreateKnowledgeRecordMutation(); const [updateKnowledge] = useUpdateKnowledgeRecordMutation(); const [deleteKnowledge] = useDeleteKnowledgeRecordMutation(); const [transitionKnowledge] = useTransitionKnowledgeArticleMutation();
  const [createServiceLevel] = useCreateServiceLevelRecordMutation(); const [updateServiceLevel] = useUpdateServiceLevelRecordMutation(); const [deleteServiceLevel] = useDeleteServiceLevelRecordMutation();
  const [createInteraction] = useCreateInteractionMutation(); const [updateInteraction] = useUpdateInteractionMutation(); const [completeInteraction] = useCompleteInteractionMutation(); const [cancelInteraction] = useCancelInteractionMutation();
  const [createUniversalRequest] = useCreateUniversalRequestMutation(); const [updateUniversalRequest] = useUpdateUniversalRequestMutation(); const [transitionUniversalRequest] = useTransitionUniversalRequestMutation(); const [deleteUniversalRequest] = useDeleteUniversalRequestMutation();
  const active = domain === "interaction" ? interactions : domain === "universal-request" ? universalRequests : domain === "major" || domain === "incident" ? incident : domain === "problem" ? problems : domain === "change" ? changes : domain === "request" ? requests : domain === "catalog" ? catalog : domain === "knowledge" ? knowledge : serviceLevel;
  const records = useMemo(() => apiRows(active.data as ApiListResponse | undefined).map(workRecordFromApi), [active.data]);
  const create = (record: WorkRecord) => {
    const body = workRecordToApi(record);
    if (domain === "interaction") return createInteraction(body).unwrap();
    if (domain === "universal-request") return createUniversalRequest(body).unwrap();
    if (domain === "major" || domain === "incident") return createIncident(body).unwrap(); if (domain === "problem") return createProblem(body).unwrap(); if (domain === "change") return createChange(body).unwrap();
    if (target.domain === "catalog") return createCatalog({ resource: target.resource, body }).unwrap(); if (target.domain === "knowledge") return createKnowledge({ resource: target.resource, body }).unwrap(); if (target.domain === "sla") return createServiceLevel({ resource: target.resource, body }).unwrap();
    return Promise.reject(new Error("Requests are created through catalog ordering, not direct REQ creation."));
  };
  const update = (id: string, record: WorkRecord) => {
    const body = workRecordToApi(record);
    if (domain === "interaction") return updateInteraction({ id, body }).unwrap();
    if (domain === "universal-request") return updateUniversalRequest({ id, body }).unwrap();
    if (domain === "major" || domain === "incident") return updateIncident({ id, body }).unwrap(); if (domain === "problem") return updateProblem({ id, body }).unwrap(); if (domain === "change") return updateChange({ id, body }).unwrap();
    if (target.domain === "catalog") return updateCatalog({ resource: target.resource, id, body }).unwrap(); if (target.domain === "knowledge") return updateKnowledge({ resource: target.resource, id, body }).unwrap(); if (target.domain === "sla") return updateServiceLevel({ resource: target.resource, id, body }).unwrap();
    return Promise.reject(new Error("This request resource is updated through its lifecycle actions."));
  };
  const transition = (id: string, state: string) => {
    const status = state.toLowerCase();
    if (domain === "interaction" && state === "Completed") return completeInteraction({ id, body: { outcome: "completed" } }).unwrap();
    if (domain === "interaction" && state === "Abandoned") return cancelInteraction({ id }).unwrap();
    if (domain === "interaction") return updateInteraction({ id, body: { status } }).unwrap();
    if (domain === "universal-request") return transitionUniversalRequest({ id, status }).unwrap();
    if (domain === "major" || domain === "incident") return transitionIncident({ id, status }).unwrap(); if (domain === "problem") return transitionProblem({ id, status }).unwrap(); if (domain === "change") return transitionChange({ id, status }).unwrap();
    if (target.domain === "request") return transitionRequest({ resource: target.resource, id, status }).unwrap(); if (target.domain === "knowledge" && target.resource === "articles") return transitionKnowledge({ id, status }).unwrap();
    return update(id, { ...records.find((item) => item.id === id)!, state });
  };
  const remove = (id: string) => {
    if (domain === "universal-request") return deleteUniversalRequest({ id }).unwrap();
    if (target.domain === "catalog") return deleteCatalog({ resource: target.resource, id }).unwrap(); if (target.domain === "knowledge") return deleteKnowledge({ resource: target.resource, id }).unwrap(); if (target.domain === "sla") return deleteServiceLevel({ resource: target.resource, id }).unwrap();
    return Promise.reject(new Error("The backend lifecycle does not allow deleting this record type."));
  };
  return { domain, records, create, update, transition, remove, isLoading: active.isLoading, isError: active.isError, refetch: active.refetch };
}

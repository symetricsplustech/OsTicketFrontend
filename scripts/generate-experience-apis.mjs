import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const domains = [
  ["continual-improvement", "improvement", "Improvement"],
  ["service-operations-workspace", "service-operations", "ServiceOperations"],
  ["employee-center", "employee-center", "EmployeeCenter"],
  ["conversational-service", "conversational-service", "ConversationalService"],
  ["intelligent-automation", "intelligent-automation", "IntelligentAutomation"],
  ["workforce-optimization", "workforce", "Workforce"],
  ["vendor-management", "vendor", "Vendor"],
  ["experience-feedback", "experience-feedback", "ExperienceFeedback"],
  ["benchmark-management", "benchmarks", "Benchmark"],
  ["performance-analytics", "performance-analytics", "PerformanceAnalytics"],
];

for (const [folder, domain, name] of domains) {
  const apiPath = resolve(packageRoot, "src/features", folder, "api");
  mkdirSync(apiPath, { recursive: true });
  const camel = `${name[0].toLowerCase()}${name.slice(1)}`;
  const content = `import { baseApi } from "@shared/api/base";
import type { ExperienceMutation, ExperienceQuery, ExperienceResponse } from "@features/enterprise-experience/api/experienceTypes";

const domain = "${domain}";
const tag = { type: "ItsmWork" as const, id: "${domain}" };
export const ${camel}Api = baseApi.injectEndpoints({ endpoints: (build) => ({
  list${name}Records: build.query<ExperienceResponse, ExperienceQuery>({ query: ({ resource, ...params }) => ({ url: \`/core/experience-records/\${domain}/\${resource}\`, params }), providesTags: [tag] }),
  create${name}Record: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, body }) => ({ url: \`/core/experience-records/\${domain}/\${resource}\`, method: "POST", body }), invalidatesTags: [tag] }),
  update${name}Record: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id, body }) => ({ url: \`/core/experience-records/\${domain}/\${resource}/\${id}\`, method: "PUT", body }), invalidatesTags: [tag] }),
  transition${name}Record: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id, body }) => ({ url: \`/core/experience-records/\${domain}/\${resource}/\${id}/transition\`, method: "POST", body }), invalidatesTags: [tag] }),
  delete${name}Record: build.mutation<ExperienceResponse, ExperienceMutation>({ query: ({ resource, id }) => ({ url: \`/core/experience-records/\${domain}/\${resource}/\${id}\`, method: "DELETE" }), invalidatesTags: [tag] }),
}) });
export const { useList${name}RecordsQuery, useCreate${name}RecordMutation, useUpdate${name}RecordMutation, useTransition${name}RecordMutation, useDelete${name}RecordMutation } = ${camel}Api;

export function use${name}Repository(resource: string, skip: boolean) {
  const query = useList${name}RecordsQuery({ resource }, { skip });
  const [createRecord] = useCreate${name}RecordMutation();
  const [updateRecord] = useUpdate${name}RecordMutation();
  const [transitionRecord] = useTransition${name}RecordMutation();
  const [deleteRecord] = useDelete${name}RecordMutation();
  return {
    query,
    create: (body: Record<string, unknown>) => createRecord({ resource, body }).unwrap(),
    update: (id: string, body: Record<string, unknown>) => updateRecord({ resource, id, body }).unwrap(),
    transition: (id: string, status: string) => transitionRecord({ resource, id, body: { status } }).unwrap(),
    remove: (id: string) => deleteRecord({ resource, id }).unwrap(),
  };
}
`;
  writeFileSync(resolve(apiPath, `${camel}Api.ts`), content);
}

console.log(`Generated ${domains.length} domain API modules.`);

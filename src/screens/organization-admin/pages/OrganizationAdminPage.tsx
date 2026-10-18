import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpDown,
  Download,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Sparkles,
} from "lucide-react";
import { Button, Input, Select, Switch } from "@components/common/ui";
import { Badge, StatusBadge } from "@components/common/Badge";
import { showSuccess } from "@components/common/Toast/ToastContainer";
import {
  resolveOrganizationAdminPageModel,
  type OrganizationAdminActivityEntry,
  type OrganizationAdminCalendarEvent,
  type OrganizationAdminFieldModel,
  type OrganizationAdminPageKind,
  type OrganizationAdminSettingsGroup,
  type OrganizationAdminStat,
  type OrganizationAdminTableModel,
  matrixRowHeader,
} from "./pageModel";

interface OrganizationAdminPageProps {
  sectionKey: string;
  section: string;
  title: string;
  description: string;
  /** Path relative to /organization, e.g. "incident-management/all-incidents". */
  routeKey: string;
}

export function OrganizationAdminPage({
  sectionKey,
  section,
  title,
  description,
  routeKey,
}: OrganizationAdminPageProps) {
  const model = resolveOrganizationAdminPageModel({ sectionKey, title, description, routeKey });

  return (
    <div>
      <PageHeading
        section={section}
        title={title}
        description={description}
        primaryAction={model.primaryAction}
        secondaryActions={model.secondaryActions}
        createHref={model.createHref}
      />
      <PageBody kind={model.kind} model={model} sectionKey={sectionKey} title={title} routeKey={routeKey} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Heading                                                             */
/* ------------------------------------------------------------------ */

function PageHeading({
  section,
  title,
  description,
  primaryAction,
  secondaryActions,
  createHref,
}: {
  section: string;
  title: string;
  description: string;
  primaryAction?: string;
  secondaryActions?: string[];
  createHref?: string;
}) {
  const navigate = useNavigate();
  return (
    <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{section}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 outline-none md:text-3xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">{description}</p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {secondaryActions?.map((action) => (
          <Button key={action} variant="outline" size="sm">
            {action}
          </Button>
        ))}
        {primaryAction ? (
          <Button
            size="sm"
            onClick={createHref ? () => navigate(createHref) : undefined}
          >
            {primaryAction.toLowerCase().includes("export") ? (
              <Download className="h-4 w-4" />
            ) : primaryAction.toLowerCase().includes("submit") || primaryAction.toLowerCase().includes("send") ? (
              <Send className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {primaryAction}
          </Button>
        ) : null}
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Body dispatcher                                                     */
/* ------------------------------------------------------------------ */

function PageBody({
  kind,
  model,
  sectionKey,
  title,
  routeKey,
}: {
  kind: OrganizationAdminPageKind;
  model: ReturnType<typeof resolveOrganizationAdminPageModel>;
  sectionKey: string;
  title: string;
  routeKey: string;
}) {
  switch (kind) {
    case "dashboard":
      return <DashboardBody stats={model.stats ?? []} activity={model.activity ?? []} />;
    case "list":
      return <ListBody table={model.table} title={title} basePath={routeKey} />;
    case "form":
      return <FormBody fields={model.fields ?? []} title={title} />;
    case "settings":
      return <SettingsBody groups={model.settingsGroups ?? []} title={title} />;
    case "report":
      return <ReportBody stats={model.stats ?? []} table={model.table} series={model.reportSeries ?? []} basePath={routeKey} />;
    case "calendar":
      return <CalendarBody events={model.calendarEvents ?? []} />;
    case "activity":
      return <ActivityBody activity={model.activity ?? []} table={model.table} basePath={routeKey} title={title} />;
    case "matrix":
      return <MatrixBody table={model.table} sectionKey={sectionKey} />;
    case "workflow":
      return <WorkflowBody nodes={model.workflowNodes ?? []} />;
  }
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

function DashboardBody({
  stats,
  activity,
}: {
  stats: OrganizationAdminStat[];
  activity: OrganizationAdminActivityEntry[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{stat.value}</p>
            {stat.hint ? <p className="mt-1 text-xs text-slate-500">{stat.hint}</p> : null}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-200 bg-white lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-800">Recent activity</h2>
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </div>
          <ul className="divide-y divide-slate-100">
            {activity.map((entry, index) => (
              <li key={`${entry.title}-${index}`} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{entry.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {entry.actor} · {entry.time}
                  </p>
                </div>
                {entry.status ? (
                  <Badge variant={entry.status === "Success" ? "success" : entry.status === "Failed" ? "danger" : "warning"}>
                    {entry.status}
                  </Badge>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800">Health</h2>
          <div className="mt-4 space-y-4">
            {[
              { label: "SLA compliance", value: 96 },
              { label: "Auto-assignment coverage", value: 84 },
              { label: "Knowledge deflection", value: 38 },
              { label: "Asset data quality", value: 91 },
            ].map((bar) => (
              <div key={bar.label}>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>{bar.label}</span>
                  <span className="font-medium text-slate-800">{bar.value}%</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full ${bar.value >= 90 ? "bg-emerald-500" : bar.value >= 60 ? "bg-brand-500" : "bg-amber-500"}`}
                    style={{ width: `${bar.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* List                                                                */
/* ------------------------------------------------------------------ */

function recordSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function ListBody({
  table,
  title,
  basePath,
}: {
  table?: OrganizationAdminTableModel;
  title: string;
  basePath: string;
}) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const rows = (table?.rows ?? []).filter((row) =>
    query ? row.cells.some((cell) => cell.toLowerCase().includes(query.toLowerCase())) : true,
  );

  const openRecord = (rowIndex: number) => {
    const row = table?.rows[rowIndex];
    const first = row?.cells[0];
    if (!first) return;
    navigate(`/organization/${basePath}/${recordSlug(first)}`);
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${title.toLowerCase()}…`}
            className="pl-9"
            aria-label={`Search ${title}`}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <ArrowUpDown className="h-4 w-4" />
            Sort
          </Button>
          <Button variant="ghost" size="sm" aria-label="More actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              {(table?.columns ?? []).map((column) => (
                <th key={column} className="px-5 py-3 font-medium">
                  {column}
                </th>
              ))}
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
              const rowIndex = table?.rows.indexOf(row) ?? 0;
              return (
                <tr
                  key={rowIndex}
                  className="cursor-pointer hover:bg-slate-50/70"
                  onClick={() => openRecord(rowIndex)}
                >
                  {row.cells.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={`px-5 py-3 ${
                        cellIndex === 0
                          ? "font-medium text-slate-900 group-hover:text-brand-700"
                          : "text-slate-600"
                      }`}
                    >
                      {cellIndex === 1 && cell.length < 20 ? <StatusBadge status={cell} /> : cell}
                    </td>
                  ))}
                  <td className="px-5 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Row actions"
                      onClick={(event) => {
                        event.stopPropagation();
                        openRecord(rowIndex);
                      }}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={(table?.columns.length ?? 0) + 1} className="px-5 py-10 text-center text-sm text-slate-400">
                  No matching records.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
        <span>
          Showing {rows.length} of {table?.rows.length ?? 0}
        </span>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Form                                                                */
/* ------------------------------------------------------------------ */

function FormBody({ fields, title }: { fields: OrganizationAdminFieldModel[]; title: string }) {
  const navigate = useNavigate();
  return (
    <form
      className="rounded-xl border border-slate-200 bg-white"
      onSubmit={(event) => {
        event.preventDefault();
        showSuccess(`${title} saved`, "Your changes have been applied.");
      }}
    >
      <div className="grid gap-5 p-6 md:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label} className={field.span === 2 ? "md:col-span-2" : undefined}>
            <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor={`field-${field.label}`}>
              {field.label}
            </label>
            {field.type === "textarea" ? (
              <textarea
                id={`field-${field.label}`}
                rows={4}
                placeholder={field.placeholder}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            ) : field.type === "select" ? (
              <Select id={`field-${field.label}`} defaultValue={field.options?.[0]}>
                {field.options?.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </Select>
            ) : (
              <Input
                id={`field-${field.label}`}
                type={field.type === "email" ? "email" : field.type === "password" ? "password" : "text"}
                placeholder={field.placeholder}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
        <Button variant="outline" type="button" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

function SettingSwitch({ id, defaultOn }: { id: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return <Switch id={id} checked={on} onChange={setOn} />;
}

function SettingsBody({ groups, title }: { groups: OrganizationAdminSettingsGroup[]; title: string }) {
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.title} className="rounded-xl border border-slate-200 bg-white">
          <h2 className="border-b border-slate-100 px-5 py-4 text-sm font-semibold text-slate-800">{group.title}</h2>
          <ul className="divide-y divide-slate-100">
            {group.rows.map((row) => (
              <li key={row.label} className="flex items-center justify-between gap-6 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-slate-800">{row.label}</p>
                  {row.hint ? <p className="mt-0.5 text-xs text-slate-500">{row.hint}</p> : null}
                </div>
                {row.control === "toggle" ? (
                  <SettingSwitch id={`setting-${row.label}`} defaultOn={row.defaultOn ?? false} />
                ) : row.control === "select" ? (
                  <Select defaultValue={row.value} aria-label={row.label} className="w-48">
                    {row.options?.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </Select>
                ) : (
                  <Input defaultValue={row.value} aria-label={row.label} className="w-48" />
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
      <div className="flex justify-end">
        <Button onClick={() => showSuccess(`${title} saved`, "Settings updated for your organization.")}>
          Save changes
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Report                                                              */
/* ------------------------------------------------------------------ */

function ReportBody({
  stats,
  table,
  series,
  basePath,
}: {
  stats: OrganizationAdminStat[];
  table?: OrganizationAdminTableModel;
  series: number[];
  basePath: string;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{stat.value}</p>
            {stat.hint ? <p className="mt-1 text-xs text-slate-500">{stat.hint}</p> : null}
          </div>
        ))}
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Trend (last 12 periods)</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" size="sm">
              Excel
            </Button>
            <Button variant="outline" size="sm">
              <Sparkles className="h-4 w-4" />
              Schedule
            </Button>
          </div>
        </div>
        <div className="mt-6 flex h-44 items-end gap-2">
          {series.map((value, index) => (
            <div key={index} className="flex-1">
              <div
                className="rounded-t bg-brand-500/80 transition-colors hover:bg-brand-600"
                style={{ height: `${value}%` }}
                title={`${value}`}
              />
            </div>
          ))}
        </div>
      </section>

      {table ? <ListBody table={table} title="Report data" basePath={basePath} /> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Calendar                                                            */
/* ------------------------------------------------------------------ */

const TONE_CLASSES: Record<OrganizationAdminCalendarEvent["tone"], string> = {
  blue: "bg-sky-100 text-sky-800",
  amber: "bg-amber-100 text-amber-800",
  emerald: "bg-emerald-100 text-emerald-800",
  rose: "bg-rose-100 text-rose-800",
};

function CalendarBody({ events }: { events: OrganizationAdminCalendarEvent[] }) {
  const daysInMonth = 31;
  const firstWeekday = 4; // October 2026 starts on a Thursday (0=Sun).
  const weeks: number[][] = [];
  let week: number[] = Array(firstWeekday).fill(0);
  for (let day = 1; day <= daysInMonth; day += 1) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) weeks.push([...week, ...Array(7 - week.length).fill(0)]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">October 2026</h2>
        <div className="flex gap-2 text-xs">
          {(["blue", "amber", "emerald", "rose"] as const).map((tone) => (
            <span key={tone} className="flex items-center gap-1 text-slate-500">
              <span className={`h-2 w-2 rounded-full ${TONE_CLASSES[tone].split(" ")[0]}`} />
              {tone}
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 text-xs">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((weekday) => (
          <div key={weekday} className="bg-slate-50 px-2 py-2 text-center font-medium text-slate-500">
            {weekday}
          </div>
        ))}
        {weeks.flatMap((days, weekIndex) =>
          days.map((day, dayIndex) => {
            const dayEvents = day ? events.filter((event) => event.day === day) : [];
            return (
              <div key={`${weekIndex}-${dayIndex}`} className="min-h-[76px] bg-white p-1.5">
                {day ? <p className="text-right font-medium text-slate-600">{day}</p> : null}
                <div className="mt-1 space-y-1">
                  {dayEvents.map((event) => (
                    <p key={event.label} className={`truncate rounded px-1.5 py-0.5 ${TONE_CLASSES[event.tone]}`}>
                      {event.label}
                    </p>
                  ))}
                </div>
              </div>
            );
          }),
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Activity log                                                        */
/* ------------------------------------------------------------------ */

function ActivityBody({
  activity,
  table,
  basePath,
  title,
}: {
  activity: OrganizationAdminActivityEntry[];
  table?: OrganizationAdminTableModel;
  basePath: string;
  title: string;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white">
        <h2 className="border-b border-slate-100 px-5 py-4 text-sm font-semibold text-slate-800">Timeline</h2>
        <ol className="relative space-y-0 px-5 py-4">
          {activity.map((entry, index) => (
            <li key={`${entry.title}-${index}`} className="relative flex gap-4 pb-6 last:pb-0">
              {index < activity.length - 1 ? (
                <span className="absolute left-[7px] top-6 h-full w-px bg-slate-200" aria-hidden />
              ) : null}
              <span
                className={`mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full ring-4 ring-white ${
                  entry.status === "Failed" ? "bg-red-500" : entry.status === "Warning" ? "bg-amber-500" : "bg-emerald-500"
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-800">{entry.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {entry.actor} · {entry.time}
                </p>
              </div>
              {entry.status ? (
                <Badge variant={entry.status === "Success" ? "success" : entry.status === "Failed" ? "danger" : "warning"}>
                  {entry.status}
                </Badge>
              ) : null}
            </li>
          ))}
        </ol>
      </section>
      {table ? <ListBody table={table} title={title} basePath={basePath} /> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Permission matrix                                                   */
/* ------------------------------------------------------------------ */

function MatrixBody({ table, sectionKey }: { table?: OrganizationAdminTableModel; sectionKey: string }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-800">Permission matrix</h2>
        <p className="mt-1 text-xs text-slate-500">
          ✓ grants the capability; — denies it. Changes apply to every member holding this role.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3 font-medium">{matrixRowHeader(sectionKey)}</th>
              {(table?.columns ?? []).map((column) => (
                <th key={column} className="px-5 py-3 text-center font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(table?.rows ?? []).map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-slate-50/70">
                <td className="px-5 py-3 font-medium text-slate-900">{row.cells[0] ?? "—"}</td>
                {row.cells.slice(1).map((cell, cellIndex) => (
                  <td key={cellIndex} className={`px-5 py-3 text-center ${cell === "✓" ? "text-emerald-600" : "text-slate-300"}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Workflow designer                                                   */
/* ------------------------------------------------------------------ */

function WorkflowBody({ nodes }: { nodes: string[] }) {
  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-800">Definition</h2>
        <p className="mt-1 text-xs text-slate-500">Drag-free preview of the current workflow path.</p>
        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-0">
          {nodes.map((node, index) => (
            <div key={node} className="flex items-center lg:flex-1">
              <div
                className={`w-full rounded-lg border px-4 py-3 text-sm font-medium shadow-sm ${
                  index === 0
                    ? "border-sky-200 bg-sky-50 text-sky-900"
                    : index === nodes.length - 1
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : node.toLowerCase().includes("approval")
                        ? "border-amber-200 bg-amber-50 text-amber-900"
                        : node.toLowerCase().includes("condition")
                          ? "border-violet-200 bg-violet-50 text-violet-900"
                          : "border-slate-200 bg-white text-slate-800"
                }`}
              >
                {node}
              </div>
              {index < nodes.length - 1 ? (
                <span className="hidden h-px w-8 shrink-0 bg-slate-300 lg:block" aria-hidden />
              ) : null}
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-800">Version history</h2>
        <ul className="mt-3 divide-y divide-slate-100 text-sm">
          {[
            { version: "v4", meta: "Published by Priya Nair · 2 days ago" },
            { version: "v3", meta: "Published by Marcus Webb · Oct 3, 2026" },
            { version: "v2", meta: "Retired · Sep 18, 2026" },
          ].map((entry) => (
            <li key={entry.version} className="flex items-center justify-between py-3">
              <span className="font-medium text-slate-800">{entry.version}</span>
              <span className="text-xs text-slate-500">{entry.meta}</span>
              <Button variant="ghost" size="sm">
                View
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

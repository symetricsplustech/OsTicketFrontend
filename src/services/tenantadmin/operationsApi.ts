import { tenantadminApi } from "./base";
import {
  crudEndpoints,
  qs,
  resourceUrl,
  transitionEndpoint,
  type ListArgs,
  type ListResponse,
} from "./crudFactory";
import type { ApiSuccess } from "@services/http";

export interface OnCallSchedule {
  id: string;
  name: string;
  description: string | null;
  timezone: string | null;
  rotationType: string;
  status: string;
  teamId: string | null;
  escalationPolicy: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  _count?: { shifts: number };
}

export interface OnCallShift {
  id: string;
  scheduleId: string;
  userId: string;
  kind: string;
  startAt: string;
  endAt: string;
  note: string | null;
  status: string;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface Release {
  id: string;
  number: string;
  name: string;
  version: string | null;
  type: string;
  status: string;
  description: string | null;
  plannedStartAt: string | null;
  plannedEndAt: string | null;
  actualStartAt: string | null;
  actualEndAt: string | null;
  ownerId: string | null;
  teamId: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  code: string | null;
  type: string;
  status: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  rating: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string | null;
  type: string;
  status: string;
  audience: string;
  pinned: boolean;
  publishAt: string | null;
  expireAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const ON_CALL_SCHEDULES_PATH = "/itsm/on-call/schedules";
export const ON_CALL_SHIFTS_PATH = "/itsm/on-call/shifts";
export const RELEASES_PATH = "/itsm/releases";
export const VENDORS_PATH = "/itsm/vendors";
export const ANNOUNCEMENTS_PATH = "/itsm/announcements";

export const onCallApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<OnCallSchedule, "OnCallSchedule">(build, {
      path: ON_CALL_SCHEDULES_PATH,
      tag: "OnCallSchedule",
    }),
    listScheduleShifts: build.query<
      ListResponse<OnCallShift>,
      { scheduleId: string } & ListArgs
    >({
      query: ({ scheduleId, ...args }) => ({
        url: `${resourceUrl(ON_CALL_SCHEDULES_PATH, scheduleId)}/shifts${qs(args)}`,
      }),
      providesTags: (_r, _e, args) => [
        { type: "OnCallShift", id: args.scheduleId },
      ],
    }),
    createScheduleShift: build.mutation<
      ApiSuccess<OnCallShift>,
      { scheduleId: string; body: Record<string, unknown> }
    >({
      query: ({ scheduleId, body }) => ({
        url: `${resourceUrl(ON_CALL_SCHEDULES_PATH, scheduleId)}/shifts`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["OnCallShift"],
    }),
    ...crudEndpoints<OnCallShift, "OnCallShift">(build, {
      path: ON_CALL_SHIFTS_PATH,
      tag: "OnCallShift",
    }),
  }),
});

export const {
  useListOnCallScheduleQuery,
  useGetOnCallScheduleQuery,
  useCreateOnCallScheduleMutation,
  useUpdateOnCallScheduleMutation,
  useDeleteOnCallScheduleMutation,
  useListScheduleShiftsQuery,
  useCreateScheduleShiftMutation,
  useListOnCallShiftQuery,
  useGetOnCallShiftQuery,
  useUpdateOnCallShiftMutation,
  useDeleteOnCallShiftMutation,
} = onCallApi;

export const releasesApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<Release, "Release">(build, {
      path: RELEASES_PATH,
      tag: "Release",
    }),
    deployRelease: transitionEndpoint<Release, "Release">(
      build,
      RELEASES_PATH,
      "Release",
      "/deploy",
    ),
    completeRelease: transitionEndpoint<Release, "Release">(
      build,
      RELEASES_PATH,
      "Release",
      "/complete",
    ),
    cancelRelease: transitionEndpoint<Release, "Release">(
      build,
      RELEASES_PATH,
      "Release",
      "/cancel",
    ),
  }),
});

export const {
  useListReleaseQuery,
  useGetReleaseQuery,
  useCreateReleaseMutation,
  useUpdateReleaseMutation,
  useDeleteReleaseMutation,
  useDeployReleaseMutation,
  useCompleteReleaseMutation,
  useCancelReleaseMutation,
} = releasesApi;

export const vendorsApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<Vendor, "Vendor">(build, {
      path: VENDORS_PATH,
      tag: "Vendor",
    }),
    activateVendor: transitionEndpoint<Vendor, "Vendor">(
      build,
      VENDORS_PATH,
      "Vendor",
      "/activate",
    ),
    deactivateVendor: transitionEndpoint<Vendor, "Vendor">(
      build,
      VENDORS_PATH,
      "Vendor",
      "/deactivate",
    ),
    blacklistVendor: transitionEndpoint<Vendor, "Vendor">(
      build,
      VENDORS_PATH,
      "Vendor",
      "/blacklist",
    ),
  }),
});

export const {
  useListVendorQuery,
  useGetVendorQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,
  useActivateVendorMutation,
  useDeactivateVendorMutation,
  useBlacklistVendorMutation,
} = vendorsApi;

export const announcementsApi = tenantadminApi.injectEndpoints({
  endpoints: (build) => ({
    ...crudEndpoints<Announcement, "Announcement">(build, {
      path: ANNOUNCEMENTS_PATH,
      tag: "Announcement",
    }),
    publishAnnouncement: transitionEndpoint<Announcement, "Announcement">(
      build,
      ANNOUNCEMENTS_PATH,
      "Announcement",
      "/publish",
    ),
    archiveAnnouncement: transitionEndpoint<Announcement, "Announcement">(
      build,
      ANNOUNCEMENTS_PATH,
      "Announcement",
      "/archive",
    ),
    expireAnnouncement: transitionEndpoint<Announcement, "Announcement">(
      build,
      ANNOUNCEMENTS_PATH,
      "Announcement",
      "/expire",
    ),
  }),
});

export const {
  useListAnnouncementQuery,
  useGetAnnouncementQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  usePublishAnnouncementMutation,
  useArchiveAnnouncementMutation,
  useExpireAnnouncementMutation,
} = announcementsApi;

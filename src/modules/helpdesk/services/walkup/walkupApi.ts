import api from "@shared/lib/api";

export interface WalkupLocation {
  _id: string;
  tenantId: string;
  number: string;
  name: string;
  description: string;
  address: string;
  floor: string;
  room: string;
  timezone: string;
  hours: Record<string, { open: string; close: string; closed: boolean }>;
  exceptions: Array<{
    date: string;
    open: string;
    close: string;
    closed: boolean;
    reason: string;
  }>;
  services: string[];
  kiosks: string[];
  team: string;
  maxConcurrentCheckins: number;
  waitTimeEstimation: boolean;
  autoAssign: boolean;
  checkinMethods: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalkupService {
  _id: string;
  tenantId: string;
  number: string;
  name: string;
  description: string;
  category: string;
  locations: string[];
  estimatedDuration: number;
  requiresAppointment: boolean;
  allowsWalkin: boolean;
  requiresApproval: boolean;
  requiresAsset: boolean;
  skillRequired: string;
  slaTargetMinutes: number;
  autoCreateTicket: boolean;
  ticketTemplate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalkupQueue {
  _id: string;
  tenantId: string;
  locationId: string;
  serviceId: string;
  name: string;
  number: string;
  status: string;
  maxSize: number;
  currentSize: number;
  avgWaitMinutes: number;
  estimatedWaitMinutes: number;
  currentServing: string;
  nextNumber: number;
  priorityHandling: boolean;
  autoEstimateWait: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WalkupCheckin {
  _id: string;
  tenantId: string;
  locationId: string;
  queueId: string;
  serviceId: string;
  appointmentId: string;
  kioskId: string;
  number: string;
  queueNumber: number;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  checkinMethod: string;
  status: string;
  priority: number;
  reason: string;
  notes: string;
  checkinAt: string;
  calledAt: string;
  startedAt: string;
  completedAt: string;
  waitMinutes: number;
  serviceMinutes: number;
  technicianId: string;
  technicianName: string;
  satisfactionRating: number;
  satisfactionComment: string;
  outcome: string;
  ticketId: string;
  incidentId: string;
  requestId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  _id: string;
  tenantId: string;
  locationId: string;
  serviceId: string;
  queueId: string;
  number: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  checkinMethod: string;
  reminderSent: boolean;
  reminderSentAt: string;
  checkinAt: string;
  startedAt: string;
  completedAt: string;
  technicianId: string;
  technicianName: string;
  reason: string;
  notes: string;
  outcome: string;
  ticketId: string;
  incidentId: string;
  requestId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WalkupInteraction {
  _id: string;
  tenantId: string;
  checkinId: string;
  appointmentId: string;
  locationId: string;
  userId: string;
  technicianId: string;
  type: string;
  subject: string;
  description: string;
  resolution: string;
  assetsInvolved: string[];
  assetsProvided: Array<{
    assetId: string;
    serialNumber: string;
    condition: string;
  }>;
  softwareInvolved: string[];
  startedAt: string;
  endedAt: string;
  durationMinutes: number;
  outcome: string;
  satisfactionRating: number;
  satisfactionComment: string;
  followUpRequired: boolean;
  followUpNotes: string;
  ticketId: string;
  incidentId: string;
  requestId: string;
  changeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Kiosk {
  _id: string;
  tenantId: string;
  locationId: string;
  name: string;
  description: string;
  number: string;
  serialNumber: string;
  ipAddress: string;
  macAddress: string;
  status: string;
  lastHeartbeat: string;
  hardwareInfo: Record<string, unknown>;
  softwareVersion: string;
  configuredServices: string[];
  uiTheme: Record<string, unknown>;
  printerEnabled: boolean;
  printerConfig: Record<string, unknown>;
  scannerEnabled: boolean;
  cameraEnabled: boolean;
  cardReaderEnabled: boolean;
  lastConfigUpdate: string;
  createdAt: string;
  updatedAt: string;
}

export interface WaitTimeEvent {
  _id: string;
  tenantId: string;
  queueId: string;
  checkinId: string;
  timestamp: string;
  queueSize: number;
  waitTimeMinutes: number;
  servedCount: number;
  abandonedCount: number;
  avgServiceMinutes: number;
  eventType: string;
  createdAt: string;
}

export interface WalkupDashboard {
  totalLocations: number;
  activeLocations: number;
  totalServices: number;
  activeServices: number;
  totalQueues: number;
  openQueues: number;
  activeCheckins: number;
  waitingCount: number;
  inServiceCount: number;
  upcomingAppointments: number;
  totalKiosks: number;
  onlineKiosks: number;
  totalInteractions: number;
  avgWaitMinutes: number;
}

export const walkupApi = {
  // Locations
  listLocations: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: WalkupLocation[] }>(
      "/core/walkup/locations",
      { params },
    ),
  getLocation: (id: string) =>
    api.get<{ success: boolean; data: WalkupLocation }>(
      `/core/walkup/locations/${id}`,
    ),
  createLocation: (data: Partial<WalkupLocation>) =>
    api.post<{ success: boolean; data: WalkupLocation }>(
      "/core/walkup/locations",
      data,
    ),
  updateLocation: (id: string, data: Partial<WalkupLocation>) =>
    api.put<{ success: boolean; data: WalkupLocation }>(
      `/core/walkup/locations/${id}`,
      data,
    ),
  deleteLocation: (id: string) =>
    api.delete<{ success: boolean }>(`/core/walkup/locations/${id}`),
  getOpenLocations: () =>
    api.get<{ success: boolean; data: WalkupLocation[] }>(
      "/core/walkup/locations/open",
    ),

  // Services
  listServices: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: WalkupService[] }>(
      "/core/walkup/services",
      { params },
    ),
  getService: (id: string) =>
    api.get<{ success: boolean; data: WalkupService }>(
      `/core/walkup/services/${id}`,
    ),
  createService: (data: Partial<WalkupService>) =>
    api.post<{ success: boolean; data: WalkupService }>(
      "/core/walkup/services",
      data,
    ),
  updateService: (id: string, data: Partial<WalkupService>) =>
    api.put<{ success: boolean; data: WalkupService }>(
      `/core/walkup/services/${id}`,
      data,
    ),
  deleteService: (id: string) =>
    api.delete<{ success: boolean }>(`/core/walkup/services/${id}`),

  // Queues
  listQueues: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: WalkupQueue[] }>("/core/walkup/queues", {
      params,
    }),
  getQueue: (id: string) =>
    api.get<{ success: boolean; data: WalkupQueue }>(
      `/core/walkup/queues/${id}`,
    ),
  createQueue: (data: Partial<WalkupQueue>) =>
    api.post<{ success: boolean; data: WalkupQueue }>(
      "/core/walkup/queues",
      data,
    ),
  updateQueue: (id: string, data: Partial<WalkupQueue>) =>
    api.put<{ success: boolean; data: WalkupQueue }>(
      `/core/walkup/queues/${id}`,
      data,
    ),
  deleteQueue: (id: string) =>
    api.delete<{ success: boolean }>(`/core/walkup/queues/${id}`),

  // Check-ins
  checkIn: (data: Partial<WalkupCheckin>) =>
    api.post<{ success: boolean; data: WalkupCheckin }>(
      "/core/walkup/checkin",
      data,
    ),
  callCheckin: (id: string, technicianId: string, technicianName: string) =>
    api.post<{ success: boolean; data: WalkupCheckin }>(
      `/core/walkup/checkin/${id}/call`,
      { technicianId, technicianName },
    ),
  startService: (id: string, technicianId: string, technicianName: string) =>
    api.post<{ success: boolean; data: WalkupCheckin }>(
      `/core/walkup/checkin/${id}/start`,
      { technicianId, technicianName },
    ),
  completeCheckin: (id: string, data: Partial<WalkupCheckin>) =>
    api.post<{ success: boolean; data: WalkupCheckin }>(
      `/core/walkup/checkin/${id}/complete`,
      data,
    ),
  cancelCheckin: (id: string) =>
    api.post<{ success: boolean; data: WalkupCheckin }>(
      `/core/walkup/checkin/${id}/cancel`,
    ),

  // Appointments
  listAppointments: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: Appointment[] }>(
      "/core/walkup/appointments",
      { params },
    ),
  getAppointment: (id: string) =>
    api.get<{ success: boolean; data: Appointment }>(
      `/core/walkup/appointments/${id}`,
    ),
  createAppointment: (data: Partial<Appointment>) =>
    api.post<{ success: boolean; data: Appointment }>(
      "/core/walkup/appointments",
      data,
    ),
  updateAppointment: (id: string, data: Partial<Appointment>) =>
    api.put<{ success: boolean; data: Appointment }>(
      `/core/walkup/appointments/${id}`,
      data,
    ),
  checkinAppointment: (
    id: string,
    data: { checkinMethod: string; kioskId?: string },
  ) =>
    api.post<{
      success: boolean;
      data: { appointment: unknown; checkin: unknown };
    }>(`/core/walkup/appointments/${id}/checkin`, data),
  cancelAppointment: (id: string) =>
    api.post<{ success: boolean; data: unknown }>(
      `/core/walkup/appointments/${id}/cancel`,
    ),

  // Interactions
  createInteraction: (data: Partial<WalkupInteraction>) =>
    api.post<{ success: boolean; data: unknown }>(
      "/core/walkup/interactions",
      data,
    ),
  getInteraction: (id: string) =>
    api.get<{ success: boolean; data: unknown }>(
      `/core/walkup/interactions/${id}`,
    ),
  completeInteraction: (id: string, data: Partial<WalkupInteraction>) =>
    api.post<{ success: boolean; data: unknown }>(
      `/core/walkup/interactions/${id}/complete`,
      data,
    ),

  // Kiosks
  listKiosks: (params?: Record<string, unknown>) =>
    api.get<{ success: boolean; data: Kiosk[] }>("/core/walkup/kiosks", {
      params,
    }),
  getKiosk: (id: string) =>
    api.get<{ success: boolean; data: Kiosk }>(`/core/walkup/kiosks/${id}`),
  createKiosk: (data: Partial<Kiosk>) =>
    api.post<{ success: boolean; data: Kiosk }>("/core/walkup/kiosks", data),
  updateKiosk: (id: string, data: Partial<Kiosk>) =>
    api.put<{ success: boolean; data: Kiosk }>(
      `/core/walkup/kiosks/${id}`,
      data,
    ),
  deleteKiosk: (id: string) =>
    api.delete<{ success: boolean }>(`/core/walkup/kiosks/${id}`),
  heartbeat: (id: string) =>
    api.post<{ success: boolean; data: Kiosk }>(
      `/core/walkup/kiosks/${id}/heartbeat`,
    ),

  // Wait Time
  recordWaitTime: (
    queueId: string,
    eventType: string,
    data: Record<string, unknown>,
  ) =>
    api.post<{ success: boolean; data: unknown }>(
      `/core/walkup/queues/${queueId}/wait-time`,
      { eventType, ...data },
    ),
  getWaitTimeEstimate: (queueId: string) =>
    api.get<{
      success: boolean;
      data: {
        estimatedWaitMinutes: number;
        avgWaitMinutes: number;
        queueSize: number;
      };
    }>(`/core/walkup/queues/${queueId}/wait-time`),

  // Dashboard
  getDashboard: () =>
    api.get<{ success: boolean; data: WalkupDashboard }>(
      "/core/walkup/dashboard",
    ),
};

export default walkupApi;

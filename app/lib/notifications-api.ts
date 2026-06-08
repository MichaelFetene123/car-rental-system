import { authFetch } from "@/app/lib/auth";

export type EmailSettings = {
  host: string;
  port: number;
  username: string;
  password?: string;
  fromName: string;
  fromEmail: string;
};

export type NotificationLog = {
  id: string;
  type: "email" | "sms";
  recipient: string;
  subject: string | null;
  status: "sent" | "failed" | "pending";
  sent_at: string;
  error_message?: string | null;
  user?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
};

export type NotificationStats = {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  successRate: number;
};

export type SendBulkNotificationPayload = {
  type: "email" | "sms";
  recipientType: "all" | "specific";
  userIds?: string[];
  subject?: string;
  message: string;
};

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const error = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(error.message)) return error.message.join(", ");
    if (typeof error.message === "string") return error.message;
  } catch {
    return "An unknown error occurred.";
  }
  return response.statusText || "Request failed";
};

export const fetchNotificationSettings = async (
  signal?: AbortSignal,
): Promise<{ email: any; sms: any }> => {
  const response = await authFetch("/notifications/settings", {
    method: "GET",
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return await response.json();
};

export const updateEmailSettings = async (
  payload: EmailSettings,
): Promise<void> => {
  const response = await authFetch("/notifications/settings/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
};

export const fetchNotificationLogs = async (
  signal?: AbortSignal,
): Promise<NotificationLog[]> => {
  const response = await authFetch("/notifications/logs", {
    method: "GET",
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return await response.json();
};

export const fetchNotificationStats = async (
  signal?: AbortSignal,
): Promise<NotificationStats> => {
  const response = await authFetch("/notifications/stats", {
    method: "GET",
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return await response.json();
};

export const sendBulkNotification = async (
  payload: SendBulkNotificationPayload,
): Promise<{ total: number }> => {
  const response = await authFetch("/notifications/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return await response.json();
};

export const deleteNotificationLog = async (id: string): Promise<void> => {
  const response = await authFetch(`/notifications/logs/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
};

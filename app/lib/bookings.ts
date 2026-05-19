import { authFetch } from "@/app/lib/auth";
import type { BookingStatus, CarStatus, PaymentStatus } from "@/app/lib/status";

export type PaymentMethod = "credit_card" | "mobile_money" | "cash" | "chapa";
export type RefundMode = "auto" | "manual_review";

export type AdminPayment = {
  id: string;
  status: PaymentStatus;
  amount: number | string;
  refundedAmount?: number | string | null;
  paidAt?: string | null;
  method?: PaymentMethod | null;
};

export type AdminBooking = {
  id: string;
  bookingCode: string;
  status: BookingStatus;
  totalAmount: number | string;
  pickupAt: string;
  returnAt: string;
  bookedAt: string;
  extraCharges?: number | string | null;
  lateFee?: number | string | null;
  inspectionFee?: number | string | null;
  damageNotes?: string | null;
  user: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
  };
  car: {
    id: string;
    name: string;
    imageUrl: string | null;
    status: CarStatus;
  };
  pickupLocation: {
    name: string;
  } | null;
  returnLocation: {
    name: string;
  } | null;
  payments?: AdminPayment[];
};

export type BookingConflict = {
  id: string;
  bookingCode: string;
  pickupAt: string;
  returnAt: string;
  status: BookingStatus;
  conflictType: "overlap" | "buffer_violation";
};

export type AdminPaymentSummary = {
  hasCompletedPayment: boolean;
  totalCompleted: number;
  totalRefunded: number;
  pendingPayments: number;
  netPaid: number;
};

export type AdminReviewQueueItem = {
  booking: AdminBooking;
  paymentSummary: AdminPaymentSummary;
  hasCompletedPayment: boolean;
  conflicts: BookingConflict[];
  hasConflicts: boolean;
};

export type AdminRefundProcessResult = {
  bookingId: string;
  paymentId: string | null;
  requestedAmount: number | null;
  total: number;
  queued: number;
  completed: number;
  failed: number;
  skipped: number;
};

export const BOOKINGS_QUERY_KEY = ["bookings", "all"] as const;

const parseError = async (response: Response) => {
  const errorText = await response.text();
  return `(${response.status}). ${errorText || response.statusText}`;
};

const parseJson = async <T>(response: Response): Promise<T> => {
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
};

export const fetchAllBookings = async (
  signal?: AbortSignal,
): Promise<AdminBooking[]> => {
  const response = await authFetch("/bookings", {
    method: "GET",
    signal,
  });

  if (!response.ok) {
    throw new Error(`Unable to load bookings ${await parseError(response)}`);
  }

  return parseJson<AdminBooking[]>(response);
};

export const fetchAdminReviewQueue = async (
  paidOnly?: boolean,
): Promise<AdminReviewQueueItem[]> => {
  const query = typeof paidOnly === "boolean" ? `?paidOnly=${paidOnly}` : "";
  const response = await authFetch(`/bookings/admin/review-queue${query}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(
      `Unable to load review queue ${await parseError(response)}`,
    );
  }

  return parseJson<AdminReviewQueueItem[]>(response);
};

const requestAdminAction = async <T>(
  endpoint: string,
  payload: Record<string, unknown>,
): Promise<T> => {
  const response = await authFetch(endpoint, {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Unable to update booking ${await parseError(response)}`);
  }

  return parseJson<T>(response);
};

export const approveBooking = async (payload: {
  bookingId: string;
  reviewNote?: string;
}) => requestAdminAction<AdminBooking>("/bookings/admin/approve", payload);

export const rejectBooking = async (payload: {
  bookingId: string;
  reason?: string;
  refundMode?: RefundMode;
}) => requestAdminAction<AdminBooking>("/bookings/admin/reject", payload);

export const pickupBooking = async (payload: { bookingId: string }) =>
  requestAdminAction<AdminBooking>("/bookings/admin/pickup", payload);

export const completeBooking = async (payload: {
  bookingId: string;
  actualReturnedAt?: string;
}) => requestAdminAction<AdminBooking>("/bookings/admin/complete", payload);

export const noShowBooking = async (payload: {
  bookingId: string;
  reason?: string;
}) => requestAdminAction<AdminBooking>("/bookings/admin/no-show", payload);

export const inspectBooking = async (payload: {
  bookingId: string;
  extraCharges?: number;
  lateFee?: number;
  inspectionFee?: number;
  damageNotes?: string;
  createAdditionalPayment?: boolean;
  additionalPaymentMethod?: PaymentMethod;
}) => requestAdminAction<AdminBooking>("/bookings/admin/inspection", payload);

export const cancelUnpaidPendingBooking = async (payload: {
  bookingId: string;
  reason?: string;
}) =>
  requestAdminAction<AdminBooking>("/bookings/admin/cancel-unpaid", payload);

export const processRefundForBooking = async (payload: {
  bookingId: string;
  reason?: string;
}) =>
  requestAdminAction<AdminRefundProcessResult>(
    `/bookings/admin/${payload.bookingId}/refund`,
    {
      reason: payload.reason,
    },
  );

export const deleteExpiredBooking = async (bookingId: string) => {
  const response = await authFetch(`/bookings/admin/${bookingId}/expired`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      `Unable to delete expired booking ${await parseError(response)}`,
    );
  }
};

export const deleteCancelledBooking = async (bookingId: string) => {
  const response = await authFetch(`/bookings/admin/${bookingId}/cancelled`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      `Unable to delete cancelled booking ${await parseError(response)}`,
    );
  }
};

export const deleteCompletedBooking = async (bookingId: string) => {
  const response = await authFetch(`/bookings/admin/${bookingId}/completed`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      `Unable to delete completed booking ${await parseError(response)}`,
    );
  }
};

export const deleteRefundedBooking = async (bookingId: string) => {
  const response = await authFetch(`/bookings/admin/${bookingId}/refunded`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      `Unable to delete refunded booking ${await parseError(response)}`,
    );
  }
};

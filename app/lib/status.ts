export type BookingStatus =
  | "pending"
  | "approved"
  | "active"
  | "completed"
  | "rejected"
  | "cancelled"
  | "no_show"
  | "expired";

export type PaymentStatus =
  | "pending"
  | "completed"
  | "refund_initiated"
  | "refund_processing"
  | "partially_refunded"
  | "refunded"
  | "refund_reversed"
  | "failed"
  | "expired";

export type CarStatus = "available" | "rented" | "maintenance";

export const bookingStatusLabels: Record<BookingStatus, string> = {
  pending: "Booking Approval Pending",
  approved: "Booking Approved",
  active: "Booking Active Rental",
  completed: "Booking Completed",
  rejected: "Booking Rejected",
  cancelled: "Booking Cancelled",
  no_show: "Booking No Show",
  expired: "Booking Expired",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: "Payment Pending",
  completed: "Payment Completed",
  refund_initiated: "Refund Initiated",
  refund_processing: "Refund Processing",
  partially_refunded: "Partially Refunded",
  refunded: "Refunded",
  refund_reversed: "Refund Reversed",
  failed: "Payment Failed",
  expired: "Payment Expired",
};

export const PAYMENT_STATUS_ORDER: PaymentStatus[] = [
  "pending",
  "completed",
  "refund_initiated",
  "refund_processing",
  "partially_refunded",
  "refunded",
  "refund_reversed",
  "failed",
  "expired",
];

export const carStatusLabels: Record<CarStatus, string> = {
  available: "Available",
  rented: "Rented",
  maintenance: "Maintenance",
};

export const BOOKING_STATUS_ORDER: BookingStatus[] = [
  "pending",
  "approved",
  "active",
  "completed",
];

export const ARCHIVED_BOOKING_STATUSES: BookingStatus[] = [
  "completed",
  "cancelled",
  "rejected",
  "no_show",
];

export const isTerminalBookingStatus = (status: BookingStatus) =>
  ["rejected", "cancelled", "no_show", "expired"].includes(status);

export type BookingStatus =
  | "pending"
  | "approved"
  | "active"
  | "completed"
  | "rejected"
  | "cancelled"
  | "no_show";

export type PaymentStatus =
  | "pending"
  | "completed"
  | "partially_refunded"
  | "refunded"
  | "failed";

export type CarStatus = "available" | "rented" | "maintenance";

export const bookingStatusLabels: Record<BookingStatus, string> = {
  pending: "Pending Approval",
  approved: "Approved",
  active: "Active Rental",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
  no_show: "No Show",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  pending: "Payment Pending",
  completed: "Payment Completed",
  partially_refunded: "Partially Refunded",
  refunded: "Refunded",
  failed: "Payment Failed",
};

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
  ["rejected", "cancelled", "no_show"].includes(status);

import type { PaymentStatus } from "@/app/lib/status";

export type PaymentLike = {
  amount: number | string;
  refundedAmount?: number | string | null;
  status: PaymentStatus;
};

export type PaymentSummary = {
  totalCompleted: number;
  totalRefunded: number;
  pendingPayments: number;
  failedPayments: number;
  netPaid: number;
  hasCompletedPayment: boolean;
  hasNetPayment: boolean;
};

const toNumber = (value: number | string | null | undefined) =>
  value === null || value === undefined ? 0 : Number(value);

export const summarizePayments = (payments: PaymentLike[]): PaymentSummary => {
  const totalCompleted = payments
    .filter((payment) => payment.status === "completed")
    .reduce((sum, payment) => sum + toNumber(payment.amount), 0);

  const totalRefunded = payments
    .filter((payment) =>
      ["refunded", "partially_refunded"].includes(payment.status),
    )
    .reduce((sum, payment) => sum + toNumber(payment.refundedAmount), 0);

  const pendingPayments = payments.filter(
    (payment) => payment.status === "pending",
  ).length;

  const failedPayments = payments.filter(
    (payment) => payment.status === "failed",
  ).length;

  const netPaid = totalCompleted - totalRefunded;

  return {
    totalCompleted,
    totalRefunded,
    pendingPayments,
    failedPayments,
    netPaid,
    hasCompletedPayment: totalCompleted > 0,
    hasNetPayment: netPaid > 0,
  };
};

export const resolvePaymentStatus = (
  summary: PaymentSummary,
  totalAmount: number,
  payments: PaymentLike[],
): PaymentStatus => {
  if (!payments.length) return "pending";

  if (payments.some((payment) => payment.status === "expired")) {
    return "expired";
  }

  const hasRefund = payments.some((payment) =>
    [
      "refunded",
      "partially_refunded",
      "refund_initiated",
      "refund_processing",
      "refund_reversed",
    ].includes(payment.status),
  );

  if (payments.some((payment) => payment.status === "refund_reversed")) {
    return "refund_reversed";
  }

  if (payments.some((payment) => payment.status === "refund_processing")) {
    return "refund_processing";
  }

  if (payments.some((payment) => payment.status === "refund_initiated")) {
    return "refund_initiated";
  }

  if (summary.netPaid <= 0 && hasRefund) {
    return "refunded";
  }

  if (payments.some((payment) => payment.status === "partially_refunded")) {
    return "partially_refunded";
  }

  if (totalAmount > 0 && summary.netPaid >= totalAmount) {
    return "completed";
  }

  if (payments.some((payment) => payment.status === "failed")) {
    return "failed";
  }

  if (summary.pendingPayments > 0) {
    return "pending";
  }

  return "pending";
};

export const isPaymentCovered = (
  summary: PaymentSummary,
  totalAmount: number,
) => summary.netPaid >= totalAmount;

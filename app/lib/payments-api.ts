import { authFetch } from "@/app/lib/auth";
import type { PaymentStatus as SharedPaymentStatus } from "@/app/lib/status";

export type PaymentMethod = "credit_card" | "mobile_money" | "cash" | "chapa";

export type PaymentStatus = SharedPaymentStatus;

export type AdminPayment = {
  id: string;
  bookingId: string;
  bookingCode: string;
  customerName: string;
  customerEmail: string;
  invoiceNumber: string;
  transactionId: string | null;
  amount: number;
  tax: number;
  fees: number;
  refundedAmount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt: string | null;
  createdAt: string;
  refundReason: string | null;
  notes: string | null;
};

export type PaginatedPaymentsResponse = {
  data: AdminPayment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type AdminPaymentStats = {
  totalRevenue: number;
  pendingAmount: number;
  refundedAmount: number;
  totalTransactions: number;
};

export type AdminRefundResult = {
  paymentId: string;
  bookingId: string;
  requestedAmount: number | null;
  refundedAmount: number;
  status: string;
  message: string;
};

export const PAYMENTS_QUERY_KEY = ["adminPayments"] as const;

const parseError = async (response: Response) => {
  try {
    const error = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(error.message)) return error.message.join(", ");
    if (typeof error.message === "string") return error.message;
  } catch {
    // ignore
  }
  return `(${response.status}) ${response.statusText || "Request failed"}`;
};

const parseJson = async <T>(response: Response): Promise<T> => {
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
};

export const fetchAdminPayments = async (
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    method?: string;
    startDate?: string;
    endDate?: string;
  },
  signal?: AbortSignal,
): Promise<PaginatedPaymentsResponse> => {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== "all") {
        searchParams.set(key, String(value));
      }
    });
  }

  const query = searchParams.toString();
  const response = await authFetch(
    `/admin/payments${query ? `?${query}` : ""}`,
    {
      method: "GET",
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to load payments ${await parseError(response)}`);
  }

  return parseJson<PaginatedPaymentsResponse>(response);
};

export const computePaymentStats = (
  payments: AdminPayment[],
): AdminPaymentStats => {
  return {
    totalRevenue: payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: payments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0),
    refundedAmount: payments
      .filter(
        (p) => p.status === "refunded" || p.status === "partially_refunded",
      )
      .reduce((sum, p) => sum + p.refundedAmount, 0),
    totalTransactions: payments.length,
  };
};

export const updatePaymentStatus = async (
  paymentId: string,
  dto: { status: PaymentStatus; notes?: string },
): Promise<AdminPayment> => {
  const response = await authFetch(`/admin/payments/${paymentId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    throw new Error(
      `Unable to update payment status ${await parseError(response)}`,
    );
  }

  return parseJson<AdminPayment>(response);
};

export const processPaymentRefund = async (
  paymentId: string,
  dto: { amount?: number; reason: string },
): Promise<AdminRefundResult> => {
  const response = await authFetch(`/admin/payments/${paymentId}/refund`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    throw new Error(`Unable to process refund ${await parseError(response)}`);
  }

  return parseJson<AdminRefundResult>(response);
};

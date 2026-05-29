"use client";
import { useState, useEffect } from "react";
import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/ui/dialog";
import { Label } from "@/app/ui/lable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui/select";
import { Textarea } from "@/app/ui/textarea";
import {
  DollarSign,
  CreditCard,
  Smartphone,
  Banknote,
  Receipt,
  RefreshCw,
  AlertCircle,
  Download,
  Eye,
} from "lucide-react";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableScrollArea,
} from "@/app/ui/table";
import { lusitana } from "@/app/ui/utils/fonts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TableSkeletonRows } from "@/app/ui/skeletons";
import { PaymentStatusBadge } from "@/app/ui/status-badges";
import {
  fetchAdminPayments,
  computePaymentStats,
  updatePaymentStatus,
  PAYMENTS_QUERY_KEY,
  type AdminPayment,
  type PaymentStatus,
} from "@/app/lib/payments-api";
import { PAYMENT_STATUS_ORDER, paymentStatusLabels } from "@/app/lib/status";

export default function ManagePayments() {
  const queryClient = useQueryClient();
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMethod, setFilterMethod] = useState("all");

  const {
    data: paymentsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      ...PAYMENTS_QUERY_KEY,
      { search: searchTerm, status: filterStatus, method: filterMethod },
    ],
    queryFn: ({ signal }) =>
      fetchAdminPayments(
        {
          search: searchTerm || undefined,
          status: filterStatus !== "all" ? filterStatus : undefined,
          method: filterMethod !== "all" ? filterMethod : undefined,
        },
        signal,
      ),
  });

  const payments = paymentsData?.data ?? [];
  const stats = computePaymentStats(payments);
  const availableStatusSet = new Set(payments.map((p) => p.status));
  const availableStatuses = PAYMENT_STATUS_ORDER.filter((s) =>
    availableStatusSet.has(s),
  );
  const shouldScrollTableBody = payments.length > 5;
  const ROW_HEIGHT_PX = 56; // approximate table row height
  const HEADER_HEIGHT_PX = 56; // approximate header height

  // Refunds are handled from the booking page; no client refund action here.

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: PaymentStatus;
      notes?: string;
    }) => updatePaymentStatus(id, { status, notes }),
    onSuccess: () => {
      toast.success("Payment status updated");
      queryClient.invalidateQueries({ queryKey: PAYMENTS_QUERY_KEY });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Status update failed");
    },
  });

  // No-op: refunds handled elsewhere

  const handleStatusChange = (
    payment: AdminPayment,
    newStatus: PaymentStatus,
  ) => {
    statusMutation.mutate({ id: payment.id, status: newStatus });
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "credit_card":
        return <CreditCard className="size-4" />;
      case "mobile_money":
        return <Smartphone className="size-4" />;
      case "cash":
        return <Banknote className="size-4" />;
      default:
        return <CreditCard className="size-4" />;
    }
  };

  const formatETB = (amount: number) =>
    `ETB ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`${lusitana.className} text-2xl pb-2`}>
          Payment & Billing Management
        </h1>
        <p className="text-muted-foreground">
          Track payments, process refunds, and manage invoices
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-blue-50 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              Total Revenue
            </CardTitle>
            <DollarSign className="size-4 text-blue-700" />
          </CardHeader>
          <CardContent className="text-blue-900">
            <div className="text-2xl font-bold text-blue-900">
              {formatETB(stats.totalRevenue)}
            </div>
            <p className="text-xs text-blue-700">Completed payments</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">
              Pending
            </CardTitle>
            <AlertCircle className="size-4 text-emerald-700" />
          </CardHeader>
          <CardContent className="text-emerald-900">
            <div className="text-2xl font-bold text-emerald-900">
              {formatETB(stats.pendingAmount)}
            </div>
            <p className="text-xs text-emerald-700">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">
              Refunded
            </CardTitle>
            <RefreshCw className="size-4 text-amber-700" />
          </CardHeader>
          <CardContent className="text-amber-900">
            <div className="text-2xl font-bold text-amber-900">
              {formatETB(stats.refundedAmount)}
            </div>
            <p className="text-xs text-amber-700">Total refunds</p>
          </CardContent>
        </Card>
        <Card className="bg-rose-50 border-rose-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-rose-800">
              Transactions
            </CardTitle>
            <Receipt className="size-4 text-rose-700" />
          </CardHeader>
          <CardContent className="text-rose-900">
            <div className="text-2xl font-bold text-rose-900">
              {payments.length}
            </div>
            <p className="text-xs text-rose-700">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Search by customer, booking, or invoice..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              className="md:w-96 bg-sky-100 border-none"
            />
            <Select
              value={filterStatus}
              onValueChange={(v) => {
                setFilterStatus(v);
              }}
            >
              <SelectTrigger className="md:w-48 border-gray-300 bg-sky-100">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="border-none bg-white">
                <SelectItem value="all">All Status</SelectItem>
                {availableStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {paymentStatusLabels[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterMethod}
              onValueChange={(v) => {
                setFilterMethod(v);
              }}
            >
              <SelectTrigger className="md:w-48 border-gray-300 bg-sky-100">
                <SelectValue placeholder="Filter by method" />
              </SelectTrigger>
              <SelectContent className="border-none bg-white">
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="chapa">Chapa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TableScrollArea
            className="rounded bg-white"
            style={{
              maxHeight: shouldScrollTableBody
                ? `${ROW_HEIGHT_PX * 5 + HEADER_HEIGHT_PX}px`
                : undefined,
              overflowY: shouldScrollTableBody ? "auto" : "visible",
            }}
          >
            <table className="w-full min-w-175 caption-bottom text-sm">
              <TableHeader className="[&_th]:sticky [&_th]:top-0 [&_th]:z-20 [&_th]:bg-white">
                <TableRow className="border-gray-300">
                  <TableHead className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-[inset_0_-1px_0_0_#d1d5db]">
                    Invoice
                  </TableHead>
                  <TableHead className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-[inset_0_-1px_0_0_#d1d5db]">
                    Booking
                  </TableHead>
                  <TableHead className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-[inset_0_-1px_0_0_#d1d5db]">
                    Customer
                  </TableHead>
                  <TableHead className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-[inset_0_-1px_0_0_#d1d5db]">
                    Method
                  </TableHead>
                  <TableHead className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-[inset_0_-1px_0_0_#d1d5db]">
                    Amount
                  </TableHead>
                  <TableHead className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-[inset_0_-1px_0_0_#d1d5db]">
                    Tax/Fees
                  </TableHead>
                  <TableHead className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-[inset_0_-1px_0_0_#d1d5db]">
                    Status
                  </TableHead>
                  <TableHead className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-[inset_0_-1px_0_0_#d1d5db]">
                    Date
                  </TableHead>
                  <TableHead className="sticky top-0 z-30 bg-white border-b border-gray-200 text-center shadow-[inset_0_-1px_0_0_#d1d5db]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeletonRows columns={9} rows={5} />
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-8 text-red-600"
                    >
                      Failed to load payments:{" "}
                      {error instanceof Error ? error.message : "Unknown error"}
                    </TableCell>
                  </TableRow>
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id} className="border-gray-300">
                      <TableCell className="font-medium">
                        {payment.invoiceNumber}
                      </TableCell>
                      <TableCell>{payment.bookingCode}</TableCell>
                      <TableCell>{payment.customerName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMethodIcon(payment.method)}
                          <span className="capitalize">
                            {payment.method.replace("_", " ")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatETB(payment.amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatETB(payment.tax + payment.fees)}
                      </TableCell>
                      <TableCell>
                        <PaymentStatusBadge status={payment.status} />
                      </TableCell>
                      <TableCell>
                        {payment.paidAt
                          ? new Date(payment.paidAt).toLocaleDateString()
                          : new Date(payment.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View Details"
                            disabled={statusMutation.isPending}
                            onClick={() => {
                              setSelectedPayment(payment);
                              setIsDetailDialogOpen(true);
                            }}
                          >
                            <Eye className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Download Invoice"
                            disabled={statusMutation.isPending}
                            onClick={() => {
                              // Create a simple HTML invoice and download as file
                              const invoiceHtml = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${payment.invoiceNumber}</title></head><body><h1>Invoice: ${payment.invoiceNumber}</h1><p><strong>Booking:</strong> ${payment.bookingCode}</p><p><strong>Customer:</strong> ${payment.customerName} &lt;${payment.customerEmail}&gt;</p><p><strong>Amount:</strong> ${formatETB(payment.amount)}</p><p><strong>Tax:</strong> ${formatETB(payment.tax)}</p><p><strong>Fees:</strong> ${formatETB(payment.fees)}</p><p><strong>Paid At:</strong> ${payment.paidAt ?? payment.createdAt}</p><p><strong>Method:</strong> ${payment.method}</p><p><strong>Status:</strong> ${payment.status}</p></body></html>`;
                              const blob = new Blob([invoiceHtml], {
                                type: "text/html",
                              });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = `${payment.invoiceNumber}.html`;
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                              URL.revokeObjectURL(url);
                            }}
                          >
                            <Download className="size-4" />
                          </Button>
                          {/* Refund action removed — handled in booking page */}
                          {/* Delete action removed — handled in booking page */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </table>
          </TableScrollArea>
        </CardContent>
      </Card>

      {/* Refunds are handled on the booking page; UI removed here. */}

      {/* Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="bg-white border-none max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Details for invoice {selectedPayment?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-3">
            {selectedPayment ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Invoice</p>
                  <div className="font-medium">
                    {selectedPayment.invoiceNumber}
                  </div>

                  <p className="text-sm text-muted-foreground mt-2">Booking</p>
                  <div className="font-medium">
                    {selectedPayment.bookingCode}
                  </div>

                  <p className="text-sm text-muted-foreground mt-2">Customer</p>
                  <div className="font-medium">
                    {selectedPayment.customerName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedPayment.customerEmail}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment</p>
                  <div className="font-medium">
                    {formatETB(selectedPayment.amount)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Tax: {formatETB(selectedPayment.tax)} • Fees:{" "}
                    {formatETB(selectedPayment.fees)}
                  </div>

                  <p className="text-sm text-muted-foreground mt-2">Status</p>
                  <PaymentStatusBadge status={selectedPayment.status} />

                  <p className="text-sm text-muted-foreground mt-2">
                    Transaction
                  </p>
                  <div className="font-medium">
                    {selectedPayment.transactionId ?? "—"}
                  </div>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <div className="whitespace-pre-wrap">
                    {selectedPayment.notes ?? "No notes"}
                  </div>
                </div>
              </div>
            ) : (
              <div>No payment selected</div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                if (!selectedPayment) return;
                const invoiceHtml = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${selectedPayment.invoiceNumber}</title></head><body><h1>Invoice: ${selectedPayment.invoiceNumber}</h1><p><strong>Booking:</strong> ${selectedPayment.bookingCode}</p><p><strong>Customer:</strong> ${selectedPayment.customerName} &lt;${selectedPayment.customerEmail}&gt;</p><p><strong>Amount:</strong> ${formatETB(selectedPayment.amount)}</p><p><strong>Tax:</strong> ${formatETB(selectedPayment.tax)}</p><p><strong>Fees:</strong> ${formatETB(selectedPayment.fees)}</p><p><strong>Paid At:</strong> ${selectedPayment.paidAt ?? selectedPayment.createdAt}</p><p><strong>Method:</strong> ${selectedPayment.method}</p><p><strong>Status:</strong> ${selectedPayment.status}</p></body></html>`;
                const blob = new Blob([invoiceHtml], { type: "text/html" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${selectedPayment.invoiceNumber}.html`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Download Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

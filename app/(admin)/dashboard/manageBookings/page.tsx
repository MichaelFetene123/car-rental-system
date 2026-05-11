"use client";
import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { toast } from "sonner";
import { Badge } from "@/app/ui/badge";
import { Button } from "@/app/ui/button";
import {
  Check,
  X,
  Ban,
  Search,
  AlertCircle,
  Loader2,
  Car,
  Flag,
  ClipboardCheck,
  AlertTriangle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/ui/table";
import { Input } from "@/app/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui/select";
import { lusitana } from "@/app/ui/utils/fonts";
import {
  fetchAllBookings,
  fetchAdminReviewQueue,
  approveBooking,
  rejectBooking,
  pickupBooking,
  completeBooking,
  noShowBooking,
  inspectBooking,
  AdminBooking,
  AdminReviewQueueItem,
  RefundMode,
  PaymentMethod,
} from "@/app/lib/bookings";
import {
  BookingStatusBadge,
  CarStatusBadge,
  PaymentStatusBadge,
} from "@/app/ui/status-badges";
import {
  isPaymentCovered,
  resolvePaymentStatus,
  summarizePayments,
} from "@/app/lib/payment-summary";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/ui/dialog";
import { Label } from "@/app/ui/lable";
import { Textarea } from "@/app/ui/textarea";
import { Switch } from "@/app/ui/switch";

const ManageBookingsPage = () => {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [reviewQueue, setReviewQueue] = useState<AdminReviewQueueItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "approve" | "pickup" | "complete" | "no_show";
    booking: AdminBooking;
  } | null>(null);
  const [confirmReason, setConfirmReason] = useState("");
  const [rejectTarget, setRejectTarget] = useState<AdminBooking | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [refundMode, setRefundMode] = useState<RefundMode>("auto");
  const [inspectTarget, setInspectTarget] = useState<AdminBooking | null>(null);
  const [inspectForm, setInspectForm] = useState({
    extraCharges: "",
    lateFee: "",
    damageNotes: "",
    createAdditionalPayment: true,
    additionalPaymentMethod: "cash" as PaymentMethod,
  });

  const reviewQueueMap = useMemo<Map<string, AdminReviewQueueItem>>(() => {
    return new Map(reviewQueue.map((item) => [item.booking.id, item]));
  }, [reviewQueue]);

  // Fetch bookings on mount
  useEffect(() => {
    const loadBookings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [data, reviewData] = await Promise.all([
          fetchAllBookings(),
          fetchAdminReviewQueue(false),
        ]);
        setBookings(data);
        setReviewQueue(reviewData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load bookings";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.user.full_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      booking.car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.bookingCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const applyBookingUpdate = (updated: AdminBooking) => {
    setBookings((current) =>
      current.map((booking) => (booking.id === updated.id ? updated : booking)),
    );

    if (updated.status !== "pending") {
      setReviewQueue((current) =>
        current.filter((item) => item.booking.id !== updated.id),
      );
    }
  };

  const openConfirmAction = (
    type: "approve" | "pickup" | "complete" | "no_show",
    booking: AdminBooking,
  ) => {
    setConfirmReason("");
    setConfirmAction({ type, booking });
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    const { booking, type } = confirmAction;
    setActionInProgress(booking.id);

    try {
      let updated: AdminBooking | null = null;

      if (type === "approve") {
        updated = await approveBooking({ bookingId: booking.id });
      }

      if (type === "pickup") {
        updated = await pickupBooking({ bookingId: booking.id });
      }

      if (type === "complete") {
        updated = await completeBooking({ bookingId: booking.id });
      }

      if (type === "no_show") {
        updated = await noShowBooking({
          bookingId: booking.id,
          reason: confirmReason || undefined,
        });
      }

      if (updated) {
        applyBookingUpdate(updated);
      }

      toast.success("Booking updated successfully");
      setConfirmAction(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update booking status";
      toast.error(errorMessage);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;

    setActionInProgress(rejectTarget.id);
    try {
      const updated = await rejectBooking({
        bookingId: rejectTarget.id,
        reason: rejectReason || undefined,
        refundMode,
      });

      applyBookingUpdate(updated);
      toast.success("Booking rejected");
      setRejectTarget(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to reject booking";
      toast.error(errorMessage);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleInspect = async () => {
    if (!inspectTarget) return;

    const extraCharges = Number(inspectForm.extraCharges || 0);
    const lateFee = Number(inspectForm.lateFee || 0);

    if (extraCharges < 0 || lateFee < 0) {
      toast.error("Charges must be zero or higher.");
      return;
    }

    setActionInProgress(inspectTarget.id);
    try {
      const updated = await inspectBooking({
        bookingId: inspectTarget.id,
        extraCharges: extraCharges || undefined,
        lateFee: lateFee || undefined,
        damageNotes: inspectForm.damageNotes || undefined,
        createAdditionalPayment: inspectForm.createAdditionalPayment,
        additionalPaymentMethod: inspectForm.additionalPaymentMethod,
      });

      applyBookingUpdate(updated);
      toast.success("Inspection recorded");
      setInspectTarget(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to record inspection";
      toast.error(errorMessage);
    } finally {
      setActionInProgress(null);
    }
  };

  const getPaymentSummary = (booking: AdminBooking) =>
    summarizePayments(booking.payments ?? []);

  const getPaymentStatus = (booking: AdminBooking) => {
    const totalAmount = Number(booking.totalAmount);
    const payments = booking.payments ?? [];
    const summary = getPaymentSummary(booking);

    return resolvePaymentStatus(summary, totalAmount, payments);
  };

  const isPaymentReady = (booking: AdminBooking) => {
    const summary = getPaymentSummary(booking);
    return isPaymentCovered(summary, Number(booking.totalAmount));
  };

  const getConflictDetails = (bookingId: string) =>
    reviewQueueMap.get(bookingId)?.conflicts ?? [];

  const formatConflictLabel = (bookingId: string) => {
    const conflicts = getConflictDetails(bookingId);
    if (!conflicts.length) return null;

    const labels = conflicts.map((conflict) =>
      conflict.conflictType === "overlap" ? "Overlap" : "Buffer",
    );

    return `Conflict: ${labels.join(", ")}`;
  };

  const isLateReturn = (booking: AdminBooking) => {
    if (!["approved", "active"].includes(booking.status)) return false;
    const now = new Date();
    const returnAt = new Date(booking.returnAt);
    return now.getTime() > returnAt.getTime();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="space-y-6 ">
      <div>
        <h1 className={`${lusitana.className} text-2xl mb-1`}>
          Manage Bookings
        </h1>
        <p className="text-muted-foreground">
          Approve, reject, or cancel customer bookings
        </p>
      </div>

      {/* Booking Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-blue-50 border-blue-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800">
              Pending Bookings
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-900">
            <div className="text-3xl font-semibold text-blue-900">
              {bookings.filter((b) => b.status === "pending").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-emerald-800">
              Approved Bookings
            </CardTitle>
          </CardHeader>
          <CardContent className="text-emerald-900">
            <div className="text-3xl font-semibold text-emerald-900">
              {bookings.filter((b) => b.status === "approved").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-indigo-50 border-indigo-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-indigo-800">
              Active Rentals
            </CardTitle>
          </CardHeader>
          <CardContent className="text-indigo-900">
            <div className="text-3xl font-semibold text-indigo-900">
              {bookings.filter((b) => b.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-rose-50 border-rose-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-rose-800">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="text-rose-900">
            <div className="text-3xl font-semibold text-rose-900">
              {formatCurrency(
                bookings.reduce((sum, booking) => {
                  const summary = getPaymentSummary(booking);
                  return sum + summary.netPaid;
                }, 0),
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6 flex items-center gap-2 text-red-700">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="ml-auto"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Booking Table */}
      <Card className="bg-gray-50 rounded-lg border-none">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>
              All Bookings
              {isLoading && (
                <Loader2 className="inline ml-2 size-4 animate-spin" />
              )}
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-gray-300 focus:border-2 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full sm:w-40 bg-gray-200 border-gray-300 focus:border-2 focus:border-blue-500">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-none">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="m-4 bg-white rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-blue-500" />
              <span className="ml-2 text-muted-foreground">
                Loading bookings...
              </span>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-muted-foreground text-lg">
                  {bookings.length === 0
                    ? "No bookings found"
                    : "No bookings match your search"}
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 ">
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Car</TableHead>
                  <TableHead>Pickup Date</TableHead>
                  <TableHead>Return Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => {
                  const paymentSummary = getPaymentSummary(booking);
                  const paymentStatus = getPaymentStatus(booking);
                  const isPaid = isPaymentReady(booking);
                  const conflictLabel = formatConflictLabel(booking.id);
                  const conflicts = getConflictDetails(booking.id);
                  const isLate = isLateReturn(booking);
                  const extraCharges = Number(booking.extraCharges ?? 0);
                  const lateFee = Number(booking.lateFee ?? 0);
                  const totalExtras = extraCharges + lateFee;
                  const canApprove =
                    booking.status === "pending" && isPaid && !conflicts.length;
                  const canReject = booking.status === "pending";
                  const canPickup = booking.status === "approved";
                  const canComplete = booking.status === "active";
                  const canNoShow = booking.status === "approved";
                  const canInspect = booking.status === "completed";

                  return (
                    <TableRow key={booking.id} className="border-gray-200 ">
                      <TableCell className="font-medium text-sm ">
                        {booking.bookingCode}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {booking.user.full_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {booking.user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.car.name}</p>
                          <div className="mt-2">
                            <CarStatusBadge status={booking.car.status} />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(booking.pickupAt)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(booking.returnAt)}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(booking.totalAmount)}
                        {totalExtras > 0 ? (
                          <p className="text-xs text-amber-700">
                            Extras: {formatCurrency(totalExtras)}
                          </p>
                        ) : null}
                        {booking.damageNotes ? (
                          <p className="text-xs text-amber-700">Damage noted</p>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <PaymentStatusBadge status={paymentStatus} />
                          <p className="text-xs text-muted-foreground">
                            Net paid: {formatCurrency(paymentSummary.netPaid)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <BookingStatusBadge status={booking.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          {conflictLabel ? (
                            <Badge
                              className="bg-rose-100 text-rose-700"
                              title={conflictLabel}
                            >
                              <AlertTriangle className="size-3" />
                              Conflict
                            </Badge>
                          ) : null}
                          {isLate ? (
                            <Badge className="bg-orange-100 text-orange-700">
                              Late
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {booking.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  openConfirmAction("approve", booking)
                                }
                                title={
                                  canApprove
                                    ? "Approve"
                                    : "Payment required or conflicts detected"
                                }
                                disabled={
                                  actionInProgress === booking.id || !canApprove
                                }
                                className="cursor-pointer"
                              >
                                {actionInProgress === booking.id ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <Check className="size-4 text-green-600 cursor-pointer" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setRejectTarget(booking)}
                                title="Reject"
                                disabled={
                                  actionInProgress === booking.id || !canReject
                                }
                                className="cursor-pointer"
                              >
                                {actionInProgress === booking.id ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <X className="size-4 text-red-600 cursor-pointer" />
                                )}
                              </Button>
                            </>
                          )}
                          {canPickup && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                openConfirmAction("pickup", booking)
                              }
                              title="Activate rental"
                              disabled={actionInProgress === booking.id}
                              className="cursor-pointer"
                            >
                              {actionInProgress === booking.id ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Car className="size-4 text-blue-600" />
                              )}
                            </Button>
                          )}
                          {canComplete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                openConfirmAction("complete", booking)
                              }
                              title="Complete rental"
                              disabled={actionInProgress === booking.id}
                              className="cursor-pointer"
                            >
                              {actionInProgress === booking.id ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Flag className="size-4 text-emerald-600" />
                              )}
                            </Button>
                          )}
                          {canNoShow && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                openConfirmAction("no_show", booking)
                              }
                              title="Mark no-show"
                              disabled={actionInProgress === booking.id}
                              className="cursor-pointer"
                            >
                              {actionInProgress === booking.id ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Ban className="size-4 text-orange-600" />
                              )}
                            </Button>
                          )}
                          {canInspect && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setInspectTarget(booking)}
                              title="Inspect return"
                              disabled={actionInProgress === booking.id}
                              className="cursor-pointer"
                            >
                              {actionInProgress === booking.id ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <ClipboardCheck className="size-4 text-purple-600" />
                              )}
                            </Button>
                          )}
                          {!canApprove &&
                          !canReject &&
                          !canPickup &&
                          !canComplete &&
                          !canNoShow &&
                          !canInspect ? (
                            <span className="text-sm text-muted-foreground px-2">
                              No actions
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(confirmAction)}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmAction(null);
            setConfirmReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === "approve"
                ? "Approve booking"
                : confirmAction?.type === "pickup"
                  ? "Activate rental"
                  : confirmAction?.type === "complete"
                    ? "Complete rental"
                    : "Mark no-show"}
            </DialogTitle>
            <DialogDescription>
              Confirm this action for booking{" "}
              {confirmAction?.booking.bookingCode}.
            </DialogDescription>
          </DialogHeader>
          {confirmAction?.type === "no_show" ? (
            <div className="space-y-2">
              <Label htmlFor="noShowReason">Reason (optional)</Label>
              <Input
                id="noShowReason"
                value={confirmReason}
                onChange={(event) => setConfirmReason(event.target.value)}
                placeholder="Reason for no-show"
              />
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={Boolean(actionInProgress)}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTarget(null);
            setRejectReason("");
            setRefundMode("auto");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject booking</DialogTitle>
            <DialogDescription>
              Reject booking {rejectTarget?.bookingCode} and process refunds.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectReason">Reason (optional)</Label>
              <Textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                placeholder="Why is this booking rejected?"
              />
            </div>
            <div className="space-y-2">
              <Label>Refund mode</Label>
              <Select
                value={refundMode}
                onValueChange={(value) => setRefundMode(value as RefundMode)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select refund mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto refund</SelectItem>
                  <SelectItem value="manual_review">Manual review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={Boolean(actionInProgress)}
            >
              Reject booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(inspectTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setInspectTarget(null);
            setInspectForm({
              extraCharges: "",
              lateFee: "",
              damageNotes: "",
              createAdditionalPayment: true,
              additionalPaymentMethod: "cash",
            });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inspect returned vehicle</DialogTitle>
            <DialogDescription>
              Record inspection results for booking {inspectTarget?.bookingCode}
              .
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="extraCharges">Extra charges</Label>
                <Input
                  id="extraCharges"
                  type="number"
                  min="0"
                  value={inspectForm.extraCharges}
                  onChange={(event) =>
                    setInspectForm((current) => ({
                      ...current,
                      extraCharges: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lateFee">Late fee</Label>
                <Input
                  id="lateFee"
                  type="number"
                  min="0"
                  value={inspectForm.lateFee}
                  onChange={(event) =>
                    setInspectForm((current) => ({
                      ...current,
                      lateFee: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="damageNotes">Damage notes</Label>
              <Textarea
                id="damageNotes"
                value={inspectForm.damageNotes}
                onChange={(event) =>
                  setInspectForm((current) => ({
                    ...current,
                    damageNotes: event.target.value,
                  }))
                }
                placeholder="Describe any damages or issues"
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label>Create additional payment</Label>
                <p className="text-xs text-muted-foreground">
                  Generate a payment request for extra charges.
                </p>
              </div>
              <Switch
                checked={inspectForm.createAdditionalPayment}
                onCheckedChange={(checked) =>
                  setInspectForm((current) => ({
                    ...current,
                    createAdditionalPayment: checked,
                  }))
                }
              />
            </div>
            {inspectForm.createAdditionalPayment ? (
              <div className="space-y-2">
                <Label>Payment method</Label>
                <Select
                  value={inspectForm.additionalPaymentMethod}
                  onValueChange={(value) =>
                    setInspectForm((current) => ({
                      ...current,
                      additionalPaymentMethod: value as PaymentMethod,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit_card">Credit card</SelectItem>
                    <SelectItem value="mobile_money">Mobile money</SelectItem>
                    <SelectItem value="chapa">Chapa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInspectTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleInspect}
              disabled={Boolean(actionInProgress)}
            >
              Save inspection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageBookingsPage;

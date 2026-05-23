"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Badge as BadgeIcon,
  Edit,
  AlertCircle,
  Trash2,
  Check,
  Circle,
} from "lucide-react";
import { Card } from "@/app/ui/card";
import { Button } from "@/app/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/ui/dialog";
import { Label } from "@/app/ui/lable";
import { Input } from "@/app/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui/select";
import { ImageWithFallback } from "@/app/ui/figma/imageWithFallBack";
import { MyBookingsSkeleton } from "@/app/ui/skeletons";
import { authFetch, getCurrentUserEmail } from "@/app/lib/auth";
import { CURRENT_USER_QUERY_KEY, useCurrentUser } from "@/app/lib/auth-queries";
import { subscribeToBookingSync } from "@/app/lib/booking-sync";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Switch } from "@/app/ui/switch";
import { BookingStatusBadge, PaymentStatusBadge } from "@/app/ui/status-badges";
import type { BookingStatus, PaymentStatus } from "@/app/lib/status";
import {
  ARCHIVED_BOOKING_STATUSES,
  bookingStatusLabels,
  isTerminalBookingStatus,
} from "@/app/lib/status";
import {
  isPaymentCovered,
  resolvePaymentStatus,
  summarizePayments,
} from "@/app/lib/payment-summary";
import type { PaymentSummary } from "@/app/lib/payment-summary";

type Booking = {
  id: string;
  carId: string;
  carName: string;
  carImage: string;
  carYear: number;
  carType: string;
  status: BookingStatus;
  rentalPeriod: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  returnLocation: string;
  pickupLocationId: string;
  returnLocationId: string;
  totalPrice: number;
  extraCharges: number;
  lateFee: number;
  inspectionFee: number;
  bookedAt: string;
  bookedOn: string;
  expiresAt: string | null;
  payments: BackendPayment[];
  paymentSummary: PaymentSummary;
  paymentStatus: PaymentStatus;
  isPaid: boolean;
};

type BackendPayment = {
  id: string;
  status: PaymentStatus;
  amount: number | string;
  refundedAmount?: number | string | null;
  paidAt?: string | null;
};

type BackendBooking = {
  id: string;
  carId: string;
  pickupAt: string;
  returnAt: string;
  bookedAt: string;
  expiresAt?: string | null;
  totalAmount: number | string;
  status: BookingStatus;
  extraCharges?: number | string | null;
  lateFee?: number | string | null;
  inspectionFee?: number | string | null;
  carNameSnapshot: string | null;
  carTypeSnapshot: string | null;
  carYearSnapshot: number | null;
  carImageSnapshot: string | null;
  pickupLocation?: { id: string; name: string } | null;
  returnLocation?: { id: string; name: string } | null;
  payments?: BackendPayment[];
};

type UpdateBookingPayload = {
  bookingId: string;
  pickupAt: string;
  returnAt: string;
  pickupLocationId: string;
  returnLocationId: string;
};

const fallbackBookingImage =
  "https://images.unsplash.com/photo-1549924231-f129b911e442?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";
const PAYMENT_EXPIRY_WINDOW_MS = 15 * 60 * 1000;
const NOW_REFRESH_INTERVAL_MS = 30 * 1000;
const MY_BOOKINGS_REFRESH_INTERVAL_MS = 10 * 1000;

const toTimestamp = (value: string | null | undefined): number | null => {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
};

const getBookingExpiryTimestamp = (
  booking: Pick<Booking, "bookedAt" | "expiresAt">,
): number | null => {
  const expiresAtTimestamp = toTimestamp(booking.expiresAt);
  if (expiresAtTimestamp !== null) return expiresAtTimestamp;

  const bookedAtTimestamp = toTimestamp(booking.bookedAt);
  if (bookedAtTimestamp === null) return null;

  return bookedAtTimestamp + PAYMENT_EXPIRY_WINDOW_MS;
};

const isBookingPaymentExpired = (booking: Booking, nowMs: number): boolean => {
  if (booking.status === "expired" || booking.paymentStatus === "expired") {
    return true;
  }

  if (booking.status !== "pending" || booking.isPaid) {
    return false;
  }

  const expiryTimestamp = getBookingExpiryTimestamp(booking);
  return expiryTimestamp !== null && nowMs >= expiryTimestamp;
};

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const error = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(error.message)) return error.message.join(", ");
    if (typeof error.message === "string") return error.message;
  } catch {
    // Fall back to status text when body is not valid JSON.
  }

  return response.statusText || "Request failed";
};

const formatDateForDisplay = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);

const mapBackendBookingToUiBooking = (booking: BackendBooking): Booking => {
  const payments = booking.payments ?? [];
  const totalAmount = Number(booking.totalAmount);
  const paymentSummary = summarizePayments(payments);
  const paymentStatus = resolvePaymentStatus(
    paymentSummary,
    totalAmount,
    payments,
  );
  const displayPaymentStatus =
    ["active", "completed"].includes(booking.status) &&
    ![
      "refunded",
      "partially_refunded",
      "refund_initiated",
      "refund_processing",
      "refund_reversed",
    ].includes(paymentStatus)
      ? "completed"
      : paymentStatus;
  const isPaid = isPaymentCovered(paymentSummary, totalAmount);

  return {
    id: booking.id,
    carId: booking.carId,
    carName: booking.carNameSnapshot ?? "Unknown Car",
    carImage: booking.carImageSnapshot ?? "",
    carYear: booking.carYearSnapshot ?? new Date().getFullYear(),
    carType: booking.carTypeSnapshot ?? "Unknown",
    status: booking.status,
    rentalPeriod: `${formatDateForDisplay(booking.pickupAt)} - ${formatDateForDisplay(booking.returnAt)}`,
    pickupDate: booking.pickupAt,
    returnDate: booking.returnAt,
    pickupLocation: booking.pickupLocation?.name ?? "Unknown",
    returnLocation: booking.returnLocation?.name ?? "Unknown",
    pickupLocationId: booking.pickupLocation?.id ?? "",
    returnLocationId: booking.returnLocation?.id ?? "",
    totalPrice: totalAmount,
    extraCharges: Number(booking.extraCharges ?? 0),
    lateFee: Number(booking.lateFee ?? 0),
    inspectionFee: Number(booking.inspectionFee ?? 0),
    bookedAt: booking.bookedAt,
    bookedOn: formatDateForDisplay(booking.bookedAt),
    expiresAt: booking.expiresAt ?? null,
    payments,
    paymentSummary,
    paymentStatus: displayPaymentStatus,
    isPaid,
  };
};

const toBookingIsoDate = (dateOnly: string) =>
  new Date(`${dateOnly}T09:00:00.000Z`).toISOString();

const BookingTimeline = ({
  status,
  isPaid,
}: {
  status: BookingStatus;
  isPaid: boolean;
}) => {
  const steps = [
    { key: "pending", label: "Requested", complete: true },
    { key: "payment", label: "Payment", complete: isPaid },
    {
      key: "approved",
      label: "Approved",
      complete: ["approved", "active", "completed"].includes(status),
    },
    {
      key: "active",
      label: "Active",
      complete: ["active", "completed"].includes(status),
    },
    { key: "completed", label: "Completed", complete: status === "completed" },
  ];

  const terminalBannerClass =
    status === "cancelled"
      ? "border-gray-200 bg-gray-50 text-gray-600"
      : status === "no_show"
        ? "border-orange-200 bg-orange-50 text-orange-700"
        : "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <div className="mt-4">
      <div className="grid grid-cols-5 gap-2">
        {steps.map((step) => (
          <div key={step.key} className="flex flex-col items-center gap-1">
            <span
              className={`flex size-6 items-center justify-center rounded-full ${
                step.complete
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {step.complete ? (
                <Check className="size-3" />
              ) : (
                <Circle className="size-3" />
              )}
            </span>
            <span
              className={`text-[11px] ${
                step.complete ? "text-gray-700" : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
      {isTerminalBookingStatus(status) ? (
        <div
          className={`mt-3 rounded-md border px-3 py-2 text-xs ${terminalBannerClass}`}
        >
          {bookingStatusLabels[status]} booking.
        </div>
      ) : null}
    </div>
  );
};

const fetchMyBookings = async (): Promise<Booking[]> => {
  const response = await authFetch(`/bookings/me`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const backendBookings = (await response.json()) as BackendBooking[];
  return backendBookings.map(mapBackendBookingToUiBooking);
};

export default function MyBookingsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [nowMs, setNowMs] = useState(() => Date.now());
  const { data: currentUser } = useCurrentUser();
  const userKey =
    currentUser?.sub ?? currentUser?.email ?? getCurrentUserEmail();
  const myBookingsQueryKey = useMemo(
    () => ["myBookings", userKey] as const,
    [userKey],
  );

  const {
    data: bookings = [],
    isPending: isLoadingBookings,
    error: bookingsError,
  } = useQuery<Booking[], Error>({
    queryKey: myBookingsQueryKey,
    queryFn: fetchMyBookings,
    enabled: Boolean(userKey),
    staleTime: 0,
    gcTime: 15 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: MY_BOOKINGS_REFRESH_INTERVAL_MS,
    refetchIntervalInBackground: true,
  });

  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    const intervalId = window.setInterval(
      () => setNowMs(Date.now()),
      NOW_REFRESH_INTERVAL_MS,
    );

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!userKey) return;

    return subscribeToBookingSync(() => {
      void queryClient.invalidateQueries({
        queryKey: ["myBookings"],
        refetchType: "active",
      });
      void queryClient.invalidateQueries({
        queryKey: CURRENT_USER_QUERY_KEY,
        refetchType: "active",
      });
    });
  }, [queryClient, userKey]);

  const visibleBookings = useMemo(() => {
    if (showArchived) return bookings;

    return bookings.filter(
      (booking) =>
        booking.status === "rejected" ||
        booking.status === "completed" ||
        booking.paymentStatus === "refunded" ||
        (booking.status === "cancelled" &&
          booking.paymentStatus === "pending") ||
        !ARCHIVED_BOOKING_STATUSES.includes(booking.status),
    );
  }, [bookings, showArchived]);

  const locationOptions = useMemo(() => {
    const locationMap = new Map<string, string>();

    bookings.forEach((booking) => {
      if (booking.pickupLocationId) {
        locationMap.set(booking.pickupLocationId, booking.pickupLocation);
      }
      if (booking.returnLocationId) {
        locationMap.set(booking.returnLocationId, booking.returnLocation);
      }
    });

    return Array.from(locationMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [bookings]);

  const [editForm, setEditForm] = useState({
    pickupDate: "",
    returnDate: "",
    pickupLocationId: "",
    returnLocationId: "",
  });

  const convertToDateInput = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const handleEditClick = (booking: Booking) => {
    setEditingBooking(booking);

    const pickupDate = convertToDateInput(booking.pickupDate);
    const returnDate = convertToDateInput(booking.returnDate);

    setEditForm({
      pickupDate,
      returnDate,
      pickupLocationId: booking.pickupLocationId,
      returnLocationId: booking.returnLocationId,
    });

    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (booking: Booking) => {
    setDeletingBooking(booking);
    setIsDeleteDialogOpen(true);
  };

  const updateBookingMutation = useMutation({
    mutationFn: async (payload: UpdateBookingPayload) => {
      const response = await authFetch(`/bookings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      return response.json();
    },
    onSuccess: (_data, payload) => {
      queryClient.setQueryData<Booking[]>(myBookingsQueryKey, (current = []) => {
        const pickupLocationName =
          current.find((b) => b.pickupLocationId === payload.pickupLocationId)
            ?.pickupLocation ??
          current.find((b) => b.returnLocationId === payload.pickupLocationId)
            ?.returnLocation ??
          "Unknown";

        const returnLocationName =
          current.find((b) => b.returnLocationId === payload.returnLocationId)
            ?.returnLocation ??
          current.find((b) => b.pickupLocationId === payload.returnLocationId)
            ?.pickupLocation ??
          "Unknown";

        return current.map((booking) => {
          if (booking.id !== payload.bookingId) return booking;

          return {
            ...booking,
            pickupDate: payload.pickupAt,
            returnDate: payload.returnAt,
            rentalPeriod: `${formatDateForDisplay(payload.pickupAt)} - ${formatDateForDisplay(payload.returnAt)}`,
            pickupLocationId: payload.pickupLocationId,
            returnLocationId: payload.returnLocationId,
            pickupLocation: pickupLocationName,
            returnLocation: returnLocationName,
          };
        });
      });
      void queryClient.invalidateQueries({
        queryKey: ["myBookings"],
        refetchType: "active",
      });
      void queryClient.invalidateQueries({
        queryKey: CURRENT_USER_QUERY_KEY,
        refetchType: "active",
      });

      toast.success("Booking updated successfully.");
      setIsEditDialogOpen(false);
      setEditingBooking(null);
    },
    onError: (error) => {
      toast.error(
        `Failed to update booking. ${error instanceof Error ? error.message : ""}`,
      );
    },
  });

  const deleteBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await authFetch(`/bookings/${bookingId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }
    },
    onSuccess: (_data, bookingId) => {
      queryClient.setQueryData<Booking[]>(myBookingsQueryKey, (current = []) =>
        current.filter((booking) => booking.id !== bookingId),
      );
      void queryClient.invalidateQueries({
        queryKey: ["myBookings"],
        refetchType: "active",
      });
      void queryClient.invalidateQueries({
        queryKey: CURRENT_USER_QUERY_KEY,
        refetchType: "active",
      });

      toast.success("Booking deleted successfully.");
      setIsDeleteDialogOpen(false);
      setDeletingBooking(null);
    },
    onError: (error) => {
      toast.error(
        `Failed to delete booking. ${error instanceof Error ? error.message : ""}`,
      );
    },
  });

  const handleSaveEdit = () => {
    if (!editingBooking) return;

    if (new Date(editForm.pickupDate) >= new Date(editForm.returnDate)) {
      toast.error("Return date must be after pickup date");
      return;
    }

    if (!editForm.pickupLocationId || !editForm.returnLocationId) {
      toast.error("Please select both pickup and return locations");
      return;
    }

    updateBookingMutation.mutate({
      bookingId: editingBooking.id,
      pickupAt: toBookingIsoDate(editForm.pickupDate),
      returnAt: toBookingIsoDate(editForm.returnDate),
      pickupLocationId: editForm.pickupLocationId,
      returnLocationId: editForm.returnLocationId,
    });
  };

  const handleConfirmDelete = () => {
    if (!deletingBooking) return;
    deleteBookingMutation.mutate(deletingBooking.id);
  };

  const canModifyBooking = (booking: Booking): boolean => {
    return (
      booking.status === "pending" &&
      !booking.isPaid &&
      !isBookingPaymentExpired(booking, nowMs)
    );
  };

  const canCancelBooking = (booking: Booking): boolean => {
    return (
      booking.status === "pending" &&
      booking.paymentStatus !== "completed" &&
      !isBookingPaymentExpired(booking, nowMs)
    );
  };

  const selectedBookingForPayment = useMemo(() => {
    const activeBooking = bookings.find(
      (booking) =>
        booking.status === "pending" &&
        !booking.isPaid &&
        !isBookingPaymentExpired(booking, nowMs),
    );

    return activeBooking ?? null;
  }, [bookings, nowMs]);

  const handleProceedToPayment = () => {
    if (!selectedBookingForPayment) {
      toast.error(
        "No active booking available for payment. Please create a new booking.",
      );
      return;
    }

    router.push(`/payment?bookingId=${selectedBookingForPayment.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
            <p className="text-gray-600">View and manage your car bookings</p>
            <div className="mt-3 flex items-center gap-2">
              <Switch
                checked={showArchived}
                onCheckedChange={setShowArchived}
              />
              <span className="text-sm text-gray-600">
                Show completed and archived
              </span>
            </div>
          </div>
          <Button
            onClick={handleProceedToPayment}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!selectedBookingForPayment || isLoadingBookings}
          >
            Proceed to Payment
          </Button>
        </div>

        {bookingsError ? (
          <Card className="text-center mb-6 p-4 border border-red-200 bg-red-50">
            <p className="text-sm text-red-700">{bookingsError.message}</p>
          </Card>
        ) : null}

        {isLoadingBookings ? <MyBookingsSkeleton count={2} /> : null}

        <div className="space-y-6">
          {visibleBookings.map((booking) => {
            const isPaymentWindowExpired = isBookingPaymentExpired(
              booking,
              nowMs,
            );
            const totalExtras =
              booking.extraCharges + booking.lateFee + booking.inspectionFee;

            return (
              <Card key={booking.id} className="overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                  <div className="md:col-span-1">
                    <ImageWithFallback
                      src={booking.carImage || fallbackBookingImage}
                      alt={booking.carName}
                      className="w-full h-64 md:h-full object-cover"
                    />
                  </div>

                  <div className="md:col-span-2 p-6">
                    <div className="flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold mb-1">
                            {booking.carName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {booking.carYear} • {booking.carType}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">
                              Booking #{booking.id}
                            </p>
                            <div className="flex items-end gap-2 justify-end">
                              <BookingStatusBadge status={booking.status} />
                              <PaymentStatusBadge
                                status={booking.paymentStatus}
                              />
                            </div>
                            {isPaymentWindowExpired ? (
                              <p className="mt-2 text-[11px]  text-yellow-700">
                                Payment Time Expired
                              </p>
                            ) : booking.status === "pending" &&
                              booking.isPaid ? (
                              <p className="mt-2 text-[11px] text-yellow-700">
                                Payment completed, awaiting approval.
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Rental Period
                              </p>
                              <p className="text-sm font-medium">
                                {booking.rentalPeriod}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Pick-up Location
                              </p>
                              <p className="text-sm font-medium">
                                {booking.pickupLocation}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Return Location
                              </p>
                              <p className="text-sm font-medium">
                                {booking.returnLocation}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <BadgeIcon className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Booked on
                              </p>
                              <p className="text-sm font-medium">
                                {booking.bookedOn}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {isPaymentWindowExpired ? (
                        <div className="mb-2 rounded-lg  bg-red-50 p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
                              <div>
                                <p className="text-sm font-semibold text-red-700">
                                  Payment Time Expired
                                </p>
                                <p className="text-xs text-red-700">
                                  Booking Expired - Please Book Again
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                className="bg-red-600 text-white hover:bg-red-700"
                                onClick={() =>
                                  router.push(`/cars/${booking.carId}`)
                                }
                              >
                                Book Again
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      <div className="mt-auto pt-4 border-t border-gray-300 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Total Price
                          </p>
                          <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(booking.totalPrice)}
                          </p>
                          {totalExtras > 0 ? (
                            <p className="text-xs font-semibold text-amber-700">
                              Extras: {formatCurrency(totalExtras)}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex gap-2">
                          {canModifyBooking(booking) && (
                            <Button
                              variant="outline"
                              onClick={() => handleEditClick(booking)}
                              className="gap-2 border-gray-300 hover:bg-gray-200"
                            >
                              <Edit className="w-4 h-4" />
                              Modify
                            </Button>
                          )}
                          {canCancelBooking(booking) && (
                            <Button
                              variant="outline"
                              onClick={() => handleDeleteClick(booking)}
                              className="gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-100"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {!isLoadingBookings && bookings.length === 0 && (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <BadgeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-6">
                You haven&apos;t made any bookings. Start exploring our amazing
                collection of cars!
              </p>
            </div>
          </Card>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-white border-none">
          <DialogHeader>
            <DialogTitle>Modify Booking</DialogTitle>
            <DialogDescription>
              Update your booking details for {editingBooking?.carName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pick-up Date</Label>
                <Input
                  type="date"
                  value={editForm.pickupDate}
                  onChange={(e) =>
                    setEditForm({ ...editForm, pickupDate: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="border-gray-300 hover:border-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label>Return Date</Label>
                <Input
                  type="date"
                  value={editForm.returnDate}
                  onChange={(e) =>
                    setEditForm({ ...editForm, returnDate: e.target.value })
                  }
                  min={
                    editForm.pickupDate ||
                    new Date().toISOString().split("T")[0]
                  }
                  className="border-gray-300 hover:border-gray-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pick-up Location</Label>
                <Select
                  value={editForm.pickupLocationId}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, pickupLocationId: value })
                  }
                >
                  <SelectTrigger className="border-gray-300 focus:border-gray-500">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent className="border-none bg-white">
                    {locationOptions.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Return Location</Label>
                <Select
                  value={editForm.returnLocationId}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, returnLocationId: value })
                  }
                >
                  <SelectTrigger className="border-gray-300 focus:border-gray-500">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent className="border-none bg-white">
                    {locationOptions.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Modification Policy
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Changes to your booking will be subject to admin approval.
                  Price may be adjusted based on new dates. You can modify your
                  booking up to 24 hours before pickup time.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-gray-300 hover:bg-gray-200"
              disabled={updateBookingMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={updateBookingMutation.isPending}
            >
              {updateBookingMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white border-none">
          <DialogHeader>
            <DialogTitle>Delete Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this booking?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {deletingBooking && (
              <div className="space-y-3">
                <div className="border border-gray-400 rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold mb-2">
                    {deletingBooking.carName}
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    ing
                    <p>Booking ID: #{deletingBooking.id}</p>
                    <p>Rental Period: {deletingBooking.rentalPeriod}</p>
                    <p>Total Price: ${deletingBooking.totalPrice}</p>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      Deletion Policy
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      - Deleting a booking is irreversible and will remove all
                      associated data.
                      <br />- If the booking is pending or approved, a refund
                      may be applicable based on our cancellation policy.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-gray-300 hover:bg-gray-200"
              disabled={deleteBookingMutation.isPending}
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteBookingMutation.isPending}
            >
              {deleteBookingMutation.isPending
                ? "Deleting..."
                : "Confirm Deletion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

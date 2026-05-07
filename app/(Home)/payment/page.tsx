"use client";

import { useMemo, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/app/ui/card";
import { Button } from "@/app/ui/button";
import { ImageWithFallback } from "@/app/ui/figma/imageWithFallBack";
import { PaymentBookingsSkeleton } from "@/app/ui/skeletons";
import { authFetch, getCurrentUserEmail } from "@/app/lib/auth";
import { useCurrentUser } from "@/app/lib/auth-queries";

type BackendBookingStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "completed";

type BackendBooking = {
  id: string;
  bookingCode?: string;
  carId: string;
  pickupAt: string;
  returnAt: string;
  bookedAt: string;
  totalAmount: number | string;
  status: BackendBookingStatus;
  carNameSnapshot: string | null;
  carTypeSnapshot: string | null;
  carYearSnapshot: number | null;
  carImageSnapshot: string | null;
  pickupLocation?: { id: string; name: string } | null;
  returnLocation?: { id: string; name: string } | null;
};

type PaymentBooking = {
  id: string;
  bookingCode?: string;
  carId: string;
  carName: string;
  carType: string;
  carYear: number;
  carImage: string;
  pickupAt: string;
  returnAt: string;
  bookedAt: string;
  pickupLocation: string;
  returnLocation: string;
  pickupLocationId: string;
  returnLocationId: string;
  totalAmount: number;
  status: BackendBookingStatus;
};

const fallbackBookingImage =
  "https://images.unsplash.com/photo-1549924231-f129b911e442?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

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

const fetchPaymentBookings = async (): Promise<PaymentBooking[]> => {
  const response = await authFetch(`/bookings/me`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const backendBookings = (await response.json()) as BackendBooking[];
  return backendBookings.map((booking) => ({
    id: booking.id,
    bookingCode: booking.bookingCode,
    carId: booking.carId,
    carName: booking.carNameSnapshot ?? "Unknown Car",
    carType: booking.carTypeSnapshot ?? "Unknown",
    carYear: booking.carYearSnapshot ?? new Date().getFullYear(),
    carImage: booking.carImageSnapshot ?? "",
    pickupAt: booking.pickupAt,
    returnAt: booking.returnAt,
    bookedAt: booking.bookedAt,
    pickupLocation: booking.pickupLocation?.name ?? "Unknown",
    returnLocation: booking.returnLocation?.name ?? "Unknown",
    pickupLocationId: booking.pickupLocation?.id ?? "",
    returnLocationId: booking.returnLocation?.id ?? "",
    totalAmount: Number(booking.totalAmount),
    status: booking.status,
  }));
};

export default function PaymentPage() {
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [processingBookingId, setProcessingBookingId] = useState<string | null>(
    null,
  );
  const { data: currentUser } = useCurrentUser();
  const userKey =
    currentUser?.sub ?? currentUser?.email ?? getCurrentUserEmail();
  const {
    data: bookings = [],
    isPending: isLoadingBookings,
    error: bookingsError,
  } = useQuery<PaymentBooking[], Error>({
    queryKey: ["paymentBookings", userKey],
    queryFn: fetchPaymentBookings,
    enabled: Boolean(userKey),
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
  });

  const pendingBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "pending"),
    [bookings],
  );

  const bookingStats = useMemo(() => {
    const totalCars = pendingBookings.length;
    const totalMoney = pendingBookings.reduce(
      (sum, booking) => sum + booking.totalAmount,
      0,
    );

    return { totalCars, totalMoney };
  }, [pendingBookings]);

  const pendingBooking = useMemo(() => {
    const pending = pendingBookings
      .slice()
      .sort((a, b) => +new Date(b.bookedAt) - +new Date(a.bookedAt));
    return pending[0] ?? null;
  }, [pendingBookings]);

  const handleChapaPayment = async () => {
    setPaymentError(null);
    if (!pendingBooking) {
      setPaymentError("No pending booking found to pay.");
      return;
    }

    setProcessingBookingId(pendingBooking.id);

    try {
      const response = await authFetch(`/payments/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: pendingBooking.id,
        }),
      });
      // console.log('Payment initialize response status:', response);
      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      //  Handle the response from the payment initialization
      const payload = (await response.json()) as { checkout_url?: string };

      if (!payload.checkout_url)
        throw new Error("Chapa checkout url is missing");

      window.location.assign(payload.checkout_url);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to start payment";
      setPaymentError(message);
    } finally {
      setProcessingBookingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold mb-2">Payment</h1>
            <p className="text-gray-600">
              Review your booking and continue to payment.
            </p>
          </div>
          <Card className="px-4 py-3 border-gray-200 min-w-56">
            <p className="text-xs text-gray-500 text-right">Total Cars</p>
            <p className="text-2xl font-bold text-blue-600 text-right">
              {bookingStats.totalCars}
            </p>
            <div className="flex justify-end mt-1">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
          </Card>
        </div>

        {bookingsError ? (
          <Card className="p-4 border-red-200 bg-red-50">
            <p className="text-sm text-red-700">{bookingsError.message}</p>
          </Card>
        ) : null}

        <Card className="p-6 border-gray-200">
          <h2 className="text-xl font-semibold mb-4">All Booked Cars</h2>

          {isLoadingBookings ? (
            <PaymentBookingsSkeleton count={1} />
          ) : pendingBookings.length > 0 ? (
            <div className="space-y-4">
              {pendingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row gap-4"
                >
                  <div className="w-full sm:w-40 h-28 shrink-0 overflow-hidden rounded-md bg-gray-100">
                    <ImageWithFallback
                      src={booking.carImage || fallbackBookingImage}
                      alt={booking.carName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {booking.carName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {booking.carYear} • {booking.carType}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDateForDisplay(booking.pickupAt)} -{" "}
                      {formatDateForDisplay(booking.returnAt)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {booking.pickupLocation} to {booking.returnLocation}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="font-medium capitalize">{booking.status}</p>
                    <p className="text-xs text-gray-500 mt-2">Price</p>
                    <p className="text-lg font-bold text-blue-600">
                      ${booking.totalAmount}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No pending bookings to pay.</p>
          )}
        </Card>

        <Card className="p-6 border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Total Amount</p>
          <p className="text-3xl font-bold text-blue-600">
            ${bookingStats.totalMoney}
          </p>
          <div className="mt-4 flex justify-end">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleChapaPayment}
              disabled={!pendingBooking || processingBookingId !== null}
              aria-disabled={!pendingBooking || processingBookingId !== null}
            >
              {processingBookingId ? "Processing..." : "Checkout"}
            </Button>
          </div>
          {paymentError ? (
            <p className="mt-3 text-sm text-red-600">{paymentError}</p>
          ) : null}
        </Card>
      </div>
    </div>
  );
}

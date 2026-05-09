import { authFetch } from "@/app/lib/auth";

export type AdminBooking = {
  id: string;
  bookingCode: string;
  status: "pending" | "approved" | "rejected" | "cancelled" | "completed";
  totalAmount: number;
  pickupAt: string;
  returnAt: string;
  bookedAt: string;
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
  };
  pickupLocation: {
    name: string;
  } | null;
  returnLocation: {
    name: string;
  } | null;
};

export type UpdateBookingStatusPayload = {
  bookingId: string;
  status: "approved" | "rejected" | "cancelled" | "completed";
};

export const BOOKINGS_QUERY_KEY = ["bookings", "all"] as const;

export const fetchAllBookings = async (
  signal?: AbortSignal,
): Promise<AdminBooking[]> => {
  const response = await authFetch("/bookings", {
    method: "GET",
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Unable to load bookings (${response.status}). ${errorText}`,
    );
  }

  return (await response.json()) as AdminBooking[];
};

export const updateBookingStatus = async (
  payload: UpdateBookingStatusPayload,
): Promise<AdminBooking> => {
  const response = await authFetch("/bookings/status", {
    method: "PATCH",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Unable to update booking status (${response.status}). ${errorText}`,
    );
  }

  return (await response.json()) as AdminBooking;
};

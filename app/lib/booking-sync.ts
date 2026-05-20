"use client";

const BOOKING_SYNC_STORAGE_KEY = "car-rental:booking-sync";
const BOOKING_SYNC_EVENT_NAME = "car-rental:booking-sync";

type BookingSyncPayload = {
  at: number;
  bookingId?: string;
  action?: string;
  status?: string;
};

export const broadcastBookingSync = (
  payload: Omit<BookingSyncPayload, "at"> = {},
) => {
  if (typeof window === "undefined") return;

  const data: BookingSyncPayload = {
    at: Date.now(),
    ...payload,
  };

  try {
    window.localStorage.setItem(BOOKING_SYNC_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage write errors (private mode or storage limits).
  }

  window.dispatchEvent(new CustomEvent(BOOKING_SYNC_EVENT_NAME, { detail: data }));
};

export const subscribeToBookingSync = (onSync: () => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== BOOKING_SYNC_STORAGE_KEY) return;
    if (event.newValue === event.oldValue) return;
    onSync();
  };

  const handleCustomEvent = () => {
    onSync();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(BOOKING_SYNC_EVENT_NAME, handleCustomEvent);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(BOOKING_SYNC_EVENT_NAME, handleCustomEvent);
  };
};

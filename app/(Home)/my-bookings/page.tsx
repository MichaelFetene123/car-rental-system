"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  MapPin,
  Badge as BadgeIcon,
  Edit,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Card } from "@/app/ui/card";
import { Badge } from "@/app/ui/badge";
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
import { API_BASE_URL } from "@/server/server";
import { getStoredToken } from "@/app/lib/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type BookingStatus = "confirmed" | "pending" | "cancelled";

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
  bookedOn: string;
};

type BackendBookingStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "completed";

type BackendBooking = {
  id: string;
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

type UpdateBookingPayload = {
  bookingId: string;
  pickupAt: string;
  returnAt: string;
  pickupLocationId: string;
  returnLocationId: string;
};

const fallbackBookingImage =
  "https://images.unsplash.com/photo-1549924231-f129b911e442?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

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

const mapBackendStatusToUi = (status: BackendBookingStatus): BookingStatus => {
  if (status === "approved") return "confirmed";
  if (status === "pending") return "pending";
  return "cancelled";
};

const mapBackendBookingToUiBooking = (booking: BackendBooking): Booking => ({
  id: booking.id,
  carId: booking.carId,
  carName: booking.carNameSnapshot ?? "Unknown Car",
  carImage: booking.carImageSnapshot ?? "",
  carYear: booking.carYearSnapshot ?? new Date().getFullYear(),
  carType: booking.carTypeSnapshot ?? "Unknown",
  status: mapBackendStatusToUi(booking.status),
  rentalPeriod: `${formatDateForDisplay(booking.pickupAt)} - ${formatDateForDisplay(booking.returnAt)}`,
  pickupDate: booking.pickupAt,
  returnDate: booking.returnAt,
  pickupLocation: booking.pickupLocation?.name ?? "Unknown",
  returnLocation: booking.returnLocation?.name ?? "Unknown",
  pickupLocationId: booking.pickupLocation?.id ?? "",
  returnLocationId: booking.returnLocation?.id ?? "",
  totalPrice: Number(booking.totalAmount),
  bookedOn: formatDateForDisplay(booking.bookedAt),
});

const toBookingIsoDate = (dateOnly: string) =>
  new Date(`${dateOnly}T09:00:00.000Z`).toISOString();

const fetchMyBookings = async (): Promise<Booking[]> => {
  const token = getStoredToken();

  if (!token) {
    throw new Error("Please log in to view your bookings.");
  }

  const response = await fetch(`${API_BASE_URL}/bookings/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
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

  const {
    data: bookings = [],
    isPending: isLoadingBookings,
    error: bookingsError,
  } = useQuery<Booking[], Error>({
    queryKey: ["myBookings"],
    queryFn: fetchMyBookings,
    staleTime: Infinity,
    gcTime: 15 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

    const dates = booking.rentalPeriod.split(" - ");
    const pickupDate = dates[0] ? convertToDateInput(dates[0]) : "";
    const returnDate = dates[1] ? convertToDateInput(dates[1]) : "";

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
      const token = getStoredToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      return response.json();
    },
    onSuccess: (_data, payload) => {
      queryClient.setQueryData<Booking[]>(["myBookings"], (current = []) => {
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
      const token = getStoredToken();
      if (!token) throw new Error("Authentication required");

      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }
    },
    onSuccess: (_data, bookingId) => {
      queryClient.setQueryData<Booking[]>(["myBookings"], (current = []) =>
        current.filter((booking) => booking.id !== bookingId),
      );

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
    return booking.status === "pending";
  };

  const canCancelBooking = (booking: Booking): boolean => {
    return booking.status === "pending";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-gray-600">View and manage your car bookings</p>
        </div>

        {bookingsError ? (
          <Card className="text-center mb-6 p-4 border border-red-200 bg-red-50">
            <p className="text-sm text-red-700">{bookingsError.message}</p>
          </Card>
        ) : null}

        {isLoadingBookings ? <MyBookingsSkeleton count={3} /> : null}

        <div className="space-y-6">
          {bookings.map((booking) => (
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
                          <Badge
                            variant={
                              booking.status === "confirmed"
                                ? "default"
                                : booking.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className={
                              booking.status === "confirmed"
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-yellow-400 hover:bg-yellow-400"
                            }
                          >
                            {booking.status}
                          </Badge>
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

                    <div className="mt-auto pt-4 border-t border-gray-300 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Total Price
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          ${booking.totalPrice}
                        </p>
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
          ))}
        </div>

        {!isLoadingBookings && bookings.length === 0 && (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <BadgeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't made any bookings. Start exploring our amazing
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
                      <br />- If the booking is confirmed or pending, a refund
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

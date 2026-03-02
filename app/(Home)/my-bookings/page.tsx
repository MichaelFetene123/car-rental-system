"use client";

import { useState } from "react";
import {
  Calendar,
  MapPin,
  Badge as BadgeIcon,
  Edit,
  X,
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
import {
  mockBookings as initialMockBookings,
  mockLocations,
  Booking,
} from "@/app/lib/mockData";
import { toast } from "sonner";

const bookingImages = [
  "https://images.unsplash.com/photo-1624968789500-08275d8c3265?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMEJNVyUyMHNwb3J0JTIwY2FyJTIwcm9hZHxlbnwxfHx8fDE3NzE4NDc2MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1606173929045-3dd85676897b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVlJTIwQk1XJTIwbHV4dXJ5JTIwY2FyJTIwb2NlYW58ZW58MXx8fHwxNzcxODQ3NjEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
];

// interface Booking {
//   id: string;
//   carName: string;
//   carYear: string;
//   carType: string;
//   rentalPeriod: string;
//   pickupLocation: string;
//   returnLocation: string;
//   bookedOn: string;
//   totalPrice: number;
//   status: "confirmed" | "pending" | "cancelled";
//   pickupDate?: string;
//   returnDate?: string;
// }

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>(
    initialMockBookings as Booking[],
  );
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Form state for editing
  const [editForm, setEditForm] = useState({
    pickupDate: "",
    returnDate: "",
    pickupLocation: "",
    returnLocation: "",
  });

  const handleEditClick = (booking: Booking) => {
    setEditingBooking(booking);

    // Parse dates from rental period if available
    const dates = booking.rentalPeriod.split(" - ");
    const pickupDate = dates[0] ? convertToDateInput(dates[0]) : "";
    const returnDate = dates[1] ? convertToDateInput(dates[1]) : "";

    setEditForm({
      pickupDate: pickupDate,
      returnDate: returnDate,
      pickupLocation: booking.pickupLocation,
      returnLocation: booking.returnLocation,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (booking: Booking) => {
    setDeletingBooking(booking);
    setIsDeleteDialogOpen(true);
  };

  const convertToDateInput = (dateStr: string): string => {
    // Convert "Feb 15, 2026" to "2026-02-15"
    try {
      const date = new Date(dateStr);
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const formatDateForDisplay = (dateStr: string): string => {
    // Convert "2026-02-15" to "Feb 15, 2026"
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

  const handleSaveEdit = () => {
    if (!editingBooking) return;

    // Validate dates
    if (new Date(editForm.pickupDate) >= new Date(editForm.returnDate)) {
      toast.error("Return date must be after pickup date");
      return;
    }

    // Calculate new price based on new dates
    const days = Math.ceil(
      (new Date(editForm.returnDate).getTime() -
        new Date(editForm.pickupDate).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const pricePerDay =
      editingBooking.totalPrice /
      Math.ceil(
        (new Date(
          convertToDateInput(editingBooking.rentalPeriod.split(" - ")[1]),
        ).getTime() -
          new Date(
            convertToDateInput(editingBooking.rentalPeriod.split(" - ")[0]),
          ).getTime()) /
          (1000 * 60 * 60 * 24),
      );
    const newPrice = Math.round(days * pricePerDay);

    setBookings(
      bookings.map((booking) =>
        booking.id === editingBooking.id
          ? {
              ...booking,
              rentalPeriod: `${formatDateForDisplay(editForm.pickupDate)} - ${formatDateForDisplay(editForm.returnDate)}`,
              pickupLocation: editForm.pickupLocation,
              returnLocation: editForm.returnLocation,
              totalPrice: newPrice,
              status: "pending" as const, // Changed bookings go to pending for admin approval
            }
          : booking,
      ),
    );

    toast.success(
      "Booking updated successfully! Changes are pending admin approval.",
    );
    setIsEditDialogOpen(false);
    setEditingBooking(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingBooking) return;

    setBookings(
      bookings.filter((booking) => booking.id !== deletingBooking.id),
    );

    toast.success("Booking deleted successfully.");
    setIsDeleteDialogOpen(false);
    setDeletingBooking(null);
  };

  const canModifyBooking = (booking: Booking): boolean => {
    return booking.status === "confirmed" || booking.status === "pending";
  };

  const canCancelBooking = (booking: Booking): boolean => {
    return booking.status === "confirmed" || booking.status === "pending";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-gray-600">View and manage your car bookings</p>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {bookings.map((booking, index) => (
            <Card key={booking.id} className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                {/* Car Image and Info */}
                <div className="md:col-span-1">
                  <ImageWithFallback
                    src={bookingImages[index % bookingImages.length]}
                    alt={booking.carName}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>

                {/* Booking Details */}
                <div className="md:col-span-2 p-6">
                  <div className="flex flex-col h-full">
                    {/* Header with Car Name and Status */}
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
                                : ""
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Booking Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
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
                          <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
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
                          <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
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
                          <BadgeIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
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

                    {/* Footer with Price and Actions */}
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

        {/* Empty State (if no bookings) */}
        {bookings.length === 0 && (
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

      {/* Edit Booking Dialog */}
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
                  value={editForm.pickupLocation}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, pickupLocation: value })
                  }
                >
                  <SelectTrigger className="border-gray-300 focus:border-gray-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-none bg-white">
                    {mockLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Return Location</Label>
                <Select
                  value={editForm.returnLocation}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, returnLocation: value })
                  }
                >
                  <SelectTrigger className="border-gray-300 focus:border-gray-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-none bg-white">
                    {mockLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
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
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700 text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Booking Dialog */}
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
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      Deletion Policy
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      • Deleting a booking is irreversible and will remove all
                      associated data.
                      <br />• If the booking is confirmed or pending, a refund
                      may be applicable based on our cancellation policy.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter >
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-gray-300 hover:bg-gray-200"
            >
              Keep Booking
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Confirm Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { toast } from "sonner";
import { Badge } from "@/app/ui/badge";
import { Button } from "@/app/ui/button";
import { Check, X, Ban, Search, AlertCircle, Loader2 } from "lucide-react";
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
  updateBookingStatus,
  AdminBooking,
} from "@/app/lib/bookings";

const ManageBookingsPage = () => {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Fetch bookings on mount
  useEffect(() => {
    const loadBookings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchAllBookings();
        setBookings(data);
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

  const handleApprove = async (id: string) => {
    await handleStatusUpdate(id, "approved", "Booking approved successfully");
  };

  const handleReject = async (id: string) => {
    await handleStatusUpdate(id, "rejected", "Booking rejected");
  };

  const handleCancel = async (id: string) => {
    await handleStatusUpdate(id, "cancelled", "Booking cancelled");
  };

  const handleStatusUpdate = async (
    bookingId: string,
    status: "approved" | "rejected" | "cancelled" | "completed",
    successMessage: string,
  ) => {
    setActionInProgress(bookingId);
    try {
      const updated = await updateBookingStatus({
        bookingId,
        status,
      });

      // Update local state with the new booking data
      setBookings(
        bookings.map((booking) =>
          booking.id === bookingId ? updated : booking,
        ),
      );

      toast.success(successMessage);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to update booking status";
      toast.error(errorMessage);
    } finally {
      setActionInProgress(null);
    }
  };

  const getStatusColor = (
    status: AdminBooking["status"],
  ): string => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "cancelled":
        return "bg-gray-100 text-gray-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
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
        <Card className="bg-amber-50 border-amber-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-amber-800">
              Completed Bookings
            </CardTitle>
          </CardHeader>
          <CardContent className="text-amber-900">
            <div className="text-3xl font-semibold text-amber-900">
              {bookings.filter((b) => b.status === "completed").length}
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
                bookings
                  .filter(
                    (b) => b.status === "approved" || b.status === "completed",
                  )
                  .reduce((sum, b) => sum + Number(b.totalAmount), 0),
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
              {isLoading && <Loader2 className="inline ml-2 size-4 animate-spin" />}
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
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
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
                  <TableHead>Location</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id} className="border-gray-200 ">
                    <TableCell className="font-medium text-sm ">
                      {booking.bookingCode}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{booking.user.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.user.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{booking.car.name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(booking.pickupAt)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(booking.returnAt)}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>
                        {booking.pickupLocation && (
                          <p>
                            <span className="text-muted-foreground">From:</span>{" "}
                            {booking.pickupLocation.name}
                          </p>
                        )}
                        {booking.returnLocation && (
                          <p>
                            <span className="text-muted-foreground">To:</span>{" "}
                            {booking.returnLocation.name}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(booking.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {booking.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApprove(booking.id)}
                              title="Approve"
                              disabled={actionInProgress === booking.id}
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
                              onClick={() => handleReject(booking.id)}
                              title="Reject"
                              disabled={actionInProgress === booking.id}
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
                        {(booking.status === "approved" ||
                          booking.status === "pending") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCancel(booking.id)}
                            title="Cancel"
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
                        {(booking.status === "completed" ||
                          booking.status === "rejected" ||
                          booking.status === "cancelled") && (
                          <span className="text-sm text-muted-foreground px-2">
                            No actions
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageBookingsPage;

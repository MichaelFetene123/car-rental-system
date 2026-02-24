"use client"
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { toast } from "sonner";
import { Badge, badgeVariants } from "@/app/ui/badge";
import { Button } from "@/app/ui/button";
import { Check, X, Ban, Search } from "lucide-react";
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
import {initialBookings, Booking} from "@/app/lib/data"






const ManageBookingsPage = () => {
 const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.carName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleApprove = (id: string) => {
    setBookings(
      bookings.map((booking) =>
        booking.id === id ? { ...booking, status: "approved" as const } : booking
      )
    );
    toast.success("Booking approved successfully");
  };

  const handleReject = (id: string) => {
    setBookings(
      bookings.map((booking) =>
        booking.id === id ? { ...booking, status: "rejected" as const } : booking
      )
    );
    toast.error("Booking rejected");
  };

  const handleCancel = (id: string) => {
    setBookings(
      bookings.map((booking) =>
        booking.id === id ? { ...booking, status: "cancelled" as const } : booking
      )
    );
    toast.info("Booking cancelled");
  };

  const getStatusColor = (status: Booking["status"]) => {
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
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return <div className="space-y-6 ">
    <div>
        <h1 className={`${lusitana.className} text-2xl mb-1`}>Manage Bookings</h1>
        <p className="text-muted-foreground">
          Approve, reject, or cancel customer bookings
        </p>
      </div>
      {/* Booking Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gray-50 border-none shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {bookings.filter((b) => b.status === "pending").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 border-none shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {bookings.filter((b) => b.status === "approved").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 border-none shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {bookings.filter((b) => b.status === "completed").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 border-none shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent >
            <div className="text-3xl font-semibold ">
              $
              {bookings
                .filter((b) => b.status === "approved" || b.status === "completed")
                .reduce((sum, b) => sum + b.totalAmount, 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Table */}
      <Card className="bg-gray-50 rounded-lg border-none">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>All Bookings</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-gray-300 focus:border-2 focus:border-blue-500"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter} >
                <SelectTrigger className="w-full sm:w-40 bg-gray-200 border-gray-300 focus:border-2 focus:border-blue-500">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-none">
                  <SelectItem value="all" >All Status</SelectItem>
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
          <div className="overflow-x-auto">
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
                    <TableCell className="font-medium  ">{booking.id}</TableCell>
                    <TableCell>{booking.customerName}</TableCell>
                    <TableCell>{booking.carName}</TableCell>
                    <TableCell>{formatDate(booking.pickupDate)}</TableCell>
                    <TableCell>{formatDate(booking.returnDate)}</TableCell>
                    <TableCell>{booking.location}</TableCell>
                    <TableCell>${booking.totalAmount}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
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
                              className="cursor-pointer"
                            >
                              <Check className="size-4 text-green-600 cursor-pointer" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleReject(booking.id)}
                              title="Reject"
                              className="cursor-pointer"
                            >
                              <X className="size-4 text-red-600 cursor-pointer" />
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
                            className="cursor-pointer"
                          >
                            <Ban className="size-4 text-orange-600" />
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
          </div>
        </CardContent>
      </Card>

  </div>;
};

export default ManageBookingsPage;

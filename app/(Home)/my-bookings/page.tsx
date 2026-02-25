"use client";
import { Calendar, MapPin, Badge as BadgeIcon } from "lucide-react";
import { Card } from "@/app/ui/card";
import { Badge } from "@/app/ui/badge";
import { ImageWithFallback } from "@/app/ui/figma/imageWithFallBack";
import { mockBookings } from "@/app/lib/mockData";

const bookingImages = [
  "https://images.unsplash.com/photo-1624968789500-08275d8c3265?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMEJNVyUyMHNwb3J0JTIwY2FyJTIwcm9hZHxlbnwxfHx8fDE3NzE4NDc2MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1606173929045-3dd85676897b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVlJTIwQk1XJTIwbHV4dXJ5JTIwY2FyJTIwb2NlYW58ZW58MXx8fHwxNzcxODQ3NjEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
];

export default function MyBookingsPage() {
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
          {mockBookings.map((booking, index) => (
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

                    {/* Footer with Price */}
                    <div className="mt-auto pt-4 border-t border-gray-300 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Total Price
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          ${booking.totalPrice}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          Payment processed securely
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State (if no bookings) */}
        {mockBookings.length === 0 && (
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
    </div>
  );
}

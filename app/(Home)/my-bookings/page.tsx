"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Users, Fuel, Settings, MapPin } from "lucide-react";
import PublicHeader from "@/app/ui/public-header";
import { initialCars, initialBookings } from "@/app/lib/data";
import { ImageWithFallback } from "@/app/ui/figma/imageWithFallBack";
import { Button } from "@/app/ui/button";
import { Badge } from "@/app/ui/badge";
import { Card, CardContent } from "@/app/ui/card";
import { Calendar, MapPin as MapPinIcon, BadgeCheck } from "lucide-react";

export default function MyBookingsPage() {
  const bookings = initialBookings; // Using mock data for "my bookings"

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <PublicHeader />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-500 mb-8">View and manage your car bookings</p>

        <div className="space-y-6">
          {bookings.map((booking) => {
            const car = initialCars.find((c) => c.name === booking.carName);

            if (!car) return null;

            return (
              <div
                key={booking.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Car Image */}
                  <div className="md:w-1/3 lg:w-1/4 h-48 md:h-auto relative bg-gray-100">
                    <ImageWithFallback
                      src={car.image}
                      alt={car.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wide">
                            Booking #{booking.id.replace("BK", "")}
                          </span>
                          {booking.status === "approved" && (
                            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded bg-opacity-50">
                              confirmed
                            </span>
                          )}
                          {booking.status === "pending" && (
                            <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded bg-opacity-50">
                              pending
                            </span>
                          )}
                          {booking.status === "cancelled" && (
                            <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded bg-opacity-50">
                              cancelled
                            </span>
                          )}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {car.name.toUpperCase()}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          {car.year} • {car.category} • Los Angeles
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">
                          Total Price
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          ${booking.totalAmount}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Booked on 4/1/2025
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 bg-blue-50 p-1.5 rounded-full">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Rental Period
                          </p>
                          <p className="text-sm text-gray-600 mt-0.5">
                            {new Date(booking.pickupDate).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(booking.returnDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="mt-1 bg-blue-50 p-1.5 rounded-full">
                          <MapPinIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Pick-up Location
                          </p>
                          <p className="text-sm text-gray-600 mt-0.5 font-medium">
                            {booking.location}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 md:col-start-2">
                        <div className="mt-1 bg-blue-50 p-1.5 rounded-full">
                          <MapPinIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Return Location
                          </p>
                          <p className="text-sm text-gray-600 mt-0.5 font-medium">
                            Downtown Office
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

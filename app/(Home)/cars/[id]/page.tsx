"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Users, Fuel, Settings, MapPin } from "lucide-react";
import PublicHeader from "@/app/ui/public-header";
import { initialCars } from "@/app/lib/data";
import { ImageWithFallback } from "@/app/ui/figma/imageWithFallBack";
import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import { Label } from "@/app/ui/lable";

export default function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const car = initialCars.find((c) => c.id === id);

  if (!car) {
    return (
      <div className="min-h-screen bg-white">
        <PublicHeader />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Car not found</h1>
          <Link href="/" className="text-blue-600 hover:underline mt-4 block">
            Back to cars
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <PublicHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to all cars
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Car Image & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="aspect-video w-full relative rounded-2xl overflow-hidden bg-gray-100">
              <ImageWithFallback
                src={car.image}
                alt={car.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Car Information */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {car.name.toUpperCase()}
              </h1>
              <p className="text-gray-500 mb-8">
                {car.year} • {car.category}
              </p>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Users className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                  <span className="block text-sm font-medium text-gray-900">
                    {car.seats} Seats
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Fuel className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                  <span className="block text-sm font-medium text-gray-900">
                    Gasoline
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Settings className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                  <span className="block text-sm font-medium text-gray-900">
                    {car.transmission}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <MapPin className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                  <span className="block text-sm font-medium text-gray-900">
                    Los Angeles
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Description
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Experience the thrill of driving this premium {car.name}.
                  Perfect for city driving or weekend getaways, this car offers
                  a blend of performance, comfort, and style. Features include
                  advanced safety systems, premium audio, and modern
                  connectivity options.
                  <br />
                  <br />
                  Rent this {car.category} today and elevate your journey with
                  top-tier engineering and design.
                </p>
              </div>
            </div>
          </div>

          {/* Booking Widget */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24 shadow-sm">
              <div className="flex items-baseline justify-between mb-6 pb-6 border-b border-gray-100">
                <span className="text-3xl font-bold text-gray-900">
                  ${car.price}
                </span>
                <span className="text-gray-500">per day</span>
              </div>

              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pickup-date">Pickup Date</Label>
                  <Input
                    type="date"
                    id="pickup-date"
                    className="h-12 border-gray-200 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="return-date">Return Date</Label>
                  <Input
                    type="date"
                    id="return-date"
                    className="h-12 border-gray-200 bg-white"
                  />
                </div>

                <div className="pt-4">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold rounded-lg">
                    Book Now
                  </Button>
                  <p className="text-center text-xs text-gray-400 mt-3">
                    No credit card required to reserve
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

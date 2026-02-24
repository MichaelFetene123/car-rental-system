"use client";
import Link from "next/link";
import { Search, Filter, Users, Fuel, Settings } from "lucide-react";
import PublicHeader from "@/app/ui/public-header";
import { initialCars } from "@/app/lib/data";
import { ImageWithFallback } from "@/app/ui/figma/imageWithFallBack";

import { useState } from "react";
import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui/select";
import { MapPin, Calendar } from "lucide-react";
// import carImage from "figma:asset/4ad8fba70d6d1d6bb955a4c435e3235b26c7faa4.png";
import { mockLocations } from "@/app/lib/mockData";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const handleSearch = () => {
    router.push("/cars");
  };
  return (
    <section>
      <PublicHeader className="shadow-md shadow-blue-100" />
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-white overflow-hidden">
        {/* Hero Section */}
        <section className="relative pt-12 pb-24">
          {/* Decorative Background Elements */}
          <div
            className="absolute top-0 right-0 w-[900px] h-[900px] bg-gradient-to-br from-blue-100/40 to-blue-200/30 rounded-full blur-3xl opacity-60 -z-10"
            style={{ transform: "translate(40%, -30%)" }}
          ></div>
          <div
            className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-50/30 to-transparent rounded-full blur-3xl opacity-50 -z-10"
            style={{ transform: "translate(-30%, 20%)" }}
          ></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              {/* Left Column - Text Content */}
              <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
                <div className="space-y-6">
                  <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                    Find, book and
                    <br />
                    rent a car{" "}
                    <span className="text-blue-600 relative inline-block">
                      Easily
                      <svg
                        className="absolute -bottom-3 left-0 w-full"
                        height="16"
                        viewBox="0 0 240 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M3 13C60 5 120 3 237 11"
                          stroke="#2563eb"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </h1>
                  <p className="text-lg text-gray-600 max-w-md">
                    Get a car wherever and whenever you need it with your
                    device. We offer a wide range of vehicles to suit your
                    needs. Book now and enjoy affordable rates and exceptional
                    service.
                  </p>
                </div>
              </div>

              {/* Right Column - Car Image */}
              <div className="relative animate-in fade-in slide-in-from-right duration-700 delay-150">
                <div className="relative z-10 transform hover:scale-105 transition-transform duration-500 ease-out">
                  <img
                    src={`carIcon.png`}
                    alt="Blue Porsche sports car"
                    className="w-full h-auto drop-shadow-2xl"
                    style={{
                      filter:
                        "drop-shadow(0 25px 50px rgba(37, 99, 235, 0.15))",
                    }}
                  />
                </div>
                {/* Subtle glow behind car */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-400/20 rounded-full blur-3xl -z-10"></div>
              </div>
            </div>

            {/* Search Form */}
            <div className="mt-20 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom duration-700 delay-300">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-blue-200 border border-gray-100/50 p-8 hover:shadow-3xl transition-shadow duration-300">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                  {/* Location */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      Location
                    </label>
                    <Select
                      value={pickupLocation}
                      onValueChange={setPickupLocation}
                    >
                      <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                        <SelectValue placeholder="Select your city" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {mockLocations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Pickup Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Pickup date
                    </label>
                    <Input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Return Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Return date
                    </label>
                    <Input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>

                  {/* Search Button */}
                  <Button
                    onClick={handleSearch}
                    className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300"
                    size="lg"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cars Grid */}
        <section className="bg-white py-12 px-4 border-t border-gray-50">
          <div className="container mx-auto max-w-6xl">
            <h1 className="  mb-6 text-3xl font-bold pb-8 border-b border-gray-50 text-center">
              <span className="bg-gradient-to-r from-blue-950 to-blue-500 text-transparent bg-clip-text ">
                Available Cars
              </span>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {initialCars.map((car) => (
                <Link
                  href={`/cars/${car.id}`}
                  key={car.id}
                  className="group block"
                >
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    {/* Image Container */}
                    <div className="relative h-64 w-full bg-gray-50">
                      <ImageWithFallback
                        src={car.image}
                        alt={car.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Floating Badges */}
                      <div className="absolute top-4 left-4">
                        <span className="bg-blue-600/90 backdrop-blur-sm text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg">
                          Available Now
                        </span>
                      </div>
                      <div className="absolute bottom-4 right-4">
                        <span className="bg-black/80 backdrop-blur-sm text-white text-sm font-bold px-4 py-2 rounded-lg shadow-lg">
                          ${car.price}/day
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {car.name}
                          </h3>
                          <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">
                            {car.category} {car.year}
                          </p>
                        </div>
                      </div>

                      <div className="h-px bg-gray-100 my-4"></div>

                      {/* Features Grid */}
                      <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          <span>{car.seats} Seats</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Fuel className="h-4 w-4 text-blue-500" />
                          <span>Gasoline</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4 text-blue-500" />
                          <span>{car.transmission}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-blue-500" />
                          <span>Los Angeles</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 border-t border-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-950 to-blue-500 text-transparent bg-clip-text ">
                  Why Choose Us
                </span>
              </h2>
              <p className="text-gray-600">
                Discover the benefits of renting with CarRental
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Multiple Locations
                </h3>
                <p className="text-gray-600">
                  Pick up and drop off at convenient locations across the city
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Flexible Booking</h3>
                <p className="text-gray-600">
                  Book for a day, week, or month with easy modification options
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Wide Selection</h3>
                <p className="text-gray-600">
                  Choose from our extensive fleet of premium and luxury vehicles
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Hit the Road?
            </h2>
            <p className="text-blue-100 mb-8 text-lg">
              Browse our available cars and book your perfect ride today
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => router.push("/cars")}
              className="px-4 py-2 bg-gradient-to-r from-white to-blue-200 cursor-pointer hover:from-white/90 hover:to-blue-300  transition-all duration-300"
            >
              <span className="  ">View All Cars</span>
            </Button>
          </div>
        </section>


        {/* footer */}

        
      </div>
    </section>
  );
}

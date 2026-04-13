"use client";
import Link from "next/link";
import { Search, Filter, Users, Fuel, Settings } from "lucide-react";
// import PublicHeader from "@/app/ui/public-header";
import type { BackendCar, PublicCar } from "@/app/lib/data";
import { ImageWithFallback } from "@/app/ui/figma/imageWithFallBack";

import { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui/select";
import { MapPin, Calendar } from "lucide-react";
// import carImage from "figma:asset/4ad8fba70d6d1d6bb955a4c435e3235b26c7faa4.png";
import { useRouter } from "next/navigation";
import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import { Badge } from "@/app/ui/badge";
import { Card } from "@/app/ui/card";
import { HomeCarCardsSkeleton } from "@/app/ui/skeletons";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:5001";
const HOME_RECENT_CARS_LIMIT = 6;

const fetchPublicCars = async (): Promise<PublicCar[]> => {
  const response = await fetch(`${API_BASE_URL}/cars`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Unable to load cars from server (${response.status}). ${errorText}`,
    );
  }

  const backendCars = (await response.json()) as BackendCar[];
  return backendCars.map((car) => ({
    id: car.id,
    name: car.name,
    year: car.year,
    type: car.category?.name ?? "Other",
    location: car.homeLocation?.name ?? "Unknown",
    seats: car.seats,
    fuelType: car.fuelType ?? "Unknown",
    transmission: car.transmission,
    pricePerDay: Number(car.pricePerDay),
    imageUrl: car.imageUrl ?? "",
    available: car.status === "available",
    description: undefined,
  }));
};

const fallbackCarImage =
  "https://images.unsplash.com/photo-1624968789500-08275d8c3265?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

export default function HomePage() {
  const router = useRouter();
  const [cars, setCars] = useState<PublicCar[]>([]);
  const [isLoadingCars, setIsLoadingCars] = useState(true);
  const [carsError, setCarsError] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchCars = async () => {
      setIsLoadingCars(true);
      setCarsError("");

      try {
        const backendCars = await fetchPublicCars();

        if (!isMounted) return;

        setCars(backendCars.slice(0, HOME_RECENT_CARS_LIMIT));
      } catch (error) {
        if (!isMounted) return;
        setCarsError(
          error instanceof Error
            ? error.message
            : "Failed to load cars. Please try again.",
        );
      } finally {
        if (isMounted) {
          setIsLoadingCars(false);
        }
      }
    };

    fetchCars();

    return () => {
      isMounted = false;
    };
  }, []);

  const availableLocations = useMemo(
    () =>
      Array.from(new Set(cars.map((car) => car.location))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [cars],
  );

  const filteredCars = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const normalizedLocation = pickupLocation.trim().toLowerCase();

    return cars.filter((car) => {
      const matchesQuery =
        !normalizedQuery ||
        car.name.toLowerCase().includes(normalizedQuery) ||
        car.type.toLowerCase().includes(normalizedQuery);

      const matchesLocation =
        !normalizedLocation ||
        car.location.toLowerCase().includes(normalizedLocation);

      return matchesQuery && matchesLocation;
    });
  }, [cars, searchQuery, pickupLocation]);

  return (
    <section>
      {/* <PublicHeader className="shadow-md shadow-blue-100" /> */}
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
                  <p className=" text-gray-600 max-w-md italic ">
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Search className="w-4 h-4 text-blue-600" />
                      Search car
                    </label>
                    <Input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Type car name or type"
                      className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </div>

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
                        {availableLocations.map((location) => (
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {carsError ? (
                <p className="col-span-full rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {carsError}
                </p>
              ) : null}

              {isLoadingCars
                ? <HomeCarCardsSkeleton count={HOME_RECENT_CARS_LIMIT} />
                : filteredCars.map((car) => (
                    <Card
                      key={car.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                      onClick={() => router.push(`/cars/${car.id}`)}
                    >
                      <div className="relative">
                        <ImageWithFallback
                          src={car.imageUrl || fallbackCarImage}
                          alt={car.name}
                          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {car.available && (
                          <Badge className="absolute top-4 left-4 bg-blue-600 text-white">
                            Available Now
                          </Badge>
                        )}
                        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg font-semibold">
                          ${car.pricePerDay}/day
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="text-xl font-semibold mb-1">
                          {car.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {car.type} {car.year}
                        </p>

                        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{car.seats} Seats</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Fuel className="w-4 h-4" />
                            <span>{car.fuelType}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            <span>{car.transmission}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{car.location}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
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
        <section className="bg-gradient-to-r from-blue-600 to-blue-300 py-16 max-w-5xl mx-auto rounded-2xl  ">
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

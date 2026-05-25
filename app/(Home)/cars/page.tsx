"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Users,
  Fuel,
  Settings,
  MapPin,
  BadgeAlert,
} from "lucide-react";
import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import { Badge } from "@/app/ui/badge";
import { Card } from "@/app/ui/card";
import { ImageWithFallback } from "@/app/ui/figma/imageWithFallBack";
import { HomeCarCardsSkeleton } from "@/app/ui/skeletons";
import { API_BASE_URL } from "@/server/server";
import { useQuery } from "@tanstack/react-query";
import type { BackendCar, PublicCar } from "@/app/lib/data";
import { getLocationLabel } from "@/app/lib/format";
import {
  getUnavailableBadgeLabel,
  getUnavailableRangeLabel,
} from "@/app/lib/availability";
import { CarStatusBadge } from "@/app/ui/status-badges";

const HOME_RECENT_CARS_LIMIT = 6;
const PUBLIC_CARS_QUERY_KEY = ["publicCars"] as const;

const mapBackendCarToPublicCar = (car: BackendCar): PublicCar => ({
  id: car.id,
  name: car.name,
  year: car.year,
  category: car.category?.name ?? "Other",
  location: car.homeLocation?.name ?? "Unknown",
  seats: car.seats,
  fuelType: car.fuelType ?? "Unknown",
  transmission: car.transmission,
  pricePerDay: Number(car.pricePerDay),
  imageUrl: car.imageUrl ?? "",
  status: car.status,
  available: car.status === "available" && (car.category?.isActive ?? true),
  unavailablePeriod: car.unavailablePeriod ?? null,
  description: undefined,
});

const resolveCarImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return "";
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${API_BASE_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
};

const fallbackCarImage =
  "https://images.unsplash.com/photo-1624968789500-08275d8c3265?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

const fetchPublicCars = async (signal?: AbortSignal): Promise<PublicCar[]> => {
  const response = await fetch(`${API_BASE_URL}/cars`, {
    method: "GET",
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Unable to load cars from server (${response.status}). ${errorText}`,
    );
  }

  const backendCars = (await response.json()) as BackendCar[];
  // Filter out cars from inactive categories
  return backendCars
    .filter((car) => car.category?.isActive !== false)
    .map(mapBackendCarToPublicCar);
};

export default function CarsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: cars = [],
    isLoading: isLoadingCars,
    error: carsError,
  } = useQuery<PublicCar[], Error>({
    queryKey: PUBLIC_CARS_QUERY_KEY,
    queryFn: ({ signal }) => fetchPublicCars(signal),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });

  const filteredCars = useMemo(() => {
    const normalizedName = searchQuery.trim().toLowerCase();
    const normalizedCategory = searchQuery.trim().toLowerCase();
    const normalizedFuelType = searchQuery.trim().toLowerCase();

    return cars.filter((car) => {
      const matchName =
        !normalizedName || car.name.toLowerCase().includes(normalizedName);
      const matchCategory =
        !normalizedCategory ||
        car.category.toLowerCase().includes(normalizedCategory);
      const matchFuelType =
        !normalizedFuelType ||
        car.fuelType.toLowerCase().includes(normalizedFuelType);

      return matchName || matchCategory || matchFuelType;
    });
  }, [searchQuery, cars]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-linear-to-br from-gray-100 to-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-4">
            Available Cars
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Browse our selection of premium vehicles available for your next
            adventure
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-4 flex items-center gap-4">
            <div className="flex-1 flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by make, model, or features"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <Button variant="ghost" size="icon">
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Cars Grid */}
      <section className="bg-white py-12 px-4 border-t border-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h1 className="  mb-6 text-3xl font-bold pb-8 border-b border-gray-50 text-center">
            <span className="bg-linear-to-r from-blue-950 to-blue-500 text-transparent bg-clip-text ">
              {cars?.length} Available Cars
            </span>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {carsError ? (
              <p className="col-span-full rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {carsError.message}
              </p>
            ) : null}

            {isLoadingCars ? (
              <HomeCarCardsSkeleton count={HOME_RECENT_CARS_LIMIT} />
            ) : filteredCars.length === 0 ? (
              <Card className="col-span-full p-12 text-center">
                <div className="max-w-md mx-auto">
                  <BadgeAlert className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    {searchQuery.trim()
                      ? "No cars found"
                      : "No cars available yet"}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery.trim()
                      ? "No cars match your search. Try another keyword or clear the search box."
                      : "There are currently no cars to display. Please check back soon."}
                  </p>
                </div>
              </Card>
            ) : (
              filteredCars.map((car) => (
                <Card
                  key={car.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => router.push(`/cars/${car.id}`)}
                >
                  <div className="relative">
                    <ImageWithFallback
                      src={resolveCarImageUrl(car.imageUrl) || fallbackCarImage}
                      alt={car.name}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {(() => {
                      const unavailableBadge = getUnavailableBadgeLabel(
                        car.unavailablePeriod,
                      );

                      return (
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                          <CarStatusBadge status={car.status} />
                          {unavailableBadge ? (
                            <Badge className="bg-amber-600 text-white">
                              {unavailableBadge}
                            </Badge>
                          ) : null}
                        </div>
                      );
                    })()}
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg font-semibold">
                      ${car.pricePerDay}/day
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-xl font-semibold mb-1">{car.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {car.category} {car.year}
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
                        <span>{getLocationLabel(car.location)}</span>
                      </div>
                    </div>

                    {car.unavailablePeriod ? (
                      <p className="mt-4 text-xs text-amber-700">
                        Unavailable:{" "}
                        {getUnavailableRangeLabel(car.unavailablePeriod)}
                      </p>
                    ) : car.status !== "available" ? (
                      <p className="mt-4 text-xs text-gray-500">
                        {car.status === "rented"
                          ? "Currently rented"
                          : "Under maintenance"}
                      </p>
                    ) : null}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

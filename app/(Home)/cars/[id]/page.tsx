"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Fuel,
  Settings,
  MapPin,
  Heart,
  LoaderCircle,
  BadgeAlert,
} from "lucide-react";
import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import { Card } from "@/app/ui/card";
import { ImageWithFallback } from "@/app/ui/figma/imageWithFallBack";
import { CarDetailSkeleton } from "@/app/ui/skeletons";
import type { BackendCar, PublicCar } from "@/app/lib/data";
import { getStoredToken } from "@/app/lib/auth";
import { API_BASE_URL } from "@/server/server";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const fallbackCarImage =
  "https://images.unsplash.com/photo-1624968789500-08275d8c3265?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

type BackendCarWithLocationId = BackendCar & {
  homeLocation?: {
    id?: string;
    name?: string;
  } | null;
};

type PublicCarDetail = PublicCar & {
  homeLocationId?: string;
};

type CreateBookingPayload = {
  carId: string;
  pickupLocationId: string;
  returnLocationId: string;
  pickupAt: string;
  returnAt: string;
};

const mapBackendCarToPublicCar = (car: BackendCarWithLocationId): PublicCarDetail => ({
  id: car.id,
  name: car.name,
  year: car.year,
  category: car.category?.name ?? "Other",
  location: car.homeLocation?.name ?? "Unknown",
  homeLocationId: car.homeLocation?.id,
  seats: car.seats,
  fuelType: car.fuelType ?? "Unknown",
  transmission: car.transmission,
  pricePerDay: Number(car.pricePerDay),
  imageUrl: car.imageUrl ?? "",
  available: car.status === "available",
  description: undefined,
});

const fetchPublicCarById = async (
  id: string,
  signal?: AbortSignal,
): Promise<PublicCarDetail> => {
  const response = await fetch(`${API_BASE_URL}/cars/${id}`, {
    method: "GET",
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Unable to load car from server (${response.status}). ${errorText}`,
    );
  }

  const backendCar = (await response.json()) as BackendCarWithLocationId;
  return mapBackendCarToPublicCar(backendCar);
};

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(data.message)) return data.message.join(", ");
    if (typeof data.message === "string") return data.message;
  } catch {
    // Fallback to status text if response body is not JSON.
  }

  return response.statusText || "Request failed";
};

const createBooking = async (payload: CreateBookingPayload) => {
  const token = getStoredToken();

  if (!token) {
    throw new Error("Please log in to book this car.");
  }

  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const responseText = await response.text();
  //todo unless the backend is updated to always return a JSON response, we need to handle this case gracefully to avoid JSON parsing errors on empty responses.
  // todo if the response body is empty, we return null instead of trying to parse it as JSON, which would throw an error. This allows the frontend to handle successful responses that don't include a body without crashing.
  return responseText ? JSON.parse(responseText) : null;
};

export default function CarDetailPage() {
  const params = useParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const navigate = useRouter();
  const queryClient = useQueryClient();
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const {
    data: car,
    isPending: isLoadingCar,
    error: carError,
  } = useQuery<PublicCarDetail, Error>({
    queryKey: ["publicCar", id],
    queryFn: ({ signal }) => fetchPublicCarById(id as string, signal),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const bookingMutation = useMutation({
    mutationFn: (payload: CreateBookingPayload) => createBooking(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["myBookings"],
        refetchType: "all",
      });
      toast.success("Booking request submitted successfully!");
      navigate.replace("/my-bookings");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Booking failed. Please try again.",
      );
    },
  });

  if (isLoadingCar) {
    return <CarDetailSkeleton />;
  }

  if (carError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="p-12 text-center w-full max-w-xl">
          <div className="max-w-md mx-auto">
            <BadgeAlert className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Unable to load car</h2>
            <p className="text-gray-600 mb-6">
              {carError.message ||
                "Something went wrong while loading this car. Please try again."}
            </p>
          </div>
          <Button
            onClick={() => navigate.push("/cars")}
            className="bg-blue-50 text-blue-500 hover:bg-blue-100  hover:text-blue-600 transition-colors duration-300"
          >
            Back to Cars
          </Button>
        </Card>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="p-12 text-center w-full max-w-xl">
          <div className="max-w-md mx-auto">
            <BadgeAlert className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Car not found</h2>
            <p className="text-gray-600 mb-6">
              This car may have been removed or is no longer available.
            </p>
          </div>
          <Button
            onClick={() => navigate.push("/cars")}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            Back to Cars
          </Button>
        </Card>
      </div>
    );
  }

  const handleBookNow = async () => {
    if (bookingMutation.isPending) return;

    if (!pickupDate || !returnDate) {
      toast.error("Please select pickup and return dates");
      return;
    }

    if (returnDate <= pickupDate) {
      toast.error("Return date must be after pickup date");
      return;
    }

    if (!car.homeLocationId) {
      toast.error("Pickup location is unavailable for this car.");
      return;
    }

    const payload: CreateBookingPayload = {
      carId: car.id,
      pickupLocationId: car.homeLocationId,
      returnLocationId: car.homeLocationId,
      pickupAt: new Date(`${pickupDate}T09:00:00.000Z`).toISOString(),
      returnAt: new Date(`${returnDate}T09:00:00.000Z`).toISOString(),
    };

    bookingMutation.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate.push("/cars")}
          className="mb-6 hover:bg-blue-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to all cars
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Car Images and Details */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="relative mb-8 rounded-xl overflow-hidden bg-gray-100">
              <ImageWithFallback
                src={car.imageUrl || fallbackCarImage}
                alt={car.name}
                className="w-full h-125 object-cover"
              />

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                1 / 1
              </div>

              {/* Favorite Button */}
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 rounded-full bg-white/90 hover:bg-white"
              >
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            {/* Car Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{car.name}</h1>
                <p className="text-gray-600">
                  {car.year} • {car.category}
                </p>
              </div>

              {/* Specifications */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Specifications</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="flex flex-col items-center text-center p-4 bg-blue-50 rounded-lg">
                    <Users className="w-6 h-6 mb-2 text-gray-600" />
                    <span className="font-medium">{car.seats} Seats</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 bg-blue-50 rounded-lg">
                    <Fuel className="w-6 h-6 mb-2 text-gray-600" />
                    <span className="font-medium">{car.fuelType}</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 bg-blue-50 rounded-lg">
                    <Settings className="w-6 h-6 mb-2 text-gray-600" />
                    <span className="font-medium">{car.transmission}</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 bg-blue-50 rounded-lg">
                    <MapPin className="w-6 h-6 mb-2 text-gray-600" />
                    <span className="font-medium">{car.location}</span>
                  </div>
                </div>
              </Card>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {car.description ||
                    "This premium vehicle offers exceptional performance, comfort, and style. Perfect for business trips, family vacations, or special occasions. Equipped with the latest safety features and modern amenities to ensure a smooth and enjoyable driving experience."}
                </p>
              </div>

              {/* Features */}
              <div>
                <h3 className="font-semibold mb-3">Features</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <span>Air Conditioning</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <span>Bluetooth</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <span>GPS Navigation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <span>Backup Camera</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <span>Premium Sound System</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <span>Leather Seats</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 border-gray-300">
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold">${car.pricePerDay}</span>
                  <span className="text-gray-600">per day</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Pickup Date
                  </label>
                  <Input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="bg-gray-100 border-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Return Date
                  </label>
                  <Input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="bg-gray-100 border-none"
                  />
                </div>
              </div>
              <Button
                onClick={handleBookNow}
                className="w-full mb-4 bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300"
                size="lg"
                disabled={bookingMutation.isPending}
                aria-busy={bookingMutation.isPending}
              >
                {bookingMutation.isPending ? (
                  <span className="inline-flex items-center gap-2">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Booking...
                  </span>
                ) : (
                  "Book Now"
                )}
              </Button>

              {bookingMutation.isError ? (
                <p className="mb-3 text-sm text-red-600">
                  An error occurred: {bookingMutation.error.message}
                </p>
              ) : null}

              <p className="text-xs text-center text-gray-500">
                No credit card required to reserve
              </p>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-gray-300 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Free cancellation</span>
                  <span className="font-medium">Up to 24h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Insurance</span>
                  <span className="font-medium">Included</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mileage</span>
                  <span className="font-medium">Unlimited</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

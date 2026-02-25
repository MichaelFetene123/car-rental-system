"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Fuel,
  Settings,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Heart,
} from "lucide-react";
import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import { Card } from "@/app/ui/card";
import { ImageWithFallback } from "@/app/ui/figma/imageWithFallBack";
import { mockCars } from "@/app/lib/mockData";
import { toast } from "sonner";

const carImages = [
  "https://images.unsplash.com/photo-1624968789500-08275d8c3265?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMEJNVyUyMHNwb3J0JTIwY2FyJTIwcm9hZHxlbnwxfHx8fDE3NzE4NDc2MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1606173929045-3dd85676897b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVlJTIwQk1XJTIwbHV4dXJ5JTIwY2FyJTIwb2NlYW58ZW58MXx8fHwxNzcxODQ3NjEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1764045565546-a5a8bf80fbec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMFRlc2xhJTIwZWxlY3RyaWMlMjBjYXIlMjBtb3VudGFpbnxlbnwxfHx8fDE3NzE4NDc2MTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
];

export default function CarDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const car = mockCars.find((c) => c.id === id);

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Car not found</h2>
          <Button onClick={() => navigate.push("/cars")}>Back to Cars</Button>
        </div>
      </div>
    );
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? carImages.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === carImages.length - 1 ? 0 : prev + 1,
    );
  };

  const handleBookNow = () => {
    if (!pickupDate || !returnDate) {
      toast.error("Please select pickup and return dates");
      return;
    }
    toast.success("Booking request submitted successfully!");
    setTimeout(() => {
      navigate.push("/my-bookings");
    }, 1500);
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
                src={carImages[currentImageIndex]}
                alt={car.name}
                className="w-full h-[500px] object-cover"
              />

              {/* Image Navigation */}
              <div className="absolute inset-0 flex items-center justify-between px-4">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handlePrevImage}
                  className="rounded-full bg-white/90 hover:bg-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleNextImage}
                  className="rounded-full bg-white/90 hover:bg-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                {currentImageIndex + 1} / {carImages.length}
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
                  {car.year} • {car.type}
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

              <Button onClick={handleBookNow} className="w-full mb-4 bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300" size="lg">
                Book Now
              </Button>

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

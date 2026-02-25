'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, Users, Fuel, Settings, MapPin } from "lucide-react";
import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import { Badge } from "@/app/ui/badge";
import { Card } from "@/app/ui/card";
import { ImageWithFallback } from "@/app/ui/figma/imageWithFallBack";
import { mockCars } from "@/app/lib/mockData";

const carImages = [
  "https://images.unsplash.com/photo-1624968789500-08275d8c3265?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMEJNVyUyMHNwb3J0JTIwY2FyJTIwcm9hZHxlbnwxfHx8fDE3NzE4NDc2MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1606173929045-3dd85676897b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVlJTIwQk1XJTIwbHV4dXJ5JTIwY2FyJTIwb2NlYW58ZW58MXx8fHwxNzcxODQ3NjEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1764045565546-a5a8bf80fbec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMFRlc2xhJTIwZWxlY3RyaWMlMjBjYXIlMjBtb3VudGFpbnxlbnwxfHx8fDE3NzE4NDc2MTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1659083934189-ebc3cfd8d4c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzaWx2ZXIlMjBzZWRhbiUyMGNhcnxlbnwxfHx8fDE3NzE4NDc2MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1624968789500-08275d8c3265?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGl0ZSUyMEJNVyUyMHNwb3J0JTIwY2FyJTIwcm9hZHxlbnwxfHx8fDE3NzE4NDc2MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
  "https://images.unsplash.com/photo-1606173929045-3dd85676897b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVlJTIwQk1XJTIwbHV4dXJ5JTIwY2FyJTIwb2NlYW58ZW58MXx8fHwxNzcxODQ3NjEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
];

export default function CarsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCars = mockCars.filter(
    (car) =>
      car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.type.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-gray-100 to-gray-200 py-16">
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
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className="text-gray-600">Showing {filteredCars.length} Cars</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car, index) => (
              <Card
                key={car.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => router.push(`/cars/${car.id}`)}
              >
                <div className="relative">
                  <ImageWithFallback
                    src={carImages[index % carImages.length]}
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
                  <h3 className="text-xl font-semibold mb-1">{car.name}</h3>
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
    </div>
  );
}

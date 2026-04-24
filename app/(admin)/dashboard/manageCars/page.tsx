"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import { Label } from "@/app/ui/lable";
import { Textarea } from "@/app/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/app/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui/select";
import { Badge } from "@/app/ui/badge";
import { Plus, Edit, Trash2, Search, Upload } from "lucide-react";
import { ImageWithFallback } from "@/app/ui/figma/imageWithFallBack";
import { toast } from "sonner";
import { API_BASE_URL } from "@/server/server";
import { authFetch, clearStoredAuth } from "@/app/lib/auth";

import { Car } from "@/app/lib/data";
import { lusitana } from "@/app/ui/utils/fonts";

type CarCategory = {
  id: string;
  name: string;
};

type ManageCar = Car & {
  categoryId?: string;
  imageUrl?: string | null;
};

type ApiCar = {
  id: string;
  name: string;
  fuelType?: string | null;
  year: number;
  seats: number;
  transmission: string;
  pricePerDay?: number | string;
  status: Car["status"];
  description?: string | null;
  imageUrl?: string | null;
  categoryId?: string | null;
  category?: { id: string; name: string } | null;
};

export default function ManageCars() {
  const router = useRouter();
  const [cars, setCars] = useState<ManageCar[]>([]);
  const [isLoadingCars, setIsLoadingCars] = useState(true);
  const [carsLoadError, setCarsLoadError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CarCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<ManageCar | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    fuelType: "",
    category: "",
    price: "",
    status: "available" as Car["status"],
    image: "",
    year: "",
    transmission: "",
    seats: "",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const parseErrorMessage = async (response: Response): Promise<string> => {
    try {
      const error = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(error.message)) return error.message.join(", ");
      if (typeof error.message === "string") return error.message;
    } catch {
      // Fallback to response status text when body isn't JSON.
    }

    return response.statusText || "Request failed";
  };

  const handleAuthExpired = () => {
    clearStoredAuth();
    toast.error("Session expired. Please log in again.");
    router.replace("/login");
  };

  const mapApiCarToUiCar = (car: ApiCar): ManageCar => ({
    id: car.id,
    name: car.name,
    fuelType: car.fuelType ?? "",
    category: car.category?.name ?? "Unknown",
    categoryId: car.categoryId ?? car.category?.id ?? undefined,
    price: Number(car.pricePerDay ?? 0),
    status: car.status,
    image: car.imageUrl ?? "",
    imageUrl: car.imageUrl ?? null,
    year: Number(car.year),
    transmission: car.transmission,
    seats: Number(car.seats),
    description: car.description ?? "",
  });

  useEffect(() => {
    const loadCars = async () => {
      setIsLoadingCars(true);
      setCarsLoadError(null);

      try {
        const res = await authFetch(`/admin/cars`, {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(await parseErrorMessage(res));
        }

        const data = (await res.json()) as ApiCar[];
        setCars(data.map(mapApiCarToUiCar));
      } catch (err) {
        if (err instanceof Error && /log in again|refresh token|session/i.test(err.message)) {
          handleAuthExpired();
          return;
        }

        const message =
          err instanceof Error ? err.message : "Unable to load cars";
        setCarsLoadError(message);
        toast.error(`Cars load failed: ${message}`);
      } finally {
        setIsLoadingCars(false);
      }
    };

    void loadCars();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await authFetch(`/car-categories`, {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(await parseErrorMessage(res));
        }

        const data = (await res.json()) as CarCategory[];
        setCategories(data);
      } catch (err) {
        if (err instanceof Error && /log in again|refresh token|session/i.test(err.message)) {
          handleAuthExpired();
          return;
        }

        const message =
          err instanceof Error ? err.message : "Unable to load categories";
        toast.error(`Category load failed: ${message}`);
      }
    };

    void loadCategories();
  }, []);

  const getCarImageSrc = (car: Car): string => {
    const imageUrl = (car as Car & { imageUrl?: string | null }).imageUrl;
    const rawSrc = imageUrl ?? car.image;

    if (!rawSrc) return "";

    if (
      rawSrc.startsWith("http://") ||
      rawSrc.startsWith("https://") ||
      rawSrc.startsWith("blob:") ||
      rawSrc.startsWith("data:")
    ) {
      return rawSrc;
    }

    return `${API_BASE_URL}${rawSrc.startsWith("/") ? "" : "/"}${rawSrc}`;
  };

  const filteredCars = cars.filter(
    (car) =>
      car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddCar = () => {
    setEditingCar(null);
    setFormData({
      name: "",
      fuelType: "",
      category: "",
      price: "",
      status: "available",
      image: "",
      year: "",
      transmission: "",
      seats: "",
      description: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditCar = (car: ManageCar) => {
    const matchedCategoryId =
      car.categoryId ??
      categories.find((category) => category.name === car.category)?.id ??
      "";

    setEditingCar(car);
    setFormData({
      name: car.name,
      fuelType: car.fuelType || "",
      category: matchedCategoryId,
      price: car.price.toString(),
      status: car.status,
      image: car.image,
      year: car.year.toString(),
      transmission: car.transmission,
      seats: car.seats.toString(),
      description: car.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCar = async (id: string) => {
    try {
      const res = await authFetch(`/admin/cars/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(await parseErrorMessage(res));
      }

      setCars(cars.filter((car) => car.id !== id));
      toast.success("Car deleted successfully");
    } catch (err) {
      if (err instanceof Error && /log in again|refresh token|session/i.test(err.message)) {
        handleAuthExpired();
        return;
      }

      const message =
        err instanceof Error ? err.message : "Failed to delete car";
      toast.error(`Delete failed: ${message}`);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // optional preview only
      const previewUrl = URL.createObjectURL(file);
      setFormData({ ...formData, image: previewUrl });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const form = new FormData();

      form.append("name", formData.name);
      form.append("fuelType", formData.fuelType);
      form.append("categoryId", formData.category);
      form.append("pricePerDay", formData.price);
      form.append("status", formData.status);
      form.append("year", formData.year);
      form.append("transmission", formData.transmission);
      form.append("seats", formData.seats);
      form.append("description", formData.description);

      if (selectedFile) {
        form.append("image", selectedFile);
      }

      const endpoint = editingCar
        ? `/admin/cars/${editingCar.id}`
        : "/admin/cars";

      const method = editingCar ? "PATCH" : "POST";

      const res = await authFetch(endpoint, {
        method,
        body: form,
      });

      if (!res.ok) {
        throw new Error(await parseErrorMessage(res));
      }

      const data = mapApiCarToUiCar((await res.json()) as ApiCar);

      if (editingCar) {
        setCars((currentCars) =>
          currentCars.map((c) => (c.id === data.id ? data : c)),
        );
        toast.success("Car updated successfully");
      } else {
        setCars((currentCars) => [data, ...currentCars]);
        toast.success("Car added successfully");
      }

      setIsDialogOpen(false);
    } catch (err) {
      if (err instanceof Error && /log in again|refresh token|session/i.test(err.message)) {
        handleAuthExpired();
        return;
      }

      const message =
        err instanceof Error ? err.message : "Failed to save car data";
      toast.error(`Car save failed: ${message}`);
    }
  };

  const getStatusColor = (status: Car["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-700";
      case "rented":
        return "bg-blue-100 text-blue-700";
      case "maintenance":
        return "bg-orange-100 text-orange-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`${lusitana.className} text-2xl mb-1`}>Manage Cars</h1>
          <p className="text-muted-foreground">
            Add, update, or remove cars from your fleet
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleAddCar}
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              <Plus className="size-4 mr-2" />
              Add New Car
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-none">
            <DialogHeader>
              <DialogTitle>
                {editingCar ? "Edit Car" : "Add New Car"}
              </DialogTitle>
              <DialogDescription>
                {editingCar
                  ? "Update the car details below"
                  : "Enter the details of the new car"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Car Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger className="border-gray-500">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="__no_category__" disabled>
                          No categories found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuelType">Fuel Type</Label>
                  <Input
                    id="fuelType"
                    value={formData.fuelType}
                    onChange={(e) =>
                      setFormData({ ...formData, fuelType: e.target.value })
                    }
                    placeholder="e.g. Gasoline, Diesel, Electric"
                    className="border-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price per Day ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                    className="border-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: e.target.value })
                    }
                    required
                    className="border-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transmission">Transmission</Label>
                  <Select
                    value={formData.transmission}
                    onValueChange={(value) =>
                      setFormData({ ...formData, transmission: value })
                    }
                  >
                    <SelectTrigger className="border-gray-500">
                      <SelectValue placeholder="Select transmission" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      <SelectItem value="Automatic">Automatic</SelectItem>
                      <SelectItem value="Manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seats">Seats</Label>
                  <Input
                    id="seats"
                    type="number"
                    value={formData.seats}
                    onChange={(e) =>
                      setFormData({ ...formData, seats: e.target.value })
                    }
                    required
                    className="border-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        status: value as Car["status"],
                      })
                    }
                  >
                    <SelectTrigger className="border-gray-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="rented">Rented</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Write car description"
                  className="border-gray-500 min-h-24"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUpload">Car Image</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="size-4" />
                  </Button>
                  <span className="text-sm text-gray-600 truncate">
                    {selectedFile?.name ?? "No file selected"}
                  </span>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="hover:text-gray-600 hover:border-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                >
                  {editingCar ? "Update Car" : "Add Car"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-gray-50 border-none">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Fleet Overview</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search cars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-gray-300"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto bg-white rounded-lg p-4">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-300">
                  <TableHead>Car</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Transmission</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Price/Day</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingCars ? (
                  <TableRow className="border-gray-300">
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-gray-600"
                    >
                      Loading cars...
                    </TableCell>
                  </TableRow>
                ) : carsLoadError ? (
                  <TableRow className="border-gray-300">
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-red-600"
                    >
                      Failed to load cars: {carsLoadError}
                    </TableCell>
                  </TableRow>
                ) : filteredCars.length === 0 ? (
                  <TableRow className="border-gray-300">
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-gray-600"
                    >
                      No cars found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCars.map((car) => (
                    <TableRow key={car.id} className="border-gray-300">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <ImageWithFallback
                            src={getCarImageSrc(car)}
                            alt={car.name}
                            className="size-12 rounded object-cover"
                          />
                          <span>{car.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{car.category}</TableCell>
                      <TableCell>{car.year}</TableCell>
                      <TableCell>{car.transmission}</TableCell>
                      <TableCell>{car.seats}</TableCell>
                      <TableCell>${car.price}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(car.status)}>
                          {car.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditCar(car)}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCar(car.id)}
                          >
                            <Trash2 className="size-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

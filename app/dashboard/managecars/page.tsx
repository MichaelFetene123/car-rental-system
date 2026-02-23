"use client";
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import { Label } from "@/app/ui/lable";
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

import { Car, initialCars } from "@/app/lib/data";
import { lusitana } from "@/app/ui/utils/fonts";

export default function ManageCars() {
  const [cars, setCars] = useState<Car[]>(initialCars);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    status: "available" as Car["status"],
    image: "",
    year: "",
    transmission: "",
    seats: "",
  });

  const filteredCars = cars.filter(
    (car) =>
      car.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleAddCar = () => {
    setEditingCar(null);
    setFormData({
      name: "",
      category: "",
      price: "",
      status: "available",
      image: "",
      year: "",
      transmission: "",
      seats: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditCar = (car: Car) => {
    setEditingCar(car);
    setFormData({
      name: car.name,
      category: car.category,
      price: car.price.toString(),
      status: car.status,
      image: car.image,
      year: car.year.toString(),
      transmission: car.transmission,
      seats: car.seats.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCar = (id: string) => {
    setCars(cars.filter((car) => car.id !== id));
    toast.success("Car deleted successfully");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCar) {
      setCars(
        cars.map((car) =>
          car.id === editingCar.id
            ? {
                ...car,
                ...formData,
                price: parseFloat(formData.price),
                year: parseInt(formData.year),
                seats: parseInt(formData.seats),
              }
            : car,
        ),
      );
      toast.success("Car updated successfully");
    } else {
      const newCar: Car = {
        id: Date.now().toString(),
        ...formData,
        price: parseFloat(formData.price),
        year: parseInt(formData.year),
        seats: parseInt(formData.seats),
      };
      setCars([...cars, newCar]);
      toast.success("Car added successfully");
    }
    setIsDialogOpen(false);
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
                      <SelectItem value="Sedan">Sedan</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Electric">Electric</SelectItem>
                      <SelectItem value="Compact">Compact</SelectItem>
                    </SelectContent>
                  </Select>
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
                <Label htmlFor="image">Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    placeholder="Enter image URL or upload"
                    required
                    className="border-gray-500"
                  />
                  <input
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
                {filteredCars.map((car) => (
                  <TableRow key={car.id} className="border-gray-300">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <ImageWithFallback
                          src={car.image}
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

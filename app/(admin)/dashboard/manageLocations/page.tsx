"use client";

import { useState } from "react";
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
import { Badge } from "@/app/ui/badge";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/app/ui/dialog";
import { Switch } from "@/app/ui/switch";
import { toast } from "sonner";
import { lusitana } from "@/app/ui/utils/fonts";

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  isActive: boolean;
  openingHours: string;
}

const initialLocations: Location[] = [
  {
    id: "1",
    name: "Downtown Branch",
    address: "123 Main Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    phone: "+1 (555) 100-2000",
    email: "downtown@carrental.com",
    isActive: true,
    openingHours: "Mon-Fri: 8AM-8PM, Sat-Sun: 9AM-6PM",
  },
  {
    id: "2",
    name: "Airport Branch",
    address: "JFK International Airport, Terminal 4",
    city: "New York",
    state: "NY",
    zipCode: "11430",
    phone: "+1 (555) 100-3000",
    email: "airport@carrental.com",
    isActive: true,
    openingHours: "24/7",
  },
  {
    id: "3",
    name: "Mall Branch",
    address: "456 Shopping Center Blvd",
    city: "Brooklyn",
    state: "NY",
    zipCode: "11201",
    phone: "+1 (555) 100-4000",
    email: "mall@carrental.com",
    isActive: true,
    openingHours: "Mon-Sun: 10AM-9PM",
  },
  {
    id: "4",
    name: "Suburban Office",
    address: "789 Oak Avenue",
    city: "Queens",
    state: "NY",
    zipCode: "11354",
    phone: "+1 (555) 100-5000",
    email: "suburban@carrental.com",
    isActive: false,
    openingHours: "Mon-Fri: 9AM-6PM",
  },
];

export default function ManageLocations() {
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    openingHours: "",
  });

  const handleAddLocation = () => {
    setEditingLocation(null);
    setFormData({
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      email: "",
      openingHours: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address,
      city: location.city,
      state: location.state,
      zipCode: location.zipCode,
      phone: location.phone,
      email: location.email,
      openingHours: location.openingHours,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteLocation = (id: string) => {
    setLocations(locations.filter((location) => location.id !== id));
    toast.success("Location deleted");
  };

  const handleToggleActive = (id: string) => {
    setLocations(
      locations.map((location) =>
        location.id === id
          ? { ...location, isActive: !location.isActive }
          : location,
      ),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLocation) {
      setLocations(
        locations.map((location) =>
          location.id === editingLocation.id
            ? { ...location, ...formData }
            : location,
        ),
      );
      toast.success("Location updated");
    } else {
      const newLocation: Location = {
        id: Date.now().toString(),
        ...formData,
        isActive: true,
      };
      setLocations([...locations, newLocation]);
      toast.success("Location added");
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`${lusitana.className} text-2xl mb-1`}>
            Manage Locations
          </h1>
          <p className="text-muted-foreground">
            Manage pickup and drop-off locations
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleAddLocation}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="size-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-none">
            <DialogHeader>
              <DialogTitle>
                {editingLocation ? "Edit Location" : "Add New Location"}
              </DialogTitle>
              <DialogDescription>
                {editingLocation
                  ? "Update location details"
                  : "Enter the details of the new location"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Location Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="border-gray-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="border-gray-400"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="border-gray-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className="border-gray-400"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) =>
                    setFormData({ ...formData, zipCode: e.target.value })
                  }
                  className="border-gray-400"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="border-gray-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="border-gray-400"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="openingHours">Opening Hours</Label>
                <Textarea
                  id="openingHours"
                  value={formData.openingHours}
                  onChange={(e) =>
                    setFormData({ ...formData, openingHours: e.target.value })
                  }
                  placeholder="e.g., Mon-Fri: 9AM-6PM, Sat-Sun: 10AM-4PM"
                  required
                  className="border-gray-400"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="hover:border-gray-400"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingLocation ? "Update Location" : "Add Location"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => (
          <Card key={location.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <MapPin className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{location.name}</CardTitle>
                    <Badge
                      className={
                        location.isActive
                          ? "bg-green-100 text-green-700 mt-2"
                          : "bg-gray-100 text-gray-700 mt-2"
                      }
                    >
                      {location.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground text-gray-500">
                  Address
                </p>
                <p className="text-sm">
                  {location.address}
                  <br />
                  {location.city}, {location.state} {location.zipCode}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground text-gray-500">
                  Contact
                </p>
                <p className="text-sm">{location.phone}</p>
                <p className="text-sm">{location.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground text-gray-500">
                  Hours
                </p>
                <p className="text-sm">{location.openingHours}</p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-300">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={location.isActive}
                    onCheckedChange={() => handleToggleActive(location.id)}
                    className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-400 [&_[data-slot=switch-thumb]]:bg-white"
                  />
                  <span className="text-sm text-muted-foreground">Active</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditLocation(location)}
                  >
                    <Edit className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteLocation(location.id)}
                  >
                    <Trash2 className="size-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{locations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {locations.filter((l) => l.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inactive Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {locations.filter((l) => !l.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import { Label } from "@/app/ui/lable";
import { Textarea } from "@/app/ui/textarea";
import { Badge } from "@/app/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  toggleLocationStatus,
  ADMIN_LOCATIONS_QUERY_KEY,
  type AdminLocation,
  type CreateLocationPayload,
} from "@/app/lib/locations-api";

export default function ManageLocations() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<AdminLocation | null>(
    null,
  );
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

  const {
    data: locations = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ADMIN_LOCATIONS_QUERY_KEY,
    queryFn: ({ signal }) => fetchAdminLocations(signal),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ADMIN_LOCATIONS_QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: (payload: CreateLocationPayload) => createLocation(payload),
    onSuccess: () => {
      toast.success("Location created");
      setIsDialogOpen(false);
      invalidate();
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "Failed to create location",
      ),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CreateLocationPayload;
    }) => updateLocation(id, payload),
    onSuccess: () => {
      toast.success("Location updated");
      setIsDialogOpen(false);
      invalidate();
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "Failed to update location",
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteLocation(id),
    onSuccess: () => {
      toast.success("Location deleted");
      invalidate();
    },
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "Failed to delete location",
      ),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleLocationStatus(id, isActive),
    onSuccess: () => invalidate(),
    onError: (err) =>
      toast.error(
        err instanceof Error ? err.message : "Failed to update status",
      ),
  });

  const isLoadingMutation =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    toggleMutation.isPending;

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

  const handleEditLocation = (location: AdminLocation) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address,
      city: location.city,
      state: location.state,
      zipCode: location.zipCode,
      phone: location.phone ?? "",
      email: location.email ?? "",
      openingHours: location.openingHours ?? "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteLocation = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleToggleActive = (id: string, current: boolean) => {
    toggleMutation.mutate({ id, isActive: !current });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateLocationPayload = {
      name: formData.name,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      openingHours: formData.openingHours || undefined,
    };
    if (editingLocation) {
      updateMutation.mutate({ id: editingLocation.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const activeCount = locations.filter((l) => l.isActive).length;
  const inactiveCount = locations.filter((l) => !l.isActive).length;

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
                  disabled={isLoadingMutation}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoadingMutation
                    ? "Saving..."
                    : editingLocation
                      ? "Update Location"
                      : "Add Location"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="size-5 shrink-0" />
          <span>
            {error instanceof Error
              ? error.message
              : "Failed to load locations"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ADMIN_LOCATIONS_QUERY_KEY,
              })
            }
            className="ml-auto shrink-0 text-red-700 hover:text-red-900"
          >
            <RefreshCw className="size-4 mr-1" /> Retry
          </Button>
        </div>
      )}

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-blue-50 border-blue-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800">
              Total Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-900">
            <div className="text-3xl font-semibold text-blue-900">
              {isLoading ? "0" : locations.length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-emerald-800">
              Active Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="text-emerald-900">
            <div className="text-3xl font-semibold text-emerald-900">
              {isLoading ? "0" : activeCount}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-amber-800">
              Inactive Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="text-amber-900">
            <div className="text-3xl font-semibold text-amber-900">
              {isLoading ? "0" : inactiveCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={`skeleton-${i}`} className="animate-pulse">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <div className="size-5 rounded bg-gray-200" />
                    </div>
                    <div>
                      <div className="h-6 w-40 rounded-md bg-gray-200" />
                      <div className="mt-2 h-6 w-16 rounded-full bg-gray-200" />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground text-gray-500">
                    {/* Address */}
                  </p>
                  <div className="mt-2 space-y-2">
                    <div className="h-4 w-5/6 rounded bg-gray-200" />
                    <div className="h-4 w-4/6 rounded bg-gray-200" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground text-gray-500">
                    {/* Contact */}
                  </p>
                  <div className="mt-2 space-y-2">
                    <div className="h-4 w-1/2 rounded bg-gray-200" />
                    <div className="h-4 w-2/3 rounded bg-gray-200" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground text-gray-500">
                    {/* Hours */}
                  </p>
                  <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-11 rounded-full bg-gray-200" />
                    <div className="h-4 w-12 rounded bg-gray-200" />
                  </div>
                  <div className="flex gap-2">
                    <div className="size-9 rounded-md bg-gray-200" />
                    <div className="size-9 rounded-md bg-gray-200" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : locations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-16 text-center">
          <MapPin className="mb-3 size-10 text-gray-400" />
          <p className="text-lg font-medium text-gray-600">No locations yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Add your first location to get started.
          </p>
          <Button
            onClick={handleAddLocation}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="size-4 mr-2" />
            Add Location
          </Button>
        </div>
      ) : (
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
                  <p className="text-sm">{location.phone ?? "—"}</p>
                  <p className="text-sm">{location.email ?? "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground text-gray-500">
                    Hours
                  </p>
                  <p className="text-sm">{location.openingHours ?? "—"}</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-300">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={location.isActive}
                      disabled={toggleMutation.isPending}
                      onCheckedChange={() =>
                        handleToggleActive(location.id, location.isActive)
                      }
                      className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-400 **:data-[slot=switch-thumb]:bg-white"
                    />
                    <span className="text-sm text-muted-foreground">
                      Active
                    </span>
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
      )}
    </div>
  );
}

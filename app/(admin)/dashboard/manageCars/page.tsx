"use client";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import { Label } from "@/app/ui/lable";
import { Textarea } from "@/app/ui/textarea";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableScrollArea,
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
import { authFetch, clearStoredAuth, isManualLoggingOut } from "@/app/lib/auth";
import { getLocationLabel } from "@/app/lib/format";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TableSkeletonRows } from "@/app/ui/skeletons";
import { usePermissions } from "@/app/hooks/use-permissions";
import { Permissions } from "@/app/lib/permissions";
import {
  fetchPublicCarCategories,
  PUBLIC_CAR_CATEGORIES_QUERY_KEY,
  type CarCategoryOption,
} from "@/app/lib/car-categories";

import { Car } from "@/app/lib/data";
import { lusitana } from "@/app/ui/utils/fonts";

type CarLocation = {
  id: string;
  name: string;
  city?: string | null;
  state?: string | null;
  isActive?: boolean;
};

type LocationsApiResponse = {
  success?: boolean;
  data?: CarLocation[];
};

type ManageCar = Car & {
  categoryId?: string;
  categoryIsActive?: boolean;
  imageUrl?: string | null;
  location: string;
  locationId?: string;
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
  homeLocationId?: string | null;
  category?: { id: string; name: string; isActive?: boolean } | null;
  homeLocation?: {
    id: string;
    name: string;
    city?: string | null;
    state?: string | null;
  } | null;
};

const defaultCarFormData = {
  name: "",
  fuelType: "",
  category: "",
  location: "",
  price: "",
  status: "available" as Car["status"],
  image: "",
  year: "",
  transmission: "",
  seats: "",
  description: "",
};

const DEFAULT_VISIBLE_ROWS = 6;
const TABLE_HEADER_HEIGHT_PX = 52;
const TABLE_ROW_HEIGHT_PX = 56;
const MANAGE_CAR_CATEGORIES_REFRESH_INTERVAL_MS = 15 * 1000;

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

const mapApiCarToUiCar = (car: ApiCar): ManageCar => ({
  id: car.id,
  name: car.name,
  fuelType: car.fuelType ?? "",
  category: car.category?.name ?? "Unknown",
  categoryId: car.categoryId ?? car.category?.id ?? undefined,
  categoryIsActive: car.category?.isActive,
  location: car.homeLocation?.name ?? "Unknown",
  locationId: car.homeLocationId ?? car.homeLocation?.id ?? undefined,
  price: Number(car.pricePerDay ?? 0),
  status: car.status,
  image: car.imageUrl ?? "",
  imageUrl: car.imageUrl ?? null,
  year: Number(car.year),
  transmission: car.transmission,
  seats: Number(car.seats),
  description: car.description ?? "",
});

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

type CarTableRowProps = {
  car: ManageCar;
  imageSrc: string;
  locationIsActive?: boolean;
  onEdit: (car: ManageCar) => void;
  onDelete: (id: string) => void;
  canManageActions?: boolean;
};

const CarTableRow = memo(function CarTableRow({
  car,
  imageSrc,
  locationIsActive,
  onEdit,
  onDelete,
  canManageActions = false,
}: CarTableRowProps) {
  return (
    <TableRow className="border-gray-300">
      <TableCell className="border-b border-gray-200 px-2 py-2.5 align-middle sm:px-3">
        <div className="flex min-w-0 items-center gap-2">
          <ImageWithFallback
            src={imageSrc}
            alt={car.name}
            className="size-10 shrink-0 rounded object-cover"
            loading="lazy"
            decoding="async"
          />
          <span className="block max-w-full truncate font-medium text-gray-900">
            {car.name}
          </span>
        </div>
      </TableCell>
      <TableCell className="max-w-30 border-b border-gray-200 px-2 py-2.5 align-middle sm:px-3">
        <div className="flex flex-col gap-1">
          <span className="block truncate text-gray-700" title={car.category}>
            {car.category}
          </span>
          {car.categoryIsActive === false && (
            <Badge className="w-fit bg-orange-100 text-orange-700 border border-orange-300 text-xs">
              Category Inactive
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="max-w-32.5 border-b border-gray-200 px-2 py-2.5 align-middle sm:px-3">
        <div className="flex flex-col gap-1">
          <span
            className="block truncate text-gray-700"
            title={getLocationLabel(car.location)}
          >
            {getLocationLabel(car.location)}
          </span>
          {locationIsActive === false && (
            <Badge className="w-fit bg-orange-100 text-orange-700 border border-orange-300 text-xs">
              Location Inactive
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="border-b border-gray-200 px-2 py-2.5 text-sm text-gray-700 sm:px-3">
        {car.year}
      </TableCell>
      <TableCell className="border-b border-gray-200 px-2 py-2.5 text-sm text-gray-700 sm:px-3">
        <span className="block truncate">{car.transmission}</span>
      </TableCell>
      <TableCell className="border-b border-gray-200 px-2 py-2.5 text-sm text-gray-700 sm:px-3">
        {car.seats}
      </TableCell>
      <TableCell className="border-b border-gray-200 px-2 py-2.5 font-medium text-gray-800 sm:px-3">
        ${car.price}
      </TableCell>
      <TableCell className="border-b border-gray-200 px-2 py-2.5 sm:px-3">
        <Badge className={getStatusColor(car.status)}>{car.status}</Badge>
      </TableCell>
      <TableCell className="w-21.5 border-b border-gray-200 px-2 py-2.5 text-right sm:px-3">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(car)}
            disabled={!canManageActions}
          >
            <Edit className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(car.id)}
            disabled={!canManageActions}
          >
            <Trash2 className="size-4 text-red-600" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

export default function ManageCars() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { can: canAccess } = usePermissions();
  const canManageCars = canAccess(Permissions.MANAGE_CARS);
  const [cars, setCars] = useState<ManageCar[]>([]);
  const [isLoadingCars, setIsLoadingCars] = useState(true);
  const [carsLoadError, setCarsLoadError] = useState<string | null>(null);
  const [locations, setLocations] = useState<CarLocation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<ManageCar | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState(() => ({ ...defaultCarFormData }));
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [locationFieldError, setLocationFieldError] = useState<string | null>(
    null,
  );

  const handleAuthExpired = useCallback(() => {
    clearStoredAuth();
    if (!isManualLoggingOut()) {
      toast.error("Session expired. Please log in again.");
    }
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const fullPath = encodeURIComponent(`${currentPath}${currentSearch}`);
    router.replace(`/login?redirect=${fullPath}`);
  }, [router]);

  const { data: categories = [], error: categoriesError } = useQuery<
    CarCategoryOption[],
    Error
  >({
    queryKey: PUBLIC_CAR_CATEGORIES_QUERY_KEY,
    queryFn: ({ signal }) => fetchPublicCarCategories(signal),
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: "always",
    refetchInterval: MANAGE_CAR_CATEGORIES_REFRESH_INTERVAL_MS,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    const controller = new AbortController();

    const loadCars = async () => {
      setIsLoadingCars(true);
      setCarsLoadError(null);

      try {
        const res = await authFetch(`/admin/cars`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(await parseErrorMessage(res));
        }

        const data = (await res.json()) as ApiCar[];
        setCars(data.map(mapApiCarToUiCar));
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        if (
          err instanceof Error &&
          /log in again|refresh token|session/i.test(err.message)
        ) {
          handleAuthExpired();
          return;
        }

        const message =
          err instanceof Error ? err.message : "Unable to load cars";
        setCarsLoadError(message);
        toast.error(`Cars load failed: ${message}`);
      } finally {
        if (controller.signal.aborted) {
          return;
        }

        setIsLoadingCars(false);
      }
    };

    void loadCars();

    return () => {
      controller.abort();
    };
  }, [handleAuthExpired]);

  useEffect(() => {
    if (!categoriesError) return;

    if (/log in again|refresh token|session/i.test(categoriesError.message)) {
      handleAuthExpired();
      return;
    }

    toast.error(`Category load failed: ${categoriesError.message}`);
  }, [categoriesError, handleAuthExpired]);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const res = await authFetch(`/locations`, {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(await parseErrorMessage(res));
        }

        const data = (await res.json()) as CarLocation[] | LocationsApiResponse;

        const normalizedLocations = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
            ? data.data
            : [];

        setLocations(normalizedLocations);
      } catch (err) {
        if (
          err instanceof Error &&
          /log in again|refresh token|session/i.test(err.message)
        ) {
          handleAuthExpired();
          return;
        }

        const message =
          err instanceof Error ? err.message : "Unable to load locations";
        toast.error(`Location load failed: ${message}`);
      }
    };

    void loadLocations();
  }, [handleAuthExpired]);

  const filteredCars = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    if (!normalizedSearchQuery) {
      return cars;
    }

    return cars.filter(
      (car) =>
        car.name.toLowerCase().includes(normalizedSearchQuery) ||
        car.category.toLowerCase().includes(normalizedSearchQuery) ||
        getLocationLabel(car.location)
          .toLowerCase()
          .includes(normalizedSearchQuery),
    );
  }, [cars, searchQuery]);

  const carImageSources = useMemo(
    () =>
      new Map(
        filteredCars.map((car) => [car.id, getCarImageSrc(car)] as const),
      ),
    [filteredCars],
  );

  const locationStatusById = useMemo(
    () => new Map(locations.map((location) => [location.id, location.isActive] as const)),
    [locations],
  );

  const handleAddCar = useCallback(() => {
    setEditingCar(null);
    setSelectedFile(null);
    setLocationFieldError(null);
    setFormData({ ...defaultCarFormData });
    setIsDialogOpen(true);
  }, []);

  const handleEditCar = useCallback(
    (car: ManageCar) => {
      const matchedCategoryId =
        car.categoryId ??
        categories.find((category) => category.name === car.category)?.id ??
        "";
      const matchedLocationId =
        car.locationId ??
        locations.find((location) => location.name === car.location)?.id ??
        "";

      setEditingCar(car);
      setSelectedFile(null);
      setLocationFieldError(null);
      setFormData({
        name: car.name,
        fuelType: car.fuelType || "",
        category: matchedCategoryId,
        location: matchedLocationId,
        price: car.price.toString(),
        status: car.status,
        image: car.image,
        year: car.year.toString(),
        transmission: car.transmission,
        seats: car.seats.toString(),
        description: car.description || "",
      });
      setIsDialogOpen(true);
    },
    [categories, locations],
  );

  const handleDeleteCar = useCallback(
    async (id: string) => {
      try {
        const res = await authFetch(`/admin/cars/${id}`, {
          method: "DELETE",
        });
        // console.log("Response:", res);

        if (!res.ok) {
          throw new Error(await parseErrorMessage(res));
        }
        setCars((currentCars) => currentCars.filter((car) => car.id !== id));
        void queryClient.invalidateQueries({ queryKey: ["publicCars"] });
        void queryClient.invalidateQueries({ queryKey: ["publicCar"] });
        toast.success("Car deleted successfully");
      } catch (err) {
        if (
          err instanceof Error &&
          /log in again|refresh token|session/i.test(err.message)
        ) {
          handleAuthExpired();
          return;
        }

        const message =
          err instanceof Error ? err.message : "Failed to delete car";
        toast.error(`Delete failed: ${message}`);
      }
    },
    [handleAuthExpired, queryClient],
  );

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);

        // optional preview only
        const previewUrl = URL.createObjectURL(file);
        setFormData((currentData) => ({ ...currentData, image: previewUrl }));
      }
    },
    [],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!formData.location) {
        setLocationFieldError("Please select a location.");
        toast.error("Please select a location before saving.");
        return;
      }

      setLocationFieldError(null);

      try {
        const form = new FormData();

        form.append("name", formData.name);
        form.append("fuelType", formData.fuelType);
        form.append("categoryId", formData.category);
        form.append("homeLocationId", formData.location);
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
          void queryClient.invalidateQueries({
            queryKey: ["publicCar", data.id],
          });
          toast.success("Car updated successfully");
        } else {
          setCars((currentCars) => [data, ...currentCars]);
          toast.success("Car added successfully");
        }
        void queryClient.invalidateQueries({ queryKey: ["publicCars"] });

        setIsDialogOpen(false);
        setSelectedFile(null);
      } catch (err) {
        if (
          err instanceof Error &&
          /log in again|refresh token|session/i.test(err.message)
        ) {
          handleAuthExpired();
          return;
        }

        const message =
          err instanceof Error ? err.message : "Failed to save car data";
        toast.error(`Car save failed: ${message}`);
      }
    },
    [editingCar, formData, handleAuthExpired, queryClient, selectedFile],
  );

  return (
    <div className="space-y-6 md:space-y-8">
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
              disabled={!canManageCars}
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
                  <Label htmlFor="location">Location</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => {
                      setLocationFieldError(null);
                      setFormData({ ...formData, location: value });
                    }}
                  >
                    <SelectTrigger
                      id="location"
                      aria-invalid={Boolean(locationFieldError)}
                      className={
                        locationFieldError
                          ? "border-red-500 focus:ring-red-200"
                          : "border-gray-500"
                      }
                    >
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-300">
                      {locations.length > 0 ? (
                        locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                            {location.isActive === false ? " (Inactive)" : ""}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="__no_location__" disabled>
                          No locations found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {locationFieldError && (
                    <p className="text-xs text-red-600">{locationFieldError}</p>
                  )}
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
          <div className="rounded-lg bg-white p-3 sm:p-4 md:p-5">
            <TableScrollArea
              className="will-change-scroll [content-visibility:auto] [contain-intrinsic-size:416px] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300"
              style={{
                maxHeight: `${TABLE_HEADER_HEIGHT_PX + DEFAULT_VISIBLE_ROWS * TABLE_ROW_HEIGHT_PX}px`,
              }}
            >
              <table className="w-full min-w-237.5 table-fixed border-separate border-spacing-0 text-sm">
                <colgroup>
                  <col className="w-52.5" />
                  <col className="w-30" />
                  <col className="w-32.5" />
                  <col className="w-17" />
                  <col className="w-22.5" />
                  <col className="w-15.5" />
                  <col className="w-23" />
                  <col className="w-24" />
                  <col className="w-21.5" />
                </colgroup>
                <TableHeader className="bg-white [&_tr]:border-gray-300">
                  <TableRow className="border-gray-300 bg-white hover:bg-white">
                    <TableHead className="sticky top-0 z-20 border-b border-gray-300 bg-white px-2 py-2.5 font-medium sm:px-3">
                      Car
                    </TableHead>
                    <TableHead className="sticky top-0 z-20 border-b border-gray-300 bg-white px-2 py-2.5 font-medium sm:px-3">
                      Category
                    </TableHead>
                    <TableHead className="sticky top-0 z-20 border-b border-gray-300 bg-white px-2 py-2.5 font-medium sm:px-3">
                      Location
                    </TableHead>
                    <TableHead className="sticky top-0 z-20 border-b border-gray-300 bg-white px-2 py-2.5 font-medium sm:px-3">
                      Year
                    </TableHead>
                    <TableHead className="sticky top-0 z-20 border-b border-gray-300 bg-white px-2 py-2.5 font-medium sm:px-3">
                      Transmission
                    </TableHead>
                    <TableHead className="sticky top-0 z-20 border-b border-gray-300 bg-white px-2 py-2.5 font-medium sm:px-3">
                      Seats
                    </TableHead>
                    <TableHead className="sticky top-0 z-20 border-b border-gray-300 bg-white px-2 py-2.5 font-medium sm:px-3">
                      Price/Day
                    </TableHead>
                    <TableHead className="sticky top-0 z-20 border-b border-gray-300 bg-white px-2 py-2.5 font-medium sm:px-3">
                      Status
                    </TableHead>
                    <TableHead className="sticky top-0 z-20 border-b border-gray-300 bg-white px-2 py-2.5 text-right font-medium sm:px-3">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingCars ? (
                    <TableSkeletonRows
                      columns={9}
                      rows={DEFAULT_VISIBLE_ROWS}
                    />
                  ) : carsLoadError ? (
                    <TableRow className="border-gray-300">
                      <TableCell
                        colSpan={9}
                        className="border-b border-gray-200 text-center py-8 text-red-600"
                      >
                        Failed to load cars: {carsLoadError}
                      </TableCell>
                    </TableRow>
                  ) : filteredCars.length === 0 ? (
                    <TableRow className="border-gray-300">
                      <TableCell
                        colSpan={9}
                        className="border-b border-gray-200 text-center py-8 text-gray-600"
                      >
                        No cars found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCars.map((car) => (
                      <CarTableRow
                        key={car.id}
                        car={car}
                        imageSrc={carImageSources.get(car.id) ?? ""}
                        locationIsActive={
                          car.locationId ? locationStatusById.get(car.locationId) : undefined
                        }
                        onEdit={handleEditCar}
                        onDelete={handleDeleteCar}
                        canManageActions={canManageCars}
                      />
                    ))
                  )}
                </TableBody>
              </table>
            </TableScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

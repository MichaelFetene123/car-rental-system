import { authFetch } from "@/app/lib/auth";

export type AdminLocation = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string | null;
  email: string | null;
  openingHours: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateLocationPayload = {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  openingHours?: string;
  isActive?: boolean;
};

export type UpdateLocationPayload = Partial<CreateLocationPayload>;

export const ADMIN_LOCATIONS_QUERY_KEY = ["adminLocations"] as const;

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const error = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(error.message)) return error.message.join(", ");
    if (typeof error.message === "string") return error.message;
  } catch {
  }
  return response.statusText || "Request failed";
};

export const fetchAdminLocations = async (
  signal?: AbortSignal,
): Promise<AdminLocation[]> => {
  const response = await authFetch("/admin/locations", {
    method: "GET",
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as AdminLocation[];
};

export const createLocation = async (
  payload: CreateLocationPayload,
): Promise<AdminLocation> => {
  const response = await authFetch("/admin/locations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as AdminLocation;
};

export const updateLocation = async (
  id: string,
  payload: UpdateLocationPayload,
): Promise<AdminLocation> => {
  const response = await authFetch(`/admin/locations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as AdminLocation;
};

export const deleteLocation = async (id: string): Promise<void> => {
  const response = await authFetch(`/admin/locations/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
};

export const toggleLocationStatus = async (
  id: string,
  isActive: boolean,
): Promise<AdminLocation> => {
  const response = await authFetch(`/admin/locations/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as AdminLocation;
};

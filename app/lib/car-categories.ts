import { authFetch } from "@/app/lib/auth";

export type CarCategoryOption = {
  id: string;
  name: string;
  isActive?: boolean;
};

export type AdminCarCategory = {
  id: string;
  name: string;
  isActive: boolean;
  updatedAt: string;
  carsCount: number;
};

export type AdminCarCategoryMutationResult = {
  id: string;
  name: string;
  isActive: boolean;
  updatedAt: string;
  description?: string | null;
};

export const PUBLIC_CAR_CATEGORIES_QUERY_KEY = ["carCategories"] as const;
export const ADMIN_CAR_CATEGORIES_QUERY_KEY = ["adminCarCategories"] as const;

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const error = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(error.message)) return error.message.join(", ");
    if (typeof error.message === "string") return error.message;
  } catch {
    // Fall back to status text when body is not JSON.
  }

  return response.statusText || "Request failed";
};

export const fetchPublicCarCategories = async (
  signal?: AbortSignal,
): Promise<CarCategoryOption[]> => {
  const response = await authFetch("/car-categories", {
    method: "GET",
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as CarCategoryOption[];
};

export const fetchAdminCarCategories = async (
  signal?: AbortSignal,
): Promise<AdminCarCategory[]> => {
  const response = await authFetch("/admin/car-categories", {
    method: "GET",
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as AdminCarCategory[];
};

export const createAdminCarCategory = async (payload: {
  name: string;
}): Promise<AdminCarCategoryMutationResult> => {
  const response = await authFetch("/admin/car-categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as AdminCarCategoryMutationResult;
};

export const updateAdminCarCategory = async (
  id: string,
  payload: {
    name?: string;
    isActive?: boolean;
  },
): Promise<AdminCarCategoryMutationResult> => {
  const response = await authFetch(`/admin/car-categories/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as AdminCarCategoryMutationResult;
};

export const deleteAdminCarCategory = async (id: string): Promise<void> => {
  const response = await authFetch(`/admin/car-categories/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
};

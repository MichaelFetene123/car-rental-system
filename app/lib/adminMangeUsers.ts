import { authFetch } from "@/app/lib/auth";

export type AdminUsers = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
    totalBookings: number | null;
};

export type AdminUserMutationResult = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  totalBookings: number | null;
};

export type userData = {
  id?: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "customer" | "admin" | "stuff";
  status: "active" | "inactive" | "suspended";
};

export const publicUsersQueryKey = ["users"] as const;
export const adminUsersQueryKey = ["adminUsers"] as const;

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const error = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(error.message)) return error.message.join(", ");
    if (typeof error.message === "string") return error.message;
  } catch {
    return "An unknown error occurred.";
  }
  return response.statusText || "Request failed";
};



export const fetchAdminUsers = async (
  signal?: AbortSignal,
): Promise<AdminUsers[]> => {
  const response = await authFetch("/admin/users", {
    method: "GET",
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const raw = (await response.json()) as any[];

  // Map backend shape (which returns a `roles` array) to the frontend `AdminUsers` shape
  return raw.map((u) => ({
    id: u.id,
    name: u.name ?? u.full_name,
    email: u.email,
    phone: u.phone ?? null,
    // backend returns `roles: string[]` — use the first role as the primary `role` for the UI
    role: (u.role as string) ?? (Array.isArray(u.roles) ? u.roles[0] : "customer"),
    status: u.status,
    createdAt: u.createdAt ?? u.created_at,
    updatedAt: u.updatedAt ?? u.updated_at,
    totalBookings:
      u.totalBookings ?? u.total_bookings ?? u._count?.bookings ?? null,
  })) as AdminUsers[];
};



export const createAdminUser = async (
  payload: userData,
): Promise<AdminUserMutationResult> => {
  const response = await authFetch("/admin/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as AdminUserMutationResult;
};

export const updateAdminUser = async (
  userId: string,
  payload: Partial<userData>,
): Promise<AdminUserMutationResult> => {
  const response = await authFetch(`/admin/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as AdminUserMutationResult;
};

export const deleteAdminUser = async (userId: string): Promise<void> => {
  const response = await authFetch(`/admin/users/${userId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
};

export const assignRolesToUser = async (
  userId: string,
  roles: string[],
): Promise<AdminUserMutationResult> => {
  const response = await authFetch(`/admin/users/${userId}/roles`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roles }),
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  return (await response.json()) as AdminUserMutationResult;
};

import { authFetch } from "@/app/lib/auth";

// table match the backend response shape for easier integration, but we can transform it in the UI layer if needed-> table lay map emideregu nachew
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

// This file contains all the API calls related to managing users in the admin dashboard, including fetching users, creating a new user, updating user details, deleting a user, and assigning roles to a user. It also defines the types for the user data and the expected results from these operations.
export type userData = {
  id?: string;
  full_name: string;
  email: string;
  phone?: string | null;
  password?: string;
};

export type UserRole = string;
export type UserStatus = "active" | "inactive" | "suspended";

export type RoleOption = {
  id: string;
  name: string;
  type?: string | null;
};

// useru formulay emiyasgebachewu datawoch
export type CreateAdminUserPayload = {
  full_name: string;
  email: string;
  phone?: string | null;
  password: string;
  status?: UserStatus;
};

export const publicUsersQueryKey = ["users"] as const;
export const adminUsersQueryKey = ["adminUsers"] as const;
export const rolesQueryKey = ["roles"] as const;

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
): Promise<AdminUserMutationResult[]> => {
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
    role: (u.role as string) ?? (Array.isArray(u.roles) ? u.roles[0] : "user"),
    status: u.status,
    createdAt: u.createdAt ?? u.created_at,
    updatedAt: u.updatedAt ?? u.updated_at,
    totalBookings:
      u.totalBookings ?? u.total_bookings ?? u._count?.bookings ?? null,
  })) as AdminUserMutationResult[];
};

export const createAdminUser = async (
  payload: CreateAdminUserPayload,
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
  payload: Partial<CreateAdminUserPayload>,
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

export type AssignRolesResponse = {
  access_token: string;
};

export const assignRolesToUser = async (
  userId: string,
  roles: string[],
): Promise<AssignRolesResponse> => {
  const response = await authFetch(`/admin/users/${userId}/roles`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roles }),
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
  const body = (await response.json()) as { access_token?: string };
  return { access_token: body.access_token ?? "" };
};

export const fetchRoles = async (
  signal?: AbortSignal,
): Promise<RoleOption[]> => {
  const response = await authFetch("/roles", {
    method: "GET",
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as RoleOption[];
};

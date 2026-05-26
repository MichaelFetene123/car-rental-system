import { authFetch } from "@/app/lib/auth";

export type Permission = {
  id: string;
  code: string;
  name: string;
  category: string;
};

export type Role = {
  id: string;
  name: string;
  type: "admin" | "stuff" | "user";
  userCount: number;
  permissions: Permission[];
};

export type RolePayload = {
  name: string;
  type: Role["type"];
  permissionIds: string[];
};

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

export const fetchPermissions = async (
  signal?: AbortSignal,
): Promise<Permission[]> => {
  const response = await authFetch("/permissions", {
    method: "GET",
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as Permission[];
};

export const fetchRolesWithPermissions = async (
  signal?: AbortSignal,
): Promise<Role[]> => {
  const response = await authFetch("/roles", {
    method: "GET",
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as Role[];
};

export const createRole = async (payload: RolePayload): Promise<Role> => {
  const response = await authFetch("/roles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as Role;
};

export const updateRole = async (
  id: string,
  payload: RolePayload,
): Promise<Role> => {
  const response = await authFetch(`/roles/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return (await response.json()) as Role;
};

export const deleteRole = async (id: string): Promise<void> => {
  const response = await authFetch(`/roles/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
};

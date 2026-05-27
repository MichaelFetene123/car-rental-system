"use client";

import { useCurrentUser } from "@/app/lib/auth-queries";
import { isCurrentUserAdmin } from "@/app/lib/auth";
import {
  can,
  canAll,
  canAny,
  isAdmin,
  type PermissionCode,
} from "@/app/lib/permissions";

export function usePermissions() {
  const { data: currentUser, isLoading, isFetched } = useCurrentUser();

  const roles = currentUser?.roles ?? [];
  const permissions = currentUser?.permissions ?? [];
  const userIsAdmin = isAdmin(roles) || isCurrentUserAdmin();
  const permissionUser = currentUser ?? null;

  const canAccess = (permission: PermissionCode | string) =>
    userIsAdmin || can(permissionUser, permission);

  const canAccessAny = (permissionsList: (PermissionCode | string)[]) =>
    userIsAdmin || canAny(permissionUser, permissionsList);

  const canAccessAll = (permissionsList: (PermissionCode | string)[]) =>
    userIsAdmin || canAll(permissionUser, permissionsList);

  return {
    roles,
    permissions,
    isAdmin: userIsAdmin,
    isLoaded: isFetched,
    isLoading,
    can: canAccess,
    canAny: canAccessAny,
    canAll: canAccessAll,
  };
}

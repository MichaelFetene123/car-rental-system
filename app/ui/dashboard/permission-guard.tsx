"use client";

import type { ReactNode } from "react";
import { usePermissions } from "@/app/hooks/use-permissions";

type CanProps = {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
};

export function Can({ permission, children, fallback = null }: CanProps) {
  const { can, isAdmin } = usePermissions();
  if (isAdmin) return <>{children}</>;
  return can(permission) ? <>{children}</> : <>{fallback}</>;
}

type CanAnyProps = {
  permissions: string[];
  children: ReactNode;
  fallback?: ReactNode;
};

export function CanAny({
  permissions,
  children,
  fallback = null,
}: CanAnyProps) {
  const { canAny, isAdmin } = usePermissions();
  if (isAdmin) return <>{children}</>;
  return canAny(permissions) ? <>{children}</> : <>{fallback}</>;
}

type CanAllProps = {
  permissions: string[];
  children: ReactNode;
  fallback?: ReactNode;
};

export function CanAll({
  permissions,
  children,
  fallback = null,
}: CanAllProps) {
  const { canAll, isAdmin } = usePermissions();
  if (isAdmin) return <>{children}</>;
  return canAll(permissions) ? <>{children}</> : <>{fallback}</>;
}

type PermissionRouteProps = {
  permission: string;
  children: ReactNode;
};

export function PermissionRoute({
  permission,
  children,
}: PermissionRouteProps) {
  const { isLoading } = usePermissions();

  if (isLoading) return null;

  return <>{children}</>;
}

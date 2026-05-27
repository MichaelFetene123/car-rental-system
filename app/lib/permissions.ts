export const Permissions = {
  VIEW_DASHBOARD: "view_dashboard",

  MANAGE_CARS: "manage_cars",
  VIEW_CARS: "view_cars",

  MANAGE_CATEGORY: "manage_category",
  VIEW_CATEGORY: "view_category",

  MANAGE_BOOKINGS: "manage_bookings",
  VIEW_BOOKINGS: "view_bookings",
  CANCEL_BOOKINGS: "cancel_bookings",

  MANAGE_USERS: "manage_users",
  VIEW_USERS: "view_users",

  MANAGE_PAYMENTS: "manage_payments",
  VIEW_PAYMENTS: "view_payments",

  MANAGE_LOCATIONS: "manage_locations",

  MANAGE_ROLES: "manage_roles",

  MANAGE_REPORT: "manage_report",
  VIEW_REPORT: "view_report",

  MANAGE_NOTIFICATIONS: "manage_notifications",
} as const;

export type PermissionCode = (typeof Permissions)[keyof typeof Permissions];

export type CurrentUserPermissions = {
  roles: string[];
  permissions: string[];
};

export function isAdmin(roles: string[] | null | undefined): boolean {
  if (!roles || !Array.isArray(roles)) return false;
  return roles.some((role) => role.toLowerCase() === "admin");
}

export function can(
  user: CurrentUserPermissions | null,
  permission: PermissionCode | string,
): boolean {
  if (!user) return false;
  if (isAdmin(user.roles)) return true;
  return user.permissions.includes(permission);
}

export function canAny(
  user: CurrentUserPermissions | null,
  permissions: (PermissionCode | string)[],
): boolean {
  if (!user) return false;
  if (isAdmin(user.roles)) return true;
  return permissions.some((p) => user.permissions.includes(p));
}

export function canAll(
  user: CurrentUserPermissions | null,
  permissions: (PermissionCode | string)[],
): boolean {
  if (!user) return false;
  if (isAdmin(user.roles)) return true;
  return permissions.every((p) => user.permissions.includes(p));
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  Car,
  Calendar,
  Users,
  FileText,
  Shield,
  WalletCards,
  MapPin,
  Bell,
  Tags,
} from "lucide-react";
import { usePermissions } from "@/app/hooks/use-permissions";
import { Permissions, type PermissionCode } from "@/app/lib/permissions";

type NavLink = {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  permission?: PermissionCode;
};

const Links: NavLink[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: Permissions.VIEW_DASHBOARD,
  },
  {
    name: "Manage Cars",
    href: "/dashboard/manageCars",
    icon: Car,
    permission: Permissions.VIEW_CARS,
  },
  {
    name: "Manage Bookings",
    href: "/dashboard/manageBookings",
    icon: Calendar,
    permission: Permissions.VIEW_BOOKINGS,
  },
  {
    name: "Manage Categories",
    href: "/dashboard/manageCategories",
    icon: Tags,
    permission: Permissions.VIEW_CATEGORY,
  },
  {
    name: "Manage Users",
    href: "/dashboard/manageUsers",
    icon: Users,
    permission: Permissions.VIEW_USERS,
  },
  {
    name: "Roles & Permissions",
    href: "/dashboard/rolesAndPermissions",
    icon: Shield,
    permission: Permissions.MANAGE_ROLES,
  },
  {
    name: "Payment & Billing",
    href: "/dashboard/managePayments",
    icon: WalletCards,
    permission: Permissions.VIEW_PAYMENTS,
  },
  {
    name: "Manage Locations",
    href: "/dashboard/manageLocations",
    icon: MapPin,
    permission: Permissions.MANAGE_LOCATIONS,
  },
  {
    name: "Notifications",
    href: "/dashboard/Notifications",
    icon: Bell,
    permission: Permissions.MANAGE_NOTIFICATIONS,
  },
  {
    name: "Reports",
    href: "/dashboard/manageReports",
    icon: FileText,
    permission: Permissions.VIEW_REPORT,
  },
];

const NavLinks = () => {
  const pathname = usePathname();
  const { can, isLoaded } = usePermissions();

  return (
    <>
      {Links.map((link) => {
        const LinkIcon = link.icon;
        const isAllowed = link.permission ? can(link.permission) : true;

        if (!isLoaded) {
          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                "flex h-11 grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium transition-colors hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3",
                {
                  "bg-sky-100 text-blue-600":
                    pathname === link.href,
                },
              )}
            >
              <LinkIcon className="w-5" />
              <p className="hidden md:block">{link.name}</p>
            </Link>
          );
        }

        return (
          <Link
            key={link.name}
            href={isAllowed ? link.href : "#"}
            aria-disabled={!isAllowed}
            tabIndex={isAllowed ? 0 : -1}
            onClick={(event) => {
              if (isAllowed) return;
              event.preventDefault();
            }}
            className={clsx(
              "flex h-11 grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium transition-colors md:flex-none md:justify-start md:p-2 md:px-3",
              isAllowed
                ? "hover:bg-sky-100 hover:text-blue-600"
                : "cursor-not-allowed border border-dashed border-gray-200 bg-gray-50 text-gray-400 opacity-80",
              {
                "bg-sky-100 text-blue-600": isAllowed && pathname === link.href,
              },
            )}
          >
            <LinkIcon className="w-5" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
};

export default NavLinks;

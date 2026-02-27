"use client"
import Link from "next/link"; 
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LayoutDashboard, Car, Calendar , Users, FileText, Shield, WalletCards, DollarSign, MapPin, Bell, Zap, Code , } from 'lucide-react';

const Links = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Manage Cars", href: "/dashboard/manageCars", icon: Car },
  {
    name: "Manage Bookings",
    href: "/dashboard/manageBookings",
    icon: Calendar,
  },
  { name: "Manage Users", href: "/dashboard/manageUsers", icon: Users },
  {
    name: "Roles & Permissions",
    href: "/dashboard/rolesAndPermissions",
    icon: Shield,
  },
  {
    name: "Payment & Billing",
    href: "/dashboard/managePayments",
    icon: WalletCards,
  },
  {name: "Pricing & Discounts", href: "/dashboard/pricingAndDiscounts", icon: DollarSign},
  {name: "Manage Locations", href: "/dashboard/manageLocations", icon: MapPin},
  {name: "Notifications", href: "/dashboard/Notifications", icon: Bell},
  {name: "Integrations", href: "/dashboard/ManageIntegrations", icon: Zap},
  {name: "Api & Webhooks", href: "/dashboard/ManageApi", icon: Code},
  { name: "Reports", href: "/dashboard/manageReports", icon: FileText },
];


const NavLinks = () =>{
  const pathname = usePathname();
  return (
    <>
      {Links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx("flex h-[45px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3", 
              {
              "bg-sky-100 text-blue-600": pathname === link.href,
              }
          )}
          >
            <LinkIcon className="w-5" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}

export default NavLinks;
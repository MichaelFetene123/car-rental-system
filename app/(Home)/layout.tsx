"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Car, Facebook, Twitter, Instagram, Linkedin, Loader2 } from "lucide-react";
import { Button } from "@/app/ui/button";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/app/lib/auth-queries";
import { usePermissions } from "@/app/hooks/use-permissions";
import { Permissions } from "@/app/lib/permissions";
import {
  logoutUser,
  getCurrentUserEmail,
  getCurrentUserName,
  isCurrentUserAdmin,
} from "@/app/lib/auth";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const { can: canAccess } = usePermissions();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const fallbackEmail = isHydrated ? getCurrentUserEmail() : null;
  const fallbackIsAdmin = isHydrated ? isCurrentUserAdmin() : false;
  const isAuthenticated = Boolean(currentUser || fallbackEmail);
  const isAdmin = Boolean(
    currentUser?.roles?.some((role) => role === "admin") ?? fallbackIsAdmin,
  );
  const canViewDashboard = canAccess(Permissions.VIEW_DASHBOARD);
  const rawUserName =
    currentUser?.full_name ?? (isHydrated ? getCurrentUserName() : undefined);
  const rawUserEmail = currentUser?.email ?? fallbackEmail;
  const userName = typeof rawUserName === "string" ? rawUserName : undefined;
  const userEmail = typeof rawUserEmail === "string" ? rawUserEmail : undefined;

  const isActive = (path: string) => pathname === path;
  const displayName = userName
    ? userName.length > 18
      ? `${userName.slice(0, 18)}...`
      : userName
    : userEmail
      ? userEmail.length > 18
        ? `${userEmail.slice(0, 18)}...`
        : userEmail
      : "";

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);

    await logoutUser();
    router.replace("/");

    setIsSigningOut(false);
  };

  return (
    <div className="min-h-screen bg-white  ">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-blue-100 bg-linear-to-r from-slate-50 via-white to-blue-50/60 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 py-3 md:py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="grid size-10 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                  <Car className="h-5 w-5" />
                </div>
                <div className="leading-none">
                  <span className="block text-2xl font-bold text-blue-700">
                    CarR
                  </span>
                  <span className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-blue-400 md:block">
                    Premium Rentals
                  </span>
                </div>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden items-center gap-1 rounded-full border border-blue-100 bg-white/80 p-1 shadow-sm md:flex">
              <Link
                href="/"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  isActive("/")
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                Home
              </Link>
              <Link
                href="/cars"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  isActive("/cars")
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                Cars
              </Link>
              <Link
                href="/my-bookings"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  isActive("/my-bookings")
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                My Bookings
              </Link>
              <span className="rounded-full px-4 py-2 text-sm font-semibold text-slate-500">
                About
              </span>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {canViewDashboard && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="border-blue-200 bg-white/80 px-4 py-2 text-blue-700 transition-all hover:border-blue-400 hover:bg-blue-50"
                >
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              )}
              {isAuthenticated ? (
                <>
                  {userEmail && (
                    <div
                      className="hidden items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 sm:flex"
                      title={userName ?? userEmail}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold uppercase text-white">
                        {(userName ?? userEmail ?? "").charAt(0)}
                      </div>
                      <span className="max-w-32 truncate text-sm font-semibold text-blue-800">
                        {displayName}
                      </span>
                    </div>
                  )}
                  <Button
                    size="sm"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                  >
                    {isSigningOut ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Sign out"
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  asChild
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  <Link href="/login">Login</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="mt-16 bg-slate-50 text-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Top footer content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-center sm:text-left">
            <div>
              <div className="flex items-center gap-2 mb-4 justify-center sm:justify-start">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold">CarR</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Your trusted partner for premium car rentals with flexible plans
                and nationwide pickup locations.
              </p>
            </div>
            <nav aria-label="Footer navigation">
              <h3 className="font-semibold mb-4 text-slate-900">Explore</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {[
                  { label: "Home", href: "/" },
                  { label: "About", href: "/" },
                  { label: "Services", href: "/cars" },
                  { label: "Contact", href: "/" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="relative inline-block transition-colors duration-300 hover:text-slate-900 after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-blue-600 after:transition-transform after:duration-300 hover:after:scale-x-100"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Support">
              <h3 className="font-semibold mb-4 text-slate-900">Support</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {[
                  { label: "FAQ", href: "/" },
                  { label: "Help Center", href: "/" },
                  { label: "Privacy Policy", href: "/" },
                  { label: "Terms", href: "/" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="relative inline-block transition-colors duration-300 hover:text-slate-900 after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-blue-600 after:transition-transform after:duration-300 hover:after:scale-x-100"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div>
              <h3 className="font-semibold mb-4 text-slate-900">Connect</h3>
              <div className="flex items-center gap-4 justify-center sm:justify-start">
                <Link
                  href="https://facebook.com"
                  aria-label="Visit our Facebook"
                  className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition-all duration-300 hover:text-blue-600 hover:border-blue-500 hover:-translate-y-0.5"
                >
                  <Facebook className="h-4 w-4" />
                </Link>
                <Link
                  href="https://twitter.com"
                  aria-label="Visit our Twitter"
                  className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition-all duration-300 hover:text-blue-600 hover:border-blue-500 hover:-translate-y-0.5"
                >
                  <Twitter className="h-4 w-4" />
                </Link>
                <Link
                  href="https://instagram.com"
                  aria-label="Visit our Instagram"
                  className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition-all duration-300 hover:text-blue-600 hover:border-blue-500 hover:-translate-y-0.5"
                >
                  <Instagram className="h-4 w-4" />
                </Link>
                <Link
                  href="https://linkedin.com"
                  aria-label="Visit our LinkedIn"
                  className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm transition-all duration-300 hover:text-blue-600 hover:border-blue-500 hover:-translate-y-0.5"
                >
                  <Linkedin className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom bar */}
        <div className="border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-slate-500">
            © 2026 CarRental. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

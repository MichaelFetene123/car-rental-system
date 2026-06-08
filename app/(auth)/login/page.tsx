"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { Car, Loader2 } from "lucide-react";
import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import { Label } from "@/app/ui/lable";
import { hasTokenRole } from "@/app/lib/auth";
import { useLoginMutation } from "@/app/lib/auth-queries";

const resolveNextPath = (nextPath: string | null) => {
  if (nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")) {
    return nextPath;
  }
  return null;
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitRedirect = searchParams.get("redirect") || searchParams.get("next");
  const redirectPath = useMemo(
    () => resolveNextPath(explicitRedirect),
    [explicitRedirect],
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const loginMutation = useLoginMutation();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNeedsVerification(false);

    try {
      const response = await loginMutation.mutateAsync({
        email: email.trim(),
        password,
      });
      const isAdmin = hasTokenRole(response.access_token, "admin");
      setIsNavigating(true);
      const defaultPath = isAdmin ? "/dashboard" : "/";
      router.push(redirectPath || defaultPath);
      router.refresh();
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to sign in. Please try again.";

      if (message.includes("Please verify your email before logging in")) {
        setNeedsVerification(true);
        setError("");
      } else {
        setError(message);
      }
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-500 via-white to-blue-50 flex items-center justify-center px-4 py-8">
      <section className="w-full max-w-md rounded-2xl bg-white border border-blue-100 shadow-xl p-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <span className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </span>
          <span className="text-2xl font-bold text-blue-700">CarR</span>
        </Link>

        <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
        <p className="text-sm text-gray-600 mt-2">
          Welcome back. Enter your account details to continue.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="h-11 border-gray-300 focus-visible:ring-blue-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="h-11 border-gray-300 focus-visible:ring-blue-300"
            />
          </div>

          {needsVerification ? (
            <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-3 space-y-2">
              <p>
                Your email is not verified. Please check your inbox or{" "}
                <Link
                  href={`/verify-email?email=${encodeURIComponent(email)}`}
                  className="text-blue-700 hover:underline font-medium"
                >
                  request a new verification link
                </Link>
                .
              </p>
            </div>
          ) : error ? (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loginMutation.isPending || isNavigating}
          >
            {loginMutation.isPending || isNavigating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <p className="text-sm text-gray-600 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-blue-700 hover:underline font-medium"
          >
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

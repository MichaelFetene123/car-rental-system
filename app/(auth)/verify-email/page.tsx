"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useRef } from "react";
import {
  Car,
  AlertCircle,
  Loader2,
  Mail,
  CheckCircle2,
  Clock,
  RefreshCw,
  WifiOff,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import { Label } from "@/app/ui/lable";
import {
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useCurrentUser,
} from "@/app/lib/auth-queries";
import { toast } from "sonner";

type VerificationState =
  | { type: "pending" }
  | { type: "verifying" }
  | { type: "expired" }
  | { type: "failed"; message: string };

/** Returns a webmail URL for common providers, or null if unknown. */
function getEmailProviderUrl(email: string): string | null {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (domain.includes("gmail")) return "https://mail.google.com";
  if (domain.includes("yahoo")) return "https://mail.yahoo.com";
  if (
    domain.includes("outlook") ||
    domain.includes("hotmail") ||
    domain.includes("live") ||
    domain.includes("msn")
  )
    return "https://outlook.live.com";
  if (
    domain.includes("icloud") ||
    domain.includes("me.com") ||
    domain.includes("mac.com")
  )
    return "https://www.icloud.com/mail";
  if (domain.includes("proton") || domain.includes("pm.me"))
    return "https://mail.proton.me";
  return null;
}

/* Loading skeleton shown while useSearchParams resolves */
function VerifyEmailSkeleton() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-500 via-white to-blue-50 flex items-center justify-center px-4">
      <section className="w-full max-w-md rounded-2xl bg-white border border-blue-100 shadow-2xl p-8 text-center">
        <div className="inline-flex items-center gap-2 mb-8">
          <span className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </span>
          <span className="text-2xl font-bold text-blue-700">CarR</span>
        </div>
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
        </div>
      </section>
    </main>
  );
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(emailParam);
  const [state, setState] = useState<VerificationState>(
    token ? { type: "verifying" } : { type: "pending" },
  );

  const verifyMutation = useVerifyEmailMutation();
  const resendMutation = useResendVerificationMutation();
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const hasAttemptedVerification = useRef(false);

  useEffect(() => {
    if (!isUserLoading && currentUser?.email_verified) {
      router.replace("/");
    }
  }, [currentUser, isUserLoading, router]);

  useEffect(() => {
    if (
      !token ||
      hasAttemptedVerification.current ||
      (currentUser && currentUser.email_verified)
    )
      return;

    hasAttemptedVerification.current = true;
    verifyMutation.mutate(
      { token },
      {
        onSuccess: () => {
          toast.success("Email verified successfully. Welcome!");
          router.replace("/");
        },
        onError: (error) => {
          const message =
            error instanceof Error ? error.message : "Something went wrong";
          if (message.toLowerCase().includes("expired")) {
            setState({ type: "expired" });
          } else if (
            message.toLowerCase().includes("failed to fetch") ||
            message.toLowerCase().includes("network error")
          ) {
            setState({
              type: "failed",
              message: "Network error. Please check your connection.",
            });
            hasAttemptedVerification.current = false;
          } else {
            setState({ type: "failed", message });
          }
        },
      },
    );
  }, [token, router, verifyMutation, currentUser]);

  const handleResend = () => {
    if (!email.trim()) return;

    resendMutation.mutate(
      { email: email.trim() },
      {
        onSuccess: (data) => {
          if (data.message === "Email already verified") {
            toast.success("Your email is already verified!");
            router.replace("/");
          } else {
            setState({ type: "pending" });
            toast.success("Verification email sent!");
          }
        },
        onError: (error) => {
          const message =
            error instanceof Error ? error.message : "Failed to send email";
          toast.error(message);
        },
      },
    );
  };

  if ((isUserLoading && !!token) || currentUser?.email_verified) {
    return <VerifyEmailSkeleton />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-500 via-white to-blue-50 flex items-center justify-center px-4 py-8">
      <section className="w-full max-w-md rounded-2xl bg-white border border-blue-100 shadow-2xl p-8 text-center">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <span className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center shadow">
            <Car className="w-5 h-5 text-white" />
          </span>
          <span className="text-2xl font-bold text-blue-700">CarR</span>
        </Link>

        {/* ── VERIFYING ── */}
        {state.type === "verifying" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Verifying your email…
            </h1>
            <p className="text-sm text-gray-500 max-w-xs">
              Please wait while we confirm your email address. This only takes a
              moment.
            </p>
          </div>
        )}

        {/* ── EXPIRED ── */}
        {state.type === "expired" && (
          <div className="flex flex-col items-center gap-5 py-6">
            {/* Icon badge */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center">
                <Clock className="h-10 w-10 text-amber-500" />
              </div>
              <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-white" />
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Verification link expired
              </h1>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Your email verification link has expired. Enter your email
                address below and we&apos;ll send you a fresh link right away.
              </p>
            </div>

            {/* Highlighted info box */}
            <div className="w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-left flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                Verification links expire after{" "}
                <span className="font-semibold">15 minutes</span> for your
                security. Request a new one below.
              </p>
            </div>

            <div className="w-full space-y-3">
              <div className="space-y-2 text-left">
                <Label htmlFor="resend-email">Your email address</Label>
                <Input
                  id="resend-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 border-gray-300 focus-visible:ring-blue-300"
                />
              </div>
              <Button
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                disabled={resendMutation.isPending || !email.trim()}
                onClick={handleResend}
              >
                {resendMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Send new verification link
                  </>
                )}
              </Button>
            </div>

            <Link
              href="/signup"
              className="inline-flex items-center gap-1 text-sm text-blue-700 hover:underline font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign up
            </Link>
          </div>
        )}

        {/* ── FAILED ── */}
        {state.type === "failed" && (
          <div className="flex flex-col items-center gap-5 py-6">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Verification failed
              </h1>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                {state.message}
              </p>
            </div>

            {state.message.toLowerCase().includes("network") ? (
              <div className="w-full bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex gap-3">
                <WifiOff className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">
                  Check your internet connection and try again.
                </p>
              </div>
            ) : null}

            <div className="flex flex-col gap-2 w-full">
              <Button
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setState({ type: "pending" })}
              >
                Request a new link
              </Button>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-1 text-sm text-blue-700 hover:underline font-medium py-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign up
              </Link>
            </div>
          </div>
        )}

        {/* ── PENDING (verification link sent) ── */}
        {state.type === "pending" && (
          <div className="flex flex-col items-center gap-5 py-6">
            {/* Icon */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                <Mail className="h-10 w-10 text-blue-600" />
              </div>
              <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </span>
            </div>

            {/* Heading & message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Check your email
              </h1>
              <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
                Please check your email and click the verification link to
                activate your account.
                {email && (
                  <>
                    {" "}
                    <span className="text-gray-400">{email}</span>
                  </>
                )}
              </p>
            </div>

            {/* Action buttons */}
            <div className="w-full flex flex-col gap-3">
              {/* Open Email button — only shown when provider is known */}
              {email && getEmailProviderUrl(email) && (
                <a
                  href={getEmailProviderUrl(email)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Email App
                </a>
              )}

              {/* Resend button */}
              <Button
                variant="outline"
                className="w-full h-11 border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                disabled={resendMutation.isPending || !email.trim()}
                onClick={handleResend}
              >
                {resendMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-gray-400">
              Didn&apos;t receive the email? Check your spam folder or resend
              above.
            </p>

            <Link
              href="/signup"
              className="inline-flex items-center gap-1 text-sm text-blue-700 hover:underline font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign up
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailSkeleton />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

import Link from "next/link";
import { Abril_Fatface, Space_Grotesk } from "next/font/google";

const displayFont = Abril_Fatface({
  weight: "400",
  subsets: ["latin"],
});

const bodyFont = Space_Grotesk({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export default function PaymentSuccessPage() {
  return (
    <main
      className={`${bodyFont.className} relative flex min-h-screen items-center justify-center overflow-hidden bg-[#e8f1ff] px-6 py-16 text-[#0a2b52]`}
    >
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#c7dcff] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-[#dbe9ff] blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-12 h-40 w-40 -translate-x-1/2 rounded-full bg-white/60 blur-2xl" />

      <section className="relative w-full max-w-sm rounded-2xl bg-white/85 p-8 shadow-[0_24px_60px_rgba(10,43,82,0.18)] backdrop-blur">
        <button
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full border border-blue-100 bg-white/70 px-2 py-0.5 text-xs text-blue-600"
          type="button"
        >
          x
        </button>

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-500 shadow-[0_12px_24px_rgba(59,130,246,0.35)]">
          <svg
            aria-hidden="true"
            className="h-9 w-9 text-white"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <div className="mt-6 text-center">
          <h1 className={`${displayFont.className} text-2xl text-blue-700`}>
            Payment Successful
          </h1>
          <p className="mt-3 text-sm text-blue-700/80">
            Your payment has been processed. You can return to the homepage and
            explore more cars.
          </p>
        </div>

        <div className="mt-6">
          <Link
            className="block rounded-full bg-blue-500 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-[0_10px_24px_rgba(59,130,246,0.35)] transition hover:bg-blue-600"
            href="/"
          >
            Continue shopping
          </Link>
        </div>
      </section>
    </main>
  );
}

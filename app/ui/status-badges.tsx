import { Badge } from "@/app/ui/badge";
import { cn } from "@/app/ui/utils/utils";
import type { BookingStatus, CarStatus, PaymentStatus } from "@/app/lib/status";
import {
  bookingStatusLabels,
  carStatusLabels,
  paymentStatusLabels,
} from "@/app/lib/status";

const bookingStyles: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  active: "bg-blue-100 text-blue-800",
  completed: "bg-slate-200 text-slate-800",
  rejected: "bg-rose-100 text-rose-800",
  cancelled: "bg-gray-100 text-gray-700",
  no_show: "bg-orange-100 text-orange-800",
  expired: "bg-red-100 text-red-800",
};

const paymentStyles: Record<PaymentStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  completed: "bg-emerald-100 text-emerald-800",
  refund_initiated: "bg-blue-100 text-blue-800",
  refund_processing: "bg-cyan-100 text-cyan-800",
  partially_refunded: "bg-violet-100 text-violet-800",
  refunded: "bg-slate-100 text-slate-700",
  refund_reversed: "bg-orange-100 text-orange-800",
  failed: "bg-rose-100 text-rose-800",
  expired: "bg-red-100 text-red-800",
};

const carStyles: Record<CarStatus, string> = {
  available: "bg-emerald-100 text-emerald-800",
  rented: "bg-amber-100 text-amber-800",
  maintenance: "bg-yellow-100 text-yellow-800",
};

type StatusBadgeProps = {
  className?: string;
};

export const BookingStatusBadge = ({
  status,
  className,
}: StatusBadgeProps & { status: BookingStatus }) => (
  <Badge className={cn(bookingStyles[status], className)}>
    {bookingStatusLabels[status]}
  </Badge>
);

export const PaymentStatusBadge = ({
  status,
  className,
}: StatusBadgeProps & { status: PaymentStatus }) => (
  <Badge className={cn(paymentStyles[status], className)}>
    {paymentStatusLabels[status]}
  </Badge>
);

export const CarStatusBadge = ({
  status,
  className,
}: StatusBadgeProps & { status: CarStatus }) => (
  <Badge className={cn(carStyles[status], className)}>
    {carStatusLabels[status]}
  </Badge>
);

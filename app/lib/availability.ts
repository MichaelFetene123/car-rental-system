export type UnavailablePeriod = {
  startDate: string;
  endDate: string;
  days: number;
};

const dayInMs = 1000 * 60 * 60 * 24;

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const formatShortDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

export const getUnavailableBadgeLabel = (period?: UnavailablePeriod | null) => {
  if (!period) return null;

  const today = startOfDay(new Date());
  const end = startOfDay(new Date(period.endDate));
  const remainingDays = Math.max(
    0,
    Math.round((end.getTime() - today.getTime()) / dayInMs),
  );

  if (remainingDays === 0) return "Unavailable today";

  return `Unavailable for ${remainingDays} ${remainingDays === 1 ? "day" : "days"}`;
};

export const getBookedUntilLabel = (period?: UnavailablePeriod | null) => {
  if (!period) return null;

  const end = new Date(period.endDate);
  return `Booked until ${formatShortDate(end)}`;
};

export const getUnavailableDetailLabel = (
  period?: UnavailablePeriod | null,
) => {
  if (!period) return null;

  const start = new Date(period.startDate);
  const end = new Date(period.endDate);
  const dayCount = Math.max(0, period.days);

  return `This car is unavailable from ${formatShortDate(start)} to ${formatShortDate(end)} (${dayCount} ${dayCount === 1 ? "day" : "days"}).`;
};

export const getUnavailableRangeLabel = (
  period?: UnavailablePeriod | null,
) => {
  if (!period) return null;

  const start = new Date(period.startDate);
  const end = new Date(period.endDate);
  const dayCount = Math.max(0, period.days);

  return `${formatShortDate(start)} - ${formatShortDate(end)} (${dayCount} ${dayCount === 1 ? "day" : "days"})`;
};

export const isDateRangeUnavailable = (
  period: UnavailablePeriod | null | undefined,
  pickupDate: Date,
  returnDate: Date,
  bufferDays = 1,
) => {
  if (!period) return false;

  const start = startOfDay(new Date(period.startDate));
  const end = startOfDay(new Date(period.endDate));
  const bufferMs = bufferDays * dayInMs;
  const windowStart = new Date(start.getTime() - bufferMs);
  const windowEnd = new Date(end.getTime() + bufferMs);

  return pickupDate < windowEnd && returnDate > windowStart;
};

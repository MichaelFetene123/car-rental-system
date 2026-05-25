export const getLocationLabel = (
  value: unknown,
  fallback = "Unknown",
): string => {
  if (typeof value === "string") return value;

  if (value && typeof value === "object" && "name" in value) {
    const name = (value as { name?: unknown }).name;
    if (typeof name === "string" && name.trim()) return name;
  }

  return fallback;
};

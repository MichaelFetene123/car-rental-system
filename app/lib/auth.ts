import { API_BASE_URL } from "@/server/server";

const TOKEN_STORAGE_KEY = "car_rental_access_token";

export const AUTH_COOKIE_NAME = "car_rental_access_token";

const TOKEN_COOKIE_TTL_SECONDS = 60 * 60;

type ApiErrorResponse = {
  message?: string | string[];
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
};

export type AuthResponse = {
  access_token: string;
};

export type CurrentUser = {
  sub: string;
  email?: string;
  roles: string[];
  permissions: string[];
  tokenVersion: number;
};

type TokenPayload = {
  roles?: unknown;
  email?: unknown;
  exp?: unknown;
};

let refreshPromise: Promise<string> | null = null;

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const error = (await response.json()) as ApiErrorResponse;
    if (Array.isArray(error.message)) {
      return error.message.join(", ");
    }
    if (typeof error.message === "string") {
      return error.message;
    }
  } catch {
    // Ignore JSON parse errors and fallback to status text...
  }

  return response.statusText || "Request failed";
};

const requestJson = async <T>(path: string, init: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    const error = new Error(await parseErrorMessage(response));
    (error as { status?: number }).status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
};

export const loginUser = async (payload: LoginPayload): Promise<AuthResponse> =>
  requestJson<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const registerUser = async (payload: RegisterPayload): Promise<void> => {
  await requestJson<void>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

const readTokenFromCookie = (): string | null => {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${AUTH_COOKIE_NAME}=`));

  if (!cookie) return null;

  const [, value] = cookie.split("=");
  return value ? decodeURIComponent(value) : null;
};

export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;

  try {
    const localToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (localToken) return localToken;
  } catch {
    // Ignore browser storage restrictions and fallback to cookies.
  }

  return readTokenFromCookie();
};

export const persistAccessToken = (token: string) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // Ignore browser storage restrictions.
  }

  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${TOKEN_COOKIE_TTL_SECONDS}; samesite=lax`;
};

export const clearStoredAuth = () => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Ignore browser storage restrictions.
  }

  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax`;
};

const decodeBase64Url = (value: string): string => {
  if (typeof window === "undefined") return "";

  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return window.atob(`${normalized}${padding}`);
};

const parseTokenPayload = (token: string): TokenPayload | null => {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    return JSON.parse(decodeBase64Url(payload)) as TokenPayload;
  } catch {
    return null;
  }
};

const getTokenExpiry = (token: string): number | null => {
  const payload = parseTokenPayload(token);
  if (!payload || typeof payload.exp !== "number") return null;
  return payload.exp;
};

const isTokenExpired = (token: string, skewSeconds = 30): boolean => {
  const exp = getTokenExpiry(token);
  if (!exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return exp <= now + skewSeconds;
};

export const refreshAccessToken = async (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        cache: "no-store",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      const data = (await response.json()) as AuthResponse;

      if (!data.access_token) {
        throw new Error("Refresh did not return an access token");
      }

      persistAccessToken(data.access_token);
      return data.access_token;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

export const getValidAccessToken = async (): Promise<string | null> => {
  const token = getStoredToken();

  if (token && !isTokenExpired(token)) {
    return token;
  }

  try {
    return await refreshAccessToken();
  } catch {
    clearStoredAuth();
    return null;
  }
};

export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await getValidAccessToken();

  if (!token) {
    throw new Error("Please log in again.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const fetchCurrentUser = async (): Promise<CurrentUser> => {
  const response = await authFetch("/auth/me", {
    method: "GET",
  });

  if (!response.ok) {
    const error = new Error(await parseErrorMessage(response));
    (error as { status?: number }).status = response.status;
    throw error;
  }

  const text = await response.text();
  if (!text) {
    throw new Error("No user payload returned");
  }

  return JSON.parse(text) as CurrentUser;
};

export const authFetch = async (
  input: string,
  init: RequestInit = {},
): Promise<Response> => {
  const token = await getValidAccessToken();

  if (!token) {
    throw new Error("Please log in again.");
  }

  const requestUrl = input.startsWith("http")
    ? input
    : `${API_BASE_URL}${input}`;
  const headers = new Headers(init.headers ?? {});
  headers.set("Authorization", `Bearer ${token}`);

  let response = await fetch(requestUrl, {
    ...init,
    headers,
    cache: init.cache ?? "no-store",
    credentials: "include",
  });

  if (response.status !== 401 && response.status !== 403) {
    return response;
  }

  const refreshedToken = await refreshAccessToken();
  headers.set("Authorization", `Bearer ${refreshedToken}`);

  response = await fetch(requestUrl, {
    ...init,
    headers,
    cache: init.cache ?? "no-store",
    credentials: "include",
  });

  return response;
};

export const hasTokenRole = (token: string | null, role: string): boolean => {
  if (!token) return false;

  const payload = parseTokenPayload(token);
  if (!payload || !Array.isArray(payload.roles)) return false;

  return payload.roles.some((item) => item === role);
};

export const isCurrentUserAdmin = (): boolean =>
  hasTokenRole(getStoredToken(), "admin");

export const getCurrentUserEmail = (): string | null => {
  const token = getStoredToken();
  if (!token) return null;

  const payload = parseTokenPayload(token);
  if (!payload || typeof payload.email !== "string") return null;

  return payload.email;
};

export const logoutUser = async () => {
  const token = await getValidAccessToken();

  if (!token) {
    clearStoredAuth();
    return;
  }

  try {
    await requestJson<void>("/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    // Always clear local auth, even when token is expired/revoked.
  } finally {
    clearStoredAuth();
  }
};

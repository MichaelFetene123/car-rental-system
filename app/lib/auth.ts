import { API_BASE_URL } from "@/server/server";

const TOKEN_STORAGE_KEY = "car_rental_access_token";

export const AUTH_COOKIE_NAME = "car_rental_access_token";
export const SESSION_EXPIRED_TOAST_KEY = "car_rental_session_expired_message";
const MANUAL_LOGOUT_KEY = "car_rental_manual_logout";
export const AUTH_STATE_RESET_EVENT = "car-rental-auth-state-reset";

export const SESSION_EXPIRED_MESSAGE = "Session expired. Please login again.";

export const setManualLogoutFlag = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(MANUAL_LOGOUT_KEY, "true");
};

export const clearManualLogoutFlag = () => {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(MANUAL_LOGOUT_KEY);
};

export const notifyAuthStateReset = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_STATE_RESET_EVENT));
};

export const isManualLoggingOut = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(MANUAL_LOGOUT_KEY) === "true";
};

const PUBLIC_PATH_PREFIXES = ["/", "/login", "/signup"];

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
  full_name?: string;
  totalBookings?: number | null;
  status?: string;
  roles: string[];
  permissions: string[];
  tokenVersion: number;
};

type TokenPayload = {
  roles?: unknown;
  email?: unknown;
  full_name?: unknown;
  exp?: unknown;
};

type ProfileUser = {
  name?: string;
  full_name?: string;
  totalBookings?: number | null;
  status?: string;
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

  clearManualLogoutFlag();

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

const isPublicPath = (pathname: string): boolean =>
  pathname === "/" ||
  PUBLIC_PATH_PREFIXES.slice(1).some(
    (publicPath) =>
      pathname === publicPath || pathname.startsWith(`${publicPath}/`),
  );

export const shouldRedirectToLogin = (): boolean => {
  if (typeof window === "undefined") return false;

  return !isPublicPath(window.location.pathname);
};

export const isPageReload = (): boolean => {
  if (typeof window === "undefined") return false;

  try {
    const navEntries =
      (performance.getEntriesByType("navigation") as
        | PerformanceNavigationTiming[]
        | undefined) || [];

    if (navEntries.length > 0) {
      return navEntries[0].type === "reload";
    }

    // Fallback for older browsers
    // @ts-ignore
    if (
      (performance as any).navigation &&
      (performance as any).navigation.type
    ) {
      // 1 === TYPE_RELOAD
      // @ts-ignore
      return (performance as any).navigation.type === 1;
    }
  } catch {
    // ignore
  }

  return false;
};

const queueSessionExpiredToast = () => {
  if (typeof window === "undefined") return;

  window.sessionStorage.setItem(
    SESSION_EXPIRED_TOAST_KEY,
    SESSION_EXPIRED_MESSAGE,
  );
};

const handleSessionExpired = () => {
  clearStoredAuth();
  notifyAuthStateReset();
  const pageReload = isPageReload();

  if (!isManualLoggingOut() && !pageReload) {
    queueSessionExpiredToast();
  }

  // Always clear manual logout flag after handling expiration.
  clearManualLogoutFlag();

  if (typeof window === "undefined") return;

  if (shouldRedirectToLogin()) {
    window.location.replace("/login");
  }
};

const isSessionRefreshError = (error: unknown): boolean => {
  const status =
    error instanceof Error &&
    typeof (error as { status?: number }).status === "number"
      ? (error as { status?: number }).status
      : null;

  if (status === 401 || status === 403) {
    return true;
  }

  const message = error instanceof Error ? error.message : "";

  return /refresh token|invalid refresh token|token has been revoked|user not found/i.test(
    message,
  );
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
        const error = new Error(await parseErrorMessage(response));
        (error as { status?: number }).status = response.status;
        throw error;
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
  } catch (error) {
    if (isSessionRefreshError(error)) {
      handleSessionExpired();
    }
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

  const user = JSON.parse(text) as CurrentUser;

  try {
    const profileResponse = await authFetch("/profile", {
      method: "GET",
    });

    if (!profileResponse.ok) {
      return user;
    }

    const profileText = await profileResponse.text();
    if (!profileText) {
      return user;
    }

    const profile = JSON.parse(profileText) as ProfileUser;

    return {
      ...user,
      full_name: profile.full_name ?? profile.name ?? user.full_name,
      totalBookings: profile.totalBookings ?? user.totalBookings,
      status: profile.status ?? user.status,
    };
  } catch {
    return user;
  }
};

export const authFetch = async (
  input: string,
  init: RequestInit = {},
): Promise<Response> => {
  const token = await getValidAccessToken();

  if (!token) {
    return new Promise<Response>(() => undefined);
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

  if (response.status !== 401) {
    return response;
  }

  let refreshedToken: string;

  try {
    refreshedToken = await refreshAccessToken();
  } catch {
    handleSessionExpired();
    return new Promise<Response>(() => undefined);
  }

  headers.set("Authorization", `Bearer ${refreshedToken}`);

  response = await fetch(requestUrl, {
    ...init,
    headers,
    cache: init.cache ?? "no-store",
    credentials: "include",
  });

  if (response.status === 401) {
    handleSessionExpired();
    return new Promise<Response>(() => undefined);
  }

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

export const getCurrentUserName = (): string | null => {
  const token = getStoredToken();
  if (!token) return null;

  const payload = parseTokenPayload(token);
  if (!payload || typeof payload.full_name !== "string") return null;

  return payload.full_name;
};

export const logoutUser = async () => {
  setManualLogoutFlag();

  const token = getStoredToken();

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
    notifyAuthStateReset();
  }
};

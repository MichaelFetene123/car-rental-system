"use client";

import {
  clearStoredAuth,
  fetchCurrentUser,
  isManualLoggingOut,
  shouldRedirectToLogin,
  isPageReload,
  loginUser,
  logoutUser,
  persistAccessToken,
  registerUser,
  notifyAuthStateReset,
  SESSION_EXPIRED_TOAST_KEY,
  SESSION_EXPIRED_MESSAGE,
  type CurrentUser,
  type LoginPayload,
  type RegisterPayload,
} from "@/app/lib/auth";
import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const CURRENT_USER_QUERY_KEY = ["currentUser"] as const;

export const clearAuthQueryState = (queryClient: QueryClient) => {
  queryClient.setQueryData(CURRENT_USER_QUERY_KEY, null);
  queryClient.removeQueries({ queryKey: ["myBookings"] });
  queryClient.removeQueries({ queryKey: ["paymentBookings"] });
  queryClient.removeQueries({ queryKey: ["adminProfile"] });
  queryClient.removeQueries({ queryKey: ["adminUsers"] });
  queryClient.removeQueries({ queryKey: ["roles"] });
  queryClient.removeQueries({ queryKey: ["users"] });
  queryClient.removeQueries({ queryKey: ["dashboard"] });
};

export const useCurrentUser = () =>
  useQuery<CurrentUser | null, Error>({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: async () => {
      try {
        return await fetchCurrentUser();
      } catch (error) {
        const status =
          error instanceof Error &&
          typeof (error as { status?: number }).status === "number"
            ? (error as { status?: number }).status
            : null;

        if (status === 401 || status === 403) {
          clearStoredAuth();
          notifyAuthStateReset();
          if (typeof window !== "undefined") {
            const pageReload = isPageReload();

            if (!isManualLoggingOut() && !pageReload && shouldRedirectToLogin()) {
              // Only queue the toast when the session expired automatically (not manual logout/login or page reload)
              window.sessionStorage.setItem(
                SESSION_EXPIRED_TOAST_KEY,
                SESSION_EXPIRED_MESSAGE,
              );
            }

            if (shouldRedirectToLogin()) {
              window.location.replace("/login");
            }
          }
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) => loginUser(payload),
    onSuccess: (data) => {
      persistAccessToken(data.access_token);
      queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
    },
    onError: () => {
      clearStoredAuth();
    },
  });
};

export const useRegisterMutation = () =>
  useMutation({
    mutationFn: (payload: RegisterPayload) => registerUser(payload),
  });

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logoutUser(),
    onSuccess: () => {
      clearAuthQueryState(queryClient);
    },
  });
};

"use client";

import {
  clearStoredAuth,
  fetchCurrentUser,
  loginUser,
  logoutUser,
  persistAccessToken,
  registerUser,
  type CurrentUser,
  type LoginPayload,
  type RegisterPayload,
} from "@/app/lib/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const CURRENT_USER_QUERY_KEY = ["currentUser"] as const;

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
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
    initialData: null,
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
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, null);
      queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
    },
  });
};

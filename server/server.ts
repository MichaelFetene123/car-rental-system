export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export const TOKEN_STORAGE_KEY = process.env.NEXT_PUBLIC_TOKEN_STORAGE_KEY || "car_rental_access_token";
export const AUTH_COOKIE_NAME = process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || "car_rental_access_token";
export const SESSION_EXPIRED_TOAST_KEY = process.env.NEXT_PUBLIC_SESSION_EXPIRED_TOAST_KEY || "car_rental_session_expired_message";
export const MANUAL_LOGOUT_KEY = process.env.NEXT_PUBLIC_MANUAL_LOGOUT_KEY || "car_rental_manual_logout";
export const AUTH_STATE_RESET_EVENT = process.env.NEXT_PUBLIC_AUTH_STATE_RESET_EVENT || "car-rental-auth-state-reset";
export const SESSION_EXPIRED_MESSAGE = process.env.NEXT_PUBLIC_SESSION_EXPIRED_MESSAGE || "Session expired. Please login again.";

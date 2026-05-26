"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import {
  SESSION_EXPIRED_MESSAGE,
  SESSION_EXPIRED_TOAST_KEY,
} from "@/app/lib/auth";
import { toast } from "sonner";

export const AppToaster = () => {
  useEffect(() => {
    const message = window.sessionStorage.getItem(SESSION_EXPIRED_TOAST_KEY);

    if (!message) return;

    window.sessionStorage.removeItem(SESSION_EXPIRED_TOAST_KEY);
    toast.error(message || SESSION_EXPIRED_MESSAGE);
  }, []);

  return <Toaster position="top-right" richColors />;
};

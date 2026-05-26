"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import { Label } from "@/app/ui/lable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authFetch } from "@/app/lib/auth";
import { CURRENT_USER_QUERY_KEY } from "@/app/lib/auth-queries";

const profileQueryKey = ["adminProfile"] as const;

type ProfileResponse = {
  id: string;
  name?: string;
  full_name?: string;
  email?: string;
  phone?: string | null;
  status?: string;
  roles?: string[];
};

type UpdateProfilePayload = {
  full_name?: string;
  email?: string;
  phone?: string | null;
};

const fetchProfile = async (): Promise<ProfileResponse> => {
  const response = await authFetch("/profile", { method: "GET" });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to load profile");
  }
  const text = await response.text();
  return text ? (JSON.parse(text) as ProfileResponse) : ({} as ProfileResponse);
};

const updateProfile = async (payload: UpdateProfilePayload) => {
  const response = await authFetch("/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to update profile");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

const changePassword = async (payload: {
  currentPassword: string;
  newPassword: string;
}) => {
  const response = await authFetch("/profile/password", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to update password");
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export default function AdminProfilePage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
  });

  const { data: profile, isPending } = useQuery({
    queryKey: profileQueryKey,
    queryFn: fetchProfile,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (!profile) return;
    setFormData({
      full_name: profile.full_name ?? profile.name ?? "",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
    });
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: profileQueryKey });
      await queryClient.invalidateQueries({
        queryKey: CURRENT_USER_QUERY_KEY,
      });
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile",
      );
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setPasswordData({ currentPassword: "", newPassword: "" });
      toast.success("Password updated successfully");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update password",
      );
    },
  });

  const handleProfileSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.full_name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    const currentName = profile?.full_name ?? profile?.name ?? "";
    const currentEmail = profile?.email ?? "";
    const currentPhone = profile?.phone ?? "";
    const nextName = formData.full_name.trim();
    const nextEmail = formData.email.trim();
    const nextPhone = formData.phone.trim();

    const payload: UpdateProfilePayload = {};

    if (nextName && nextName !== currentName) {
      payload.full_name = nextName;
    }

    if (nextEmail && nextEmail !== currentEmail) {
      payload.email = nextEmail;
    }

    if (nextPhone !== currentPhone) {
      payload.phone = nextPhone || null;
    }

    if (Object.keys(payload).length === 0) {
      toast.info("No changes to update");
      return;
    }

    updateProfileMutation.mutate(payload);
  };

  const handlePasswordSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!passwordData.currentPassword.trim()) {
      toast.error("Current password is required");
      return;
    }
    if (passwordData.newPassword.trim().length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  return (
    <div>
      <div className="space-y-6 max-w-5xl mx-auto bg-gray-50 p-6 rounded-lg">
        <div>
          <h1 className="text-2xl font-semibold">Admin Profile</h1>
          <p className="text-muted-foreground">
            Manage your admin account details and password.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 bg-gray-50 p-6 rounded-lg">
          <Card className="border-gray-200 md:h-1/2 bg-white">
            <CardHeader>
              <CardTitle>Current Admin Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 text-sm text-gray-700">
                <div className="grid grid-cols-[96px_1fr] items-center gap-3">
                  <span className="text-muted-foreground">Name</span>
                  <span>{profile?.full_name ?? profile?.name ?? "-"}</span>
                </div>
                <div className="grid grid-cols-[96px_1fr] items-center gap-3">
                  <span className="text-muted-foreground">Email</span>
                  <span>{profile?.email ?? "-"}</span>
                </div>

                <div className="grid grid-cols-[96px_1fr] items-center gap-3">
                  <span className="text-muted-foreground">Phone</span>
                  <span>{profile?.phone ?? "-"}</span>
                </div>
                <div className="grid grid-cols-[96px_1fr] items-center gap-3">
                  <span className="text-muted-foreground">Password</span>
                  <span>••••••••</span>
                </div>
                <div className="grid grid-cols-[96px_1fr] items-center gap-3">
                  <span className="text-muted-foreground">Status</span>
                  <span>{profile?.status ?? "-"}</span>
                </div>
                <div className="grid grid-cols-[96px_1fr] items-center gap-3">
                  <span className="text-muted-foreground">Roles</span>
                  <span>{profile?.roles?.join(", ") ?? "-"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle>Profile Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-name">Name</Label>
                    <Input
                      id="admin-name"
                      value={formData.full_name}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          full_name: event.target.value,
                        }))
                      }
                      required
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={formData.email}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }))
                      }
                      required
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-phone">Phone</Label>
                    <Input
                      id="admin-phone"
                      value={formData.phone}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone: event.target.value,
                        }))
                      }
                      disabled={isPending}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-blue-600 text-white hover:bg-blue-500"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending
                      ? "Saving..."
                      : "Update Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-white">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(event) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            currentPassword: event.target.value,
                          }))
                        }
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords((prev) => ({
                            ...prev,
                            current: !prev.current,
                          }))
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        aria-label={
                          showPasswords.current
                            ? "Hide current password"
                            : "Show current password"
                        }
                      >
                        {showPasswords.current ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(event) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            newPassword: event.target.value,
                          }))
                        }
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords((prev) => ({
                            ...prev,
                            new: !prev.new,
                          }))
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        aria-label={
                          showPasswords.new
                            ? "Hide new password"
                            : "Show new password"
                        }
                      >
                        {showPasswords.new ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="bg-blue-600 text-white hover:bg-blue-500"
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending
                      ? "Updating..."
                      : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

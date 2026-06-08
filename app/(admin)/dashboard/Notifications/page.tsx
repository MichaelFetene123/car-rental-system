"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/ui/card";
import { Badge } from "@/app/ui/badge";
import { Label } from "@/app/ui/lable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui/select";
import { Textarea } from "@/app/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/ui/dialog";
import {
  Mail,
  MessageSquare,
  Bell,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  X,
  User,
  Trash2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/ui/tabs";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableScrollArea,
} from "@/app/ui/table";
import { lusitana } from "@/app/ui/utils/fonts";
import { TableSkeletonRows } from "@/app/ui/skeletons";
import {
  fetchNotificationSettings,
  fetchNotificationLogs,
  fetchNotificationStats,
  updateEmailSettings,
  sendBulkNotification,
  deleteNotificationLog,
  type NotificationLog,
  type NotificationStats,
  type EmailSettings,
} from "@/app/lib/notifications-api";
import {
  fetchAdminUsers,
  adminUsersQueryKey,
  type AdminUserMutationResult,
} from "@/app/lib/adminMangeUsers";

// ─── Query keys ───────────────────────────────────────────────────────────────
const NOTIF_STATS_KEY = ["notifications", "stats"] as const;
const NOTIF_LOGS_KEY = ["notifications", "logs"] as const;
const NOTIF_SETTINGS_KEY = ["notifications", "settings"] as const;
const REFETCH_MS = 30_000;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatRelativeTime = (dateValue: string) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Just now";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
};

const statusBadgeClass = (status: string) => {
  if (status === "sent") return "bg-green-100 text-green-700";
  if (status === "failed") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon,
  colorClass,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  colorClass: string;
}) {
  return (
    <Card className={`border ${colorClass}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center text-gray-500">
      <AlertCircle className="size-8 text-red-400" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center text-gray-400">
      <Bell className="size-8" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

function RelativeTimeDisplay({ dateStr }: { dateStr: string }) {
  const [relativeTime, setRelativeTime] = useState("");

  // Need this to avoid hydration mismatch, update relative time only on client
  useMemo(() => {
    setRelativeTime(formatRelativeTime(dateStr));
  }, [dateStr]);

  // Update relative time dynamically every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setRelativeTime(formatRelativeTime(dateStr));
    }, 60000);
    return () => clearInterval(interval);
  }, [dateStr]);

  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap">
      <span>{formatDate(dateStr)}</span>
      <span className="text-gray-300">•</span>
      <span className="text-gray-400">{relativeTime}</span>
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ManageNotifications() {
  const queryClient = useQueryClient();

  // ── Stats ──────────────────────────────────────────────────────────────────
  const {
    data: stats,
    isPending: statsLoading,
    error: statsError,
  } = useQuery<NotificationStats, Error>({
    queryKey: NOTIF_STATS_KEY,
    queryFn: ({ signal }) => fetchNotificationStats(signal),
    refetchInterval: REFETCH_MS,
    refetchOnWindowFocus: true,
  });

  // ── Logs ───────────────────────────────────────────────────────────────────
  const {
    data: logs = [],
    isPending: logsLoading,
    error: logsError,
  } = useQuery<NotificationLog[], Error>({
    queryKey: NOTIF_LOGS_KEY,
    queryFn: ({ signal }) => fetchNotificationLogs(signal),
    refetchInterval: REFETCH_MS,
    refetchOnWindowFocus: true,
  });

  const [deleteLogTarget, setDeleteLogTarget] = useState<string | null>(null);

  const deleteLogMutation = useMutation({
    mutationFn: (id: string) => deleteNotificationLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIF_LOGS_KEY });
      queryClient.invalidateQueries({ queryKey: NOTIF_STATS_KEY });
      toast.success("Log deleted successfully");
      setDeleteLogTarget(null);
    },
    onError: (err: Error) => toast.error(err.message || "Failed to delete log"),
  });

  // ── Settings ───────────────────────────────────────────────────────────────
  const {
    data: settingsData,
    isPending: settingsLoading,
    error: settingsError,
  } = useQuery<{ email: any; sms: any }, Error>({
    queryKey: NOTIF_SETTINGS_KEY,
    queryFn: ({ signal }) => fetchNotificationSettings(signal),
    staleTime: 5 * 60 * 1000,
  });

  // ── Email settings form ────────────────────────────────────────────────────
  const emailCfg = settingsData?.email;
  const emailConfigJson =
    emailCfg?.config_json && typeof emailCfg.config_json === "object"
      ? (emailCfg.config_json as Record<string, unknown>)
      : {};

  const [emailForm, setEmailForm] = useState<EmailSettings>({
    host: "",
    port: 587,
    username: "",
    password: "",
    fromName: "",
    fromEmail: "",
  });

  // Populate form once settings load
  useMemo(() => {
    if (emailCfg) {
      setEmailForm({
        host: String(emailConfigJson.host ?? ""),
        port: Number(emailConfigJson.port ?? 587),
        username: String(emailConfigJson.username ?? ""),
        password: "",
        fromName: emailCfg.from_name ?? "",
        fromEmail: emailCfg.from_email ?? "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsData]);

  const updateEmailMutation = useMutation({
    mutationFn: (payload: EmailSettings) => updateEmailSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIF_SETTINGS_KEY });
      toast.success("Email settings saved successfully");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to save email settings"),
  });

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmailMutation.mutate(emailForm);
  };

  // ── Users list (for recipient picker) ─────────────────────────────────────
  const { data: allUsers = [] } = useQuery<AdminUserMutationResult[], Error>({
    queryKey: adminUsersQueryKey,
    queryFn: () => fetchAdminUsers(),
    staleTime: 2 * 60 * 1000,
  });

  // Filter to non-admin users with emails
  const selectableUsers = useMemo(
    () => allUsers.filter((u) => u.role !== "admin" && u.email),
    [allUsers],
  );

  // ── Send email form ────────────────────────────────────────────────────────
  const [sendForm, setSendForm] = useState({
    recipientType: "all" as "all" | "specific",
    subject: "",
    message: "",
  });
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    const q = userSearchQuery.toLowerCase().trim();
    if (!q) return selectableUsers;
    return selectableUsers.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [selectableUsers, userSearchQuery]);

  const toggleUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const sendMutation = useMutation({
    mutationFn: () =>
      sendBulkNotification({
        type: "email",
        recipientType: sendForm.recipientType,
        userIds:
          sendForm.recipientType === "specific" ? selectedUserIds : undefined,
        subject: sendForm.subject,
        message: sendForm.message,
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: NOTIF_LOGS_KEY });
      queryClient.invalidateQueries({ queryKey: NOTIF_STATS_KEY });
      setSendForm({ recipientType: "all", subject: "", message: "" });
      setSelectedUserIds([]);
      setUserSearchQuery("");
      toast.success(
        `Email sent to ${result.total} recipient${result.total !== 1 ? "s" : ""}`,
      );
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to send email"),
  });

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendForm.subject.trim()) {
      toast.error("Subject is required for email notifications");
      return;
    }
    if (!sendForm.message.trim()) {
      toast.error("Message body is required");
      return;
    }
    if (sendForm.recipientType === "specific" && selectedUserIds.length === 0) {
      toast.error("Please select at least one recipient");
      return;
    }
    sendMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <Dialog open={!!deleteLogTarget} onOpenChange={(open) => !open && setDeleteLogTarget(null)}>
        <DialogContent className="bg-white border-none">
          <DialogHeader>
            <DialogTitle>Delete Notification Log</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this notification log?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteLogTarget(null)}
              disabled={deleteLogMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteLogTarget) {
                  deleteLogMutation.mutate(deleteLogTarget);
                }
              }}
              className="bg-red-600 hover:bg-red-500 text-white"
              disabled={deleteLogMutation.isPending}
            >
              {deleteLogMutation.isPending ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="size-4 mr-2" />
              )}
              {deleteLogMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className={`${lusitana.className} text-2xl`}>
          Notifications &amp; Communication
        </h1>
        <p className="text-muted-foreground text-gray-500">
          Manage email notifications, settings, and delivery logs
        </p>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      {statsError ? (
        <div className="text-sm text-red-500 flex items-center gap-2">
          <AlertCircle className="size-4" /> Could not load stats:{" "}
          {statsError.message}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Total Sent"
            value={stats?.sent ?? 0}
            icon={<CheckCircle2 className="size-4 text-blue-700" />}
            colorClass="bg-blue-50 border-blue-100"
          />
          <StatCard
            title="Pending"
            value={stats?.pending ?? 0}
            icon={<Clock className="size-4 text-amber-700" />}
            colorClass="bg-amber-50 border-amber-100"
          />
          <StatCard
            title="Failed"
            value={stats?.failed ?? 0}
            icon={<Bell className="size-4 text-rose-700" />}
            colorClass="bg-rose-50 border-rose-100"
          />
          <StatCard
            title="Success Rate"
            value={`${(stats?.successRate ?? 0).toFixed(1)}%`}
            icon={<Mail className="size-4 text-emerald-700" />}
            colorClass="bg-emerald-50 border-emerald-100"
          />
        </div>
      )}

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <Tabs defaultValue="logs">
        <TabsList className="bg-gray-200 rounded-full">
          {(
            [
              { value: "logs", label: "Notification Logs" },
              { value: "send", label: "Send Email" },
              { value: "settings", label: "Email Settings" },
            ] as const
          ).map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="data-[state=active]:bg-white data-[state=active]:text-black rounded-full"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ──────────────────── LOGS TAB ────────────────────────────────────── */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className={`text-xl ${lusitana.className}`}>
                Notification Logs
              </CardTitle>
              <CardDescription className="text-gray-500">
                All email delivery records from the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logsError ? (
                <ErrorState
                  message={`Could not load logs: ${logsError.message}`}
                />
              ) : (
                <TableScrollArea className="max-h-[336px] rounded-md bg-white">
                  <table className="min-w-full caption-bottom text-sm">
                    <TableHeader className="[&_th]:sticky [&_th]:top-0 [&_th]:z-20 [&_th]:bg-gray-50">
                      <TableRow className="border-gray-300">
                        <TableHead className="shadow-[inset_0_-1px_0_0_#d1d5db]">Type</TableHead>
                        <TableHead className="shadow-[inset_0_-1px_0_0_#d1d5db]">Recipient</TableHead>
                        <TableHead className="shadow-[inset_0_-1px_0_0_#d1d5db]">Subject</TableHead>
                        <TableHead className="shadow-[inset_0_-1px_0_0_#d1d5db]">Status</TableHead>
                        <TableHead className="shadow-[inset_0_-1px_0_0_#d1d5db] pl-10">Sent At</TableHead>
                        <TableHead className="shadow-[inset_0_-1px_0_0_#d1d5db] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logsLoading ? (
                        <TableSkeletonRows columns={6} rows={6} />
                      ) : logs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="py-12">
                            <EmptyState message="No notification logs found." />
                          </TableCell>
                        </TableRow>
                      ) : (
                        logs.map((log) => (
                          <TableRow key={log.id} className="border-gray-200">
                          <TableCell className="border-b border-gray-200">
                            <div className="flex items-center gap-2">
                              {log.type === "email" ? (
                                <Mail className="size-4 text-blue-600" />
                              ) : (
                                <MessageSquare className="size-4 text-green-600" />
                              )}
                              <span className="uppercase text-xs font-medium text-gray-600">
                                {log.type}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="border-b border-gray-200 text-sm">
                            <div>{log.recipient}</div>
                            {log.user?.full_name && (
                              <div className="text-xs text-gray-400">
                                {log.user.full_name}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="border-b border-gray-200 text-sm max-w-xs truncate">
                            {log.subject ?? <span className="text-gray-400 italic">—</span>}
                          </TableCell>
                          <TableCell className="border-b border-gray-200">
                            <Badge
                              className={`capitalize text-xs ${statusBadgeClass(log.status)}`}
                            >
                              {log.status}
                            </Badge>
                            {log.error_message && (
                              <p
                                className="text-xs text-red-500 mt-1 max-w-[180px] truncate"
                                title={log.error_message}
                              >
                                {log.error_message}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="border-b border-gray-200 text-sm text-gray-500">
                            <RelativeTimeDisplay dateStr={log.sent_at} />
                          </TableCell>
                          <TableCell className="border-b border-gray-200 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteLogTarget(log.id)}
                              disabled={deleteLogMutation.isPending && deleteLogTarget === log.id}
                            >
                              <Trash2 className="size-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )))}
                    </TableBody>
                  </table>
                </TableScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ──────────────────── SEND TAB ────────────────────────────────────── */}
        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle className={`text-xl ${lusitana.className}`}>
                Send Admin Email
              </CardTitle>
              <CardDescription className="text-gray-500">
                Manually send a one-time email to customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* ── Warning: email not configured ─────────────────────────── */}
              {!settingsData?.email && !settingsLoading && (
                <div className="mb-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                  <div>
                    <p className="font-medium">Email not configured</p>
                    <p className="text-amber-700">
                      SMTP settings have not been saved yet. Go to the{" "}
                      <strong>Email Settings</strong> tab to configure your
                      outbound email before sending.
                    </p>
                  </div>
                </div>
              )}
              <form onSubmit={handleSendEmail} className="space-y-5">
                {/* Recipients */}
                <div className="space-y-2">
                  <Label>Recipients</Label>
                  <Select
                    value={sendForm.recipientType}
                    onValueChange={(v) => {
                      setSendForm({
                        ...sendForm,
                        recipientType: v as "all" | "specific",
                      });
                      setSelectedUserIds([]);
                      setUserSearchQuery("");
                    }}
                  >
                    <SelectTrigger className="border-gray-200 bg-gray-100 focus:border-gray-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-none bg-white">
                      <SelectItem value="all">All Active Users</SelectItem>
                      <SelectItem value="specific">Specific Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* User picker – only when "specific" */}
                {sendForm.recipientType === "specific" && (
                  <div className="space-y-2">
                    <Label>Select Users</Label>

                    {/* Selected user badges */}
                    {selectedUserIds.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedUserIds.map((uid) => {
                          const u = allUsers.find((x) => x.id === uid);
                          return (
                            <span
                              key={uid}
                              className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 text-xs px-2 py-1"
                            >
                              <User className="size-3" />
                              {u?.name ?? u?.email ?? uid}
                              <button
                                type="button"
                                onClick={() => toggleUser(uid)}
                                className="ml-1 hover:text-blue-500"
                              >
                                <X className="size-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Search */}
                    <Input
                      placeholder="Search by name or email…"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="border-gray-200 bg-gray-100"
                    />

                    {/* Scrollable user list */}
                    <div className="max-h-52 overflow-y-auto rounded-md border border-gray-200 bg-white divide-y divide-gray-100">
                      {filteredUsers.length === 0 ? (
                        <p className="text-center text-sm text-gray-400 py-6">
                          No users found
                        </p>
                      ) : (
                        filteredUsers.map((u) => {
                          const checked = selectedUserIds.includes(u.id);
                          return (
                            <label
                              key={u.id}
                              className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-50 select-none"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleUser(u.id)}
                                className="accent-blue-600 size-4"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">
                                  {u.name}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                  {u.email}
                                </p>
                              </div>
                              <Badge className="bg-gray-100 text-gray-600 text-xs capitalize">
                                {u.role}
                              </Badge>
                            </label>
                          );
                        })
                      )}
                    </div>

                    {selectedUserIds.length > 0 && (
                      <p className="text-xs text-gray-500">
                        {selectedUserIds.length} user
                        {selectedUserIds.length !== 1 ? "s" : ""} selected
                      </p>
                    )}
                  </div>
                )}

                {/* Subject */}
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    placeholder="Enter email subject"
                    value={sendForm.subject}
                    onChange={(e) =>
                      setSendForm({ ...sendForm, subject: e.target.value })
                    }
                    className="border-gray-200 bg-gray-100 focus:border-gray-400"
                    required
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    placeholder="Enter your message…"
                    rows={6}
                    value={sendForm.message}
                    onChange={(e) =>
                      setSendForm({ ...sendForm, message: e.target.value })
                    }
                    className="border-gray-200 bg-gray-100 focus:border-gray-400"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60"
                  disabled={sendMutation.isPending || !settingsData?.email}
                >
                  {sendMutation.isPending ? (
                    <Loader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="size-4 mr-2" />
                  )}
                  {sendMutation.isPending ? "Sending…" : "Send Email"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ──────────────────── SETTINGS TAB ───────────────────────────────── */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className={`${lusitana.className} text-xl`}>
                Email Settings (SMTP)
              </CardTitle>
              <CardDescription className="text-gray-500">
                Configure outbound email delivery
              </CardDescription>
            </CardHeader>
            <CardContent>
              {settingsError ? (
                <ErrorState
                  message={`Could not load settings: ${settingsError.message}`}
                />
              ) : settingsLoading ? (
                <div className="flex items-center gap-2 py-8 text-gray-400">
                  <Loader2 className="size-5 animate-spin" /> Loading settings…
                </div>
              ) : (
                <form onSubmit={handleSaveEmail} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>SMTP Host</Label>
                      <Input
                        value={emailForm.host}
                        onChange={(e) =>
                          setEmailForm({ ...emailForm, host: e.target.value })
                        }
                        placeholder="smtp.example.com"
                        className="border-gray-100 bg-gray-100 focus:border-gray-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>SMTP Port</Label>
                      <Input
                        type="number"
                        value={emailForm.port}
                        onChange={(e) =>
                          setEmailForm({
                            ...emailForm,
                            port: Number(e.target.value),
                          })
                        }
                        placeholder="587"
                        className="border-gray-100 bg-gray-100 focus:border-gray-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>SMTP Username</Label>
                      <Input
                        value={emailForm.username}
                        onChange={(e) =>
                          setEmailForm({
                            ...emailForm,
                            username: e.target.value,
                          })
                        }
                        placeholder="user@example.com"
                        className="border-gray-100 bg-gray-100 focus:border-gray-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>SMTP Password</Label>
                      <Input
                        type="password"
                        value={emailForm.password}
                        onChange={(e) =>
                          setEmailForm({
                            ...emailForm,
                            password: e.target.value,
                          })
                        }
                        placeholder="Leave blank to keep current"
                        className="border-gray-100 bg-gray-100 focus:border-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>From Name</Label>
                      <Input
                        value={emailForm.fromName}
                        onChange={(e) =>
                          setEmailForm({
                            ...emailForm,
                            fromName: e.target.value,
                          })
                        }
                        placeholder="RentCars"
                        className="border-gray-100 bg-gray-100 focus:border-gray-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>From Email</Label>
                      <Input
                        type="email"
                        value={emailForm.fromEmail}
                        onChange={(e) =>
                          setEmailForm({
                            ...emailForm,
                            fromEmail: e.target.value,
                          })
                        }
                        placeholder="no-reply@example.com"
                        className="border-gray-100 bg-gray-100 focus:border-gray-500"
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={updateEmailMutation.isPending}
                  >
                    {updateEmailMutation.isPending ? (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    ) : null}
                    {updateEmailMutation.isPending
                      ? "Saving…"
                      : "Save Email Settings"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

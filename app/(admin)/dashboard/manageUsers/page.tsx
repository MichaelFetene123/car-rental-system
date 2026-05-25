"use client";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableScrollArea,
} from "@/app/ui/table";
import { Badge } from "@/app/ui/badge";
import { Search, Edit, Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/app/ui/dialog";
import { Label } from "@/app/ui/lable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui/select";
import { toast } from "sonner";
// import { User, initialUsers } from "@/app/lib/data";
import { lusitana } from "@/app/ui/utils/fonts";
import { TableSkeletonRows } from "@/app/ui/skeletons";

import {
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  assignRolesToUser,
  adminUsersQueryKey,
  publicUsersQueryKey,
  rolesQueryKey,
  fetchRoles,
  type AdminUserMutationResult,
  type CreateAdminUserPayload,
  type UserRole,
  type UserStatus,
} from "@/app/lib/adminMangeUsers";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ADMIN_USERS_REFRESH_INTERVAL_MS = 15 * 1000;
const DEFAULT_VISIBLE_ROWS = 5;
const TABLE_HEADER_HEIGHT_PX = 52;
const TABLE_ROW_HEIGHT_PX = 56;

type ManagedUser = Omit<AdminUserMutationResult, "role" | "status"> & {
  role: UserRole;
  status: UserStatus;
  phone?: string | null;
};

export default function ManageUsers() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [roleDrafts, setRoleDrafts] = useState<Record<string, UserRole>>({});
  const [editingUser, setEditingUser] =
    useState<AdminUserMutationResult | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    status: "active" as UserStatus,
  });

  // fatch real user data from backend using react query and our api functions in lib/adminDasboardMangeUsers.ts

  const {
    data: adminUsersData,
    isPending: isLoadingUsers,
    error: UserError,
  } = useQuery<ManagedUser[], Error>({
    queryKey: adminUsersQueryKey,
    queryFn: async () => (await fetchAdminUsers()) as ManagedUser[],
    refetchInterval: ADMIN_USERS_REFRESH_INTERVAL_MS,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: "always",
    refetchIntervalInBackground: true,
  });

  const { data: rolesData } = useQuery({
    queryKey: rolesQueryKey,
    queryFn: ({ signal }) => fetchRoles(signal),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const syncUsersQueries = () => {
    queryClient.invalidateQueries({
      queryKey: adminUsersQueryKey,
      refetchType: "active",
    });
  };

  // create user by calling createAdminUser from lib/adminMangeUsers.ts and then refetching the users list

  const createUserMutation = useMutation({
    mutationFn: (formData: CreateAdminUserPayload) => createAdminUser(formData),
    onSuccess: () => {
      syncUsersQueries();
      setIsDialogOpen(false);
      toast.success("User created successfully");
    },
    onError: (error: any) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to create user",
      );
    },
  });

  // update user by calling updateAdminUser from lib/adminMangeUsers.ts and then refetching the users list

  const updateUserMutation = useMutation({
    mutationFn: ({
      id,
      ...updatedUser
    }: Partial<CreateAdminUserPayload> & { id: string }) =>
      updateAdminUser(id, updatedUser),
    onSuccess: () => {
      syncUsersQueries();
      setIsDialogOpen(false);
      toast.success("User updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update user",
      );
    },
  });

  // delete user by calling deleteAdminUser from lib/adminDasboardMangeUsers.ts and then refetching the users list

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => deleteAdminUser(id),
    onSuccess: () => {
      syncUsersQueries();
      toast.success("User deleted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete user",
      );
    },
  });

  // assign roles to user by calling assignRolesToUser from lib/adminDasboardMangeUsers.ts and then refetching the users list
  const assignRolesMutation = useMutation({
    mutationFn: ({ userId, roles }: { userId: string; roles: string[] }) =>
      assignRolesToUser(userId, roles),
    onSuccess: (_, variables) => {
      syncUsersQueries();
      setRoleDrafts((currentDrafts) => {
        const nextDrafts = { ...currentDrafts };
        delete nextDrafts[variables.userId];
        return nextDrafts;
      });
      toast.success("User roles updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update user roles",
      );
    },
  });

  //  add function to handle role assignment and call assignRolesMutation.mutate with the user id and selected roles
  const handleAssignRoles = (userId: string, roles: string[]) => {
    if (roles.some((role) => role === "admin")) {
      toast.error("Admin role assignment is not allowed.");
      return;
    }
    assignRolesMutation.mutate({ userId, roles });
  };

  const updateRoleDraft = (userId: string, role: UserRole) => {
    setRoleDrafts((currentDrafts) => ({
      ...currentDrafts,
      [userId]: role,
    }));
  };

  const getRoleDraft = (user: ManagedUser) => {
    return roleDrafts[user.id] ?? (user.role as UserRole);
  };

  const availableRoles = useMemo(() => {
    const roleNames = rolesData?.map((role) => role.name) ?? [];
    const fallbackRoles = adminUsersData?.map((user) => user.role) ?? [];
    const merged = new Set(["user", "stuff", ...roleNames, ...fallbackRoles]);
    merged.delete("admin");
    return Array.from(merged).sort();
  }, [rolesData, adminUsersData]);

  const formatRoleLabel = (role: string) => {
    if (role === "stuff") return "Staff";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const filterUsers = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();

    return adminUsersData
      ?.filter((user) => user.role !== "admin")
      .filter((user) => {
      const name = (user?.name ?? "").toLowerCase();
      const email = (user?.email ?? "").toLowerCase();
      const phoneMatches = (user?.phone ?? "").includes(normalizedQuery);

      return (
        name.includes(normalizedQuery) ||
        email.includes(normalizedQuery) ||
        phoneMatches
      );
    });
  }, [adminUsersData, searchQuery]);

  const visibleUsers = useMemo(
    () => adminUsersData?.filter((user) => user.role !== "admin") ?? [],
    [adminUsersData],
  );

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      password: "",
      status: "active",
    });
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: ManagedUser) => {
    setEditingUser(user);
    setFormData({
      full_name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      password: "",
      status: user.status as UserStatus,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteUser = (id: string) => {
    deleteUserMutation.mutate(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
        ...(formData.password ? { password: formData.password } : {}),
      });
    } else {
      createUserMutation.mutate({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        status: formData.status,
      });
    }
    setIsDialogOpen(false);
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "inactive":
        return "bg-gray-100 text-gray-700";
      case "suspended":
        return "bg-red-100 text-red-700";
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700";
      case "user":
        return "bg-blue-100 text-blue-700";
      case "stuff":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`${lusitana.className} text-2xl mb-1`}>Manage Users</h1>
        <p className="text-muted-foreground">
          View and manage user and admin accounts
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-blue-50 border-blue-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-900">
            <div className="text-3xl font-semibold text-blue-900">
              {visibleUsers.length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-emerald-800">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent className="text-emerald-900">
            <div className="text-3xl font-semibold text-emerald-900">
              {visibleUsers.filter((u) => u.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-amber-800">
              Admins
            </CardTitle>
          </CardHeader>
          <CardContent className="text-amber-900">
            <div className="text-3xl font-semibold text-amber-900">
              0
            </div>
          </CardContent>
        </Card>
        <Card className="bg-rose-50 border-rose-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-rose-800">
              Users
            </CardTitle>
          </CardHeader>
          <CardContent className="text-rose-900">
            <div className="text-3xl font-semibold text-rose-900">
              {visibleUsers.filter((u) => u.role === "user").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleAddUser}
              className="bg-blue-600 hover:bg-blue-500 text-white "
            >
              <Plus className="size-4 mr-2" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-none">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Edit User" : "Add New User"}
              </DialogTitle>
              <DialogDescription>
                {editingUser
                  ? "Update user details below"
                  : "Enter the details of the new user"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2 ">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  required
                  className="border-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="border-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                  className="border-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required={!editingUser}
                  className="border-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      status: value as UserStatus,
                    })
                  }
                >
                  <SelectTrigger className="border-gray-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-gray-300 bg-white">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="hover:text-gray-600 hover:border-gray-500"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                >
                  {editingUser ? "Update User" : "Add User"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-gray-50 border-none ">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>All Users</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-gray-300"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TableScrollArea className="max-h-128 rounded bg-white">
            <table className="min-w-full caption-bottom text-sm">
              <TableHeader className="[&_th]:sticky [&_th]:top-0 [&_th]:z-20 [&_th]:bg-white">
                <TableRow className=" border-gray-300">
                  <TableHead className="sticky top-0 z-30 bg-white border-b border-gray-200 pl-6 shadow-[inset_0_-1px_0_0_#d1d5db]">
                    Name
                  </TableHead>
                  <TableHead className="sticky top-0 z-30 bg-white border-b border-gray-200 pl-6 shadow-[inset_0_-1px_0_0_#d1d5db]">
                    Email
                  </TableHead>
                  <TableHead className="sticky top-0 z-30 bg-white border-b border-gray-200 pl-4 shadow-[inset_0_-1px_0_0_#d1d5db]">
                    Phone
                  </TableHead>
                  <TableHead className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-[inset_0_-1px_0_0_#d1d5db]">
                    Role
                  </TableHead>
                  <TableHead className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-[inset_0_-1px_0_0_#d1d5db]">
                    Status
                  </TableHead>
                  <TableHead className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-[inset_0_-1px_0_0_#d1d5db]">
                    Join Date
                  </TableHead>
                  <TableHead className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-[inset_0_-1px_0_0_#d1d5db]">
                    Bookings
                  </TableHead>
                  <TableHead className="sticky top-0 z-30 bg-white border-b border-gray-200 text-center shadow-[inset_0_-1px_0_0_#d1d5db]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingUsers ? (
                  <TableSkeletonRows columns={8} rows={DEFAULT_VISIBLE_ROWS} />
                ) : (
                  filterUsers?.map((user) => (
                    <TableRow key={user.id} className="border-gray-300">
                      <TableCell className="border-b border-gray-200">
                        {user.name}
                      </TableCell>
                      <TableCell className="border-b border-gray-200">
                        {user.email}
                      </TableCell>
                      <TableCell className="border-b border-gray-200">
                        {user.phone}
                      </TableCell>
                      <TableCell className="border-b border-gray-200">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="border-b border-gray-200">
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="border-b border-gray-200">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="border-b border-gray-200">
                        {user.totalBookings ?? 0}
                      </TableCell>
                      <TableCell className="border-b border-gray-200 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex items-center justify-center gap-2">
                            <Select
                              value={getRoleDraft(user)}
                              onValueChange={(value) =>
                                updateRoleDraft(user.id, value as UserRole)
                              }
                            >
                              <SelectTrigger className="h-9 w-32 border-gray-300 bg-white text-left">
                                <SelectValue placeholder="Role" />
                              </SelectTrigger>
                              <SelectContent className="border-gray-300 bg-white">
                                {availableRoles.map((role) => (
                                  <SelectItem key={role} value={role}>
                                    {formatRoleLabel(role)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-500 text-white"
                              disabled={
                                assignRolesMutation.isPending ||
                                getRoleDraft(user) === user.role
                              }
                              onClick={() =>
                                handleAssignRoles(user.id, [getRoleDraft(user)])
                              }
                            >
                              Save
                            </Button>
                          </div>
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditUser(user)}
                            >
                              <Edit className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="size-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </table>
          </TableScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

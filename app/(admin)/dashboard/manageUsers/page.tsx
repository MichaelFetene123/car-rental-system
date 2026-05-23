"use client";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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

import {
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  assignRolesToUser,
  adminUsersQueryKey,
  publicUsersQueryKey,
  type AdminUserMutationResult,
  type AdminUsers,
  type userData,
} from "@/app/lib/adminMangeUsers";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ADMIN_USERS_REFRESH_INTERVAL_MS = 15 * 1000;
const DEFAULT_VISIBLE_ROWS = 5;
const TABLE_HEADER_HEIGHT_PX = 52;
const TABLE_ROW_HEIGHT_PX = 56;

type ManagedUser = Omit<AdminUserMutationResult, "role" | "status"> & {
  role: userData["role"];
  status: userData["status"];
  phone?: string | null;
};

export default function ManageUsers() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUsers | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "customer" as userData["role"],
    status: "active" as userData["status"],
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

  const syncUsersQueries = () => {
    queryClient.invalidateQueries({
      queryKey: adminUsersQueryKey,
      refetchType: "active",
    });
  };

  // create user by calling createAdminUser from lib/adminMangeUsers.ts and then refetching the users list

  const createUserMutation = useMutation({
    mutationFn: (formData: userData) => createAdminUser(formData),
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
    mutationFn: ({ id, ...updatedUser }: Partial<userData> & { id: string }) =>
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
    onSuccess: () => {
      syncUsersQueries();
      toast.success("User roles updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update user roles",
      );
    },
  });

// todo: add function to handle role assignment and call assignRolesMutation.mutate with the user id and selected roles
const handleAssignRoles = (userId: string, roles: string[]) => {
  assignRolesMutation.mutate({ userId, roles });
}

  const filterUsers = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase().trim();

    return adminUsersData?.filter((user) => {
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

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "customer",
      status: "active",
    });
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: ManagedUser) => {
    setEditingUser(user as AdminUsers);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      role: user.role as userData["role"],
      status: user.status as userData["status"],
    });
    setIsDialogOpen(true);
  };

  const handleDeleteUser = (id: string) => {
    deleteUserMutation.mutate(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, ...formData });
    } else {
      createUserMutation.mutate(formData);
    }
    setIsDialogOpen(false);
  };

  const getStatusColor = (status: userData["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "inactive":
        return "bg-gray-100 text-gray-700";
      case "suspended":
        return "bg-red-100 text-red-700";
    }
  };

  const getRoleColor = (role: userData["role"]) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700";
      case "customer":
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
          View and manage customer and admin accounts
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
              {adminUsersData?.length}
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
              {adminUsersData?.filter((u) => u.status === "active").length}
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
              {adminUsersData?.filter((u) => u.role === "admin").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-rose-50 border-rose-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-rose-800">
              Customers
            </CardTitle>
          </CardHeader>
          <CardContent className="text-rose-900">
            <div className="text-3xl font-semibold text-rose-900">
              {adminUsersData?.filter((u) => u.role === "customer").length}
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
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
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
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      role: value as userData["role"],
                    })
                  }
                >
                  <SelectTrigger className="border-gray-500 ">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-gray-300 bg-white">
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="stuff">Stuff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      status: value as userData["status"],
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
          <Table containerClassName="bg-white rounded-lg">
            <TableHeader>
              <TableRow className=" border-gray-300">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filterUsers?.map((user) => (
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
                  <TableCell className="border-b border-gray-200 text-right">
                    <div className="flex justify-end gap-2">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";
import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/ui/dialog";
import { Label } from "@/app/ui/lable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui/select";
import { Checkbox } from "@/app/ui/checkbox";
import { Shield, UserCog, Edit, Trash2, Plus } from "lucide-react";
import { lusitana } from "@/app/ui/utils/fonts";

interface Permission {
  id: string;
  name: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  type: "super_admin" | "staff" | "agent";
  permissions: string[];
  userCount: number;
  createdAt: string;
}

const PERMISSIONS: Permission[] = [
  { id: "view_dashboard", name: "View Dashboard", category: "Dashboard" },
  { id: "manage_cars", name: "Manage Cars", category: "Cars" },
  { id: "view_cars", name: "View Cars", category: "Cars" },
  { id: "manage_bookings", name: "Manage Bookings", category: "Bookings" },
  { id: "view_bookings", name: "View Bookings", category: "Bookings" },
  { id: "cancel_bookings", name: "Cancel Bookings", category: "Bookings" },
  { id: "manage_users", name: "Manage Users", category: "Users" },
  { id: "view_users", name: "View Users", category: "Users" },
  { id: "manage_payments", name: "Manage Payments", category: "Payments" },
  { id: "view_payments", name: "View Payments", category: "Payments" },
  { id: "process_refunds", name: "Process Refunds", category: "Payments" },
  { id: "manage_pricing", name: "Manage Pricing", category: "Pricing" },
  { id: "view_reports", name: "View Reports", category: "Reports" },
  { id: "manage_locations", name: "Manage Locations", category: "Locations" },
  { id: "manage_roles", name: "Manage Roles & Permissions", category: "Roles" },
  {
    id: "manage_notifications",
    name: "Manage Notifications",
    category: "Notifications",
  },
  {
    id: "manage_integrations",
    name: "Manage Integrations",
    category: "Integrations",
  },
  { id: "manage_api", name: "Manage API & Webhooks", category: "API" },
];

export default function ManageRoles() {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: "1",
      name: "Super Admin",
      type: "super_admin",
      permissions: PERMISSIONS.map((p) => p.id),
      userCount: 2,
      createdAt: "2024-01-01",
    },
    {
      id: "2",
      name: "Staff",
      type: "staff",
      permissions: [
        "view_dashboard",
        "view_cars",
        "manage_bookings",
        "view_bookings",
        "view_users",
        "view_payments",
      ],
      userCount: 8,
      createdAt: "2024-01-01",
    },
    {
      id: "3",
      name: "Agent",
      type: "agent",
      permissions: [
        "view_dashboard",
        "view_cars",
        "view_bookings",
        "view_users",
      ],
      userCount: 15,
      createdAt: "2024-01-01",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "staff" as Role["type"],
    permissions: [] as string[],
  });

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      type: role.type,
      permissions: role.permissions,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this role?")) {
      setRoles(roles.filter((role) => role.id !== id));
    }
  };

  const handleSubmit = () => {
    if (editingRole) {
      setRoles(
        roles.map((role) =>
          role.id === editingRole.id ? { ...role, ...formData } : role,
        ),
      );
    } else {
      const newRole: Role = {
        id: Date.now().toString(),
        ...formData,
        userCount: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setRoles([...roles, newRole]);
    }
    setIsDialogOpen(false);
    setEditingRole(null);
    setFormData({ name: "", type: "staff", permissions: [] });
  };

  const togglePermission = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const permissionsByCategory = PERMISSIONS.reduce(
    (acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    },
    {} as Record<string, Permission[]>,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`${lusitana.className} text-2xl pb-2 `}>Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Manage admin roles and access control
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingRole(null);
                setFormData({ name: "", type: "staff", permissions: [] });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="size-4 mr-2" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-white border-none">
            <DialogHeader>
              <DialogTitle>
                {editingRole ? "Edit Role" : "Create New Role"}
              </DialogTitle>
              <DialogDescription>
                Define role name, type, and permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Role Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Manager, Supervisor"
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label>Role Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: Role["type"]) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-none">
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="space-y-4">
                  {Object.entries(permissionsByCategory).map(
                    ([category, permissions]) => (
                      <div
                        key={category}
                        className="border rounded-lg p-4 border-gray-300"
                      >
                        <h4 className="font-semibold mb-3">{category}</h4>
                        <div className="space-y-2">
                          {permissions.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={permission.id}
                                checked={formData.permissions.includes(
                                  permission.id,
                                )}
                                onCheckedChange={() =>
                                  togglePermission(permission.id)
                                }
                                className="peer text-white data-[state=checked]:bg-blue-600 border-gray-500"
                              />
                              <label
                                htmlFor={permission.id}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {permission.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="hover:border-gray-400 text-black hover:text-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {editingRole ? "Save Changes" : "Create Role"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-blue-100">
                    {role.type === "super_admin" ? (
                      <Shield className="size-6 text-blue-600" />
                    ) : (
                      <UserCog className="size-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <CardTitle>{role.name}</CardTitle>
                    <CardDescription>
                      {role.userCount} {role.userCount === 1 ? "user" : "users"}{" "}
                      • Created {role.createdAt}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      role.type === "super_admin" ? "default" : "secondary"
                    }
                    className={`${role.type === "super_admin" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
                  >
                    {role.type.replace("_", " ").toUpperCase()}
                  </Badge>
                  {role.type !== "super_admin" && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(role)}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(role.id)}
                      >
                        <Trash2 className="size-4 text-red-600" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <h4 className="text-sm font-semibold mb-2">
                  Permissions ({role.permissions.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.slice(0, 10).map((permId) => {
                    const perm = PERMISSIONS.find((p) => p.id === permId);
                    return perm ? (
                      <Badge key={permId} variant="outline">
                        {perm.name}
                      </Badge>
                    ) : null;
                  })}
                  {role.permissions.length > 10 && (
                    <Badge variant="outline">
                      +{role.permissions.length - 10} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

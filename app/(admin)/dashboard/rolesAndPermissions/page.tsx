"use client";
import { useCallback, useMemo, useState, useEffect } from "react";
import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/ui/dialog";
import { Checkbox } from "@/app/ui/checkbox";
import { Label } from "@/app/ui/lable";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/app/ui/select";
import { Badge } from "@/app/ui/badge";
import { RoleCardsSkeleton } from "@/app/ui/skeletons";
import { CURRENT_USER_QUERY_KEY } from "@/app/lib/auth-queries";
import { useQueryClient } from "@tanstack/react-query";
import { Shield, UserCog, Edit, Trash2, Plus } from "lucide-react";
import { lusitana } from "@/app/ui/utils/fonts";
import { toast } from "sonner";
import {
  createRole,
  deleteRole,
  fetchPermissions,
  fetchRolesWithPermissions,
  updateRole,
  type Permission,
  type Role,
} from "@/app/lib/roles-permissions";
import { fetchCurrentUser, type CurrentUser } from "@/app/lib/auth";
import { isAdmin, can } from "@/app/lib/permissions";
import { isCurrentUserAdmin } from "@/app/lib/auth";

const ROLE_TYPE_LABELS: Record<Role["type"], string> = {
  admin: "Admin",
  stuff: "Stuff",
  user: "User",
};

const formatCategory = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());

const MANAGE_ROLES_PERMISSION = "manage_roles";
const DEFAULT_ROLE_NAMES = new Set(["admin", "stuff", "user"]);

const canManageRoles = (user: CurrentUser | null) =>
  isCurrentUserAdmin() ||
  isAdmin(user?.roles) ||
  can(user, MANAGE_ROLES_PERMISSION);

export default function ManageRoles() {
  const queryClient = useQueryClient();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingDeleteAt, setPendingDeleteAt] = useState<number | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "stuff" as Role["type"],
    permissions: [] as string[],
  });

  const isProtectedRole = (role: Role) => DEFAULT_ROLE_NAMES.has(role.name);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [rolesData, permsData, currentUserData] = await Promise.all([
        fetchRolesWithPermissions(),
        fetchPermissions(),
        fetchCurrentUser(),
      ]);
      setRoles(rolesData || []);
      setPermissions(permsData || []);
      setCurrentUser(currentUserData || null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load data";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      type: role.type,
      permissions: role.permissions.map((p) => p.id),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const role = roles.find((item) => item.id === id);
    if (role && isProtectedRole(role)) {
      toast.warning("Default system roles cannot be deleted.");
      return;
    }

    const now = Date.now();
    const isConfirming =
      pendingDeleteId === id &&
      pendingDeleteAt !== null &&
      now - pendingDeleteAt < 5000;

    if (!isConfirming) {
      setPendingDeleteId(id);
      setPendingDeleteAt(now);
      toast.warning("Click delete again to confirm.");
      return;
    }

    setPendingDeleteId(null);
    setPendingDeleteAt(null);

    try {
      setIsSaving(true);
      await deleteRole(id);
      toast.success("Role deleted successfully.");
      await loadData();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete role";
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      const message = "Role name is required.";
      setError(message);
      toast.error(message);
      return;
    }

    if (formData.permissions.length === 0) {
      const message = "Select at least one permission.";
      setError(message);
      toast.error(message);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (editingRole) {
        await updateRole(editingRole.id, {
          name: formData.name,
          type: formData.type,
          permissionIds: formData.permissions,
        });
        toast.success("Role updated successfully.");
      } else {
        await createRole({
          name: formData.name,
          type: formData.type,
          permissionIds: formData.permissions,
        });
        toast.success("Role created successfully.");
      }

      setIsDialogOpen(false);
      setEditingRole(null);
      setFormData({ name: "", type: "stuff", permissions: [] });
      await loadData();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save role";
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const togglePermission = (permissionId: string) => {
    setFormData((prev) => {
      const isSelected = prev.permissions.includes(permissionId);
      const nextPermissions = isSelected
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId];
      const permission = permissions.find((item) => item.id === permissionId);

      if (permission) {
        if (isSelected) {
          toast.warning(`Removed ${permission.name} permission.`);
        } else {
          toast.success(`Added ${permission.name} permission.`);
        }
      }

      return {
        ...prev,
        permissions: nextPermissions,
      };
    });
  };

  const permissionsByCategory = useMemo(() => {
    return permissions.reduce(
      (acc, permission) => {
        if (!acc[permission.category]) {
          acc[permission.category] = [];
        }
        acc[permission.category].push(permission);
        return acc;
      },
      {} as Record<string, Permission[]>,
    );
  }, [permissions]);

  const isAuthorized = canManageRoles(currentUser);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`${lusitana.className} text-2xl pb-2 `}>
            Roles & Permissions
          </h1>
          <p className="text-muted-foreground">
            Manage admin roles and access control
          </p>
        </div>
        {isAuthorized && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingRole(null);
                  setFormData({ name: "", type: "stuff", permissions: [] });
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
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="stuff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label>Permissions</Label>
                  <div className="space-y-4">
                    {Object.entries(permissionsByCategory).map(
                      ([category, groupedPermissions]) => (
                        <div
                          key={category}
                          className="border rounded-lg p-4 border-gray-300"
                        >
                          <h4 className="font-semibold mb-3">
                            {formatCategory(category)}
                          </h4>
                          <div className="space-y-2">
                            {groupedPermissions.map((permission) => (
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
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSaving}
                >
                  {editingRole ? "Save Changes" : "Create Role"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Loading skeleton - shows immediately on mount, before auth resolves */}
      {isLoading && <RoleCardsSkeleton count={3} />}

      {/* Error state */}
      {!isLoading && error && (
        <Card>
          <CardContent className="py-4 text-sm text-red-600">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Access denied */}
      {!isLoading && !error && !isAuthorized && (
        <Card>
          <CardHeader>
            <CardTitle>Read-only mode</CardTitle>
            <CardDescription>
              Role management actions are disabled for your current permissions.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Real content */}
      {!isLoading && !error && isAuthorized && (
        <div className="grid gap-6">
          {roles.length === 0 && (
            <Card>
              <CardContent className="py-6 text-sm text-muted-foreground">
                No roles found. Create your first role to get started.
              </CardContent>
            </Card>
          )}

          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-blue-100">
                      {role.type === "admin" ? (
                        <Shield className="size-6 text-blue-600" />
                      ) : (
                        <UserCog className="size-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <CardTitle>{role.name}</CardTitle>
                      <CardDescription>
                        {role.userCount}{" "}
                        {role.userCount === 1 ? "user" : "users"}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={role.type === "admin" ? "default" : "secondary"}
                      className={`${role.type === "admin" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
                    >
                      {ROLE_TYPE_LABELS[role.type]}
                    </Badge>
                    {role.name !== 'user' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(role)}
                        disabled={isSaving}
                      >
                        <Edit className="size-4" />
                      </Button>
                    )}
                    {!isProtectedRole(role) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(role.id)}
                        disabled={isSaving}
                      >
                        <Trash2 className="size-4 text-red-600" />
                      </Button>
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
                    {role.permissions.slice(0, 10).map((permission) => (
                      <Badge key={permission.id} variant="outline">
                        {permission.name}
                      </Badge>
                    ))}
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
      )}
    </div>
  );
}

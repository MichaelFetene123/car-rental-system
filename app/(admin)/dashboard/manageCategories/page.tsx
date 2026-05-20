"use client";

import { useMemo, useState } from "react";
import { lusitana } from "@/app/ui/utils/fonts";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { Button } from "@/app/ui/button";
import { Badge } from "@/app/ui/badge";
import { Input } from "@/app/ui/input";
import { Label } from "@/app/ui/lable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/ui/table";
import { toast } from "sonner";
import { CarFront, Edit, Plus, Search, Tags, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ADMIN_CAR_CATEGORIES_QUERY_KEY,
  PUBLIC_CAR_CATEGORIES_QUERY_KEY,
  fetchAdminCarCategories,
  createAdminCarCategory,
  updateAdminCarCategory,
  deleteAdminCarCategory,
  type AdminCarCategory,
} from "@/app/lib/car-categories";

const ADMIN_CATEGORIES_REFRESH_INTERVAL_MS = 15 * 1000;

const formatUpdatedDate = (updatedAt: string): string => {
  try {
    return new Date(updatedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return updatedAt;
  }
};

export default function ManageCategoriesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCarCategory | null>(
    null,
  );
  const [categoryName, setCategoryName] = useState("");

  const {
    data: categories = [],
    isPending: isLoadingCategories,
    error: categoriesError,
    isFetching: isRefreshingCategories,
  } = useQuery<AdminCarCategory[], Error>({
    queryKey: ADMIN_CAR_CATEGORIES_QUERY_KEY,
    queryFn: ({ signal }) => fetchAdminCarCategories(signal),
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: "always",
    refetchInterval: ADMIN_CATEGORIES_REFRESH_INTERVAL_MS,
    refetchIntervalInBackground: true,
  });

  const syncCategoryQueries = () => {
    void queryClient.invalidateQueries({
      queryKey: ADMIN_CAR_CATEGORIES_QUERY_KEY,
      refetchType: "active",
    });
    void queryClient.invalidateQueries({
      queryKey: PUBLIC_CAR_CATEGORIES_QUERY_KEY,
      refetchType: "active",
    });
  };

  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => createAdminCarCategory({ name }),
    onSuccess: () => {
      toast.success("Category added");
      setIsDialogOpen(false);
      syncCategoryQueries();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to add category",
      );
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { name?: string; isActive?: boolean };
    }) => updateAdminCarCategory(id, payload),
    onSuccess: (_data, variables) => {
      if (typeof variables.payload.isActive === "boolean") {
        toast.success(
          variables.payload.isActive
            ? "Category activated"
            : "Category deactivated",
        );
      } else {
        toast.success("Category updated");
        setIsDialogOpen(false);
      }
      syncCategoryQueries();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to update category",
      );
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteAdminCarCategory(id),
    onSuccess: () => {
      toast.success("Category deleted");
      syncCategoryQueries();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete category",
      );
    },
  });

  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [categories, searchQuery]);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryName("");
    setIsDialogOpen(true);
  };

  const handleEditCategory = (category: AdminCarCategory) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setIsDialogOpen(true);
  };

  const handleDeleteCategory = (id: string) => {
    const target = categories.find((category) => category.id === id);

    if (!target) return;

    if (target.carsCount > 0) {
      toast.error("Cannot delete a category that is used by cars");
      return;
    }

    deleteCategoryMutation.mutate(id);
  };

  const handleToggleStatus = (id: string) => {
    const target = categories.find((category) => category.id === id);
    if (!target) return;
    updateCategoryMutation.mutate({
      id,
      payload: { isActive: !target.isActive },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedName = categoryName.trim();

    if (!normalizedName) {
      toast.error("Category name is required");
      return;
    }

    const duplicate = categories.find(
      (category) =>
        category.name.toLowerCase() === normalizedName.toLowerCase() &&
        category.id !== editingCategory?.id,
    );

    if (duplicate) {
      toast.error("Category already exists");
      return;
    }

    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        payload: { name: normalizedName },
      });
    } else {
      createCategoryMutation.mutate(normalizedName);
    }
  };

  const activeCount = categories.filter((category) => category.isActive).length;
  const totalCars = categories.reduce(
    (sum, category) => sum + category.carsCount,
    0,
  );
  const isSubmitting =
    createCategoryMutation.isPending || updateCategoryMutation.isPending;
  const isMutatingCategory =
    isSubmitting || deleteCategoryMutation.isPending;

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`${lusitana.className} text-2xl mb-1`}>
            Manage Categories
          </h1>
          <p className="text-muted-foreground">
            Add and maintain car categories for your fleet.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button
            onClick={handleAddCategory}
            className="bg-blue-600 text-white hover:bg-blue-500"
          >
            <Plus className="size-4" />
            Add Category
          </Button>
          <DialogContent className="max-w-md bg-white border-none">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Edit Category" : "Create Category"}
              </DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? "Update the selected category name"
                  : "Create a new category for vehicle grouping"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Category Name</Label>
                <Input
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Luxury SUV"
                  className="border-gray-400"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingCategory
                      ? "Save changes"
                      : "Create category"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:gap-5 md:grid-cols-3">
        <Card className="bg-blue-50 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-800">
              Total Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-bold text-blue-900">
              {categories.length}
            </span>
            <Tags className="size-5 text-blue-700" />
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 border-emerald-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-emerald-800">
              Active Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-bold text-emerald-900">
              {activeCount}
            </span>
            <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-amber-800">
              Assigned Cars
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-2xl font-bold text-amber-900">
              {totalCars}
            </span>
            <CarFront className="size-5 text-amber-700" />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-50 border-none">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>
              Category List
              {isRefreshingCategories ? (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  Refreshing...
                </span>
              ) : null}
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search category..."
                className="pl-9 border-gray-300 bg-white"
                disabled={isLoadingCategories}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-1 sm:pt-2">
          <div className="rounded-lg bg-white p-4">
            {categoriesError ? (
              <p className="mb-4 text-sm text-red-700">
                Failed to load categories. {categoriesError.message}
              </p>
            ) : null}
            <Table>
              <TableHeader>
                <TableRow className="border-gray-300">
                  <TableHead>Name</TableHead>
                  <TableHead>Cars</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right pr-7">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingCategories ? (
                  <TableRow className="border-gray-300">
                    <TableCell colSpan={5} className="py-6 text-center">
                      Loading categories...
                    </TableCell>
                  </TableRow>
                ) : filteredCategories.length === 0 ? (
                  <TableRow className="border-gray-300">
                    <TableCell colSpan={5} className="py-6 text-center">
                      {searchQuery.trim()
                        ? "No categories match your search."
                        : "No categories found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id} className="border-gray-300">
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell>{category.carsCount}</TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(category.id)}
                          className=" rounded-full "
                          disabled={isMutatingCategory}
                        >
                          <Badge
                            className={
                              category.isActive
                                ? "bg-green-100 text-green-700 border border-green-500 hover:bg-green-200 hover:shadow-3xl"
                                : "bg-gray-100 text-gray-700 border border-gray-500 hover:bg-gray-200 hover:shadow-3xl"
                            }
                          >
                            {category.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell>{formatUpdatedDate(category.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditCategory(category)}
                            disabled={isMutatingCategory}
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCategory(category.id)}
                            disabled={isMutatingCategory}
                          >
                            <Trash2 className="size-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

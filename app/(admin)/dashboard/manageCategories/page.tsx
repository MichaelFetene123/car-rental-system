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
  DialogTrigger,
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

type Category = {
  id: string;
  name: string;
  carsCount: number;
  isActive: boolean;
  updatedAt: string;
};

const initialCategories: Category[] = [
  {
    id: "cat-1",
    name: "Sedan",
    carsCount: 12,
    isActive: true,
    updatedAt: "2026-03-20",
  },
  {
    id: "cat-2",
    name: "SUV",
    carsCount: 8,
    isActive: true,
    updatedAt: "2026-03-19",
  },
  {
    id: "cat-3",
    name: "Electric",
    carsCount: 5,
    isActive: true,
    updatedAt: "2026-03-12",
  },
  {
    id: "cat-4",
    name: "Sports",
    carsCount: 3,
    isActive: true,
    updatedAt: "2026-03-10",
  },
  {
    id: "cat-5",
    name: "Compact",
    carsCount: 0,
    isActive: false,
    updatedAt: "2026-03-08",
  },
];

export default function ManageCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");

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

  const handleEditCategory = (category: Category) => {
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

    setCategories(categories.filter((category) => category.id !== id));
    toast.success("Category deleted");
  };

  const handleToggleStatus = (id: string) => {
    setCategories(
      categories.map((category) =>
        category.id === id
          ? {
              ...category,
              isActive: !category.isActive,
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : category,
      ),
    );
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
      setCategories(
        categories.map((category) =>
          category.id === editingCategory.id
            ? {
                ...category,
                name: normalizedName,
                updatedAt: new Date().toISOString().slice(0, 10),
              }
            : category,
        ),
      );
      toast.success("Category updated");
    } else {
      setCategories([
        {
          id: `cat-${Date.now()}`,
          name: normalizedName,
          carsCount: 0,
          isActive: true,
          updatedAt: new Date().toISOString().slice(0, 10),
        },
        ...categories,
      ]);
      toast.success("Category added");
    }

    setIsDialogOpen(false);
  };

  const activeCount = categories.filter((category) => category.isActive).length;
  const totalCars = categories.reduce(
    (sum, category) => sum + category.carsCount,
    0,
  );

  return (
    <div className="space-y-6">
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
          <DialogTrigger asChild>
            <Button
              onClick={handleAddCategory}
              className="bg-blue-600 text-white hover:bg-blue-500"
            >
              <Plus className="size-4" />
              Add Category
            </Button>
          </DialogTrigger>
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
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 text-white">
                  {editingCategory ? "Save changes" : "Create category"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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
            <CardTitle>Category List</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search category..."
                className="pl-9 border-gray-300 bg-white"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-lg bg-white p-4">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-300">
                  <TableHead>Name</TableHead>
                  <TableHead>Cars</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
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
                    <TableCell>{category.updatedAt}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

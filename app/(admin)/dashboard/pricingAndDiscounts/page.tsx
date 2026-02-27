"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/ui/card";
import { Button } from "@/app/ui/button";
import { Input } from "@/app/ui/input";
import { Label } from "@/app/ui/lable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/ui/table";
import { Badge } from "@/app/ui/badge";
import { Plus, Edit, Trash2, Percent, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/app/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui/select";
import { Switch } from "@/app/ui/switch";
import { toast } from "sonner";

interface PricingRule {
  id: string;
  name: string;
  type: "base" | "seasonal" | "discount";
  category: string;
  value: number;
  isPercentage: boolean;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
}

const initialPricing: PricingRule[] = [
  {
    id: "1",
    name: "Base Sedan Rate",
    type: "base",
    category: "Sedan",
    value: 75,
    isPercentage: false,
    isActive: true,
  },
  {
    id: "2",
    name: "Base SUV Rate",
    type: "base",
    category: "SUV",
    value: 95,
    isPercentage: false,
    isActive: true,
  },
  {
    id: "3",
    name: "Summer Discount",
    type: "discount",
    category: "All",
    value: 15,
    isPercentage: true,
    startDate: "2026-06-01",
    endDate: "2026-08-31",
    isActive: true,
  },
  {
    id: "4",
    name: "Winter Premium",
    type: "seasonal",
    category: "All",
    value: 10,
    isPercentage: true,
    startDate: "2026-12-01",
    endDate: "2026-02-28",
    isActive: true,
  },
  {
    id: "5",
    name: "Weekend Special",
    type: "discount",
    category: "Compact",
    value: 20,
    isPercentage: true,
    isActive: true,
  },
];

export default function ManagePricing() {
  const [pricing, setPricing] = useState<PricingRule[]>(initialPricing);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "base" as PricingRule["type"],
    category: "",
    value: "",
    isPercentage: false,
    startDate: "",
    endDate: "",
  });

  const handleAddRule = () => {
    setEditingRule(null);
    setFormData({
      name: "",
      type: "base",
      category: "",
      value: "",
      isPercentage: false,
      startDate: "",
      endDate: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditRule = (rule: PricingRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      type: rule.type,
      category: rule.category,
      value: rule.value.toString(),
      isPercentage: rule.isPercentage,
      startDate: rule.startDate || "",
      endDate: rule.endDate || "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteRule = (id: string) => {
    setPricing(pricing.filter((rule) => rule.id !== id));
    toast.success("Pricing rule deleted");
  };

  const handleToggleActive = (id: string) => {
    setPricing(
      pricing.map((rule) =>
        rule.id === id ? { ...rule, isActive: !rule.isActive } : rule,
      ),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ruleData = {
      ...formData,
      value: parseFloat(formData.value),
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
    };

    if (editingRule) {
      setPricing(
        pricing.map((rule) =>
          rule.id === editingRule.id ? { ...rule, ...ruleData } : rule,
        ),
      );
      toast.success("Pricing rule updated");
    } else {
      const newRule: PricingRule = {
        id: Date.now().toString(),
        ...ruleData,
        isActive: true,
      };
      setPricing([...pricing, newRule]);
      toast.success("Pricing rule added");
    }
    setIsDialogOpen(false);
  };

  const getTypeColor = (type: PricingRule["type"]) => {
    switch (type) {
      case "base":
        return "bg-blue-100 text-blue-700";
      case "seasonal":
        return "bg-purple-100 text-purple-700";
      case "discount":
        return "bg-green-100 text-green-700";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl mb-1">Pricing & Discounts</h1>
          <p className="text-muted-foreground">
            Manage pricing rules, seasonal rates, and discount codes
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleAddRule}
              className="text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="size-4 mr-2" />
              Add Pricing Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-none">
            <DialogHeader>
              <DialogTitle>
                {editingRule ? "Edit Pricing Rule" : "Add New Pricing Rule"}
              </DialogTitle>
              <DialogDescription>
                {editingRule
                  ? "Update the pricing rule details"
                  : "Create a new pricing rule or discount"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Rule Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="border-gray-300 "
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      type: value as PricingRule["type"],
                    })
                  }
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-none bg-white">
                    <SelectItem value="base">Base Rate</SelectItem>
                    <SelectItem value="seasonal">Seasonal Rate</SelectItem>
                    <SelectItem value="discount">Discount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="border-none bg-white">
                    <SelectItem value="All">All Categories</SelectItem>
                    <SelectItem value="Sedan">Sedan</SelectItem>
                    <SelectItem value="SUV">SUV</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                    <SelectItem value="Compact">Compact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    className="border-gray-300"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isPercentage">Unit</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="isPercentage"
                      className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-400 [&_[data-slot=switch-thumb]]:bg-white"
                      checked={formData.isPercentage}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isPercentage: checked })
                      }
                    />
                    <Label htmlFor="isPercentage" className="cursor-pointer">
                      {formData.isPercentage ? "Percentage" : "Fixed Amount"}
                    </Label>
                  </div>
                </div>
              </div>
              {(formData.type === "seasonal" ||
                formData.type === "discount") && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="border-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className="border-gray-300"
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className=" hover:border-gray-400"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingRule ? "Update Rule" : "Add Rule"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-semibold">Pricing Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-300">
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricing.map((rule) => (
                  <TableRow key={rule.id} className="border-gray-300">
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(rule.type)}>
                        {rule.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{rule.category}</TableCell>
                    <TableCell>
                      {rule.isPercentage ? (
                        <span className="flex items-center gap-1">
                          <Percent className="size-3" />
                          {rule.value}%
                        </span>
                      ) : (
                        `$${rule.value}`
                      )}
                    </TableCell>
                    <TableCell>{formatDate(rule.startDate)}</TableCell>
                    <TableCell>{formatDate(rule.endDate)}</TableCell>
                    <TableCell>
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={() => handleToggleActive(rule.id)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditRule(rule)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRule(rule.id)}
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

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Pricing Rules
            </CardTitle>
            <Tag className="size-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {pricing.filter((p) => p.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Discounts
            </CardTitle>
            <Percent className="size-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {
                pricing.filter((p) => p.type === "discount" && p.isActive)
                  .length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Seasonal Rates
            </CardTitle>
            <Tag className="size-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {
                pricing.filter((p) => p.type === "seasonal" && p.isActive)
                  .length
              }
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

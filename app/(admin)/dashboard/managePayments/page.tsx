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
import { Textarea } from "@/app/ui/textarea";
import {
  DollarSign,
  CreditCard,
  Smartphone,
  Banknote,
  Receipt,
  RefreshCw,
  AlertCircle,
  Download,
  Eye,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/ui/table";
import { lusitana } from "@/app/ui/utils/fonts";

interface Payment {
  id: string;
  bookingId: string;
  customerName: string;
  amount: number;
  method: "credit_card" | "mobile_money" | "cash";
  status: "pending" | "completed" | "refunded" | "failed";
  transactionId: string;
  date: string;
  invoiceNumber: string;
  tax: number;
  fees: number;
}

const mockPayments: Payment[] = [
  {
    id: "1",
    bookingId: "BK-2024-001",
    customerName: "John Doe",
    amount: 450,
    method: "credit_card",
    status: "completed",
    transactionId: "TXN-001234",
    date: "2024-02-20",
    invoiceNumber: "INV-001",
    tax: 45,
    fees: 0,
  },
  {
    id: "2",
    bookingId: "BK-2024-002",
    customerName: "Jane Smith",
    amount: 680,
    method: "mobile_money",
    status: "completed",
    transactionId: "TXN-001235",
    date: "2024-02-21",
    invoiceNumber: "INV-002",
    tax: 68,
    fees: 20,
  },
  {
    id: "3",
    bookingId: "BK-2024-003",
    customerName: "Mike Johnson",
    amount: 320,
    method: "cash",
    status: "pending",
    transactionId: "TXN-001236",
    date: "2024-02-22",
    invoiceNumber: "INV-003",
    tax: 32,
    fees: 0,
  },
];

export default function ManagePayments() {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMethod, setFilterMethod] = useState("all");

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || payment.status === filterStatus;
    const matchesMethod =
      filterMethod === "all" || payment.method === filterMethod;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const handleRefund = () => {
    if (selectedPayment) {
      setPayments(
        payments.map((payment) =>
          payment.id === selectedPayment.id
            ? { ...payment, status: "refunded" as const }
            : payment,
        ),
      );
      setIsRefundDialogOpen(false);
      setSelectedPayment(null);
      setRefundAmount("");
      setRefundReason("");
    }
  };

  const getStatusColor = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMethodIcon = (method: Payment["method"]) => {
    switch (method) {
      case "credit_card":
        return <CreditCard className="size-4" />;
      case "mobile_money":
        return <Smartphone className="size-4" />;
      case "cash":
        return <Banknote className="size-4" />;
    }
  };

  const totalRevenue = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);
  const refundedAmount = payments
    .filter((p) => p.status === "refunded")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`${lusitana.className} text-2xl pb-2`}>Payment & Billing Management</h1>
        <p className="text-muted-foreground">
          Track payments, process refunds, and manage invoices
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Completed payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="size-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${pendingAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refunded</CardTitle>
            <RefreshCw className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${refundedAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total refunds</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Receipt className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Search by customer, booking, or invoice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="md:w-96 bg-sky-100 border-none"
            />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="md:w-48 border-gray-300 bg-sky-100">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="border-none bg-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterMethod} onValueChange={setFilterMethod}>
              <SelectTrigger className="md:w-48 border-gray-300 bg-sky-100 ">
                <SelectValue placeholder="Filter by method" />
              </SelectTrigger>
              <SelectContent className="border-none bg-white">
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg border-gray-300">
            <Table className="">
              <TableHeader>
                <TableRow className="border-gray-300">
                  <TableHead>Invoice</TableHead>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Tax/Fees</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id} className="border-gray-300">
                    <TableCell className="font-medium">
                      {payment.invoiceNumber}
                    </TableCell>
                    <TableCell>{payment.bookingId}</TableCell>
                    <TableCell>{payment.customerName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getMethodIcon(payment.method)}
                        <span className="capitalize">
                          {payment.method.replace("_", " ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${payment.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      ${(payment.tax + payment.fees).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusColor(payment.status)}
                        variant="secondary"
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="View Details"
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Download Invoice"
                        >
                          <Download className="size-4" />
                        </Button>
                        {payment.status === "completed" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Process Refund"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setRefundAmount(payment.amount.toString());
                              setIsRefundDialogOpen(true);
                            }}
                          >
                            <RefreshCw className="size-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Refund Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent className="bg-white border-none">
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Issue a refund for payment {selectedPayment?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Refund Amount</Label>
              <Input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="Enter refund amount"
                className="border-gray-300 focus:border-gray-700"
              />
              <p className="text-xs text-muted-foreground">
                Original amount: ${selectedPayment?.amount.toFixed(2)}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Reason for Refund</Label>
              <Textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter the reason for this refund..."
                rows={3}
                className="border-gray-300 focus:border-gray-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRefundDialogOpen(false)}
              className="border-gray-300 hover:border-gray-700"
            >
              Cancel
            </Button>
            <Button onClick={handleRefund}
            className="bg-blue-600 hover:bg-blue-700 text-white">Process Refund</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// lib/card.ts
import { Car, ClipboardList, Activity, DollarSign } from "lucide-react";

export type CardData = {
  title: string;
  value: number | string;
  icon: React.ElementType;
};

export type RevenueData = {
  month: string;
  revenue: number;
};

export type BookingData = {
  day: string;
  bookings: number;
};

export type carTypeData = {
  name: string;
  value: number;
};

export interface Car {
  id: string;
  name: string;
  category: string;
  price: number;
  status: "available" | "rented" | "maintenance";
  image: string;
  year: number;
  transmission: string;
  seats: number;
}

// Mock customers data
export const customers = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Smith" },
  { id: "3", name: "Bob Johnson" },
];

export const cards: CardData[] = [
  {
    title: "Available cars",
    value: 24,
    icon: Car,
  },
  {
    title: "Active rentals",
    value: 8,
    icon: Activity,
  },
  {
    title: "Total booking",
    value: 120,
    icon: ClipboardList,
  },
  {
    title: "Revenue",
    value: "$25,000",
    icon: DollarSign,
  },
];

export const revenueData: RevenueData[] = [
  { month: "Jan", revenue: 12400 },
  { month: "Feb", revenue: 18200 },
  { month: "Mar", revenue: 15800 },
  { month: "Apr", revenue: 21500 },
  { month: "May", revenue: 19200 },
  { month: "Jun", revenue: 24800 },
  { month: "Jul", revenue: 28500 },
];

export const bookingData: BookingData[] = [
  { day: "Mon", bookings: 12 },
  { day: "Tue", bookings: 19 },
  { day: "Wed", bookings: 15 },
  { day: "Thu", bookings: 22 },
  { day: "Fri", bookings: 28 },
  { day: "Sat", bookings: 35 },
  { day: "Sun", bookings: 31 },
];

export const carTypeData: carTypeData[] = [
  { name: "Sedan", value: 45 },
  { name: "SUV", value: 30 },
  { name: "Sports", value: 15 },
  { name: "Electric", value: 10 },
];

export const initialCars: Car[] = [
  {
    id: "1",
    name: "Tesla Model 3",
    category: "Electric",
    price: 89,
    status: "available",
    image:
      "https://images.unsplash.com/photo-1581182394275-6abb23f30ab0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHlbGVjdHJpYyUyMGNhciUyMG1vZGVybnxlbnwxfHx8fDE3NzA1OTUwNzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    year: 2024,
    transmission: "Automatic",
    seats: 5,
  },
  {
    id: "2",
    name: "BMW 5 Series",
    category: "Sedan",
    price: 95,
    status: "rented",
    image:
      "https://images.unsplash.com/photo-1758216383800-7023ee8ed42b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzZWRhbiUyMGNhcnxlbnwxfHx8fDE3NzA1Mjg2NTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    year: 2023,
    transmission: "Automatic",
    seats: 5,
  },
  {
    id: "3",
    name: "Range Rover Sport",
    category: "SUV",
    price: 120,
    status: "available",
    image:
      "https://images.unsplash.com/photo-1747414632749-6c8b14ba30fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXYlMjBjYXIlMjBleHRlcmlvcnxlbnwxfHx8fDE3NzA2NDUwNjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    year: 2024,
    transmission: "Automatic",
    seats: 7,
  },
  {
    id: "4",
    name: "Porsche 911",
    category: "Sports",
    price: 250,
    status: "maintenance",
    image:
      "https://images.unsplash.com/photo-1696581084306-591db2e1af14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBjYXIlMjByZWR8ZW58MXx8fHwxNzcwNTk4MTI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    year: 2024,
    transmission: "Manual",
    seats: 2,
  },
  {
    id: "5",
    name: "Honda Civic",
    category: "Compact",
    price: 45,
    status: "available",
    image:
      "https://images.unsplash.com/photo-1743809809295-cfd2a2e3d40f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wYWN0JTIwaGF0Y2hiYWNrJTIwY2FyfGVufDF8fHx8MTc3MDYxNjUzOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    year: 2023,
    transmission: "Automatic",
    seats: 5,
  },
];

// Function to get a car by ID

export interface Booking {
  id: string;
  customerName: string;
  carName: string;
  pickupDate: string;
  returnDate: string;
  totalAmount: number;
  status: "pending" | "approved" | "rejected" | "cancelled" | "completed";
  location: string;
}

export const initialBookings: Booking[] = [
  {
    id: "BK001",
    customerName: "John Smith",
    carName: "Tesla Model 3",
    pickupDate: "2026-02-15",
    returnDate: "2026-02-20",
    totalAmount: 445,
    status: "pending",
    location: "Downtown",
  },
  {
    id: "BK002",
    customerName: "Sarah Johnson",
    carName: "BMW 5 Series",
    pickupDate: "2026-02-10",
    returnDate: "2026-02-17",
    totalAmount: 665,
    status: "approved",
    location: "Airport",
  },
  {
    id: "BK003",
    customerName: "Mike Wilson",
    carName: "Range Rover Sport",
    pickupDate: "2026-02-12",
    returnDate: "2026-02-15",
    totalAmount: 360,
    status: "pending",
    location: "Downtown",
  },
  {
    id: "BK004",
    customerName: "Emily Brown",
    carName: "Honda Civic",
    pickupDate: "2026-02-08",
    returnDate: "2026-02-14",
    totalAmount: 270,
    status: "completed",
    location: "Mall",
  },
  {
    id: "BK005",
    customerName: "David Lee",
    carName: "Porsche 911",
    pickupDate: "2026-02-16",
    returnDate: "2026-02-18",
    totalAmount: 500,
    status: "rejected",
    location: "Airport",
  },
];

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "admin" | "stuff";
  status: "active" | "inactive" | "suspended";
  joinDate: string;
  totalBookings: number;
}

export const initialUsers: User[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    role: "customer",
    status: "active",
    joinDate: "2025-05-12",
    totalBookings: 8,
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "+1 (555) 234-5678",
    role: "customer",
    status: "active",
    joinDate: "2025-08-20",
    totalBookings: 12,
  },
  {
    id: "3",
    name: "Mike Wilson",
    email: "mike.wilson@example.com",
    phone: "+1 (555) 345-6789",
    role: "stuff",
    status: "active",
    joinDate: "2025-11-05",
    totalBookings: 5,
  },
  {
    id: "4",
    name: "Emily Brown",
    email: "emily.b@example.com",
    phone: "+1 (555) 456-7890",
    role: "admin",
    status: "active",
    joinDate: "2024-03-15",
    totalBookings: 0,
  },
  {
    id: "5",
    name: "David Lee",
    email: "david.lee@example.com",
    phone: "+1 (555) 567-8901",
    role: "customer",
    status: "suspended",
    joinDate: "2025-09-30",
    totalBookings: 3,
  },
];

export const dailyData = [
  { date: "Feb 1", revenue: 3200, bookings: 12, cars: 8 },
  { date: "Feb 2", revenue: 4100, bookings: 15, cars: 11 },
  { date: "Feb 3", revenue: 3800, bookings: 14, cars: 9 },
  { date: "Feb 4", revenue: 4500, bookings: 18, cars: 13 },
  { date: "Feb 5", revenue: 5200, bookings: 22, cars: 16 },
  { date: "Feb 6", revenue: 6100, bookings: 28, cars: 19 },
  { date: "Feb 7", revenue: 5800, bookings: 25, cars: 18 },
  { date: "Feb 8", revenue: 4200, bookings: 16, cars: 12 },
  { date: "Feb 9", revenue: 3900, bookings: 14, cars: 10 },
];

export const monthlyData = [
  { month: "Aug", revenue: 68400, bookings: 234, cars: 142 },
  { month: "Sep", revenue: 72100, bookings: 256, cars: 148 },
  { month: "Oct", revenue: 78500, bookings: 278, cars: 151 },
  { month: "Nov", revenue: 65200, bookings: 221, cars: 138 },
  { month: "Dec", revenue: 81300, bookings: 302, cars: 165 },
  { month: "Jan", revenue: 58900, bookings: 198, cars: 128 },
  { month: "Feb", revenue: 42600, bookings: 164, cars: 107 },
];

export const categoryData = [
  { category: "Sedan", revenue: 18500, bookings: 45 },
  { category: "SUV", revenue: 28300, bookings: 38 },
  { category: "Sports", revenue: 35600, bookings: 22 },
  { category: "Electric", revenue: 21800, bookings: 32 },
  { category: "Compact", revenue: 12400, bookings: 51 },
];
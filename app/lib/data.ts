// lib/card.ts
import {
  Car,
  ClipboardList,
  Activity,
  DollarSign,
  
} from "lucide-react";

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
  }
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

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


export const initialCars: Car[] = [
  {
    id: "1",
    name: "Tesla Model 3",
    category: "Electric",
    price: 89,
    status: "available",
    image: "https://images.unsplash.com/photo-1581182394275-6abb23f30ab0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMGNhciUyMG1vZGVybnxlbnwxfHx8fDE3NzA1OTUwNzB8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
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
    image: "https://images.unsplash.com/photo-1758216383800-7023ee8ed42b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBzZWRhbiUyMGNhcnxlbnwxfHx8fDE3NzA1Mjg2NTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
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
    image: "https://images.unsplash.com/photo-1747414632749-6c8b14ba30fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXYlMjBjYXIlMjBleHRlcmlvcnxlbnwxfHx8fDE3NzA2NDUwNjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
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
    image: "https://images.unsplash.com/photo-1696581084306-591db2e1af14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBjYXIlMjByZWR8ZW58MXx8fHwxNzcwNTk4MTI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
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
    image: "https://images.unsplash.com/photo-1743809809295-cfd2a2e3d40f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wYWN0JTIwaGF0Y2hiYWNrJTIwY2FyfGVufDF8fHx8MTc3MDYxNjUzOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    year: 2023,
    transmission: "Automatic",
    seats: 5,
  },
];
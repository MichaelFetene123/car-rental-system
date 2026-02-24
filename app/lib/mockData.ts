export interface Car {
  id: string;
  name: string;
  year: number;
  type: string;
  location: string;
  seats: number;
  fuelType: string;
  transmission: string;
  pricePerDay: number;
  imageUrl: string;
  available: boolean;
  description?: string;
}

export interface Booking {
  id: string;
  carId: string;
  carName: string;
  carImage: string;
  carYear: number;
  carType: string;
  status: "confirmed" | "pending" | "cancelled";
  rentalPeriod: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  returnLocation: string;
  totalPrice: number;
  bookedOn: string;
}

export const mockCars: Car[] = [
  {
    id: "1",
    name: "BMW M4 COMPETITION",
    year: 2022,
    type: "SUV",
    location: "Los Angeles",
    seats: 5,
    fuelType: "Gasoline",
    transmission: "Automatic",
    pricePerDay: 299,
    imageUrl: "",
    available: true,
    description:
      "Experience the thrill of driving this high-performance BMW M4 Competition. With its powerful engine and luxurious interior, this car is perfect for those who demand the best.",
  },
  {
    id: "2",
    name: "BMW X5",
    year: 2022,
    type: "SUV",
    location: "Los Angeles",
    seats: 5,
    fuelType: "Gasoline",
    transmission: "Automatic",
    pricePerDay: 100,
    imageUrl: "",
    available: true,
    description:
      "Spacious and comfortable, the BMW X5 is perfect for family trips or business travel. Enjoy the premium features and smooth ride.",
  },
  {
    id: "3",
    name: "Tesla Model 3",
    year: 2023,
    type: "Sedan",
    location: "San Francisco",
    seats: 5,
    fuelType: "Electric",
    transmission: "Automatic",
    pricePerDay: 120,
    imageUrl: "",
    available: true,
    description:
      "Go green with this fully electric Tesla Model 3. Experience the future of driving with autopilot features and zero emissions.",
  },
  {
    id: "4",
    name: "Mercedes-Benz S-Class",
    year: 2023,
    type: "Luxury Sedan",
    location: "New York",
    seats: 5,
    fuelType: "Gasoline",
    transmission: "Automatic",
    pricePerDay: 250,
    imageUrl: "",
    available: true,
    description:
      "The epitome of luxury and sophistication. The Mercedes-Benz S-Class offers unparalleled comfort and cutting-edge technology.",
  },
  {
    id: "5",
    name: "Audi A6",
    year: 2022,
    type: "Sedan",
    location: "Los Angeles",
    seats: 5,
    fuelType: "Gasoline",
    transmission: "Automatic",
    pricePerDay: 100,
    imageUrl: "",
    available: true,
    description:
      "Elegant and powerful, the Audi A6 combines performance with luxury for an unforgettable driving experience.",
  },
  {
    id: "6",
    name: "Range Rover Sport",
    year: 2023,
    type: "SUV",
    location: "Miami",
    seats: 7,
    fuelType: "Gasoline",
    transmission: "Automatic",
    pricePerDay: 200,
    imageUrl: "",
    available: true,
    description:
      "Perfect for off-road adventures or city cruising. The Range Rover Sport offers versatility, luxury, and powerful performance.",
  },
];

export const mockBookings: Booking[] = [
  {
    id: "1",
    carId: "1",
    carName: "BMW M4 COMPETITION",
    carImage: "",
    carYear: 2022,
    carType: "SUV",
    status: "confirmed",
    rentalPeriod: "4/10/2025 - 4/15/2025",
    pickupDate: "4/10/2025",
    returnDate: "4/15/2025",
    pickupLocation: "Airport Terminal 1",
    returnLocation: "Downtown Office",
    totalPrice: 475,
    bookedOn: "6/1/2025",
  },
  {
    id: "2",
    carId: "1",
    carName: "BMW M4 COMPETITION",
    carImage: "",
    carYear: 2022,
    carType: "SUV",
    status: "confirmed",
    rentalPeriod: "4/10/2025 - 4/15/2025",
    pickupDate: "4/10/2025",
    returnDate: "4/15/2025",
    pickupLocation: "Airport Terminal 1",
    returnLocation: "Downtown Office",
    totalPrice: 475,
    bookedOn: "6/1/2025",
  },
];

export const mockLocations = [
  "Airport Terminal 1",
  "Airport Terminal 2",
  "Downtown Office",
  "City Center",
  "Beach Location",
  "North District",
];

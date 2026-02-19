import { Car, initialCars } from "@/app/lib/data";
import Image from 'next/image';
import CarStatus from "./status";
import { DeleteCar, UpdateCar } from "./button";

interface CarsTableProps {
  query: string;
  currentPage: number;
}

const CarsPerPage = 5; // Same as in the page

export default function CarsTable({ query, currentPage }: CarsTableProps) {
  // Filter cars based on query
  const filteredCars = initialCars.filter(car => 
    car.name.toLowerCase().includes(query.toLowerCase()) ||
    car.category.toLowerCase().includes(query.toLowerCase())
  );
  
  // Calculate pagination
  const offset = (currentPage - 1) * CarsPerPage;
  const carsToShow = filteredCars.slice(offset, offset + CarsPerPage);
  
  return (
    <div className="mt-6 flow-root">
     <div className="inline-block min-w-full align-middle">
      <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
        <div className="md:hidden">
          {
            carsToShow?.map((car) => (
              <div key={car.id}
                className="mb-2 w-full rounded-md bg-white p-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <img
                        src={car.image_url}
                        className="mr-2 rounded-full"
                        width={28}
                        height={28}
                        alt={`${car.name}'s profile picture`}
                      />
                      <p>{car.name}</p>
                    </div>
                    <p className="text-sm text-gray-500">{car.category}</p>
                  </div>
                  <CarStatus status={car.status} />
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xl font-medium">
                      {car.price}
                    </p>
                    <p>{car.year}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <UpdateCar id={car.id} />
                    <DeleteCar id={car.id} />
                  </div>
                </div>
              </div>
            ))}
        </div>
        <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Car
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Category
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Price
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Year
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Transmission
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Seats
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {carsToShow?.map((car) => (
                <tr
                  key={car.id}
                  className="w-full border-b border-gray-200 py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={car.image_url}
                        className="rounded-full"
                        width={28}
                        height={28}
                        alt={`${car.name}'s profile picture`}
                      />
                      <p>{car.name}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {car.category}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    ${car.price}/day
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {car.year}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {car.transmission}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {car.seats}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <CarStatus status={car.status} />
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateCar id={car.id} />
                      <DeleteCar id={car.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
     </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Car, getCarById, updateCar } from '@/app/lib/data';
import Form from '@/app/ui/manageCars/edit-form';

export default function EditCarPage() {
  const params = useParams();
  const router = useRouter();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carId = params.id as string;

  useEffect(() => {
    async function fetchCar() {
      try {
        const carData = await getCarById(carId);
        setCar(carData);
      } catch (err) {
        setError((err as Error).message || 'Failed to load car data');
      } finally {
        setLoading(false);
      }
    }

    fetchCar();
  }, [carId]);

  // Validate car data before submitting
  const validateCarData = (data: Partial<Car>): boolean => {
    if (!data.name || !data.category || !data.price || !data.status || !data.year || !data.transmission || !data.seats) {
      alert('Please fill in all required fields');
      return false;
    }
    
    // Validate image if provided
    if (data.image_url && !isValidImageUrl(data.image_url)) {
      alert('Please provide a valid image URL or upload an image');
      return false;
    }
    
    return true;
  };
  
  const isValidImageUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      // Check if it's a data URL (for uploaded images)
      return url.startsWith('data:image');
    }
  };

  const handleUpdateCar = async (id: string, carData: Partial<Car>) => {
    // Validate the car data before updating
    if (!validateCarData(carData)) {
      throw new Error('Invalid car data');
    }
    
    try {
      const updatedCar = await updateCar(id, carData);
      setCar(updatedCar);
      return updatedCar;
    } catch (error) {
      console.error('Error updating car:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Edit Car</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Edit Car</h1>
        <p className="text-red-600">Error: {error}</p>
        <button 
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Back
        </button>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Edit Car</h1>
        <p>Car not found</p>
        <button 
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pt-6 pb-4 px-4 bg-gray-50 rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Edit Car</h1>
      <Form car={car} updateCar={handleUpdateCar} />
    </div>
  );
}
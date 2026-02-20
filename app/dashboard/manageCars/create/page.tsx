'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Car, createCar } from '@/app/lib/data';
import Form from '@/app/ui/manageCars/edit-form';

export default function CreateCarPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  // Create a default empty car object for the form
  const defaultCar: Car = {
    id: '',
    name: '',
    category: '',
    price: 0,
    status: 'available',
    image_url: '',
    year: 0,
    transmission: '',
    seats: 0,
  };

  const handleCreateCar = async (id: string, carData: Partial<Car>) => {
    try {
      const newCar = await createCar(carData);
      router.push('/dashboard/manageCars');
      router.refresh();
      return newCar;
    } catch (error) {
      console.error('Error creating car:', error);
      throw error;
    }
  };

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

  return (
    <div className="max-w-2xl mx-auto pt-6 pb-4 px-4 bg-gray-50 rounded-lg shadow">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Create New Car</h1>
      <Form 
        car={defaultCar} 
        updateCar={handleCreateCar} 
        isCreateMode={true}
        validateCarData={validateCarData}
      />
    </div>
  );
}
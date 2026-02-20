'use client';

import { Car } from '@/app/lib/data';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FormProps {
  car: Car;
  updateCar: (id: string, carData: Partial<Car>) => Promise<Car>;
  isCreateMode?: boolean;
  validateCarData?: (data: Partial<Car>) => boolean;
}

export default function Form({ car, updateCar, isCreateMode = false, validateCarData }: FormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: car.name,
    category: car.category,
    price: car.price,
    status: car.status,
    image_url: car.image_url,
    year: car.year,
    transmission: car.transmission,
    seats: car.seats,
  });
  
  const [imageMethod, setImageMethod] = useState<'url' | 'upload'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(car.image_url || null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'year' || name === 'seats' 
        ? Number(value) 
        : value
    }));
    
    // Update image preview if image_url is changed
    if (name === 'image_url') {
      setImagePreview(value);
    }
  };
  
  const handleImageMethodChange = (method: 'url' | 'upload') => {
    setImageMethod(method);
    if (method === 'url') {
      setSelectedFile(null);
      setImagePreview(formData.image_url);
    } else {
      setFormData(prev => ({ ...prev, image_url: '' }));
      setImagePreview(null);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setImagePreview(fileUrl);
      
      // Clean up previous object URLs to prevent memory leaks
      return () => URL.revokeObjectURL(fileUrl);
    }
  };
  
  const removeCurrentImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image_url: '' }));
    setSelectedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use provided validation function or basic validation
    const validationFunction = validateCarData || ((data: Partial<Car>) => {
      if (!data.name || !data.category || !data.price || !data.status || !data.year || !data.transmission || !data.seats) {
        alert('Please fill in all required fields');
        return false;
      }
      return true;
    });
    
    const carDataToValidate = {
      ...formData,
      image_url: imageMethod === 'upload' && selectedFile 
        ? await uploadImage(selectedFile) 
        : formData.image_url
    };
    
    if (!validationFunction(carDataToValidate)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare the car data
      let imageData = formData.image_url;
      
      // If file upload method is selected and a file is provided, process it
      if (imageMethod === 'upload' && selectedFile) {
        // In a real app, you would upload the file to a cloud service here
        // For this implementation, we'll simulate getting a URL after upload
        imageData = await uploadImage(selectedFile);
      } else if (imageMethod === 'url') {
        imageData = formData.image_url;
      }
      
      const carData = {
        ...formData,
        image_url: imageData
      };
      
      if (isCreateMode) {
        // For create mode, we call updateCar without an ID
        // The createCar function in the page handles the actual creation
        await updateCar('', carData);
      } else {
        // For edit mode, we pass the car ID
        await updateCar(car.id, carData);
      }
      
      router.push('/dashboard/manageCars');
      router.refresh();
    } catch (error) {
      console.error('Error saving car:', error);
      alert(isCreateMode ? 'Failed to create car. Please try again.' : 'Failed to update car. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Simulated image upload function - in a real app this would upload to a cloud service
  const uploadImage = async (file: File): Promise<string> => {
    // In a real implementation, this would upload to cloudinary, AWS S3, etc.
    // For this demo, we'll return a data URL or a placeholder
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // In a real app, you would upload to a service and get back a permanent URL
        // Here we simulate the process by returning the data URL temporarily
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-lg ">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="md:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Car Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter car name"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            id="category"
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select category</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Sports">Sports</option>
            <option value="Electric">Electric</option>
            <option value="Compact">Compact</option>
            <option value="Luxury">Luxury</option>
          </select>
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price per Day ($) *
          </label>
          <input
            id="price"
            name="price"
            type="number"
            required
            min="0"
            step="1"
            value={formData.price}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter price"
          />
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status *
          </label>
          <select
            id="status"
            name="status"
            required
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="available">Available</option>
            <option value="rented">Rented</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        {/* Year */}
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
            Year *
          </label>
          <input
            id="year"
            name="year"
            type="number"
            required
            min="1900"
            max="2030"
            value={formData.year}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter year"
          />
        </div>

        {/* Transmission */}
        <div>
          <label htmlFor="transmission" className="block text-sm font-medium text-gray-700 mb-1">
            Transmission *
          </label>
          <select
            id="transmission"
            name="transmission"
            required
            value={formData.transmission}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
            <option value="CVT">CVT</option>
          </select>
        </div>

        {/* Seats */}
        <div>
          <label htmlFor="seats" className="block text-sm font-medium text-gray-700 mb-1">
            Number of Seats *
          </label>
          <input
            id="seats"
            name="seats"
            type="number"
            required
            min="1"
            max="10"
            value={formData.seats}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter number of seats"
          />
        </div>

        {/* Image Section - Dual Method */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Car Image
          </label>
          
          {/* Method Selection */}
          <div className="flex space-x-4 mb-4">
            <div className="flex items-center">
              <input
                type="radio"
                id="method-url"
                name="imageMethod"
                checked={imageMethod === 'url'}
                onChange={() => handleImageMethodChange('url')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="method-url" className="ml-2 block text-sm text-gray-700">
                Enter URL
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="method-upload"
                name="imageMethod"
                checked={imageMethod === 'upload'}
                onChange={() => handleImageMethodChange('upload')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="method-upload" className="ml-2 block text-sm text-gray-700">
                Upload File
              </label>
            </div>
          </div>
          
          {/* URL Input */}
          {imageMethod === 'url' && (
            <div className="mb-4">
              <input
                id="image_url"
                name="image_url"
                type="url"
                value={formData.image_url}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter image URL"
              />
            </div>
          )}
          
          {/* File Upload */}
          {imageMethod === 'upload' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Image File
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {selectedFile && (
                <p className="mt-1 text-sm text-gray-500">Selected: {selectedFile.name}</p>
              )}
            </div>
          )}
          
          {/* Image Preview */}
          {(imagePreview || formData.image_url) && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Preview:</span>
                <button
                  type="button"
                  onClick={removeCurrentImage}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove Image
                </button>
              </div>
              <div className="flex justify-center">
                <img 
                  src={imagePreview || formData.image_url} 
                  alt="Car preview" 
                  className="h-48 w-48 object-contain rounded-md border bg-gray-100"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (isCreateMode ? 'Creating...' : 'Updating...') : (isCreateMode ? 'Create Car' : 'Update Car')}
        </button>
      </div>
    </form>
  );
}

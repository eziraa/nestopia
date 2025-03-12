'use client';

import { useGetPopularHousesQuery } from '@/state/api';
import React from 'react';

const PopularHouses = () => {
    const {data: properties} = useGetPopularHousesQuery()
  return (
    <div className="container mx-auto px-10 py-8">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-8">Popular Houses</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {properties?.map((house) => (
          <div key={house.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-all hover:scale-105">
            <img
              src={ '/placeholder.jpg'}
              alt={house.name}
              className="w-full h-64 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-800">{house.name}</h2>
              <p className="text-gray-600 mt-2">{house.description}</p>
              <div className="flex justify-between items-center mt-4">
                <div className="text-lg font-bold text-gray-800">${house.pricePerMonth}/month</div>
                <div className="flex items-center text-yellow-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                  <span className="ml-1">{house.averageRating}</span>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">{house.location.city}, {house.location.state}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularHouses;

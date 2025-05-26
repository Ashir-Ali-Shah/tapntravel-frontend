import React, { useEffect, useState } from 'react';
import { apiBaseUrl } from '../apis/setting';

const BusCard = ({ name, email, adminId }) => {
  const [busCount, setBusCount] = useState(0);

  useEffect(() => {
    const fetchBusCount = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/bus/ad-bus?adminId=${adminId}`, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bus count');
        }

        const busData = await response.json();
        setBusCount(busData.length); 

      } catch (error) {
        console.error('Error fetching bus count:', error);
      }
    };

    fetchBusCount();
  }, [adminId]);

  return (
    <div className={`bus-card ${busCount > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} p-4 rounded-lg shadow-md transition transform hover:scale-105 hover:shadow-xl`}>
      <p className="text-gray-700">Company: {name}</p>
      <p className="text-gray-700">Email: {email}</p>
      <p className="text-gray-700">Total Buses: {busCount}</p>
    </div>
  );
};

export default BusCard;

import React from 'react';
import BusCard from './BusCard';

const BusList = ({ admins }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {admins.map((admin) => (
        <BusCard 
          key={admin._id.$oid}
          email={admin.email} 
          name={admin.name} 
          adminId={admin._id} 
        />
      ))}
    </div>
  );
};

export default BusList;

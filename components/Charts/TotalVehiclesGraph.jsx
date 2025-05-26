import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const TotalVehiclesGraph = ({ totalVehicles }) => {
  // Create data points for a line chart
  // Using multiple points to create a trend line
  const data = [
    { name: "Previous", value: Math.max(0, (totalVehicles || 0) * 0.8) },
    { name: "Current", value: totalVehicles || 0 }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full h-full">
      <h2 className="text-lg font-semibold mb-4">Total Vehicles</h2>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => Math.round(value)} />
          <Legend />
          <Line 
            type="monotone"
            dataKey="value" 
            stroke="#F59E0B" 
            strokeWidth={2}
            name="Vehicle Count"
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TotalVehiclesGraph;
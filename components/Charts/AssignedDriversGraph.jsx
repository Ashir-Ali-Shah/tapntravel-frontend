import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const AssignedDriversGraph = ({ assignedDrivers }) => {
  // build a little trendline from 80% → 100% of the current count
  const data = [
    { name: "Previous", value: Math.max(0, (assignedDrivers || 0) * 0.8) },
    { name: "Current",  value: assignedDrivers || 0 }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full h-full">
      <h2 className="text-lg font-semibold mb-4">Assigned Drivers</h2>
      <ResponsiveContainer width="100%" height="80%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={value => Math.round(value)} />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            name="Drivers Count"
            stroke="#10B981"   // emerald-500
            strokeWidth={2}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AssignedDriversGraph;

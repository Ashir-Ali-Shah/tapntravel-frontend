import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { busStatuses } from "../utils/bus-statuses";

// Custom colors for different status types
const COLORS = {
  [busStatuses.UPCOMING]: "#f39c12",    // Blue for upcoming
  [busStatuses.IN_TRANSIT]: "#ADD8E6",  // Blue for in transit
  [busStatuses.COMPLETED]: "#FFD580",   // Orange for completed
  [busStatuses.CANCELLED]: "#e74c3c",   // Red for cancelled
  "default": "#FFB6C1"                  // Pink for other status
};

// Human-readable labels for status codes
const STATUS_LABELS = {
  [busStatuses.UPCOMING]: "Upcoming",
  [busStatuses.IN_TRANSIT]: "In Transit",
  [busStatuses.COMPLETED]: "Completed",
  [busStatuses.CANCELLED]: "Cancelled"
};

const BusStatusChart = ({ buses }) => {
  // Calculate status distribution with useMemo to prevent unnecessary recalculations
  const statusData = useMemo(() => {
    // Create an object to store counts
    const counts = {};
    
    // Count buses by status
    buses.forEach(bus => {
      const status = bus.status || busStatuses.UPCOMING;
      counts[status] = (counts[status] || 0) + 1;
    });
    
    // Convert to array format required by Recharts
    return Object.keys(counts).map(status => ({
      name: STATUS_LABELS[status] || status,
      value: counts[status],
      color: COLORS[status] || COLORS.default
    }));
  }, [buses]);

  // If no data, show a message
  if (statusData.length === 0) {
    return <div className="text-center p-4">No bus data available</div>;
  }

  // Custom tooltip to show both count and percentage
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const total = statusData.reduce((sum, entry) => sum + entry.value, 0);
      const percentage = ((payload[0].value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-2 shadow rounded border">
          <p className="font-semibold">{payload[0].name}</p>
          <p>{`Count: ${payload[0].value}`}</p>
          <p>{`Percentage: ${percentage}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Bus Status Distribution</h2>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={statusData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={50}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {statusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BusStatusChart;
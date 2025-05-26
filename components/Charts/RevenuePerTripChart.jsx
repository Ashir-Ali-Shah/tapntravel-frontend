import React, { useMemo } from "react";
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

const RevenuePerTripChart = ({ data }) => {
  // Process the data to calculate revenue per trip for each company
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    // Make sure we're working with numbers, not strings
    return data.map(company => {
      const vehicles = Number(company.vehicles) || 0;
      const revenue = Number(company.revenue) || 0;
      
      // Calculate revenue per trip (handle cases where trips might be 0)
      const revenuePerTrip = vehicles > 0 
        ? parseFloat((revenue / vehicles).toFixed(2))
        : 0;
        
      return {
        name: company.adminName,
        revenuePerTrip,
        totalRevenue: revenue
      };
    });
  }, [data]);
  
  // Custom tooltip to show more detailed information
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
          <p className="font-bold text-gray-800">{`${label}`}</p>
          <p className="text-blue-600">{`Revenue Per Trip: Rs. ${payload[0].value}`}</p>
          <p className="text-gray-600">{`Total Revenue: Rs. ${payload[0].payload.totalRevenue}`}</p>
        </div>
      );
    }
    return null;
  };

  // Don't render if there's no data
  if (!chartData.length) {
    return <div className="w-full bg-white p-4 rounded-lg shadow-md text-center">No data available</div>;
  }

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Revenue Per Trip</h2>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#6b7280' }}
              tickLine={{ stroke: '#6b7280' }}
            />
            <YAxis 
              tickFormatter={(value) => `Rs. ${value}`}
              tick={{ fill: '#6b7280' }}
              tickLine={{ stroke: '#6b7280' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenuePerTrip"
              name="Revenue Per Trip"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4, fill: "#3b82f6" }}
              activeDot={{ r: 8, fill: "#1e40af" }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenuePerTripChart;
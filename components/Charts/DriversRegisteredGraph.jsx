import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const DriversRegisteredGraph = ({ driversRegistered = 1250 }) => {
  // Create data points for a line chart with gradient colors
  const data = [
    { name: "Previous", value: Math.max(0, (driversRegistered || 0) * 0.7) },
    { name: "Current", value: driversRegistered || 0 }
  ];

  // Custom tooltip with gradient styling
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-medium text-gray-800">{`Period: ${label}`}</p>
          <p className="text-sm" style={{ color: '#8B95FF' }}>
            {`Drivers: ${Math.round(payload[0].value).toLocaleString()}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl shadow-lg border border-gray-100/50 p-6 w-full h-full backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Drivers Registered
        </h2>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"></div>
          <span className="text-sm text-gray-600">Growth Trend</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20
          }}
        >
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8B95FF" />
              <stop offset="33%" stopColor="#FF8BA7" />
              <stop offset="66%" stopColor="#6BC5FF" />
              <stop offset="100%" stopColor="#5FFFB7" />
            </linearGradient>
            <linearGradient id="glowGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8B95FF" stopOpacity="0.1" />
              <stop offset="33%" stopColor="#FF8BA7" stopOpacity="0.1" />
              <stop offset="66%" stopColor="#6BC5FF" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#5FFFB7" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#e5e7eb" 
            strokeOpacity={0.6}
          />
          
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#d1d5db' }}
            axisLine={{ stroke: '#d1d5db' }}
          />
          
          <YAxis 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#d1d5db' }}
            axisLine={{ stroke: '#d1d5db' }}
            tickFormatter={(value) => Math.round(value).toLocaleString()}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend 
            wrapperStyle={{ 
              paddingTop: '20px',
              fontSize: '14px',
              color: '#6b7280'
            }}
          />
          
          <Line 
            type="monotone"
            dataKey="value" 
            stroke="url(#lineGradient)"
            strokeWidth={4}
            name="Drivers Registered"
            activeDot={{ 
              r: 8, 
              fill: "url(#lineGradient)",
              stroke: '#fff',
              strokeWidth: 3,
              filter: "drop-shadow(0 4px 8px rgba(139, 149, 255, 0.3))"
            }}
            dot={{
              r: 6,
              fill: "url(#lineGradient)",
              stroke: '#fff',
              strokeWidth: 2,
              filter: "drop-shadow(0 2px 4px rgba(139, 149, 255, 0.2))"
            }}
            filter="drop-shadow(0 2px 4px rgba(139, 149, 255, 0.1))"
          />
        </LineChart>
      </ResponsiveContainer>
      
      {/* Bottom accent */}
      <div className="mt-4 h-1 w-full rounded-full bg-gradient-to-r from-purple-400/20 via-pink-400/20 via-blue-400/20 to-teal-400/20"></div>
    </div>
  );
};

export default DriversRegisteredGraph;
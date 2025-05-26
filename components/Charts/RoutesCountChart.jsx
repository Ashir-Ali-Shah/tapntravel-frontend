import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const RoutesCountChart = ({ buses }) => {
  // Calculate route frequency counts
  const routeData = useMemo(() => {
    // Skip if no buses data
    if (!buses || !buses.length) return [];
    
    // Count occurrences of each route
    const routeCounts = buses.reduce((counts, bus) => {
      if (!bus.route || !bus.route.startCity || !bus.route.endCity) return counts;
      
      const routeName = `${bus.route.startCity} to ${bus.route.endCity}`;
      counts[routeName] = (counts[routeName] || 0) + 1;
      return counts;
    }, {});
    
    // Convert to array format for Recharts
    return Object.entries(routeCounts).map(([route, count]) => ({
      route,
      count
    }));
  }, [buses]);

  // Sort routes by count (descending)
  const sortedRouteData = useMemo(() => {
    return [...routeData].sort((a, b) => b.count - a.count);
  }, [routeData]);

  if (!sortedRouteData.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Routes Distribution</h3>
          <p className="text-gray-500 text-sm">No route data available</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800 mb-1">{label}</p>
          <p className="text-sm">
            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#FFB6C1' }}></span>
            <span className="font-medium">{payload[0].value} assignments</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 pb-2">
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-pink-400 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Routes Distribution
            </h3>
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedRouteData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFB6C1" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#FFB6C1" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e5e7eb" 
                strokeOpacity={0.6}
              />
              
              <XAxis
                dataKey="route"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }}
                axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                tickLine={{ stroke: '#d1d5db' }}
              />
              
              <YAxis 
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }}
                axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
                tickLine={{ stroke: '#d1d5db' }}
              />
              
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              
              <Legend 
                wrapperStyle={{ 
                  paddingTop: '20px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280'
                }}
              />
              
              <Bar
                dataKey="count"
                name="Route Assignments"
                fill="url(#barGradient)"
                radius={[6, 6, 0, 0]}
                stroke="#FFB6C1"
                strokeWidth={1}
                strokeOpacity={0.3}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RoutesCountChart;
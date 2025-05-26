import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiBaseUrl } from "../apis/setting";
import Loader from "../utils/Loader";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Custom tooltip component matching the existing style
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 border-0 rounded-xl shadow-2xl border border-gray-200/50">
        <p className="font-semibold text-gray-800 text-sm mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <p className="text-gray-600 text-sm font-medium">
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const GroupedBarChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdminsDataAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${apiBaseUrl}/admin/admins-analytics`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      // Transform data for the chart
      const formattedData = response.data.data.map(company => ({
        name: company.adminName,
        Trips: company.vehicles,
        Routes: company.routes,
        Drivers: company.drivers
      }));
      
      setChartData(formattedData);
    } catch (error) {
      console.error("Error fetching admin analytics:", error);
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminsDataAnalytics();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50/80 h-80 rounded-2xl w-full m-1 flex items-center justify-center shadow-lg border border-gray-100/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-200 border-t-indigo-500 mx-auto mb-3"></div>
          <p className="text-gray-600 font-medium">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50/80 h-80 rounded-2xl w-full m-1 flex items-center justify-center shadow-lg border border-gray-100/50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-500 font-medium">{error}</p>
          <button 
            onClick={fetchAdminsDataAnalytics}
            className="text-indigo-500 text-sm mt-2 hover:text-indigo-600 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50/80 h-80 rounded-2xl w-full m-1 flex items-center justify-center shadow-lg border border-gray-100/50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No analytics data available</p>
          <p className="text-gray-400 text-sm mt-1">Data will appear when companies are added</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50/80 min-h-[400px] rounded-2xl w-full m-1 p-6 relative shadow-lg border border-gray-100/50 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Company Analytics</h3>
        <p className="text-sm text-gray-500">Trips, Routes & Drivers by Company</p>
      </div>
      
      <div style={{ width: '100%', height: '320px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
            barCategoryGap="20%"
          >
            {/* Beautiful gradient definitions */}
            <defs>
              <linearGradient id="tripsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B95FF" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#667eea" stopOpacity={0.7}/>
              </linearGradient>
              <linearGradient id="routesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5FFFB7" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#38f9d7" stopOpacity={0.7}/>
              </linearGradient>
              <linearGradient id="driversGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFD93F" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#FF9500" stopOpacity={0.7}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e2e8f0" 
              opacity={0.6}
              horizontal={true}
              vertical={false}
            />
            <XAxis 
              dataKey="name"
              tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => Math.round(value)}
              width={50}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ fill: 'rgba(0,0,0,0.05)', radius: 8 }} 
            />
            <Legend 
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '13px',
                fontWeight: '500',
                color: '#64748b'
              }}
            />
            
            <Bar 
              dataKey="Trips" 
              name="Trips"
              fill="url(#tripsGradient)"
              radius={[4, 4, 0, 0]}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={1}
            />
            <Bar 
              dataKey="Routes" 
              name="Routes"
              fill="url(#routesGradient)"
              radius={[4, 4, 0, 0]}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={1}
            />
            <Bar 
              dataKey="Drivers" 
              name="Drivers"
              fill="url(#driversGradient)"
              radius={[4, 4, 0, 0]}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={1}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GroupedBarChart;
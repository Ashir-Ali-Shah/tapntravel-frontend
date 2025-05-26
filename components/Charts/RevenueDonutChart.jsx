import React, { useEffect, useState } from "react";
import axios from "axios";
import { apiBaseUrl } from "../apis/setting";
import Loader from "../utils/Loader";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

// Custom tooltip component matching the existing style
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 border-0 rounded-xl shadow-2xl border border-gray-200/50">
        <p className="font-semibold text-gray-800 text-sm mb-2">{payload[0].name}</p>
        <div className="flex items-center gap-2 mb-1">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: payload[0].payload.fill }}
          />
          <p className="text-gray-600 text-sm font-medium">
            Rs. {payload[0].value.toLocaleString()}
          </p>
        </div>
        <p className="text-gray-500 text-xs">
          {payload[0].payload.percentage}% of total revenue
        </p>
      </div>
    );
  }
  return null;
};

const RevenueDonutChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // Beautiful gradient colors matching the theme
  const COLORS = [
    '#8B95FF', // Purple-blue
    '#5FFFB7', // Green-teal  
    '#FFD93F', // Yellow-orange
    '#FF8BA7', // Pink
    '#6BC5FF', // Blue-cyan
    '#FF6B9D', // Rose
    '#4ECDC4', // Teal
    '#A28FD0'  // Lavender
  ];

  const fetchAdminsDataAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${apiBaseUrl}/admin/admins-analytics`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      // Calculate total revenue
      const total = response.data.data.reduce((sum, company) => sum + parseFloat(company.revenue || 0), 0);
      setTotalRevenue(total);
      
      // Transform data for the chart
      const formattedData = response.data.data
        .filter(company => company.revenue > 0) // Only include companies with revenue
        .map((company, index) => ({
          name: company.adminName,
          value: parseFloat(company.revenue || 0),
          percentage: ((parseFloat(company.revenue || 0) / total) * 100).toFixed(1),
          fill: COLORS[index % COLORS.length]
        }));
      
      setChartData(formattedData);
    } catch (error) {
      console.error("Error fetching admin analytics:", error);
      setError("Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminsDataAnalytics();
  }, []);

  // Custom legend with modern styling
  const renderCustomizedLegend = (props) => {
    const { payload } = props;
    
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center bg-white/50 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-100/50">
            <div 
              style={{ backgroundColor: entry.color }}
              className="w-3 h-3 mr-2 rounded-full shadow-sm"
            />
            <span className="text-xs font-medium text-gray-700">
              {entry.value} ({chartData[index]?.percentage}%)
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50/80 h-80 rounded-2xl w-full m-1 flex items-center justify-center shadow-lg border border-gray-100/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-200 border-t-indigo-500 mx-auto mb-3"></div>
          <p className="text-gray-600 font-medium">Loading revenue data...</p>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No revenue data available</p>
          <p className="text-gray-400 text-sm mt-1">Revenue data will appear when companies generate income</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50/80 min-h-[450px] rounded-2xl w-full m-1 p-6 relative shadow-lg border border-gray-100/50 backdrop-blur-sm">
      {/* Header */}
      <div className="mb-6 text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Revenue Analysis</h3>
        <p className="text-sm text-gray-500 mb-3">Revenue share by company</p>
        
        {/* Total Revenue Display */}
        <div className="inline-flex items-center bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 rounded-full border border-indigo-100/50">
          
          <span className="text-indigo-700 font-semibold text-sm">
            Total Revenue: Rs. {totalRevenue.toLocaleString()}
          </span>
        </div>
      </div>
      
      <div style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {/* Beautiful gradient definitions */}
            <defs>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.1)"/>
              </filter>
              {chartData.map((entry, index) => (
                <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={entry.fill} stopOpacity={0.9}/>
                  <stop offset="100%" stopColor={entry.fill} stopOpacity={0.7}/>
                </linearGradient>
              ))}
            </defs>
            
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="50%"
              outerRadius="85%"
              dataKey="value"
              labelLine={false}
              stroke="rgba(255,255,255,0.8)"
              strokeWidth={2}
              filter="url(#shadow)"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#gradient-${index})`}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              content={renderCustomizedLegend}
              layout="horizontal"
              verticalAlign="bottom"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Center Text Display */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
         
        </div>
      </div>
    </div>
  );
};

export default RevenueDonutChart;

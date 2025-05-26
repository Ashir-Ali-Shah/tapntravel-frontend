import React, { useState, useEffect } from "react";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { analyzeBusRoutes } from "../utils/HelperFunctions";
import { useSelector } from "react-redux";
import Loader from "../utils/Loader";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm p-4 border-0 rounded-xl shadow-2xl border border-gray-200/50">
        <p className="font-semibold text-gray-800 text-sm mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: payload[0].payload.fill }}
          />
          <p className="text-gray-600 text-sm font-medium">
            {`${payload[0].value} buses`}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const BarChart = ({ showFromCities = true, title = "Cities" }) => {
  const buses = useSelector((state) => state.buses.data);
  const isLoading = useSelector((state) => state.buses.loading);
  
  // Local state to persist chart data
  const [chartData, setChartData] = useState(() => {
    // Try to load cached data on component initialization
    const cacheKey = `barChart_${showFromCities ? 'from' : 'to'}_cities`;
    const cached = sessionStorage.getItem(cacheKey);
    return cached ? JSON.parse(cached) : [];
  });
  const [hasProcessedData, setHasProcessedData] = useState(false);
  const [lastProcessedTime, setLastProcessedTime] = useState(null);

  // Process data when buses are available
  useEffect(() => {
    if (buses && buses.length > 0) {
      const now = new Date();
      const upcomingBuses = buses
        .filter((bus) => new Date(bus.date) > now)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      if (upcomingBuses && upcomingBuses.length > 0) {
        const routeAnalysis = analyzeBusRoutes(upcomingBuses);
        
        if (routeAnalysis && routeAnalysis.citiesAnalysis) {
          const selectedCities = showFromCities
            ? routeAnalysis.citiesAnalysis.fromCities
            : routeAnalysis.citiesAnalysis.toCities;

          if (selectedCities && selectedCities.length > 0) {
            const topCities = selectedCities.slice(0, 4);
            // Beautiful lighter gradient colors
            const colors = [
              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple-blue gradient
              'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink gradient  
              'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue-cyan gradient
              'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'  // Green-teal gradient
            ];
            
            // Solid lighter colors as fallback
            const solidColors = ['#8B95FF', '#FF8BA7', '#6BC5FF', '#5FFFB7'];

            const data = topCities.map((city, index) => ({
              name: city.name,
              count: city.count,
              fill: solidColors[index % solidColors.length],
              gradient: colors[index % colors.length]
            }));

            setChartData(data);
            setHasProcessedData(true);
            setLastProcessedTime(new Date().toISOString());
            
            // Cache the data
            const cacheKey = `barChart_${showFromCities ? 'from' : 'to'}_cities`;
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
          }
        }
      }
    }
  }, [buses, showFromCities]);

  // Show loader only when initially loading and no processed data exists AND no cached data
  if (isLoading && !hasProcessedData && chartData.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50/80 h-70 rounded-2xl lg:w-1/2 m-1 flex items-center justify-center shadow-lg border border-gray-100/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-200 border-t-indigo-500 mx-auto mb-3"></div>
          <p className="text-gray-600 font-medium">Loading chart data...</p>
        </div>
      </div>
    );
  }

  // If we have any chart data (processed or cached), show it
  if (chartData.length > 0) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50/80 h-70 rounded-2xl lg:w-1/2 m-1 p-6 relative shadow-lg border border-gray-100/50 backdrop-blur-sm">
        {isLoading && (
          <div className="absolute top-4 right-4 z-10">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-200 border-t-indigo-500"></div>
          </div>
        )}
        
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{title} Analysis</h3>
          <p className="text-sm text-gray-500">Top destinations by bus count</p>
        </div>
        
        <ResponsiveContainer width="100%" height="85%">
          <RechartsBarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 40,
            }}
            barCategoryGap="25%"
          >
            {/* Beautiful gradient definitions */}
            <defs>
              <linearGradient id="purpleBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B95FF" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#667eea" stopOpacity={0.7}/>
              </linearGradient>
              <linearGradient id="pinkRed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF8BA7" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#f5576c" stopOpacity={0.7}/>
              </linearGradient>
              <linearGradient id="blueCyan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6BC5FF" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#00a8ff" stopOpacity={0.7}/>
              </linearGradient>
              <linearGradient id="greenTeal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5FFFB7" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#38f9d7" stopOpacity={0.7}/>
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
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => Math.round(value)}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)', radius: 8 }} />
            
            <Bar 
              dataKey="count" 
              name="Number of Buses"
              radius={[8, 8, 4, 4]}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={1}
            >
              {chartData.map((entry, index) => {
                const gradients = ['url(#purpleBlue)', 'url(#pinkRed)', 'url(#blueCyan)', 'url(#greenTeal)'];
                return <Bar key={`cell-${index}`} fill={gradients[index % gradients.length]} />;
              })}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Fallback states
  if (!buses) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50/80 h-70 rounded-2xl lg:w-1/2 m-1 flex items-center justify-center shadow-lg border border-gray-100/50">
        <Loader />
      </div>
    );
  }

  if (!hasProcessedData) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50/80 h-70 rounded-2xl lg:w-1/2 m-1 flex items-center justify-center shadow-lg border border-gray-100/50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No upcoming buses available</p>
          <p className="text-gray-400 text-sm mt-1">Data will appear when buses are scheduled</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50/80 h-70 rounded-2xl lg:w-1/2 m-1 p-6 shadow-lg border border-gray-100/50">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{title} Analysis</h3>
        <p className="text-sm text-gray-500">Top destinations by bus count</p>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <RechartsBarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 40,
          }}
          barCategoryGap="25%"
        >
          {/* Beautiful gradient definitions */}
          <defs>
            <linearGradient id="purpleBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B95FF" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#667eea" stopOpacity={0.7}/>
            </linearGradient>
            <linearGradient id="pinkRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF8BA7" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#f5576c" stopOpacity={0.7}/>
            </linearGradient>
            <linearGradient id="blueCyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6BC5FF" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#00a8ff" stopOpacity={0.7}/>
            </linearGradient>
            <linearGradient id="greenTeal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5FFFB7" stopOpacity={0.9}/>
              <stop offset="100%" stopColor="#38f9d7" stopOpacity={0.7}/>
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
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => Math.round(value)}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)', radius: 8 }} />
          
          <Bar 
            dataKey="count" 
            name="Number of Buses"
            radius={[8, 8, 4, 4]}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={1}
          >
            {chartData.map((entry, index) => {
              const gradients = ['url(#purpleBlue)', 'url(#pinkRed)', 'url(#blueCyan)', 'url(#greenTeal)'];
              return <Bar key={`cell-${index}`} fill={gradients[index % gradients.length]} />;
            })}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;

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

const DailyTripsChart = ({ buses }) => {
  // State definitions - always at the top level
  const [viewMode, setViewMode] = React.useState("daily");

  // Process bus data to get daily trip counts
  const tripData = useMemo(() => {
    if (!buses || buses.length === 0) {
      return [];
    }

    // Get date range for the last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Create a map to store dates and counts
    const tripCounts = {};
    
    // Initialize all dates in the last 30 days with 0 count
    for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0];
      tripCounts[dateString] = 0;
    }
    
    // Count trips for each day
    buses.forEach(bus => {
      if (bus.date) {
        const busDate = new Date(bus.date);
        // Only count if the bus date is within our 30-day window
        if (busDate >= thirtyDaysAgo && busDate <= today) {
          const dateString = busDate.toISOString().split('T')[0];
          tripCounts[dateString] = (tripCounts[dateString] || 0) + 1;
        }
      }
    });
    
    // Convert to array format for Recharts and sort by date
    return Object.keys(tripCounts)
      .map(dateString => ({
        date: dateString,
        // Format date for display (MM/DD)
        displayDate: new Date(dateString).toLocaleDateString('en-US', { 
          month: 'numeric', 
          day: 'numeric' 
        }),
        trips: tripCounts[dateString]
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [buses]);

  // Weekly aggregation function
  const weeklyData = useMemo(() => {
    if (tripData.length === 0) return [];
    
    const weeklyResults = [];
    let currentWeekStart = null;
    let currentWeekTrips = 0;
    let weekNumber = 0;
    
    tripData.forEach((day, index) => {
      const dayDate = new Date(day.date);
      
      // If this is the first item or it's a new week (Sunday)
      if (currentWeekStart === null || dayDate.getDay() === 0) {
        // If we have data from a previous week, save it
        if (currentWeekStart !== null) {
          weeklyResults.push({
            date: currentWeekStart,
            displayDate: `Week ${weekNumber}`,
            trips: currentWeekTrips
          });
        }
        
        // Start a new week
        currentWeekStart = day.date;
        currentWeekTrips = day.trips;
        weekNumber++;
      } else {
        // Add to current week
        currentWeekTrips += day.trips;
      }
      
      // If this is the last item and we haven't saved the week yet
      if (index === tripData.length - 1 && currentWeekTrips > 0) {
        weeklyResults.push({
          date: currentWeekStart,
          displayDate: `Week ${weekNumber}`,
          trips: currentWeekTrips
        });
      }
    });
    
    return weeklyResults;
  }, [tripData]);

  // Determine which data to use based on view mode
  const chartData = viewMode === "daily" ? tripData : weeklyData;
  
  // Return early if no data
  if (tripData.length === 0) {
    return <div className="text-center p-4">No trip data available for the last 30 days</div>;
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-100">
          <p className="font-semibold text-gray-800 mb-1">{payload[0].payload.displayDate}</p>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-pink-400"></div>
            <p className="text-sm font-medium text-gray-700">{`${payload[0].value} trips`}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-pink-400 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Trips Over Time
          </h2>
        </div>
        
        <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === "daily" 
                ? "bg-white text-pink-600 shadow-sm border border-pink-200" 
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setViewMode("daily")}
          >
            Daily
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === "weekly" 
                ? "bg-white text-pink-600 shadow-sm border border-pink-200" 
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setViewMode("weekly")}
          >
            Weekly
          </button>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FFB6C1" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#FFB6C1" stopOpacity={0.4} />
              </linearGradient>
              
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFB6C1" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#FFB6C1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#e5e7eb" 
              strokeOpacity={0.6}
            />
            
            <XAxis 
              dataKey="displayDate" 
              tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }}
              interval={viewMode === "daily" ? 6 : 0}
              angle={-45}
              textAnchor="end"
              height={80}
              axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
              tickLine={{ stroke: '#d1d5db' }}
            />
            
            <YAxis 
              allowDecimals={false}
              domain={[0, 'auto']}
              tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 500 }}
              axisLine={{ stroke: '#d1d5db', strokeWidth: 1 }}
              tickLine={{ stroke: '#d1d5db' }}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Line
              type="monotone"
              dataKey="trips"
              stroke="#FFB6C1"
              strokeWidth={3}
              dot={{ 
                r: 4, 
                fill: '#FFB6C1', 
                stroke: '#ffffff', 
                strokeWidth: 2 
              }}
              activeDot={{ 
                r: 6, 
                fill: '#FFB6C1', 
                stroke: '#ffffff', 
                strokeWidth: 3,
                filter: 'drop-shadow(0 2px 4px rgba(255, 139, 167, 0.3))'
              }}
              name="Trips"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DailyTripsChart;
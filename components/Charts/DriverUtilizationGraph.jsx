import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  LabelList
} from "recharts";

const DriverUtilizationGraph = ({ registeredDrivers, assignedDrivers, totalVehicles }) => {
  // Ensure all values are numbers
  const regDrivers = useMemo(() => Number(registeredDrivers) || 0, [registeredDrivers]);
  const asgDrivers = useMemo(() => Number(assignedDrivers) || 0, [assignedDrivers]);
  const vehicles = useMemo(() => Number(totalVehicles) || 0, [totalVehicles]);
  
  // Calculate utilization rates
  const driverAllocationRate = useMemo(() => {
    if (regDrivers === 0) return 0;
    return Math.round((asgDrivers / regDrivers) * 100);
  }, [regDrivers, asgDrivers]);
  
  const vehicleUtilizationRate = useMemo(() => {
    if (vehicles === 0) return 0;
    return Math.round((asgDrivers / vehicles) * 100);
  }, [vehicles, asgDrivers]);
  
  // Create data for absolute values graph
  const absoluteData = [
    {
      name: "Registered",
      fullName: "Registered Drivers",
      value: regDrivers,
      fill: "#8B95FF",
      gradient: "url(#purpleBlueGrad)"
    },
    {
      name: "Assigned",
      fullName: "Assigned Drivers", 
      value: asgDrivers,
      fill: "#5FFFB7",
      gradient: "url(#greenTealGrad)"
    },
    {
      name: "Vehicles",
      fullName: "Total Vehicles",
      value: vehicles,
      fill: "#FF8BA7",
      gradient: "url(#pinkRedGrad)"
    }
  ];
  
  // Create data for utilization rates
  const utilizationData = [
    {
      name: "Driver Allocation",
      value: driverAllocationRate,
      description: `${asgDrivers}/${regDrivers} drivers assigned`,
      fill: "#6BC5FF",
      gradient: "url(#blueCyanGrad)"
    },
    {
      name: "Vehicle Utilization", 
      value: vehicleUtilizationRate,
      description: `${asgDrivers}/${vehicles} vehicles with drivers`,
      fill: "#FFB366",
      gradient: "url(#orangeYellowGrad)"
    }
  ];
  
  const CustomTooltipAbsolute = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 border-0 rounded-xl shadow-2xl border border-gray-200/50">
          <p className="font-semibold text-gray-800 text-sm mb-1">{data.fullName}</p>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.fill }}
            />
            <p className="text-gray-600 text-sm font-medium">
              {data.value} {data.name.toLowerCase().includes('vehicle') ? 'vehicles' : 'drivers'}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };
  
  const CustomTooltipRates = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 border-0 rounded-xl shadow-2xl border border-gray-200/50">
          <p className="font-semibold text-gray-800 text-sm mb-1">{data.name}</p>
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.fill }}
            />
            <p className="text-lg font-bold" style={{ color: data.fill }}>
              {data.value}%
            </p>
          </div>
          <p className="text-xs text-gray-500">{data.description}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="bg-gradient-to-br from-white to-gray-50/80 rounded-2xl shadow-lg border border-gray-100/50 backdrop-blur-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Driver Allocation & Utilization</h2>
        <p className="text-sm text-gray-500">Resource distribution and efficiency metrics</p>
      </div>
      
      {/* Metrics summary with gradient cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="relative p-4 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50/80 border border-purple-100/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Registered Drivers</p>
              <p className="text-2xl font-bold text-purple-700">{regDrivers}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="relative p-4 rounded-xl bg-gradient-to-br from-green-50 to-teal-50/80 border border-green-100/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Assigned Drivers</p>
              <p className="text-2xl font-bold text-green-700">{asgDrivers}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="relative p-4 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50/80 border border-pink-100/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Vehicles</p>
              <p className="text-2xl font-bold text-pink-700">{vehicles}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-1M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Absolute values chart */}
        <div className="bg-white/50 rounded-xl p-4 border border-gray-100/50">
          <h3 className="text-lg font-medium mb-3 text-gray-800">Resource Count</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={absoluteData}
              margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
              barCategoryGap="20%"
            >
              <defs>
                <linearGradient id="purpleBlueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B95FF" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#667eea" stopOpacity={0.7}/>
                </linearGradient>
                <linearGradient id="greenTealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5FFFB7" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#38f9d7" stopOpacity={0.7}/>
                </linearGradient>
                <linearGradient id="pinkRedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF8BA7" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#f5576c" stopOpacity={0.7}/>
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
                tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                tickMargin={12}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                width={35}
              />
              <Tooltip content={<CustomTooltipAbsolute />} cursor={{ fill: 'rgba(0,0,0,0.05)', radius: 8 }} />
              <Bar 
                dataKey="value" 
                radius={[8, 8, 4, 4]}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth={1}
              >
                {absoluteData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.gradient} />
                ))}
                <LabelList 
                  dataKey="value" 
                  position="top" 
                  style={{ fontSize: '12px', fontWeight: '600', fill: '#374151' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Utilization rates chart */}
        <div className="bg-white/50 rounded-xl p-4 border border-gray-100/50">
          <h3 className="text-lg font-medium mb-3 text-gray-800">Utilization Rates</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={utilizationData}
              margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
              barCategoryGap="20%"
            >
              <defs>
                <linearGradient id="blueCyanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6BC5FF" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#00a8ff" stopOpacity={0.7}/>
                </linearGradient>
                <linearGradient id="orangeYellowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFB366" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#ff9500" stopOpacity={0.7}/>
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
                tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                tickMargin={12}
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                width={35}
              />
              <Tooltip content={<CustomTooltipRates />} cursor={{ fill: 'rgba(0,0,0,0.05)', radius: 8 }} />
              <ReferenceLine 
                y={100} 
                stroke="#94a3b8" 
                strokeDasharray="4 4" 
                opacity={0.8}
              />
              <Bar 
                dataKey="value" 
                radius={[8, 8, 4, 4]}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth={1}
              >
                {utilizationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.gradient} />
                ))}
                <LabelList 
                  dataKey="value" 
                  position="top" 
                  formatter={(value) => `${value}%`}
                  style={{ fontSize: '12px', fontWeight: '600', fill: '#374151' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Efficiency indicators */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-xl border ${driverAllocationRate >= 80 ? 'bg-gradient-to-br from-green-50 to-emerald-50/80 border-green-200/50' : driverAllocationRate >= 60 ? 'bg-gradient-to-br from-yellow-50 to-amber-50/80 border-yellow-200/50' : 'bg-gradient-to-br from-red-50 to-rose-50/80 border-red-200/50'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${driverAllocationRate >= 80 ? 'bg-green-500' : driverAllocationRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
            <div>
              <p className="text-sm font-medium text-gray-600">Driver Allocation Efficiency</p>
              <p className={`text-lg font-bold ${driverAllocationRate >= 80 ? 'text-green-700' : driverAllocationRate >= 60 ? 'text-yellow-700' : 'text-red-700'}`}>
                {driverAllocationRate >= 80 ? 'Excellent' : driverAllocationRate >= 60 ? 'Good' : 'Needs Improvement'}
              </p>
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-xl border ${vehicleUtilizationRate >= 80 ? 'bg-gradient-to-br from-green-50 to-emerald-50/80 border-green-200/50' : vehicleUtilizationRate >= 60 ? 'bg-gradient-to-br from-yellow-50 to-amber-50/80 border-yellow-200/50' : 'bg-gradient-to-br from-red-50 to-rose-50/80 border-red-200/50'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${vehicleUtilizationRate >= 80 ? 'bg-green-500' : vehicleUtilizationRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
            <div>
              <p className="text-sm font-medium text-gray-600">Vehicle Utilization Status</p>
              <p className={`text-lg font-bold ${vehicleUtilizationRate >= 80 ? 'text-green-700' : vehicleUtilizationRate >= 60 ? 'text-yellow-700' : 'text-red-700'}`}>
                {vehicleUtilizationRate >= 80 ? 'Optimal' : vehicleUtilizationRate >= 60 ? 'Moderate' : 'Low Usage'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverUtilizationGraph;
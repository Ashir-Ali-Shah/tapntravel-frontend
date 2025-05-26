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
  Line,
  ComposedChart,
  ReferenceLine,
  Cell,
  LabelList
} from "recharts";

const RevenuePerTicketGraph = ({ totalRevenue, totalTickets }) => {
  // Ensure we're working with numbers
  const revenue = useMemo(() => Number(totalRevenue) || 0, [totalRevenue]);
  const tickets = useMemo(() => Number(totalTickets) || 0, [totalTickets]);
  
  // Calculate the average revenue per ticket
  const averageRevenuePerTicket = useMemo(() => {
    if (!tickets || tickets === 0) return 0;
    return revenue / tickets;
  }, [revenue, tickets]);

  // Format currency
  const formatCurrency = (value) => {
    return `Rs. ${value.toLocaleString()}`;
  };

  // Create data for the graph with gradients
  const comparisonData = [
    {
      name: "Total Revenue",
      shortName: "Revenue",
      value: revenue,
      displayValue: formatCurrency(revenue),
      fill: "#8B95FF",
      gradient: "url(#purpleBlueRevenue)"
    },
    {
      name: "Total Tickets",
      shortName: "Tickets", 
      value: tickets,
      displayValue: tickets.toString(),
      fill: "#5FFFB7",
      gradient: "url(#greenTealRevenue)"
    },
    {
      name: "Avg. Revenue/Ticket",
      shortName: "Avg/Ticket",
      value: averageRevenuePerTicket,
      displayValue: formatCurrency(averageRevenuePerTicket),
      fill: "#FFB366",
      gradient: "url(#orangeYellowRevenue)"
    }
  ];

  // Custom tooltip with modern styling
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 border-0 rounded-xl shadow-2xl border border-gray-200/50">
          <p className="font-semibold text-gray-800 text-sm mb-1">{data.name}</p>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.fill }}
            />
            <p className="text-lg font-bold" style={{ color: data.fill }}>
              {data.displayValue}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Performance assessment
  const getPerformanceStatus = () => {
    if (averageRevenuePerTicket >= 1000) return { status: 'Excellent', color: 'green' };
    if (averageRevenuePerTicket >= 500) return { status: 'Good', color: 'yellow' };
    return { status: 'Needs Improvement', color: 'red' };
  };

  const performance = getPerformanceStatus();
  
  return (
    <div className="bg-gradient-to-br from-white to-gray-50/80 rounded-2xl shadow-lg border border-gray-100/50 backdrop-blur-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Revenue per Ticket Analysis</h2>
        <p className="text-sm text-gray-500">Financial performance and ticket pricing insights</p>
      </div>
      
      {/* Enhanced metrics summary with gradient cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="relative p-4 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50/80 border border-purple-100/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
              <p className="text-xl font-bold text-purple-700">{formatCurrency(revenue)}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="relative p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50/80 border border-green-100/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Tickets</p>
              <p className="text-xl font-bold text-green-700">{tickets.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="relative p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50/80 border border-orange-100/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Avg. per Ticket</p>
              <p className="text-xl font-bold text-orange-700">{formatCurrency(averageRevenuePerTicket)}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Beautiful chart with gradients */}
      <div className="bg-white/50 rounded-xl p-4 border border-gray-100/50 mb-6">
        <h3 className="text-lg font-medium mb-3 text-gray-800">Financial Metrics Comparison</h3>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={comparisonData}
            margin={{ top: 40, right: 30, left: 30, bottom: 20 }}
            barCategoryGap="25%"
          >
            <defs>
              <linearGradient id="purpleBlueRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B95FF" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#667eea" stopOpacity={0.7}/>
              </linearGradient>
              <linearGradient id="greenTealRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5FFFB7" stopOpacity={0.9}/>
                <stop offset="100%" stopColor="#38f9d7" stopOpacity={0.7}/>
              </linearGradient>
              <linearGradient id="orangeYellowRevenue" x1="0" y1="0" x2="0" y2="1">
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
              dataKey="shortName"
              tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              tickMargin={12}
            />
            
            <YAxis 
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              width={40}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                return value.toString();
              }}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)', radius: 8 }} />
            
            <Bar 
              dataKey="value" 
              name="Value"
              radius={[8, 8, 4, 4]}
              stroke="rgba(255,255,255,0.3)"
              strokeWidth={1}
            >
              {comparisonData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.gradient} />
              ))}
              <LabelList 
                dataKey="displayValue" 
                position="top"
                style={{ fontSize: '11px', fontWeight: '600', fill: '#374151' }}
                offset={8}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance insights and trends */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-xl border ${
          performance.color === 'green' 
            ? 'bg-gradient-to-br from-green-50 to-emerald-50/80 border-green-200/50' 
            : performance.color === 'yellow' 
            ? 'bg-gradient-to-br from-yellow-50 to-amber-50/80 border-yellow-200/50' 
            : 'bg-gradient-to-br from-red-50 to-rose-50/80 border-red-200/50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              performance.color === 'green' ? 'bg-green-500' : 
              performance.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue Performance</p>
              <p className={`text-lg font-bold ${
                performance.color === 'green' ? 'text-green-700' : 
                performance.color === 'yellow' ? 'text-yellow-700' : 'text-red-700'
              }`}>
                {performance.status}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50/80 border border-blue-100/50">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <div>
              <p className="text-sm font-medium text-gray-600">Pricing Strategy</p>
              <p className="text-lg font-bold text-blue-700">
                {averageRevenuePerTicket >= 1000 ? 'Premium' : 
                 averageRevenuePerTicket >= 500 ? 'Standard' : 'Budget'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key insights */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50/80 border border-indigo-100/50">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Key Insights
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
          <p>• Average ticket value: <span className="font-semibold text-indigo-700">{formatCurrency(averageRevenuePerTicket)}</span></p>
          <p>• Total transactions: <span className="font-semibold text-indigo-700">{tickets.toLocaleString()}</span></p>
          {tickets > 0 && (
            <>
              <p>• Revenue efficiency: <span className="font-semibold text-indigo-700">{((revenue / tickets / 1000) * 100).toFixed(1)}%</span> of Rs.1000 target</p>
              <p>• Market positioning: <span className="font-semibold text-indigo-700">{averageRevenuePerTicket >= 800 ? 'Premium segment' : 'Mass market'}</span></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenuePerTicketGraph;
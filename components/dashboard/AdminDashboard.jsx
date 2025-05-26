import React, { useEffect, useState } from "react";
import Card from "./Card";
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import BarChart from "../Charts/BarChart";
import { useSelector } from "react-redux";
import { analyzeBusRoutes } from "../utils/HelperFunctions";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { apiBaseUrl } from "../apis/setting";
import TotalVehiclesGraph from "../Charts/TotalVehiclesGraph";
import DriversRegisteredGraph from "../Charts/DriversRegisteredGraph";
import AssignedDriversGraph from "../Charts/AssignedDriversGraph";
import RevenuePerTicketGraph from "../Charts/RevenuePerTicketGraph";
import DriverUtilizationGraph from "../Charts/DriverUtilizationGraph";
import { Bell, X, Check, AlertTriangle, TrendingUp, Target, DollarSign } from "lucide-react";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isGlowing, setIsGlowing] = useState(false);
  const [lastNotificationCheck, setLastNotificationCheck] = useState(null);

  // Track notification types and their last generation time
  const [notificationHistory, setNotificationHistory] = useState({});
  
  const NOTIFICATION_COOLDOWN = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const decodedToken = jwtDecode(localStorage.getItem("token"));

        const response = await axios.get(
          `${apiBaseUrl}/admin/dashboard-analytics?adminId=${decodedToken?.sub}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setDashboardData(response?.data);
        
        // Notification will be generated in the useEffect that watches dashboardData
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error.message);
        addNotification("error", "Failed to fetch dashboard data");
      }
    };

    fetchDashboardData();
    
    // Initialize empty notifications array and load notification history from memory
    setNotifications([]);
    
    // Initialize notification history if not present
    if (Object.keys(notificationHistory).length === 0) {
      setNotificationHistory({});
    }
  }, []);

  // Helper function to check if we should generate a notification of a specific type
  const shouldGenerateNotification = (notificationType) => {
    const now = Date.now();
    const lastGenerated = notificationHistory[notificationType];
    
    // For analytics notifications, always generate if not generated in last 30 seconds
    const isAnalyticsNotification = [
      'high-revenue-efficiency',
      'daily-ticket-goal', 
      'revenue-health-check',
      'revenue-ticket-comparison',
      'total-revenue-milestone',
      'ticket-volume-analysis'
    ].includes(notificationType);
    
    if (isAnalyticsNotification) {
      if (!lastGenerated) {
        return true; // First time generating this type
      }
      return (now - lastGenerated) >= 30000; // 30 seconds cooldown for analytics
    }
    
    // For other notifications, use the longer cooldown
    if (!lastGenerated) {
      return true; // First time generating this type
    }
    
    return (now - lastGenerated) >= NOTIFICATION_COOLDOWN;
  };

  // Helper function to mark a notification type as generated
  const markNotificationGenerated = (notificationType) => {
    setNotificationHistory(prev => ({
      ...prev,
      [notificationType]: Date.now()
    }));
  };
  
  // Generate notifications based on dashboard data changes
  useEffect(() => {
    if (!dashboardData) return;
    
    const now = Date.now();
    
    // For development/testing: Generate notifications more frequently
    // Only check for notifications every 30 seconds for analytics or on first load
    if (lastNotificationCheck && (now - lastNotificationCheck) < 30000) { // 30 seconds instead of 8 hours
      return;
    }
    
    const newNotifications = [];
    const timestamp = new Date().toISOString();
    
    // Calculate key analytics variables
    const totalRevenue = dashboardData.totalRevenue || 0;
    const totalTickets = dashboardData.totalTickets || 0;
    const todaysRevenue = dashboardData.todaysRevenue || 0;
    const todaysTickets = dashboardData.todaysTickets || 0;
    
    // Calculate average revenue per ticket (overall and today's)
    const avgRevenuePerTicket = totalTickets > 0 ? totalRevenue / totalTickets : 0;
    const todaysAvgRevenuePerTicket = todaysTickets > 0 ? todaysRevenue / todaysTickets : 0;
    
    // ===== ENHANCED REVENUE ANALYTICS NOTIFICATIONS =====
    
    // 1. High Average Revenue Efficiency Notification
    if (avgRevenuePerTicket > 0 && shouldGenerateNotification('high-revenue-efficiency')) {
      let efficiencyMessage = "";
      if (avgRevenuePerTicket >= 50) {
        efficiencyMessage = `Your current avg. revenue per ticket is Rs. ${avgRevenuePerTicket.toFixed(2)} — indicating strong pricing or upsell effectiveness.`;
      } else if (avgRevenuePerTicket >= 30) {
        efficiencyMessage = `Your current avg. revenue per ticket is Rs. ${avgRevenuePerTicket.toFixed(2)} — showing good market positioning.`;
      } else if (avgRevenuePerTicket >= 20) {
        efficiencyMessage = `Your current avg. revenue per ticket is Rs. ${avgRevenuePerTicket.toFixed(2)} — there's room for pricing optimization.`;
      } else {
        efficiencyMessage = `Your current avg. revenue per ticket is Rs. ${avgRevenuePerTicket.toFixed(2)} — consider reviewing pricing strategy.`;
      }
      
      newNotifications.push({
        id: `revenue-efficiency-${Date.now()}`,
        type: avgRevenuePerTicket >= 40 ? "success" : "info",
        message: efficiencyMessage,
        timestamp: timestamp,
        read: false,
        category: "analytics",
        icon: "trending"
      });
      markNotificationGenerated('high-revenue-efficiency');
    }
    
    // 2. Goal-Based Milestone Notification (Daily Tickets)
    const dailyTicketGoal = 350; // Configurable goal
    if (todaysTickets >= 0 && shouldGenerateNotification('daily-ticket-goal')) { // Changed condition to >= 0
      const remaining = dailyTicketGoal - todaysTickets;
      
      if (todaysTickets >= dailyTicketGoal) {
        newNotifications.push({
          id: `ticket-goal-achieved-${Date.now()}`,
          type: "success",
          message: `🎉 Daily goal achieved! You've sold ${todaysTickets} tickets today (Goal: ${dailyTicketGoal})`,
          timestamp: timestamp,
          read: false,
          category: "analytics",
          icon: "target"
        });
      } else if (remaining <= 50 && remaining > 0) {
        newNotifications.push({
          id: `ticket-goal-close-${Date.now()}`,
          type: "success",
          message: `You've sold ${todaysTickets} tickets today — only ${remaining} away from your daily goal!`,
          timestamp: timestamp,
          read: false,
          category: "analytics",
          icon: "target"
        });
      } else if (todaysTickets >= dailyTicketGoal * 0.75) {
        newNotifications.push({
          id: `ticket-goal-progress-${Date.now()}`,
          type: "info",
          message: `Great progress! ${todaysTickets} tickets sold today — ${((todaysTickets/dailyTicketGoal)*100).toFixed(1)}% of daily goal completed.`,
          timestamp: timestamp,
          read: false,
          category: "analytics",
          icon: "target"
        });
      } else {
        // Show current progress even if low
        newNotifications.push({
          id: `ticket-goal-status-${Date.now()}`,
          type: "info",
          message: `Current ticket sales: ${todaysTickets} tickets today (${((todaysTickets/dailyTicketGoal)*100).toFixed(1)}% of ${dailyTicketGoal} daily goal)`,
          timestamp: timestamp,
          read: false,
          category: "analytics",
          icon: "target"
        });
      }
      markNotificationGenerated('daily-ticket-goal');
    }
    
    // 3. Revenue Health Check Notification
    if (todaysRevenue >= 0 && shouldGenerateNotification('revenue-health-check')) { // Changed condition to >= 0
      let healthMessage = "";
      let healthType = "info";
      
      if (todaysRevenue >= 15000) {
        healthMessage = `Total revenue has reached Rs. ${todaysRevenue.toLocaleString()} so far today. That's exceptional daily performance! 🚀`;
        healthType = "success";
      } else if (todaysRevenue >= 10000) {
        healthMessage = `Total revenue has reached Rs. ${todaysRevenue.toLocaleString()} so far today. That's strong daily performance!`;
        healthType = "success";
      } else if (todaysRevenue >= 5000) {
        healthMessage = `Total revenue is Rs. ${todaysRevenue.toLocaleString()} today. Moderate performance with room to grow.`;
        healthType = "info";
      } else if (todaysRevenue >= 2000) {
        healthMessage = `Today's revenue is Rs. ${todaysRevenue.toLocaleString()}. Consider strategies to boost sales.`;
        healthType = "warning";
      } else if (todaysRevenue > 0) {
        healthMessage = `Today's revenue is Rs. ${todaysRevenue.toLocaleString()}. Early in the day - tracking progress.`;
        healthType = "info";
      } else {
        healthMessage = `Revenue tracking started for today. Current: Rs. ${todaysRevenue.toLocaleString()}`;
        healthType = "info";
      }
      
      newNotifications.push({
        id: `revenue-health-${Date.now()}`,
        type: healthType,
        message: healthMessage,
        timestamp: timestamp,
        read: false,
        category: "analytics",
        icon: "dollar"
      });
      markNotificationGenerated('revenue-health-check');
    }
    
    // 4. Revenue Per Ticket Comparison (Today vs Overall Average)
    if (todaysTickets > 0 && avgRevenuePerTicket > 0 && shouldGenerateNotification('revenue-ticket-comparison')) {
      const percentageDiff = ((todaysAvgRevenuePerTicket - avgRevenuePerTicket) / avgRevenuePerTicket) * 100;
      
      let comparisonMessage = "";
      let comparisonType = "info";
      
      if (todaysAvgRevenuePerTicket > 0) {
        if (percentageDiff > 15) {
          comparisonMessage = `Today's revenue per ticket (Rs. ${todaysAvgRevenuePerTicket.toFixed(2)}) is ${percentageDiff.toFixed(1)}% above your overall average of Rs. ${avgRevenuePerTicket.toFixed(2)}`;
          comparisonType = "success";
        } else if (percentageDiff < -15) {
          comparisonMessage = `Today's revenue per ticket (Rs. ${todaysAvgRevenuePerTicket.toFixed(2)}) is ${Math.abs(percentageDiff).toFixed(1)}% below your overall average of Rs. ${avgRevenuePerTicket.toFixed(2)}`;
          comparisonType = "warning";
        } else {
          comparisonMessage = `Today's revenue per ticket (Rs. ${todaysAvgRevenuePerTicket.toFixed(2)}) is close to your overall average of Rs. ${avgRevenuePerTicket.toFixed(2)} (${percentageDiff.toFixed(1)}% difference)`;
          comparisonType = "info";
        }
        
        newNotifications.push({
          id: `revenue-comparison-${Date.now()}`,
          type: comparisonType,
          message: comparisonMessage,
          timestamp: timestamp,
          read: false,
          category: "analytics",
          icon: "trending"
        });
      }
      markNotificationGenerated('revenue-ticket-comparison');
    }
    
    // 5. Total Revenue Milestone Notifications
    if (totalRevenue > 0 && shouldGenerateNotification('total-revenue-milestone')) {
      // Check for various milestones
      const milestones = [
        { amount: 1000000, label: "1 Million" },
        { amount: 500000, label: "500K" },
        { amount: 250000, label: "250K" },
        { amount: 100000, label: "100K" },
        { amount: 50000, label: "50K" },
        { amount: 25000, label: "25K" },
        { amount: 10000, label: "10K" }
      ];
      
      // Find the highest milestone we've crossed
      const crossedMilestone = milestones.find(milestone => totalRevenue >= milestone.amount);
      
      if (crossedMilestone) {
        newNotifications.push({
          id: `revenue-milestone-${Date.now()}`,
          type: "success",
          message: `🎯 Milestone Achievement! Total revenue has reached Rs. ${totalRevenue.toLocaleString()} (${crossedMilestone.label} milestone crossed!)`,
          timestamp: timestamp,
          read: false,
          category: "analytics",
          icon: "target"
        });
      } else {
        // Show progress toward next milestone
        const nextMilestone = milestones[milestones.length - 1]; // Start with smallest
        newNotifications.push({
          id: `revenue-progress-${Date.now()}`,
          type: "info",
          message: `Total revenue: Rs. ${totalRevenue.toLocaleString()}. Next milestone: Rs. ${nextMilestone.amount.toLocaleString()} (${nextMilestone.label})`,
          timestamp: timestamp,
          read: false,
          category: "analytics",
          icon: "target"
        });
      }
      markNotificationGenerated('total-revenue-milestone');
    }
    
    // 6. Additional Analytics: Ticket Volume Analysis
    if (totalTickets > 0 && shouldGenerateNotification('ticket-volume-analysis')) {
      let volumeMessage = "";
      if (totalTickets >= 1000) {
        volumeMessage = `Total tickets sold: ${totalTickets.toLocaleString()} - High volume operation! 🚌`;
      } else if (totalTickets >= 500) {
        volumeMessage = `Total tickets sold: ${totalTickets.toLocaleString()} - Growing customer base 📈`;
      } else if (totalTickets >= 100) {
        volumeMessage = `Total tickets sold: ${totalTickets.toLocaleString()} - Building momentum 🎯`;
      } else {
        volumeMessage = `Total tickets sold: ${totalTickets.toLocaleString()} - Early stage operations ✨`;
      }
      
      newNotifications.push({
        id: `ticket-volume-${Date.now()}`,
        type: "info",
        message: volumeMessage,
        timestamp: timestamp,
        read: false,
        category: "analytics",
        icon: "trending"
      });
      markNotificationGenerated('ticket-volume-analysis');
    }
    
    // ===== EXISTING NOTIFICATIONS (keeping original logic) =====
    
    // Revenue notifications
    if (dashboardData.todaysRevenue > 0) {
      // Revenue target notifications
      const targetRevenue = 10000; // Example target, adjust as needed
      
      if (dashboardData.todaysRevenue >= targetRevenue && shouldGenerateNotification('revenue-target')) {
        newNotifications.push({
          id: `revenue-target-${Date.now()}`,
          type: "success",
          message: `Daily revenue target achieved! Rs. ${dashboardData.todaysRevenue}`,
          timestamp: timestamp,
          read: false
        });
        markNotificationGenerated('revenue-target');
      } else if (dashboardData.todaysRevenue < targetRevenue * 0.5 && shouldGenerateNotification('revenue-low')) {
        newNotifications.push({
          id: `revenue-low-${Date.now()}`,
          type: "warning",
          message: `Today's revenue (Rs. ${dashboardData.todaysRevenue}) is below 50% of target`,
          timestamp: timestamp,
          read: false
        });
        markNotificationGenerated('revenue-low');
      }
    }
    
    // Ticket sales notifications
    if (dashboardData.todaysTickets !== undefined) {
      const avgDailyTickets = dashboardData.totalTickets / 30; // Assuming 30 days for simplicity
      
      if (dashboardData.todaysTickets > avgDailyTickets * 1.2 && shouldGenerateNotification('tickets-high')) {
        newNotifications.push({
          id: `tickets-high-${Date.now()}`,
          type: "success",
          message: `Ticket sales today (${dashboardData.todaysTickets}) are above average`,
          timestamp: timestamp,
          read: false
        });
        markNotificationGenerated('tickets-high');
      } else if (dashboardData.todaysTickets < avgDailyTickets * 0.8 && dashboardData.todaysTickets > 0 && shouldGenerateNotification('tickets-low')) {
        newNotifications.push({
          id: `tickets-low-${Date.now()}`,
          type: "warning",
          message: `Ticket sales today (${dashboardData.todaysTickets}) are below average`,
          timestamp: timestamp,
          read: false
        });
        markNotificationGenerated('tickets-low');
      }
    }
    
    // Driver utilization notifications
    if (dashboardData.driversRegistered && dashboardData.assignedDrivers) {
      const unassignedDrivers = dashboardData.driversRegistered - dashboardData.assignedDrivers;
      
      if (unassignedDrivers > 3 && shouldGenerateNotification('unassigned-drivers')) {
        newNotifications.push({
          id: `unassigned-drivers-${Date.now()}`,
          type: "info",
          message: `${unassignedDrivers} registered drivers are currently unassigned`,
          timestamp: timestamp,
          read: false
        });
        markNotificationGenerated('unassigned-drivers');
      }
      
      const utilizationRate = dashboardData.driversRegistered > 0 ?
        (dashboardData.assignedDrivers / dashboardData.driversRegistered) * 100 : 0;
        
      if (utilizationRate < 70 && dashboardData.driversRegistered > 5 && shouldGenerateNotification('driver-utilization-low')) {
        newNotifications.push({
          id: `driver-utilization-${Date.now()}`,
          type: "warning",
          message: `Driver utilization rate is only ${utilizationRate.toFixed(1)}%`,
          timestamp: timestamp,
          read: false
        });
        markNotificationGenerated('driver-utilization-low');
      } else if (utilizationRate > 95 && dashboardData.driversRegistered > 5 && shouldGenerateNotification('driver-shortage')) {
        newNotifications.push({
          id: `driver-shortage-${Date.now()}`,
          type: "warning",
          message: `High driver utilization (${utilizationRate.toFixed(1)}%) - consider recruiting`,
          timestamp: timestamp,
          read: false
        });
        markNotificationGenerated('driver-shortage');
      }
    }
    
    // Vehicle utilization notifications
    if (dashboardData.totalVehicles && dashboardData.assignedDrivers) {
      const unusedVehicles = dashboardData.totalVehicles - dashboardData.assignedDrivers;
      
      if (unusedVehicles > 0 && shouldGenerateNotification('unused-vehicles')) {
        newNotifications.push({
          id: `unused-vehicles-${Date.now()}`,
          type: "info",
          message: `${unusedVehicles} vehicles are currently without assigned drivers`,
          timestamp: timestamp,
          read: false
        });
        markNotificationGenerated('unused-vehicles');
      }
      
      if (dashboardData.assignedDrivers > dashboardData.totalVehicles && shouldGenerateNotification('vehicle-shortage')) {
        newNotifications.push({
          id: `vehicle-shortage-${Date.now()}`,
          type: "error",
          message: `Vehicle shortage: ${dashboardData.assignedDrivers - dashboardData.totalVehicles} drivers without vehicles`,
          timestamp: timestamp,
          read: false
        });
        markNotificationGenerated('vehicle-shortage');
      }
    }
    
    // Add all new notifications to state
    if (newNotifications.length > 0) {
      // Prioritize analytics notifications - show ALL analytics notifications
      const analyticsNotifications = newNotifications.filter(n => n.category === 'analytics');
      const otherNotifications = newNotifications.filter(n => n.category !== 'analytics');
      
      // Show ALL analytics notifications (no limit) and up to 2 other notifications
      const limitedNotifications = [
        ...analyticsNotifications, // Show all analytics
        ...otherNotifications.slice(0, 2) // Limit other notifications to 2
      ];
      
      setNotifications(prev => [...limitedNotifications, ...prev]);
      setUnreadCount(prev => prev + limitedNotifications.length);
      
      // Trigger the glowing effect when new notifications arrive
      setIsGlowing(true);
      setTimeout(() => setIsGlowing(false), 2000); // Stop glowing after 2 seconds
      
      console.log(`Generated ${limitedNotifications.length} new notifications (${analyticsNotifications.length} analytics, ${Math.min(otherNotifications.length, 2)} others)`);
    }
    
    // Update the last notification check time
    setLastNotificationCheck(now);
    
  }, [dashboardData, notificationHistory]);

  const addNotification = (type, message) => {
    const newNotification = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prevNotifications => {
      const updatedNotifications = [newNotification, ...prevNotifications];
      updateUnreadCount(updatedNotifications);
      return updatedNotifications;
    });
    
    // Trigger the glowing effect when a new notification is added
    setIsGlowing(true);
    setTimeout(() => setIsGlowing(false), 2000); // Stop glowing after 2 seconds
  };
  
  const updateUnreadCount = (notifs) => {
    const count = notifs.filter(n => !n.read).length;
    setUnreadCount(count);
  };
  
  const markAsRead = (id) => {
    setNotifications(prevNotifications => {
      const updatedNotifications = prevNotifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      );
      updateUnreadCount(updatedNotifications);
      return updatedNotifications;
    });
  };
  
  const markAllAsRead = () => {
    setNotifications(prevNotifications => {
      const updatedNotifications = prevNotifications.map(notification => 
        ({ ...notification, read: true })
      );
      updateUnreadCount(updatedNotifications);
      return updatedNotifications;
    });
  };
  
  const deleteNotification = (id) => {
    setNotifications(prevNotifications => {
      const updatedNotifications = prevNotifications.filter(notification => notification.id !== id);
      updateUnreadCount(updatedNotifications);
      return updatedNotifications;
    });
  };
  
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now - notificationTime;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };
  
  const getNotificationIcon = (type, iconType) => {
    // Use custom icon if specified
    if (iconType === 'trending') return <TrendingUp className="w-4 h-4 text-blue-500" />;
    if (iconType === 'target') return <Target className="w-4 h-4 text-green-500" />;
    if (iconType === 'dollar') return <DollarSign className="w-4 h-4 text-emerald-500" />;
    
    // Default icons based on type
    switch (type) {
      case 'success': return <Check className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <X className="w-4 h-4 text-red-500" />;
      default: return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };
  
  const getNotificationBgColor = (type, read, category) => {
    if (read) return "bg-gray-50";
    
    // Special styling for analytics notifications
    if (category === 'analytics') {
      switch (type) {
        case 'success': return "bg-gradient-to-r from-green-50 to-emerald-50";
        case 'warning': return "bg-gradient-to-r from-yellow-50 to-orange-50";
        case 'error': return "bg-gradient-to-r from-red-50 to-pink-50";
        default: return "bg-gradient-to-r from-blue-50 to-cyan-50";
      }
    }
    
    switch (type) {
      case 'success': return "bg-green-50";
      case 'warning': return "bg-yellow-50";
      case 'error': return "bg-red-50";
      default: return "bg-blue-50";
    }
  };

  const buses = useSelector((state) => state.buses.data);
  const payments = useSelector((state) => state.payments.data);
  const vehicles = useSelector((state) => state.vehicles.data);
  const drivers = useSelector((state) => state.drivers.data);
  const busesToday = buses.filter(
    (bus) => bus.date.split("T")[0] === new Date().toISOString().split("T")[0]
  );

  return (
    <div className="content lg:px-0">
      <div className="m-auto lg:px-8">
        <div className="flex justify-between items-center m-3">
          <h1 className="font-bold text-3xl">Admin Dashboard</h1>
          <div className="relative">
            <button 
              className={`p-2 bg-white rounded-full shadow hover:bg-gray-100 relative transition-all duration-500 ${
                isGlowing 
                  ? 'ring-4 ring-blue-300 ring-opacity-70 animate-pulse' 
                  : unreadCount > 0 
                    ? 'ring-2 ring-blue-200' 
                    : ''
              }`}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className={`w-6 h-6 ${isGlowing ? 'text-blue-500' : ''}`} />
              {unreadCount > 0 && (
                <span className={`absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center transition-all duration-300 ${
                  isGlowing 
                    ? 'bg-blue-500 scale-110' 
                    : 'bg-red-500'
                }`}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {/* Enhanced Notifications Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-10 max-h-96 overflow-y-auto border border-gray-100 transition-all duration-300 animate-fadeIn">
                <div className="flex justify-between items-center p-3 border-b bg-gradient-to-r from-blue-50 to-white sticky top-0 z-10">
                  <h3 className="font-semibold text-gray-800">Revenue Analytics & Notifications</h3>
                  <button 
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200 px-2 py-1 rounded hover:bg-blue-50"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </button>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {notifications.length > 0 ? (
                    notifications.map(notification => {
                      const isNew = Date.now() - new Date(notification.timestamp).getTime() < 5000;
                      const isAnalytics = notification.category === 'analytics';
                      
                      return (
                        <div 
                          key={notification.id} 
                          className={`p-3 hover:bg-gray-50 transition-all duration-300 ${
                            getNotificationBgColor(notification.type, notification.read, notification.category)
                          } ${isNew && !notification.read ? 'animate-fadeIn' : ''} ${
                            isAnalytics ? 'border-l-4 border-l-blue-400' : ''
                          }`}
                        >
                          <div className="flex items-start">
                            <div className={`flex-shrink-0 mt-0.5 mr-2 rounded-full p-1 ${
                              isNew && !notification.read 
                                ? 'animate-pulse' 
                                : ''
                            } ${isAnalytics ? 'bg-white shadow-sm' : ''}`}>
                              {getNotificationIcon(notification.type, notification.icon)}
                            </div>
                            <div className="flex-1 min-w-0">
                              {isAnalytics && (
                                <div className="flex items-center mb-1">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    📊 Analytics
                                  </span>
                                </div>
                              )}
                              <p className={`text-sm ${
                                notification.read 
                                  ? 'text-gray-600' 
                                  : isAnalytics
                                    ? 'font-medium text-gray-900'
                                    : 'font-medium text-gray-900'
                              }`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatTimeAgo(notification.timestamp)}
                              </p>
                            </div>
                            <div className="flex ml-2 space-x-1">
                              {!notification.read && (
                                <button 
                                  className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full p-1 transition-colors duration-200"
                                  onClick={() => markAsRead(notification.id)}
                                  title="Mark as read"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              <button 
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors duration-200"
                                onClick={() => deleteNotification(notification.id)}
                                title="Remove"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      No notifications
                      <p className="text-xs mt-1">Analytics notifications will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <Card
            title="Today's Revenue"
            number={`Rs. ${dashboardData?.todaysRevenue ?? 0}`}
          />
          <Card title="Today's Tickets" number={dashboardData?.todaysTickets} />
        </div>
        
        <div className="mt-4 px-0.5" style={{ height: "300px" }}>
          <RevenuePerTicketGraph 
            totalRevenue={dashboardData?.totalRevenue || 0} 
            totalTickets={dashboardData?.totalTickets || 0} 
          />
        </div>
        <div className="mt-4 px-0.5" style={{ height: "590px" }}>
        </div>
        <div className="mt-4 px-0.5 mb-12" style={{ height: "300px" }}>
          <DriverUtilizationGraph 
            registeredDrivers={dashboardData?.driversRegistered}
            assignedDrivers={dashboardData?.assignedDrivers}
            totalVehicles={dashboardData?.totalVehicles}
          />
        </div>

        <div className="mt-4 px-0.5" style={{ height: "300px" }}>
        </div>
        <div className="mt-4 px-0.5" style={{ height: "50px" }}>
        </div>
       
        <div className="lg:flex mt-4 px-0.5 gap-2" style={{ height: "300px" }}>
          <BarChart showFromCities={true} title="Departure Cities" />
          <BarChart showFromCities={false} title="Arrival Cities" />
        </div>
        <div className="mt-4 px-0.5" style={{ height: "20px" }}>
        </div>
          {/* Drivers Registered Graph */}
  <div className="px-0.5 mb-8">
    <div className="h-80 w-full">
      <DriversRegisteredGraph driversRegistered={dashboardData?.driversRegistered} />
    </div>
  </div>


        {/* Add CSS for animations */}
        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
          
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
            70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
            100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
          }
          
          .animate-pulse {
            animation: pulse 2s infinite;
          }
          
          /* Enhanced styles for analytics notifications */
          .analytics-notification {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%);
            border-left: 4px solid #3b82f6;
          }
          
          .analytics-badge {
            background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
            color: white;
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
            border-radius: 9999px;
            font-weight: 600;
          }
        `}</style>
      </div>
    </div>
  );
};

export default AdminDashboard;
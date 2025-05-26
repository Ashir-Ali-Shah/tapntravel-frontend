import React, { useState, useEffect, useRef } from "react";
import { 
  AlertCircle, 
  Bell, 
  Check, 
  X, 
  TrendingUp, 
  Bus, 
  User, 
  Wrench, 
  Info,
  ClipboardCheck,
  Calendar,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Users
} from "lucide-react";

export default function NotificationSystem() {
  // State for notifications
  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationAnimation, setNotificationAnimation] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    todaysRevenue: 125000,
    previousRevenue: 110000,
    todaysTickets: 450,
    previousTickets: 420,
    assignedDrivers: 85,
    previousAssignedDrivers: 80,
    driversRegistered: 120,
    previousDriversRegistered: 110,
    totalVehicles: 100,
    previousVehicles: 95,
    revenuePerTicket: 278,
    previousRevenuePerTicket: 262
  });
  
  const notificationRef = useRef(null);
  
  // Simulate fetching data - in a real app this would come from Redux or API
  useEffect(() => {
    // Mock data updates every 8 seconds for demo
    const intervalId = setInterval(() => {
      // Update with random fluctuations to simulate real-time changes
      setDashboardData(prevData => {
        const newData = {...prevData};
        
        // Store previous values
        newData.previousRevenue = prevData.todaysRevenue;
        newData.previousTickets = prevData.todaysTickets;
        newData.previousAssignedDrivers = prevData.assignedDrivers;
        newData.previousDriversRegistered = prevData.driversRegistered;
        newData.previousVehicles = prevData.totalVehicles;
        newData.previousRevenuePerTicket = prevData.revenuePerTicket;
        
        // Generate new values with realistic fluctuations
        const revenueChange = Math.floor(Math.random() * 15000) - 3000; // -3000 to +12000
        newData.todaysRevenue = Math.max(100000, prevData.todaysRevenue + revenueChange);
        
        const ticketChange = Math.floor(Math.random() * 25) - 5; // -5 to +20
        newData.todaysTickets = Math.max(400, prevData.todaysTickets + ticketChange);
        
        const driverChange = Math.floor(Math.random() * 3) - 1; // -1 to +2
        newData.assignedDrivers = Math.min(newData.driversRegistered, 
                                        Math.max(70, prevData.assignedDrivers + driverChange));
        
        const registeredDriverChange = Math.floor(Math.random() * 2); // 0 to +1
        newData.driversRegistered = Math.max(100, prevData.driversRegistered + registeredDriverChange);
        
        const vehicleChange = Math.floor(Math.random() * 2) - 1; // -1 to +1
        newData.totalVehicles = Math.max(90, prevData.totalVehicles + vehicleChange);
        
        // Calculate revenue per ticket
        newData.revenuePerTicket = Math.round(newData.todaysRevenue / newData.todaysTickets);
        
        return newData;
      });
    }, 8000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Generate notifications based on data changes
  useEffect(() => {
    checkForNotifications(dashboardData);
  }, [dashboardData]);
  
  // Outside click detection for notification panel
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target) && notificationOpen) {
        setNotificationOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationOpen]);
  
  // Load notifications from localStorage on component mount
  useEffect(() => {
    const storedNotifications = JSON.parse(localStorage.getItem("adminNotifications")) || [];
    setNotifications(storedNotifications);
  }, []);
  
  // Get notification icon based on type and category
  const getNotificationIcon = (type, category) => {
    if (category === "revenue") return <TrendingUp size={18} className="text-green-500" />;
    if (category === "tickets") return <ClipboardCheck size={18} className="text-blue-500" />;
    if (category === "drivers") return <User size={18} className="text-indigo-500" />;
    if (category === "utilization") return <Info size={18} className="text-yellow-500" />;
    if (category === "maintenance") return <Wrench size={18} className="text-orange-500" />;
    if (category === "vehicles") return <Bus size={18} className="text-purple-500" />;
    if (category === "warning") return <AlertTriangle size={18} className="text-red-500" />;
    
    // Default icons based on type
    if (type === "success") return <Check size={18} className="text-green-500" />;
    if (type === "warning") return <AlertCircle size={18} className="text-yellow-500" />;
    return <Bell size={18} className="text-blue-500" />;
  };
  
  // Get notification background color based on type
  const getNotificationBgColor = (type) => {
    if (type === "success") return "bg-green-50 hover:bg-green-100";
    if (type === "warning") return "bg-amber-50 hover:bg-amber-100";
    if (type === "error") return "bg-red-50 hover:bg-red-100";
    return "bg-blue-50 hover:bg-blue-100";
  };
  
  // Generate notifications based on dashboard data changes
  const checkForNotifications = (newData) => {
    if (!newData) return;
    
    const newNotifications = [];
    
    // Revenue notification - significant increase or decrease
    if (newData.previousRevenue && newData.todaysRevenue !== newData.previousRevenue) {
      const difference = newData.todaysRevenue - newData.previousRevenue;
      const percentChange = (difference / newData.previousRevenue) * 100;
      
      if (difference > 5000) {
        newNotifications.push({
          id: `revenue-increase-${Date.now()}`,
          title: "Revenue Increase",
          message: `Revenue increased by Rs. ${difference.toLocaleString()} (${percentChange.toFixed(1)}%).`,
          time: new Date().toLocaleTimeString(),
          type: "success",
          category: "revenue",
          read: false
        });
      } else if (difference < -5000) {
        newNotifications.push({
          id: `revenue-decrease-${Date.now()}`,
          title: "Revenue Alert",
          message: `Revenue decreased by Rs. ${Math.abs(difference).toLocaleString()} (${Math.abs(percentChange).toFixed(1)}%).`,
          time: new Date().toLocaleTimeString(),
          type: "warning",
          category: "revenue",
          read: false
        });
      }
    }
    
    // Ticket purchase notification
    if (newData.previousTickets && newData.todaysTickets > newData.previousTickets) {
      const increase = newData.todaysTickets - newData.previousTickets;
      newNotifications.push({
        id: `tickets-${Date.now()}`,
        title: "New Tickets",
        message: `${increase} new ticket${increase === 1 ? '' : 's'} purchased in the last update.`,
        time: new Date().toLocaleTimeString(),
        type: "info",
        category: "tickets",
        read: false
      });
    }
    
    // Driver assignment notification
    if (newData.previousAssignedDrivers && newData.assignedDrivers > newData.previousAssignedDrivers) {
      const increase = newData.assignedDrivers - newData.previousAssignedDrivers;
      newNotifications.push({
        id: `drivers-assigned-${Date.now()}`,
        title: "Driver Assignment",
        message: `${increase} new driver${increase === 1 ? '' : 's'} assigned.`,
        time: new Date().toLocaleTimeString(),
        type: "info",
        category: "drivers",
        read: false
      });
    }
    
    // New registered drivers notification
    if (newData.previousDriversRegistered && newData.driversRegistered > newData.previousDriversRegistered) {
      const increase = newData.driversRegistered - newData.previousDriversRegistered;
      newNotifications.push({
        id: `drivers-registered-${Date.now()}`,
        title: "New Driver Registration",
        message: `${increase} new driver${increase === 1 ? '' : 's'} registered in the system.`,
        time: new Date().toLocaleTimeString(),
        type: "success",
        category: "drivers",
        read: false
      });
    }
    
    // Low driver utilization warning
    if (newData.driversRegistered && newData.assignedDrivers) {
      const utilization = newData.assignedDrivers / newData.driversRegistered;
      if (utilization < 0.7) {
        newNotifications.push({
          id: `utilization-${Date.now()}`,
          title: "Low Driver Utilization",
          message: `Only ${Math.round(utilization * 100)}% of registered drivers are assigned. Consider optimizing schedules.`,
          time: new Date().toLocaleTimeString(),
          type: "warning",
          category: "utilization",
          read: false
        });
      }
    }
    
    // Revenue per ticket change notification
    if (newData.previousRevenuePerTicket && 
        Math.abs(newData.revenuePerTicket - newData.previousRevenuePerTicket) > 10) {
      const difference = newData.revenuePerTicket - newData.previousRevenuePerTicket;
      const isIncrease = difference > 0;
      
      newNotifications.push({
        id: `revenue-per-ticket-${Date.now()}`,
        title: `Revenue Per Ticket ${isIncrease ? 'Increase' : 'Decrease'}`,
        message: `Average revenue per ticket has ${isIncrease ? 'increased' : 'decreased'} by Rs. ${Math.abs(difference)}. New average: Rs. ${newData.revenuePerTicket}`,
        time: new Date().toLocaleTimeString(),
        type: isIncrease ? "success" : "warning",
        category: "revenue",
        read: false
      });
    }
    
    // Vehicle-to-driver ratio imbalance
    if (newData.totalVehicles > 0 && newData.assignedDrivers > 0) {
      const ratio = newData.assignedDrivers / newData.totalVehicles;
      
      if (ratio < 0.9) {
        newNotifications.push({
          id: `vehicle-driver-ratio-${Date.now()}`,
          title: "Driver Shortage",
          message: `Not enough drivers (${newData.assignedDrivers}) for your total vehicles (${newData.totalVehicles}). Consider assigning more drivers.`,
          time: new Date().toLocaleTimeString(),
          type: "warning",
          category: "drivers",
          read: false
        });
      } else if (ratio > 1.2) {
        newNotifications.push({
          id: `excess-drivers-${Date.now()}`,
          title: "Excess Drivers",
          message: `You have more assigned drivers (${newData.assignedDrivers}) than needed for your vehicles (${newData.totalVehicles}). Consider fleet expansion.`,
          time: new Date().toLocaleTimeString(),
          type: "info",
          category: "vehicles",
          read: false
        });
      }
    }
    
    // Add new notifications to the state
    if (newNotifications.length > 0) {
      // Trigger animation for the bell icon
      setNotificationAnimation(true);
      setTimeout(() => setNotificationAnimation(false), 2000);
      
      setNotifications(prevNotifications => [...newNotifications, ...prevNotifications].slice(0, 30)); // Keep only 30 most recent
      
      // Also store in localStorage for persistence
      const storedNotifications = JSON.parse(localStorage.getItem("adminNotifications")) || [];
      localStorage.setItem(
        "adminNotifications", 
        JSON.stringify([...newNotifications, ...storedNotifications].slice(0, 30))
      );
      
      // Change document title to indicate new notifications
      document.title = `(${newNotifications.length}) Admin Dashboard`;
      
      // Reset title after 5 seconds
      setTimeout(() => {
        document.title = "Admin Dashboard";
      }, 5000);
    }
  };
  
  const markAsRead = (id) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    
    // Update localStorage
    const storedNotifications = JSON.parse(localStorage.getItem("adminNotifications")) || [];
    localStorage.setItem(
      "adminNotifications", 
      JSON.stringify(storedNotifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      ))
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notif => ({ ...notif, read: true }))
    );
    
    // Update localStorage
    const storedNotifications = JSON.parse(localStorage.getItem("adminNotifications")) || [];
    localStorage.setItem(
      "adminNotifications", 
      JSON.stringify(storedNotifications.map(notif => ({ ...notif, read: true })))
    );
  };
  
  const removeNotification = (id, event) => {
    if (event) event.stopPropagation();
    
    setNotifications(prevNotifications => 
      prevNotifications.filter(notif => notif.id !== id)
    );
    
    // Update localStorage
    const storedNotifications = JSON.parse(localStorage.getItem("adminNotifications")) || [];
    localStorage.setItem(
      "adminNotifications", 
      JSON.stringify(storedNotifications.filter(notif => notif.id !== id))
    );
  };
  
  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem("adminNotifications", JSON.stringify([]));
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Returns a formatted time string like "5 mins ago" or "2 hours ago"
  const getTimeAgo = (timeString) => {
    // Handle time strings that are in HH:MM:SS format (without date)
    let notificationTime;
    if (timeString.includes(':') && !timeString.includes('-') && !timeString.includes('/')) {
      // If it's just a time string without date, create a date object with today's date
      const [hours, minutes, seconds] = timeString.split(':').map(Number);
      notificationTime = new Date();
      notificationTime.setHours(hours, minutes, seconds || 0);
    } else {
      notificationTime = new Date(timeString);
    }
    
    // Check if notificationTime is valid
    if (isNaN(notificationTime.getTime())) {
      return 'Recently'; // Fallback if we can't parse the time
    }
    
    const now = new Date();
    const diffMs = now - notificationTime;
    
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
    
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    
    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  };

  // Dashboard Stats - will update to trigger notifications
  const dashboardStats = [
    {
      title: "Today's Revenue",
      value: `Rs. ${dashboardData.todaysRevenue.toLocaleString()}`,
      icon: <DollarSign size={20} className="text-green-500" />,
      change: dashboardData.todaysRevenue - dashboardData.previousRevenue,
      changePercent: ((dashboardData.todaysRevenue - dashboardData.previousRevenue) / dashboardData.previousRevenue * 100).toFixed(1)
    },
    {
      title: "Today's Tickets",
      value: dashboardData.todaysTickets,
      icon: <ClipboardCheck size={20} className="text-blue-500" />,
      change: dashboardData.todaysTickets - dashboardData.previousTickets,
      changePercent: ((dashboardData.todaysTickets - dashboardData.previousTickets) / dashboardData.previousTickets * 100).toFixed(1)
    },
    {
      title: "Assigned Drivers",
      value: dashboardData.assignedDrivers,
      icon: <User size={20} className="text-indigo-500" />,
      change: dashboardData.assignedDrivers - dashboardData.previousAssignedDrivers,
      changePercent: ((dashboardData.assignedDrivers - dashboardData.previousAssignedDrivers) / dashboardData.previousAssignedDrivers * 100).toFixed(1)
    },
    {
      title: "Total Vehicles",
      value: dashboardData.totalVehicles,
      icon: <Bus size={20} className="text-purple-500" />,
      change: dashboardData.totalVehicles - dashboardData.previousVehicles,
      changePercent: ((dashboardData.totalVehicles - dashboardData.previousVehicles) / dashboardData.previousVehicles * 100).toFixed(1)
    }
  ];
  
  // Utilization metrics
  const driverUtilization = Math.round((dashboardData.assignedDrivers / dashboardData.driversRegistered) * 100);
  const vehicleUtilization = Math.round((dashboardData.assignedDrivers / dashboardData.totalVehicles) * 100);

  return (
    <div className="p-6 w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        
        {/* Notification bell */}
        <div className="relative" ref={notificationRef}>
          <button 
            className={`p-2 rounded-full hover:bg-gray-100 transition-all ${unreadCount > 0 ? 'text-blue-600' : 'text-gray-600'}`}
            onClick={() => setNotificationOpen(!notificationOpen)}
            aria-label="Notifications"
          >
            <Bell 
              size={24} 
              className={`${notificationAnimation ? 'animate-bounce' : ''}`} 
            />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
          
          {/* Notification dropdown */}
          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 border border-gray-200 overflow-hidden">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex justify-between items-center">
                <h3 className="font-medium flex items-center gap-2">
                  <Bell size={16} />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="bg-white text-blue-600 text-xs rounded-full px-2 py-0.5 font-medium">
                      {unreadCount} new
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs hover:underline flex items-center gap-1 text-white"
                    >
                      <Check size={14} />
                      Mark all read
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button 
                      onClick={clearAllNotifications}
                      className="text-xs hover:underline flex items-center gap-1 text-white"
                    >
                      <X size={14} />
                      Clear all
                    </button>
                  )}
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto bg-gray-50">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center">
                    <Bell size={32} className="text-gray-300 mb-2" />
                    <div>No notifications</div>
                    <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
                  </div>
                ) : (
                  <>
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`border-b border-gray-100 transition-colors cursor-pointer 
                        ${!notification.read ? getNotificationBgColor(notification.type) : 'bg-white hover:bg-gray-50'}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="p-3">
                        <div className="flex justify-between">
                          <div className="flex">
                            <div className="mr-3 p-2 rounded-full bg-white shadow-sm">
                              {getNotificationIcon(notification.type, notification.category)}
                            </div>
                            <div>
                              <div className="font-medium flex items-center">
                                {notification.title}
                                {!notification.read && (
                                  <span className="ml-2 w-2 h-2 rounded-full bg-blue-500"></span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 mt-0.5">{notification.message}</div>
                              <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                                {getTimeAgo(notification.time)}
                                {!notification.read && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsRead(notification.id);
                                    }}
                                    className="text-blue-500 hover:text-blue-700 hover:underline"
                                  >
                                    Mark as read
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => removeNotification(notification.id, e)}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 h-fit"
                            aria-label="Remove notification"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="p-2 text-center border-t border-gray-200">
                    <button className="text-sm text-blue-500 hover:text-blue-700 font-medium">
                      View all notifications
                    </button>
                  </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Display alerts for critical thresholds */}
      <div className="space-y-3 mb-6">
        {notifications
          .filter(n => n.type === 'warning' && !n.read)
          .slice(0, 2)
          .map(alert => (
            <div 
              key={alert.id}
              className="flex items-start justify-between bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-amber-400 p-4 rounded-md shadow-sm"
            >
              <div className="flex items-start">
                <div className="mr-3 p-2 bg-white rounded-full shadow-sm">
                  {getNotificationIcon(alert.type, alert.category)}
                </div>
                <div>
                  <div className="font-medium text-amber-800">{alert.title}</div>
                  <div className="text-sm text-amber-700">{alert.message}</div>
                  <div className="text-xs text-amber-600 mt-1">{getTimeAgo(alert.time)}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <button 
                  onClick={() => markAsRead(alert.id)}
                  className="text-amber-600 hover:text-amber-800 bg-white p-1 rounded-full shadow-sm"
                  aria-label="Mark as read"
                >
                  <Check size={14} />
                </button>
                <button 
                  onClick={() => removeNotification(alert.id)}
                  className="text-amber-600 hover:text-amber-800 bg-white p-1 rounded-full shadow-sm"
                  aria-label="Dismiss"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        
        {/* Success notifications can also be shown here */}
        {notifications
          .filter(n => n.type === 'success' && !n.read)
          .slice(0, 1)
          .map(alert => (
            <div 
              key={alert.id}
              className="flex items-start justify-between bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-400 p-4 rounded-md shadow-sm"
            >
              <div className="flex items-start">
                <div className="mr-3 p-2 bg-white rounded-full shadow-sm">
                  {getNotificationIcon(alert.type, alert.category)}
                </div>
                <div>
                  <div className="font-medium text-green-800">{alert.title}</div>
                  <div className="text-sm text-green-700">{alert.message}</div>
                  <div className="text-xs text-green-600 mt-1">{getTimeAgo(alert.time)}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <button 
                  onClick={() => markAsRead(alert.id)}
                  className="text-green-600 hover:text-green-800 bg-white p-1 rounded-full shadow-sm"
                  aria-label="Mark as read"
                >
                  <Check size={14} />
                </button>
                <button 
                  onClick={() => removeNotification(alert.id)}
                  className="text-green-600 hover:text-green-800 bg-white p-1 rounded-full shadow-sm"
                  aria-label="Dismiss"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
      </div>
      
      {/* Dashboard stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {dashboardStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                
                {stat.change !== 0 && (
                  <div className={`flex items-center mt-2 text-xs ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change > 0 ? (
                      <TrendingUp size={14} className="mr-1" />
                    ) : (
                      <TrendingDown size={14} className="mr-1" />
                    )}
                    <span>
                      {stat.change > 0 ? '+' : ''}{stat.change} ({stat.change > 0 ? '+' : ''}{stat.changePercent}%)
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-gray-50 rounded-full">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Utilization indicators */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-6">
        <h3 className="font-semibold text-gray-700 mb-4">Resource Utilization</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Driver allocation */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Driver Allocation</span>
              <span className="text-sm font-medium">{driverUtilization}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  driverUtilization > 90 ? 'bg-green-500' : 
                  driverUtilization > 70 ? 'bg-blue-500' : 
                  driverUtilization > 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${driverUtilization}%` }}
              ></div>
            </div>
          </div>
          
          {/* Vehicle utilization */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Vehicle Utilization</span>
              <span className="text-sm font-medium">{vehicleUtilization}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${
                  vehicleUtilization > 90 ? 'bg-green-500' : 
                  vehicleUtilization > 70 ? 'bg-blue-500' : 
                  vehicleUtilization > 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${vehicleUtilization}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Driver and vehicle details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Drivers registered vs assigned */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">Driver Status</h3>
            <div className="p-2 bg-blue-50 rounded-full">
              <Users size={18} className="text-blue-500" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Registered Drivers</span>
                <span className="font-medium">{dashboardData.driversRegistered}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-blue-500 w-full"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Assigned Drivers</span>
                <span className="font-medium">{dashboardData.assignedDrivers}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-green-500" 
                  style={{ width: `${(dashboardData.assignedDrivers / dashboardData.driversRegistered) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Unassigned Drivers</span>
                <span className="font-medium">{dashboardData.driversRegistered - dashboardData.assignedDrivers}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-gray-400" 
                  style={{ width: `${((dashboardData.driversRegistered - dashboardData.assignedDrivers) / dashboardData.driversRegistered) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Revenue metrics */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">Revenue Metrics</h3>
            <div className="p-2 bg-green-50 rounded-full">
              <DollarSign size={18} className="text-green-500" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Today's Revenue</span>
                <span className="font-medium">Rs. {dashboardData.todaysRevenue.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-green-500 w-full"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Total Tickets</span>
                <span className="font-medium">{dashboardData.todaysTickets}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 rounded-full bg-blue-500 w-full"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Avg. Revenue Per Ticket</span>
                <span className="font-medium">Rs. {dashboardData.revenuePerTicket}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    dashboardData.revenuePerTicket > dashboardData.previousRevenuePerTicket 
                      ? 'bg-green-500' 
                      : 'bg-amber-500'
                  }`} 
                  style={{ width: '100%' }}
                ></div>
              </div>
              
              {dashboardData.previousRevenuePerTicket > 0 && (
                <div className={`flex items-center mt-1 text-xs ${
                  dashboardData.revenuePerTicket > dashboardData.previousRevenuePerTicket 
                    ? 'text-green-600' 
                    : 'text-amber-600'
                }`}>
                  {dashboardData.revenuePerTicket > dashboardData.previousRevenuePerTicket ? (
                    <TrendingUp size={12} className="mr-1" />
                  ) : (
                    <TrendingDown size={12} className="mr-1" />
                  )}
                  <span>
                    {dashboardData.revenuePerTicket > dashboardData.previousRevenuePerTicket ? '+' : ''}
                    {dashboardData.revenuePerTicket - dashboardData.previousRevenuePerTicket} from previous
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Demo controls (for presentation purposes) */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-6">
        <h3 className="font-semibold text-gray-700 mb-4">Demo Controls</h3>
        <p className="text-sm text-gray-600 mb-4">
          The notification system is currently generating random data changes every 8 seconds to simulate real-time updates.
          Watch the notification bell for new alerts.
        </p>
        
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => {
              // Force a revenue increase notification
              const newData = {...dashboardData};
              newData.previousRevenue = newData.todaysRevenue;
              newData.todaysRevenue += 15000;
              checkForNotifications(newData);
              setDashboardData(newData);
            }}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm font-medium"
          >
            Simulate Revenue Increase
          </button>
          
          <button 
            onClick={() => {
              // Force a ticket increase notification
              const newData = {...dashboardData};
              newData.previousTickets = newData.todaysTickets;
              newData.todaysTickets += 25;
              checkForNotifications(newData);
              setDashboardData(newData);
            }}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium"
          >
            Simulate Ticket Sales
          </button>
          
          <button 
            onClick={() => {
              // Force a driver utilization warning
              const newData = {...dashboardData};
              newData.previousAssignedDrivers = newData.assignedDrivers;
              newData.assignedDrivers = Math.floor(newData.driversRegistered * 0.6);
              checkForNotifications(newData);
              setDashboardData(newData);
            }}
            className="px-4 py-2 bg-amber-100 text-amber-700 rounded-md hover:bg-amber-200 transition-colors text-sm font-medium"
          >
            Simulate Low Driver Utilization
          </button>
          
          <button 
            onClick={() => {
              // Force a vehicle-to-driver ratio imbalance
              const newData = {...dashboardData};
              newData.previousAssignedDrivers = newData.assignedDrivers;
              newData.assignedDrivers = Math.floor(newData.totalVehicles * 1.3);
              checkForNotifications(newData);
              setDashboardData(newData);
            }}
            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors text-sm font-medium"
          >
            Simulate Excess Drivers
          </button>
          
          <button 
            onClick={() => {
              // Force a revenue decrease warning
              const newData = {...dashboardData};
              newData.previousRevenue = newData.todaysRevenue;
              newData.todaysRevenue -= 12000;
              checkForNotifications(newData);
              setDashboardData(newData);
            }}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm font-medium"
          >
            Simulate Revenue Decrease
          </button>
          
          <button 
            onClick={clearAllNotifications}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Clear All Notifications
          </button>
        </div>
      </div>
    </div>
  );
}

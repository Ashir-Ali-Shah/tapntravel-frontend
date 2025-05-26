import React, { useState, useEffect } from "react";
import Card from "./Card";
import CompaniesTable from "./CompaniesTable";
import GroupedBarChart from "../Charts/GroupedBarChart";
import RevenueDonutChart from "../Charts/RevenueDonutChart";
import axios from "axios";
import { apiBaseUrl } from "../apis/setting";
import { Bell, X, Check, AlertTriangle } from "lucide-react";

const SuperAdminDashboard = () => {
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
        const response = await axios.get(`${apiBaseUrl}/admin/admins-analytics`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

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
    if (!dashboardData?.data) return;
    
    const now = Date.now();
    
    // Only check for notifications every 8 hours or on first load
    if (lastNotificationCheck && (now - lastNotificationCheck) < NOTIFICATION_COOLDOWN) {
      return;
    }
    
    const newNotifications = [];
    const timestamp = new Date().toISOString();
    const companies = dashboardData.data;
    
    if (companies && companies.length > 0) {
      // Sort companies by revenue to find top performers
      const sortedCompanies = [...companies].sort((a, b) => 
        parseFloat(b.revenue || 0) - parseFloat(a.revenue || 0)
      );
      
      const topCompany = sortedCompanies[0];
      const totalRevenue = companies.reduce((sum, company) => sum + parseFloat(company.revenue || 0), 0);
      const avgRevenue = totalRevenue / companies.length;
      
      // Top performing company notification
      if (topCompany && parseFloat(topCompany.revenue) > avgRevenue * 1.5 && shouldGenerateNotification('top-performer')) {
        newNotifications.push({
          id: `top-performer-${Date.now()}`,
          type: "success",
          message: `${topCompany.adminName} is the top performing company with Rs. ${topCompany.revenue}`,
          timestamp: timestamp,
          read: false
        });
        markNotificationGenerated('top-performer');
      }
      
      // Low performing companies notification
      const lowPerformers = companies.filter(company => 
        parseFloat(company.revenue || 0) < avgRevenue * 0.5
      );
      
      if (lowPerformers.length > 0 && shouldGenerateNotification('low-performers')) {
        newNotifications.push({
          id: `low-performers-${Date.now()}`,
          type: "warning",
          message: `${lowPerformers.length} companies are performing below 50% of average revenue`,
          timestamp: timestamp,
          read: false
        });
        markNotificationGenerated('low-performers');
      }
      
      // New company registration (simulated based on company count)
      if (companies.length > 5 && shouldGenerateNotification('company-growth')) {
        newNotifications.push({
          id: `company-growth-${Date.now()}`,
          type: "info",
          message: `Platform growth: ${companies.length} companies now registered`,
          timestamp: timestamp,
          read: false
        });
        markNotificationGenerated('company-growth');
      }
      
      // Revenue milestone notifications
      if (totalRevenue > 100000 && shouldGenerateNotification('revenue-milestone')) {
        newNotifications.push({
          id: `revenue-milestone-${Date.now()}`,
          type: "success",
          message: `Platform revenue milestone reached: Rs. ${totalRevenue.toFixed(2)}`,
          timestamp: timestamp,
          read: false
        });
        markNotificationGenerated('revenue-milestone');
      }
      
      // Market concentration analysis
      const topThreeRevenue = sortedCompanies.slice(0, 3)
        .reduce((sum, company) => sum + parseFloat(company.revenue || 0), 0);
      const marketConcentration = (topThreeRevenue / totalRevenue) * 100;
      
      if (marketConcentration > 80 && shouldGenerateNotification('market-concentration')) {
        newNotifications.push({
          id: `market-concentration-${Date.now()}`,
          type: "warning",
          message: `High market concentration: Top 3 companies control ${marketConcentration.toFixed(1)}% of revenue`,
          timestamp: timestamp,
          read: false
        });
        markNotificationGenerated('market-concentration');
      }
      
      // Companies with zero revenue notification
      const inactiveCompanies = companies.filter(company => 
        parseFloat(company.revenue || 0) === 0
      );
      
      if (inactiveCompanies.length > 0 && shouldGenerateNotification('inactive-companies')) {
        newNotifications.push({
          id: `inactive-companies-${Date.now()}`,
          type: "info",
          message: `${inactiveCompanies.length} companies have no revenue recorded`,
          timestamp: timestamp,
          read: false
        });
        markNotificationGenerated('inactive-companies');
      }
      
      // Revenue distribution analysis
      const revenueStdDev = calculateStandardDeviation(
        companies.map(c => parseFloat(c.revenue || 0))
      );
      
      if (revenueStdDev > avgRevenue && shouldGenerateNotification('revenue-disparity')) {
        newNotifications.push({
          id: `revenue-disparity-${Date.now()}`,
          type: "info",
          message: `High revenue disparity detected across companies`,
          timestamp: timestamp,
          read: false
        });
        markNotificationGenerated('revenue-disparity');
      }
    }
    
    // Add all new notifications to state
    if (newNotifications.length > 0) {
      // Limit to maximum 3 notifications per batch to avoid overwhelming
      const limitedNotifications = newNotifications.slice(0, 3);
      
      setNotifications(prev => [...limitedNotifications, ...prev]);
      setUnreadCount(prev => prev + limitedNotifications.length);
      
      // Trigger the glowing effect when new notifications arrive
      setIsGlowing(true);
      setTimeout(() => setIsGlowing(false), 2000); // Stop glowing after 2 seconds
      
      console.log(`Generated ${limitedNotifications.length} new notifications`);
    }
    
    // Update the last notification check time
    setLastNotificationCheck(now);
    
  }, [dashboardData, notificationHistory]);

  // Helper function to calculate standard deviation
  const calculateStandardDeviation = (values) => {
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, value) => sum + value, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  };

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
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <Check className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <X className="w-4 h-4 text-red-500" />;
      default: return <Bell className="w-4 h-4 text-blue-500" />;
    }
  };
  
  const getNotificationBgColor = (type, read) => {
    if (read) return "bg-gray-50";
    
    switch (type) {
      case 'success': return "bg-green-50";
      case 'warning': return "bg-yellow-50";
      case 'error': return "bg-red-50";
      default: return "bg-blue-50";
    }
  };

  return (
    <div className="content lg:px-4">
      <div className="m-auto lg:px-8">
        <div className="flex justify-between items-center my-4">
          <h1 className="font-bold text-3xl">Super Admin Dashboard</h1>
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
            
            {/* Notifications Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-10 max-h-96 overflow-y-auto border border-gray-100 transition-all duration-300 animate-fadeIn">
                <div className="flex justify-between items-center p-3 border-b bg-gradient-to-r from-blue-50 to-white sticky top-0 z-10">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
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
                      return (
                        <div 
                          key={notification.id} 
                          className={`p-3 hover:bg-gray-50 transition-all duration-300 ${
                            getNotificationBgColor(notification.type, notification.read)
                          } ${isNew && !notification.read ? 'animate-fadeIn' : ''}`}
                        >
                          <div className="flex items-start">
                            <div className={`flex-shrink-0 mt-0.5 mr-2 rounded-full p-1 ${
                              isNew && !notification.read 
                                ? 'animate-pulse' 
                                : ''
                            }`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${
                                notification.read 
                                  ? 'text-gray-600' 
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
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* First row of charts */}
        <div className="lg:flex gap-6 mb-6">
          <div className="lg:w-2/3 mb-6 lg:mb-0">
            <GroupedBarChart />
          </div>
          <div className="lg:w-1/3">
            <RevenueDonutChart />
          </div>
        </div>
        
        {/* Companies table */}
        <div className="pt-4">
          <CompaniesTable />
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
        `}</style>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
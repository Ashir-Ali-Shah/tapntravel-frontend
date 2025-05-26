import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { apiBaseUrl } from "../apis/setting";
import { formatDateToDayMonth } from "../utils/HelperFunctions";
import { useNavigate } from "react-router-dom";
import apiClient from "../apis/apiClient";
import { busStatuses } from "../utils/bus-statuses";
import BusStatusChart from "../Charts/BusStatusChart";
import DailyTripsChart from "../Charts/DailyTripsChart";
import RoutesCountChart from "../Charts/RoutesCountChart";
import { Bell, X, Check, AlertTriangle, MapPin, Clock, Users, DollarSign } from "lucide-react";

const DriverDashboard = () => {
  const [driverBuses, setDriverBuses] = useState([]);
  const [filter, setFilter] = useState("Upcoming");
  const navigate = useNavigate();
  
  // Enhanced notification state matching admin dashboard
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isGlowing, setIsGlowing] = useState(false);
  const [lastNotificationCheck, setLastNotificationCheck] = useState(null);
  
  // Track notification types and their last generation time
  const [notificationHistory, setNotificationHistory] = useState({});
  const NOTIFICATION_COOLDOWN = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

  const today = new Date();
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const tomorrowMidnight = new Date(todayMidnight);
  tomorrowMidnight.setDate(todayMidnight.getDate() + 1);
  const dayAfterTomorrow = new Date(todayMidnight);
  dayAfterTomorrow.setDate(todayMidnight.getDate() + 2);

  useEffect(() => {
    fetchDriverBuses();
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

  // Generate notifications based on bus data changes with cooldown logic
  useEffect(() => {
    if (driverBuses.length === 0) return;
    
    const now = Date.now();
    
    // Only check for notifications every 8 hours or on first load
    if (lastNotificationCheck && (now - lastNotificationCheck) < NOTIFICATION_COOLDOWN) {
      return;
    }
    
    const newNotifications = [];
    const timestamp = new Date().toISOString();
    
    // Today's trips notification
    const todayTrips = driverBuses.filter(
      bus => new Date(bus.date).toDateString() === todayMidnight.toDateString()
    );
    
    if (todayTrips.length > 0 && shouldGenerateNotification('today-trips')) {
      newNotifications.push({
        id: `today-trips-${Date.now()}`,
        type: 'info',
        message: `You have ${todayTrips.length} trip${todayTrips.length > 1 ? 's' : ''} scheduled for today!`,
        timestamp: timestamp,
        read: false
      });
      markNotificationGenerated('today-trips');
    }
    
    // Upcoming trips starting soon notification
    const upcomingTrips = driverBuses.filter(bus => {
      if (!bus.date || !bus.departureTime) return false;
      
      const busDate = new Date(bus.date);
      if (busDate.toDateString() !== todayMidnight.toDateString()) return false;
      
      const [hours, minutes] = bus.departureTime.split(':').map(Number);
      const tripTime = new Date(busDate);
      tripTime.setHours(hours, minutes, 0);
      
      const timeDiff = (tripTime - new Date()) / (1000 * 60); // difference in minutes
      return timeDiff > 0 && timeDiff <= 120; // within next 2 hours
    });
    
    if (upcomingTrips.length > 0 && shouldGenerateNotification('upcoming-trips')) {
      newNotifications.push({
        id: `upcoming-trips-${Date.now()}`,
        type: 'warning',
        message: `${upcomingTrips.length} trip${upcomingTrips.length > 1 ? 's' : ''} starting within 2 hours!`,
        timestamp: timestamp,
        read: false
      });
      markNotificationGenerated('upcoming-trips');
    }
    
    // In-transit status notification
    const inTransitTrips = driverBuses.filter(bus => bus.status === busStatuses.IN_TRANSIT);
    if (inTransitTrips.length > 0 && shouldGenerateNotification('in-transit')) {
      newNotifications.push({
        id: `in-transit-${Date.now()}`,
        type: 'info',
        message: `You have ${inTransitTrips.length} trip${inTransitTrips.length > 1 ? 's' : ''} currently in transit.`,
        timestamp: timestamp,
        read: false
      });
      markNotificationGenerated('in-transit');
    }

    // Daily summary notification
    const completedToday = driverBuses.filter(bus => 
      bus.status === busStatuses.COMPLETED &&
      new Date(bus.date).toDateString() === todayMidnight.toDateString()
    );
    
    if (completedToday.length > 0 && shouldGenerateNotification('daily-summary')) {
      newNotifications.push({
        id: `daily-summary-${Date.now()}`,
        type: 'success',
        message: `Great job! You've completed ${completedToday.length} trip${completedToday.length > 1 ? 's' : ''} today.`,
        timestamp: timestamp,
        read: false
      });
      markNotificationGenerated('daily-summary');
    }

    // Maintenance reminder (if no trips for several days)
    const lastTripDate = Math.max(...driverBuses.map(bus => new Date(bus.date).getTime()));
    const daysSinceLastTrip = (now - lastTripDate) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastTrip > 3 && shouldGenerateNotification('maintenance-reminder')) {
      newNotifications.push({
        id: `maintenance-reminder-${Date.now()}`,
        type: 'info',
        message: 'Consider scheduling vehicle maintenance during your free time.',
        timestamp: timestamp,
        read: false
      });
      markNotificationGenerated('maintenance-reminder');
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
    
  }, [driverBuses, notificationHistory]);

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

  const fetchDriverBuses = async () => {
    try {
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      const response = await fetch(`${apiBaseUrl}/bus/bus-advance-search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          driverId: decodedToken?.sub,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch buses");
        addNotification("error", "Failed to fetch bus data");
      }

      const data = await response.json();
      setDriverBuses(data.data);
    } catch (error) {
      console.error("Error fetching driver's buses:", error);
      addNotification("error", "Failed to fetch bus data");
    }
  };

  const filterBuses = () => {
    if (filter === "Today") {
      return driverBuses.filter(
        (bus) =>
          new Date(bus.date).toDateString() === todayMidnight.toDateString()
      );
    }

    if (filter === "Tomorrow") {
      return driverBuses.filter(
        (bus) =>
          new Date(bus.date).toDateString() === tomorrowMidnight.toDateString()
      );
    }

    if (filter === "UpcomingDates") {
      return driverBuses.filter(
        (bus) =>
          new Date(bus.date).toDateString() === dayAfterTomorrow.toDateString()
      );
    }

    if (filter === "Upcoming") {
      return driverBuses.filter((bus) => new Date(bus.date) >= todayMidnight);
    }

    if (filter === "Past") {
      return driverBuses.filter((bus) => new Date(bus.date) < todayMidnight);
    }

    return driverBuses;
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };
  
  const isStartDriveAvailable = (bus) => {
    if (bus?.status === busStatuses.COMPLETED) {
      console.log("Bus status is COMPLETED");
      return false;
    }

    if (!bus?.date) {
      console.log("Bus date is missing");
      return false;
    }

    const now = new Date();

    // Strip UTC offset and parse as local
    const localDateStr = bus.date.replace(/Z|(\+|-)\d{2}:\d{2}$/, "");
    const busDate = new Date(localDateStr);

    const thirtyMinutesBefore = new Date(busDate.getTime() - 30 * 60 * 1000);

    console.log("Current time (local):", now.toString());
    console.log("Bus date (forced as local):", busDate.toString());
    console.log("30 minutes before bus date:", thirtyMinutesBefore.toString());

    const isAvailable = now >= thirtyMinutesBefore;
    console.log("Is start drive available?", isAvailable);

    return isAvailable;
  };

  const handleStartDrive = async (busId) => {
    try {
      const response = await apiClient.post("/bus/update-bus-status", {
        busId,
        status: busStatuses.IN_TRANSIT,
      });

      console.log("Bus status updated:", response.data);
      addNotification("success", "Drive started successfully!");
      navigate(`driver/map/${busId}`);
    } catch (error) {
      console.error("Failed to update bus status:", error);
      addNotification("error", "Failed to start drive");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case busStatuses.COMPLETED: return "text-green-600 bg-green-100";
      case busStatuses.IN_TRANSIT: return "text-orange-600 bg-orange-100";
      case busStatuses.CANCELLED: return "text-red-600 bg-red-100";
      default: return "text-blue-600 bg-blue-100";
    }
  };

  return (
    <div className="content lg:px-0">
      <div className="m-auto lg:px-8">
        <div className="flex justify-between items-center m-3">
          <h1 className="font-bold text-3xl">Driver Dashboard</h1>
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
        
        {/* Charts Section with enhanced styling */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 px-3">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <BusStatusChart buses={driverBuses} />
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <DailyTripsChart buses={driverBuses} />
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <RoutesCountChart buses={driverBuses} />
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-8 px-3">
          <h1 className="text-2xl font-bold text-gray-800">Assigned Buses</h1>
          <div className="flex justify-center items-center gap-2">
            <span className="text-gray-600 font-medium">Filter</span>
            <select
              className="bg-white border border-gray-300 p-2 rounded-lg shadow-sm hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              value={filter}
              onChange={handleFilterChange}
            >
              <option value="Today">
                Today, {todayMidnight.toLocaleDateString("en-US", { weekday: "long" })}
              </option>
              <option value="Tomorrow">
                Tomorrow, {tomorrowMidnight.toLocaleDateString("en-US", { weekday: "long" })}
              </option>
              <option value="UpcomingDates">
                {dayAfterTomorrow.toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  weekday: "long",
                })}
              </option>
              <option value="Upcoming">Upcoming Buses</option>
              <option value="Past">Past Buses</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-3 mb-8">
          {filterBuses().length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
              <MapPin className="w-16 h-16 text-gray-300 mb-4" />
              <h1 className="text-xl font-semibold mb-2">No bus drives for {filter.toLowerCase()}</h1>
              <p className="text-gray-400">Check back later or try a different filter</p>
            </div>
          ) : (
            filterBuses().map((bus, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl border border-gray-100 hover:border-blue-200"
              >
                {/* Route Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-lg text-gray-800">
                      {bus?.route?.startCity} → {bus?.route?.endCity}
                    </h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bus?.status || "Upcoming")}`}>
                    {bus?.status || "Upcoming"}
                  </span>
                </div>

                {/* Trip Details */}
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm font-medium">{formatDateToDayMonth(bus?.date)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm">
                      {bus?.departureTime} - {bus?.arrivalTime}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm">
                      {bus?.busDetails?.busCapacity} seats | {bus?.busDetails?.busNumber}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm font-medium">
                      Rs. {bus?.fare?.actualPrice}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                {isStartDriveAvailable(bus) && (
                  <button
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg mt-4 w-full hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg font-medium"
                    onClick={() => handleStartDrive(bus._id)}
                  >
                    Start Drive
                  </button>
                )}
              </div>
            ))
          )}
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

export default DriverDashboard;
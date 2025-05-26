import React, { useEffect, useState } from "react";
import { MapPin, Clock, Navigation } from "lucide-react";
import axios from "axios";
import { apiBaseUrl } from "../apis/setting";
import { jwtDecode } from "jwt-decode";

const NavigationBusesList = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedLocationId, setExpandedLocationId] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const decodedToken = jwtDecode(token);
        const adminId = decodedToken.sub;
        
        // API Call
        const response = await axios.post(
          `${apiBaseUrl}/location/location-advance-search`,
          { adminId },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        // For each location, fetch the location name using reverse geocoding
        const locationsWithNames = await Promise.all(
          response.data.data.map(async (location) => {
            try {
              // Try to fetch the location name using reverse geocoding
              const geocodeResponse = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.driverLatitude}&lon=${location.driverLongitude}&zoom=18&addressdetails=1`,
                { headers: { "User-Agent": "BusTrackingApp" } }
              );
              
              return {
                ...location,
                locationName: geocodeResponse.data.display_name || "Unknown location"
              };
            } catch (err) {
              // If geocoding fails, return the original location without a name
              console.error("Error fetching location name:", err);
              return {
                ...location,
                locationName: "Location name unavailable"
              };
            }
          })
        );

        setLocations(locationsWithNames);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching locations.");
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const toggleLocationDetails = (locationId) => {
    if (expandedLocationId === locationId) {
      setExpandedLocationId(null); // Collapse if already expanded
    } else {
      setExpandedLocationId(locationId); // Expand the clicked location
    }
  };

  const formatDateTime = (dateTimeString) => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString();
    } catch (e) {
      return dateTimeString || 'N/A';
    }
  };

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Idle": return "bg-blue-100 text-blue-800";
      case "Stopped": return "bg-yellow-100 text-yellow-800";
      case "Offline": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Navigation Buses List</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : locations.length === 0 ? (
        <p>No locations found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-center">
                <th className="p-4 border">Bus ID</th>
                <th className="p-4 border">Location Coordinates</th>
                <th className="p-4 border">Status</th>
                <th className="p-4 border">Details</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <React.Fragment key={location._id}>
                  <tr className="hover:bg-gray-50 text-center">
                    <td className="p-4 border">{location.busId}</td>
                    <td className="p-4 border">
                      <div className="flex flex-col items-center">
                        <div className="flex items-center text-gray-700 mb-1">
                          <MapPin size={16} className="mr-1 text-red-500" />
                          <span>
                            {location.driverLatitude}, {location.driverLongitude}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {location.locationName || "Unknown location"}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 border">
                      <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(location.status || 'Unknown')}`}>
                        {location.status || "Unknown"}
                      </span>
                    </td>
                    <td className="p-4 border">
                      <button
                        onClick={() => toggleLocationDetails(location._id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded text-sm flex items-center justify-center mx-auto"
                      >
                        {expandedLocationId === location._id ? "Hide" : "View"} Details
                      </button>
                    </td>
                  </tr>
                  {expandedLocationId === location._id && (
                    <tr className="bg-gray-50">
                      <td colSpan="4" className="p-4 border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded shadow">
                            <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                              <Navigation size={18} className="mr-2" /> Navigation Details
                            </h3>
                            <p><span className="font-medium">Latitude:</span> {location.driverLatitude}</p>
                            <p><span className="font-medium">Longitude:</span> {location.driverLongitude}</p>
                            <p><span className="font-medium">Location Name:</span> {location.locationName || "Unknown location"}</p>
                            {location.accuracy && <p><span className="font-medium">Accuracy:</span> {location.accuracy} meters</p>}
                          </div>
                          
                          <div className="bg-white p-4 rounded shadow">
                            <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                              <Clock size={18} className="mr-2" /> Additional Information
                            </h3>
                            <p><span className="font-medium">Last Updated:</span> {location.updatedAt ? formatDateTime(location.updatedAt) : 'N/A'}</p>
                            {location.speed && <p><span className="font-medium">Speed:</span> {location.speed} km/h</p>}
                            {location.bearing && <p><span className="font-medium">Bearing:</span> {location.bearing}°</p>}
                            {location.altitude && <p><span className="font-medium">Altitude:</span> {location.altitude} m</p>}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NavigationBusesList;
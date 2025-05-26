import { useEffect, useState } from "react";
import {
  GoogleMap,
  DirectionsRenderer,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Loader from "../utils/Loader";
import { apiBaseUrl } from "../apis/setting";
import { busStatuses } from "../utils/bus-statuses";
import apiClient from "../apis/apiClient";

const containerStyle = {
  width: "100%",
  height: "90%",
};

const DriverMapNavigation = () => {
  const { busId } = useParams();
  const navigate = useNavigate();

  const [userLocation, setUserLocation] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [busData, setBusData] = useState(null);
  const [loading, setLoading] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const updateDriverLocation = async (latitude, longitude) => {
    try {
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      await fetch(`${apiBaseUrl}/location/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          busId,
          driverId: decodedToken?.sub,
          latitude,
          longitude,
        }),
      });
    } catch (error) {
      console.error("❌ Error updating driver location:", error);
    }
  };

  const fetchBusData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiBaseUrl}/bus/bus-advance-search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ _id: busId }),
      });

      const data = await response.json();
      console.log("✅ Bus data response:", data);
      if (data.data && data.data.length > 0) {
        setBusData(data.data[0]);
      } else {
        console.warn("⚠️ No bus data returned");
      }
    } catch (error) {
      console.error("❌ Error fetching bus data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Watch geolocation
  useEffect(() => {
    let watchId;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const current = { lat: latitude, lng: longitude };
          setUserLocation(current);
          updateDriverLocation(latitude, longitude);
          // calculateRoute(current);
        },
        (error) => console.error("Geolocation error:", error),
        { enableHighAccuracy: true }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const calculateRoute = async (currentLocation = userLocation) => {
    if (!busData || !busData.route?.stops?.length || !currentLocation) return;

    const directionsService = new window.google.maps.DirectionsService();
    const stops = busData.route.stops;

    const origin = currentLocation;
    const destination = {
      lat: stops[stops.length - 1].geometry.location.lat,
      lng: stops[stops.length - 1].geometry.location.lng,
    };

    const waypoints = stops.slice(1, -1).map((stop) => ({
      location: {
        lat: stop.geometry.location.lat,
        lng: stop.geometry.location.lng,
      },
      stopover: true,
    }));

    try {
      const result = await directionsService.route({
        origin,
        destination,
        waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: true,
      });

      setDirectionsResponse(result);

      const routeLegs = result.routes[0].legs;
      let totalDistance = 0;
      let totalDuration = 0;

      routeLegs.forEach((leg) => {
        totalDistance += leg.distance.value;
        totalDuration += leg.duration.value;
      });

      setDistance((totalDistance / 1000).toFixed(2) + " km");
      setDuration(Math.ceil(totalDuration / 60) + " mins");
    } catch (error) {
      console.error("Directions request failed:", error);
    }
  };

  useEffect(() => {
    fetchBusData();
  }, []);

  // Routing logic
  useEffect(() => {
    const calculateRoute = async () => {
      if (!busData || !busData.route?.stops?.length) {
        console.warn("⛔ No busData or stops to calculate route");
        return;
      }

      const stops = busData.route.stops;
      console.log("📌 Bus stops:", stops);

      const firstStop = stops[0]?.geometry?.location;
      const lastStop = stops[stops.length - 1]?.geometry?.location;

      if (!firstStop || !lastStop) {
        console.warn("⚠️ Missing coordinates for first/last stop");
        return;
      }

      const origin = userLocation || {
        lat: firstStop.lat,
        lng: firstStop.lng,
      };

      const destination = {
        lat: lastStop.lat,
        lng: lastStop.lng,
      };

      const waypoints = stops
        .slice(1, -1)
        .map((stop, idx) => {
          const loc = stop.geometry?.location;
          if (loc?.lat && loc?.lng) {
            return {
              location: { lat: loc.lat, lng: loc.lng },
              stopover: true,
            };
          } else {
            console.warn(`⚠️ Missing location for stop ${idx}:`, stop);
            return null;
          }
        })
        .filter(Boolean);

      console.log("🧭 Routing info →");
      console.log("   Origin:", origin);
      console.log("   Destination:", destination);
      console.log("   Waypoints:", waypoints);

      try {
        const directionsService = new window.google.maps.DirectionsService();
        const result = await directionsService.route({
          origin,
          destination,
          waypoints,
          travelMode: window.google.maps.TravelMode.DRIVING,
          optimizeWaypoints: false,
        });

        console.log("✅ Directions API result:", result);
        setDirectionsResponse(result);

        let totalDistance = 0;
        let totalDuration = 0;

        result.routes[0].legs.forEach((leg, i) => {
          console.log(`📏 Leg ${i + 1} distance:`, leg.distance?.text);
          totalDistance += leg.distance.value;
          totalDuration += leg.duration.value;
        });

        setDistance((totalDistance / 1000).toFixed(2) + " km");
        setDuration(Math.ceil(totalDuration / 60) + " mins");
      } catch (error) {
        console.error("❌ Directions API error:", error);
      }
    };

    if (isLoaded) {
      calculateRoute();
    }
  }, [busData, userLocation, isLoaded]);

  // I want this component to renender when driver changes status of bus so that buttons can update accordingly
  const changeBusStatus = async (status) => {
    setLoading(true);
    try {
      await apiClient.post("/bus/update-bus-status", {
        busId,
        status: status,
      });

      if (status === busStatuses.COMPLETED) {
        navigate(`/`);
      }
    } catch (error) {
      console.error("Failed to update bus status:", error);
    } finally {
      await fetchBusData();
    }
  };

  if (!isLoaded) return <Loader />;

  return (
    <div className="w-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLocation || { lat: 30.1575, lng: 71.5249 }}
        zoom={10}
      >
        {directionsResponse && (
          <DirectionsRenderer directions={directionsResponse} />
        )}

        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              url: "/bus-icon.png",
              scaledSize: new window.google.maps.Size(40, 40),
            }}
          />
        )}
      </GoogleMap>

      <div className="flex justify-center items-center gap-6">
        {distance && duration && (
          <div className="text-center mt-4">
            <p>
              Total Distance: <strong>{distance}</strong>
            </p>
            <p>
              Estimated Duration: <strong>{duration}</strong>
            </p>
          </div>
        )}

        {busData?.status === busStatuses.IN_TRANSIT && (
          <button
            className="bg-primary text-white py-2 px-6 rounded-full"
            onClick={() => changeBusStatus(busStatuses.PAUSED)}
          >
            {loading ? <Loader /> : "Pasue Drive"}
          </button>
        )}
        {busData?.status === busStatuses.PAUSED && (
          <button
            className="bg-yellow-500 text-white py-2 px-6 rounded-full"
            onClick={() => changeBusStatus(busStatuses.IN_TRANSIT)}
          >
            {loading ? <Loader /> : "Resume Drive"}
          </button>
        )}
        <button
          className="bg-red-500 text-white py-2 px-6 rounded-full"
          onClick={() => changeBusStatus(busStatuses.COMPLETED)}
        >
          End Drive
        </button>
      </div>
    </div>
  );
};

export default DriverMapNavigation;

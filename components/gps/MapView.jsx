import React, { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { apiBaseUrl } from "../apis/setting";
import { jwtDecode } from "jwt-decode";
import { FaUserCircle } from "react-icons/fa";
import { renderToStaticMarkup } from "react-dom/server";
import L from "leaflet";

const riderIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/252/252025.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const driverIcon = L.divIcon({
  className: "custom-icon",
  html: renderToStaticMarkup(
    <FaUserCircle style={{ color: "green", fontSize: "32px" }} />
  ),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const AnimatedMapCenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, map.getZoom(), { duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

const DriverMap = () => {
  const [driverLocation, setDriverLocation] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);
  const driverMarkerRef = useRef(null);
  const riderMarkerRef = useRef(null);

  useEffect(() => {
    // Fetch and update driver location every 5 seconds
    const token = localStorage.getItem("token");
    const decodedToken = token ? jwtDecode(token) : null;

    if (!decodedToken) {
      console.error("No token found or token is invalid.");
      return;
    }

    const fetchDriverLocation = () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Update driver location in the backend
          await axios.post(`${apiBaseUrl}/location/update`, {
            adminId: decodedToken?.sub,
            latitude,
            longitude,
            role: "admin",
            busId: "6766eafdca4417d3f4f69b6e",
          });

          if (driverMarkerRef.current) {
            driverMarkerRef.current.setLatLng([latitude, longitude]);
          }

          setDriverLocation({ lat: latitude, lng: longitude });
        },
        (error) => console.error("Error fetching location: ", error),
        { enableHighAccuracy: true }
      );
    };

    // Fetch rider location
    const fetchRiderLocation = async () => {
      const response = await axios.post(`${apiBaseUrl}/location/fetch`, {
        busId: "6766eafdca4417d3f4f69b6e",
        adminId: decodedToken?.sub,
      });
      const riderData = response.data.data;
      console.log("RIDER DATA", riderData);

      if (riderData?.userLatitude && riderData?.userLongitude) {
        if (riderMarkerRef.current) {
          riderMarkerRef.current.setLatLng([
            riderData.userLatitude,
            riderData.userLongitude,
          ]);
        }
        setRiderLocation({
          lat: riderData?.userLatitude,
          lng: riderData?.userLongitude,
        });
      }
    };

    fetchDriverLocation();
    fetchRiderLocation();
    const interval = setInterval(() => {
      fetchDriverLocation();
      fetchRiderLocation();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      {driverLocation && (
        <MapContainer
          center={driverLocation}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {/* Driver Marker */}
          <Marker
            position={driverLocation}
            icon={riderIcon}
            ref={driverMarkerRef}
          />
          {/* Rider Marker */}
          {riderLocation && (
            <Marker
              position={riderLocation}
              icon={driverIcon}
              ref={riderMarkerRef}
            />
          )}
          {/* Polyline */}
          {driverLocation && riderLocation && (
            <Polyline
              positions={[riderLocation, driverLocation]}
              color="blue"
            />
          )}
        </MapContainer>
      )}
    </div>
  );
};

export default DriverMap;

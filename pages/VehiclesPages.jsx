import React, { useEffect, useState } from "react";
import { apiBaseUrl } from "../components/apis/setting";
import { jwtDecode } from "jwt-decode";
import Loader from "../components/utils/Loader";
import { useNavigate } from "react-router-dom";
import { MdModeEdit, MdDelete } from "react-icons/md";
import { RiWifiOffLine, RiWifiLine } from "react-icons/ri";
import toast from "react-hot-toast";

const VehiclesPage = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);

  const fetchVehicles = async () => {
    try {
      const decodedToken = jwtDecode(localStorage.getItem("token"));

      const response = await fetch(
        `${apiBaseUrl}/bus-entity?adminId=${decodedToken?.sub}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch routes");
      }

      const data = await response.json();
      setVehicles(data);
      console.log("DATA", vehicles);
    } catch (error) {
      console.error("Error fetching routes:", error);
    }
  };
  const handleEditClick = (vehicleId) => {
    navigate(`/add-vehicle/${vehicleId}`);
  };

  const handleDeleteClick = async (vehicleId) => {
    if (window.confirm("Are you sure you want to delete this Vehicle?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${apiBaseUrl}/bus-entity/${vehicleId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to delete the vehicle");
        }

        toast.success(`${data.message}`);
        fetchVehicles();
      } catch (error) {
        toast.error(`Error deleting vehicle: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div className="content mx-2">
      <div className="px-6 pt-4 min-h-screen w-full mx-auto rounded-xl">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Registered Buses</h1>
          <button
            className="bg-primary text-white px-8 py-2 rounded-full shadow-sm hover:bg-primary"
            onClick={() => navigate("/add-vehicle")}
          >
            New Bus
          </button>
        </div>
        <div className="text-black grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6  ">
          {vehicles.map((vehicle, _id) => (
            <div
              key={_id}
              className="bg-white rounded-lg shadow-lg p-6 transition transform hover:scale-105 hover:shadow-xl"
            >
              <img
                src={`https://www.freeiconspng.com/uploads/bus-png-${
                  Math.floor(Math.random() * 5) + 1
                }.png`}
                alt="Bus Logo"
              />
              <div className="text-black">
                <div className="flex justify-between items-center">
                  <p>Engine No: {vehicle.engineNumber}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditClick(vehicle._id)}>
                      <MdModeEdit className="text-green-800 text-2xl" />
                    </button>
                    <button onClick={() => handleDeleteClick(vehicle._id)}>
                      <MdDelete className="text-red-800 text-2xl" />
                    </button>
                  </div>
                </div>
                <p>Total Seats: {vehicle.busCapacity}</p>
                <p>Fuel Type: {vehicle.fuelType}</p>
                <p>Standard: {vehicle.standard}</p>
              </div>
              <div className="app-btn flex justify-center items-center mb-2 w-full gap-3">
                <p className="text-white">Number : {vehicle.busNumber}</p>
                {vehicle.wifi ? (
                  <RiWifiLine className="text-2xl" />
                ) : (
                  <RiWifiOffLine className="text-2xl" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VehiclesPage;

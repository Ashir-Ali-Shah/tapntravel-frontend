import React, { useEffect, useState } from "react";
import { apiBaseUrl } from "../components/apis/setting";
import { jwtDecode } from "jwt-decode";
import Loader from "../components/utils/Loader";
import { useNavigate } from "react-router-dom";
import { MdModeEdit, MdDelete } from "react-icons/md";
import { RiWifiOffLine, RiWifiLine } from "react-icons/ri";
import toast from "react-hot-toast";

const DriversPage = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);

  const fetchVehicles = async () => {
    try {
      const decodedToken = jwtDecode(localStorage.getItem("token"));

      const response = await fetch(
        `${apiBaseUrl}/admin?adminId=${decodedToken?.sub}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch routes");
      }

      const data = await response.json();
      setDrivers(data);
      console.log("DATA", drivers);
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };
  const handleEditClick = (driverId) => {
    navigate(`/add-driver/${driverId}`);
  };

  const handleDeleteClick = async (driverId) => {
    if (window.confirm("Are you sure you want to delete this Driver?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${apiBaseUrl}/admin/${driverId}`, {
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
    <div className="content mx-2 mt-2">
      <div className="py-2 px-6  min-h-screen w-full mx-auto rounded-xl">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Registered Drivers
          </h1>
          <button
            className="bg-primary text-white px-4 py-2 rounded-md shadow-sm hover:bg-primary"
            onClick={() => navigate("/add-driver")}
          >
            Register new Driver
          </button>
        </div>
        <div className="text-black grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6  ">
          {drivers.map((driver, _id) => (
            <div
              key={_id}
              className="bg-white rounded-lg shadow-lg p-6 transition transform hover:scale-105 hover:shadow-xl"
            >
              <img
                src={`https://i.pinimg.com/originals/bd/d9/aa/bdd9aaee8c129b1d0a7180512c6f7ae5.png`}
                alt="Bus Logo"
              />
              <div className="text-black">
                <div className="flex justify-between items-center my-2">
                  <p>Email: {driver.email}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditClick(driver._id)}>
                      <MdModeEdit className="text-green-800 text-2xl" />
                    </button>
                    <button onClick={() => handleDeleteClick(driver._id)}>
                      <MdDelete className="text-red-800 text-2xl" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="app-btn flex justify-center items-center mb-2 w-full gap-3">
                <p className="text-white">Name : {driver?.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DriversPage;

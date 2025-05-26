import React, { useEffect, useState } from "react";
import { apiBaseUrl } from "../components/apis/setting";
import { jwtDecode } from "jwt-decode";
import Loader from "../components/utils/Loader";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { CgArrowLongRightC } from "react-icons/cg";
import { getOrdinal } from "../components/utils/utilityFunctions.";
import { ImStopwatch } from "react-icons/im";
import toast from "react-hot-toast";

const BusRoutes = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);

  const fetchRoutes = async () => {
    try {
      const decodedToken = jwtDecode(localStorage.getItem("token"));

      const response = await fetch(
        `${apiBaseUrl}/route?adminId=${decodedToken?.sub}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch routes");
      }

      const data = await response.json();
      setRoutes(data);
      console.log("DATA", routes);
    } catch (error) {
      console.error("Error fetching routes:", error);
    }
  };
  const handleEditClick = (routeId) => {
    navigate(`/add-route/${routeId}`);
  };

  const handleDeleteClick = async (routeId) => {
    if (window.confirm("Are you sure you want to delete this route?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${apiBaseUrl}/route/${routeId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to delete the route");
        }

        toast.success(`${data.message}`);
        fetchRoutes();
      } catch (error) {
        toast.error(`Error deleting route: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  return (
    <div className="content mx-2">
      <div className="p-6  min-h-screen w-full mx-auto rounded-xl">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Routes</h1>
          <button
            className="bg-primary text-white px-4 py-2 rounded-md shadow-sm hover:bg-primary"
            onClick={() => navigate("/add-route")}
          >
            New route
          </button>
        </div>
        <div className="text-black grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6  ">
          {routes.map((route, _id) => (
            <div
              key={_id}
              className="bg-white rounded-lg shadow-lg p-6 transition transform hover:scale-105 hover:shadow-xl"
            >
              <div className="app-btn flex justify-center items-center mb-2 w-full">
                <p className="text-white">{route?.startCity}</p>
                <CgArrowLongRightC className="mx-1 text-3xl" />
                <p className="text-white">{route?.endCity}</p>
              </div>
              {/* <p className="text-gray-600 mb-2 app-btn text-center">
                {route.startCity + <CgArrowLongRightC /> + route.endCity}
              </p> */}
              <p>Total Stops: {route?.stops?.length - 2}</p>
              {route.stops.map((stop, index) => (
                <div key={index}>
                  <p>
                    {getOrdinal(index + 1)} Stop : {stop?.name}
                  </p>
                  <p>Address : {stop?.formattedAddress}</p>
                  {stop?.duration && (
                    <p className="flex items-center justify-center">
                      <ImStopwatch />
                      Duration : {stop?.duration} minutes
                    </p>
                  )}
                  <p className="flex items-center justify-center">
                    <FaLocationDot /> Location :{" "}
                    <a
                      href={stop?.locationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {" "}
                      Click Here
                    </a>
                  </p>
                </div>
              ))}
              <div className="mt-4 flex justify-between">
                <button
                  className="bg-green-800 text-white text-sm px-6 py-2 rounded-full flex items-center"
                  onClick={() => handleEditClick(route._id)}
                >
                  <FaEdit className="mr-2" />
                  Edit
                </button>
                <button
                  className="bg-red-700 text-sm text-white py-2 px-6 rounded-full hover:bg-red-500 flex items-center"
                  onClick={() => handleDeleteClick(route._id)}
                >
                  <FaTrashAlt className="mr-2" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusRoutes;

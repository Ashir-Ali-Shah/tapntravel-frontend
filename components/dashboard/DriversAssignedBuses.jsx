import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { FaBusAlt } from "react-icons/fa";
import { CgArrowLongRightC } from "react-icons/cg";
import { apiBaseUrl } from "../apis/setting";
import { formatDateToDayMonth, formatTime } from "../utils/HelperFunctions";

const DriversAssignedBuses = () => {
  const [driverBuses, setDriverBuses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDriverBuses();
  }, []);

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
      }

      const data = await response.json();
      setDriverBuses(data.data);
    } catch (error) {
      console.error("Error fetching driver's buses:", error);
    }
  };

  return (
    <div className="content lg:p-4">
      <div className="m-auto lg:px-8 lg:py-2">
        <h1 className="font-bold text-3xl mb-4">Choose Your Bus</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {driverBuses.length === 0 ? (
            <h1 className="text-center text-lg font-semibold">
              No assigned buses.
            </h1>
          ) : (
            driverBuses.map((bus, index) => {
              const randomImageNumber = Math.floor(Math.random() * 5) + 1;
              const imageSrc = `https://www.freeiconspng.com/uploads/bus-png-${randomImageNumber}.png`;

              return (
                <div
                  key={index}
                  className="bg-main mt-2 p-3 shadow-md rounded-xl"
                >
                  <p className="text-center font-bold flex justify-center items-center gap-2">
                    {bus?.admin?.name || "Driver"} <FaBusAlt />
                  </p>
                  <div className="flex justify-center items-center ml-4 w-full">
                    <p>{bus?.route?.startCity}</p>
                    <CgArrowLongRightC className="mx-1 text-3xl" />
                    <p>{bus?.route?.endCity}</p>
                  </div>
                  <div className="grid grid-cols-[35%_65%] md:grid-cols-2 items-center">
                    <img
                      className="rounded-md"
                      src={imageSrc}
                      alt={bus?.route?.endCity}
                    />
                    <div>
                      <div className="flex flex-col gap-4">
                        <div className="ml-4 flex flex-col justify-center items-center">
                          <p className="text-tertiary">Only in</p>
                          <p className="font-bold">
                            Rs. {bus?.fare?.actualPrice || "N/A"}
                          </p>
                          <p className="app-btn text-sm mb-2 text-center">
                            {formatDateToDayMonth(bus?.date)}{" "}
                            {formatTime(bus?.departureTime)}
                          </p>
                          <p className="app-btn text-sm">
                            {bus?.route?.stops?.length === 0
                              ? "Non Stop"
                              : `Stops: ${bus?.route?.stops?.length}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/scanner/${bus._id}`)}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mt-4 w-full"
                  >
                    Scan Tickets
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default DriversAssignedBuses;

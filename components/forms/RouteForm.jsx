import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiBaseUrl } from "../apis/setting";
import Loader from "../utils/Loader";
import { jwtDecode } from "jwt-decode";
import { pakistanCities } from "../utils/data";
import { FaCircleMinus, FaCirclePlus } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import { fetchBusStops } from "../apis/GoogleMapsApi";
import StopSelector from "./StopSelector";

function RouteForm() {
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [routeId, setRouteId] = useState(null);
  const [availableStops, setAvailableStops] = useState([]);
  const [formData, setFormData] = useState({
    startCity: "",
    endCity: "",
    stops: [
      {
        name: "",
        locationLink: "",
        duration: "",
        formattedAddress: "",
        placeId: "",
        geometry: null,
      },
      {
        name: "",
        locationLink: "",
        duration: "",
        formattedAddress: "",
        placeId: "",
        geometry: null,
      },
    ],
  });

  const { id } = useParams();
  const cityOptions = Object.keys(pakistanCities);

  const getAllStops = () => {
    // function to get hard coded stops from a hard coded object
    return Object.values(pakistanCities).flatMap((city) => city.busStops);
  };

  // Fetch Route Data for Editing
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      setRouteId(id);
      fetchRouteData(id);
    }
  }, [id]);

  const loadStops = async (city) => {
    if (city) {
      try {
        const stops = await fetchBusStops(formData.startCity);
        setAvailableStops(stops);
      } catch (error) {
        toast.error("Could not load stops from Google Maps.");
      }
    }
  };

  const fetchRouteData = async (routeId) => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/route/${routeId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch route data");
      }
      setFormData({
        startCity: data.startCity,
        endCity: data.endCity,
        stops: data.stops,
      });
    } catch (error) {
      toast.error(`Error fetching route: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddStop = () => {
    setFormData((prevState) => ({
      ...prevState,
      stops: [
        ...prevState.stops,
        {
          name: "",
          locationLink: "",
          duration: "",
          city: "",
          formattedAddress: "",
          placeId: "",
          geometry: null,
        },
      ],
    }));
  };

  const handleRemoveStop = (index) => {
    setFormData((prevState) => ({
      ...prevState,
      stops: prevState.stops.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);

      const apiUrl = isEditMode
        ? `${apiBaseUrl}/route/${routeId}`
        : `${apiBaseUrl}/route`;
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(apiUrl, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminId: decodedToken?.sub,
          startCity: formData.startCity,
          endCity: formData.endCity,
          stops: formData.stops,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to save route");
      }

      toast.success(data.message || "Route saved successfully!");
      if (!isEditMode) {
        setFormData({
          startCity: "",
          endCity: "",
          stops: [{ name: "", locationLink: "", duration: "" }],
        });
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center m-3 w-2/4">
      <form
        onSubmit={handleSubmit}
        className="border-primary border-solid border-2 w-full rounded-lg h-fit m-3 px-4 lg:px-10 py-3 bg-main"
      >
        <h2 className="text-xl italic font-bold text-center mb-0.5">
          {isEditMode ? "Edit Route" : "Add Route"}
        </h2>

        {/* Start City */}
        <div className="mb-4">
          <label
            htmlFor="startCity"
            className="block text-xl font-semibold mb-2"
          >
            Start City:
          </label>
          <select
            id="startCity"
            name="startCity"
            value={formData.startCity}
            onChange={handleInputChange}
            required
            className="border rounded-lg px-4 py-2 w-full"
          >
            <option value="">Select Departure City</option>
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* End City */}
        <div className="mb-4">
          <label htmlFor="endCity" className="block text-xl font-semibold mb-2">
            End City:
          </label>
          <select
            id="endCity"
            name="endCity"
            value={formData.endCity}
            onChange={handleInputChange}
            required
            className="border rounded-lg px-4 py-2 w-full"
          >
            <option value="">Select End City</option>
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          {/* Departure Stop */}
          <h3 className="font-bold text-lg mb-2">Departure Stand</h3>
          <StopSelector
            stop={formData.stops[0]}
            index={0}
            city={formData.startCity}
            updateStop={(newStop) => {
              const newStops = [...formData.stops];
              newStops[0] = {
                ...newStops[0],
                ...newStop,
                city: formData.startCity,
              };
              setFormData({ ...formData, stops: newStops });
            }}
          />

          {/* Optional Stops */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-lg">Inter City Stops</h3>

            <button
              type="button"
              className="text-green-700 font-bold text-lg"
              onClick={() => {
                const newStops = [...formData.stops];
                newStops.splice(-1, 0, {
                  name: "",
                  locationLink: "",
                  city: "",
                  duration: "",
                });
                setFormData({ ...formData, stops: newStops });
              }}
            >
              <FaCirclePlus />
            </button>
          </div>
          {/* Mid-City Stops */}
          {formData.stops
            .slice(1, -1)
            .filter((stop) => !stop.isMotorway) // <-- filter out motorway stops
            .map((stop, i) => {
              const actualIndex = formData.stops.findIndex((s) => s === stop);
              return (
                <StopSelector
                  key={`mid-${actualIndex}`} // unique key
                  stop={stop}
                  index={actualIndex}
                  city={stop.city}
                  isOptional
                  updateStop={(newStop) => {
                    const newStops = [...formData.stops];
                    newStops[actualIndex] = {
                      ...newStops[actualIndex],
                      ...newStop,
                    };
                    setFormData({ ...formData, stops: newStops });
                  }}
                  removeStop={() => {
                    const newStops = [...formData.stops];
                    newStops.splice(actualIndex, 1);
                    setFormData({ ...formData, stops: newStops });
                  }}
                />
              );
            })}

          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-lg">Motorway Stops</h3>

            <button
              type="button"
              className="text-green-700 font-bold text-lg"
              onClick={() => {
                const newStops = [...formData.stops];
                newStops.splice(-1, 0, {
                  name: "",
                  locationLink: "",
                  city: "",
                  duration: "",
                  isMotorway: true,
                });
                setFormData({ ...formData, stops: newStops });
              }}
            >
              <FaCirclePlus />
            </button>
          </div>
          {/* Optional Motorway Stops */}
          {/* Motorway Stops */}
          {formData.stops
            .slice(1, -1)
            .filter((stop) => stop.isMotorway)
            .map((stop, i) => {
              const actualIndex = formData.stops.findIndex((s) => s === stop);
              return (
                <StopSelector
                  key={`motorway-${actualIndex}`} // unique key
                  stop={stop}
                  index={actualIndex}
                  city={stop.city}
                  isOptional
                  isMotorway
                  updateStop={(newStop) => {
                    const newStops = [...formData.stops];
                    newStops[actualIndex] = {
                      ...newStops[actualIndex],
                      ...newStop,
                    };
                    setFormData({ ...formData, stops: newStops });
                  }}
                  removeStop={() => {
                    const newStops = [...formData.stops];
                    newStops.splice(actualIndex, 1);
                    setFormData({ ...formData, stops: newStops });
                  }}
                />
              );
            })}

          {/* Arrival Stop */}
          <h3 className="font-bold text-lg mt-2 mb-2">Arrival Stand</h3>
          <StopSelector
            stop={formData.stops[formData.stops.length - 1]}
            index={formData.stops.length - 1}
            city={formData.endCity}
            updateStop={(newStop) => {
              const newStops = [...formData.stops];
              newStops[newStops.length - 1] = {
                ...newStops[newStops.length - 1],
                ...newStop,
                city: formData.endCity,
              };
              setFormData({ ...formData, stops: newStops });
            }}
          />
        </div>

        <div>
          <div className="bg-primary mx-auto my-2 border-2 border-solid rounded-full px-4 py-1 text-main text-xl w-1/2">
            <button
              className="text-main text-lg w-full flex justify-center items-center gap-2"
              type="submit"
            >
              {loading ? <Loader /> : isEditMode ? "Update Route" : "Add Route"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default RouteForm;

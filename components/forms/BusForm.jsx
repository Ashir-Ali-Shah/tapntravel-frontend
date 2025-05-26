import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiBaseUrl } from "../apis/setting";
import Loader from "../utils/Loader";
import { jwtDecode } from "jwt-decode";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchAdminBuses } from "../../store/slices/busesSlice";

function BusForm() {
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [busId, setBusId] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const dispatch = useDispatch();

  const { id } = useParams();

  const [formData, setFormData] = useState({
    routeId: "",
    busEntityId: "",
    departureTime: "",
    arrivalTime: "",
    date: "",
    fare: {
      actualPrice: "",
      discount: 0,
      promoCode: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const decodedToken = jwtDecode(token);

        // Fetch routes
        const routeResponse = await fetch(
          `${apiBaseUrl}/route?adminId=${decodedToken?.sub}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const routeData = await routeResponse.json();
        if (!routeResponse.ok) throw new Error("Failed to fetch routes.");
        setRoutes(routeData);

        // Fetch buses
        const busResponse = await fetch(
          `${apiBaseUrl}/bus-entity?adminId=${decodedToken?.sub}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const busData = await busResponse.json();
        if (!busResponse.ok) throw new Error("Failed to fetch buses.");
        setBuses(busData);

        if (id) {
          setIsEditMode(true);
          setBusId(id);
          fetchBusData(id);
        }
      } catch (error) {
        toast.error(`${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const fetchBusData = async (busId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiBaseUrl}/bus/${busId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error("Failed to fetch bus data");
      }

      setFormData({
        routeId: data.routeId,
        busEntityId: data.busEntityId,
        departureTime: data.departureTime || "",
        arrivalTime: data.arrivalTime || "",
        date: data.date.split("T")[0],
        fare: {
          actualPrice: data.fare?.actualPrice || "",
          discount: data.fare?.discount || 0,
          promoCode: data.fare?.promoCode || "",
        },
      });
    } catch (error) {
      toast.error(`Error fetching bus: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleNestedInputChange = (e, key, subKey) => {
    const { name, value, checked, type } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [key]: {
        ...prevState[key],
        [subKey || name]: type === "checkbox" ? checked : value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      const apiUrl = isEditMode
        ? `${apiBaseUrl}/bus/${busId}`
        : `${apiBaseUrl}/bus`;
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(apiUrl, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          routeId: formData.routeId,
          busEntityId: formData.busEntityId,
          adminId: decodedToken?.sub,
          departureTime: formData.departureTime,
          arrivalTime: formData.arrivalTime,
          date: formData.date,
          fare: formData.fare,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.errors?.[0]?.msg || "Failed to save bus");
      }

      dispatch(fetchAdminBuses());

      toast.success(
        data.message ||
          (isEditMode ? "Bus updated successfully!" : "Bus added successfully!")
      );

      if (!isEditMode) {
        setFormData({
          routeId: "",
          busEntityId: "",
          departureTime: "",
          arrivalTime: "",
          date: "",
          fare: {
            actualPrice: "",
            discount: 0,
            promoCode: "",
          },
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
          Add Bus Form
        </h2>

        <div className="mb-4">
          <label htmlFor="routeId" className="block text-xl font-semibold mb-2">
            Select Your Route:
          </label>
          <select
            id="routeId"
            name="routeId"
            value={formData.routeId}
            onChange={(e) =>
              setFormData({ ...formData, routeId: e.target.value })
            }
            required
            className="border rounded-lg h-9 px-2 w-full"
          >
            <option value="" disabled>
              Choose Your Route
            </option>
            {routes.map((route) => (
              <option key={route.id} value={route._id}>
                {route.startCity} to {route.endCity} ( Stops:{""}{" "}
                {route?.stops
                  ?.slice(1, -1)
                  .map((stop) => stop.name)
                  .join(", ") || "Non-stop"}
                )
              </option>
            ))}
          </select>
        </div>

        {/* Bus Selection */}
        <div className="mb-4">
          <label
            htmlFor="busEntityId"
            className="block text-xl font-semibold mb-2"
          >
            Choose Your Bus:
          </label>
          <select
            id="busEntityId"
            name="busEntityId"
            value={formData.busEntityId}
            onChange={(e) =>
              setFormData({ ...formData, busEntityId: e.target.value })
            }
            required
            className="border rounded-lg h-9 px-2 w-full"
          >
            <option value="" disabled>
              Select Your Bus
            </option>
            {buses.map((bus) => (
              <option key={bus.id} value={bus._id}>
                {bus.busNumber}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label
            htmlFor="departureTime"
            className="block text-xl font-semibold mb-2"
          >
            Departure Time:
          </label>
          <input
            type="time"
            id="departureTime"
            name="departureTime"
            value={formData.departureTime}
            onChange={handleChange}
            required
            className="border rounded-lg h-9 p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="arrivalTime"
            className="block text-xl font-semibold mb-2"
          >
            Arrival Time:
          </label>
          <input
            type="time"
            id="arrivalTime"
            name="arrivalTime"
            value={formData.arrivalTime}
            onChange={handleChange}
            required
            className="border rounded-lg h-9 p-2 w-full"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="date" className="block text-xl font-semibold mb-2">
            Date:
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            min={new Date().toISOString().split("T")[0]}
            className="border rounded-lg h-9 p-2 w-full"
          />
        </div>

        <div className="w-full">
          <div className="mb-4">
            <label
              htmlFor="actualPrice"
              className="block text-xl font-semibold mb-2"
            >
              Price(In PKR):
            </label>
            <input
              type="number"
              id="actualPrice"
              name="actualPrice"
              value={formData.fare.actualPrice}
              onChange={(e) =>
                handleNestedInputChange(e, "fare", "actualPrice")
              }
              required
              className="border rounded-lg h-9 p-2 w-full"
            />
          </div>
        </div>

        <div>
          <div className="w-1/2 mx-auto">
            <button
              className="text-main app-btn mx-auto text-lg w-full flex justify-center items-center gap-2"
              type="submit"
            >
              {loading ? <Loader /> : isEditMode ? "Update Bus" : "Add Bus"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default BusForm;

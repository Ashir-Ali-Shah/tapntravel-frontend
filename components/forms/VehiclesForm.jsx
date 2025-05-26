import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { apiBaseUrl } from "../apis/setting";
import Loader from "../utils/Loader";
import { jwtDecode } from "jwt-decode";

function VehiclesForm() {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    busNumber: "",
    busCapacity: "",
    engineNumber: "",
    wifi: false,
    ac: false,
    fuelType: "diesel",
    standard: "",
  });

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchVehicleData(id);
    }
  }, [id]);

  // Fetch data for edit mode
  const fetchVehicleData = async (vehicleId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiBaseUrl}/bus-entity/${vehicleId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch vehicle data.");
      }

      setFormData({
        busNumber: data.busNumber,
        busCapacity: data.busCapacity,
        engineNumber: data.engineNumber,
        wifi: data.wifi,
        ac: data.ac,
        fuelType: data.fuelType,
        standard: data.standard,
      });
    } catch (error) {
      toast.error(`Error fetching vehicle: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const decodedToken = jwtDecode(token);
      const endpoint = isEditMode
        ? `${apiBaseUrl}/bus-entity/${id}`
        : `${apiBaseUrl}/bus-entity`;
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminId: decodedToken?.sub,
          busNumber: formData.busNumber,
          busCapacity: formData.busCapacity,
          engineNumber: formData.engineNumber,
          wifi: formData.wifi,
          ac: formData.ac,
          fuelType: formData.fuelType,
          standard: formData.standard,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to submit form.");
      }

      toast.success(
        isEditMode
          ? "Vehicle updated successfully!"
          : "Vehicle added successfully!"
      );
      if (!isEditMode) {
        setFormData({
          busNumber: "",
          busCapacity: "",
          engineNumber: "",
          wifi: false,
          ac: false,
          fuelType: "diesel",
          standard: "",
        });
      }
    } catch (error) {
      toast.error(`${error.message}`);
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
          {isEditMode ? "Edit Vehicle" : "Vehicle Registration Form"}
        </h2>

        <div className="mb-1 flex flex-col">
          <label htmlFor="bus-number" className="font-bold text-lg">
            Bus Number :
          </label>
          <input
            type="text"
            placeholder="Enter Bus Number"
            id="bus-number"
            className="border-ternary_light w-full border-solid border-2 rounded-full px-4 py-1 focus:border-primary focus:outline-none"
            name="busNumber"
            value={formData.busNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-1 flex flex-col">
          <label htmlFor="bus-capacity" className="font-bold text-lg">
            Total Seats :
          </label>
          <input
            className="border-ternary_light border-solid border-2 rounded-full px-4 py-1 focus:border-primary focus:outline-none"
            type="number"
            id="bus-capacity"
            name="busCapacity"
            required
            placeholder="Enter Total Seats"
            value={formData.busCapacity}
            onChange={handleChange}
          />
        </div>

        <div className="mb-1 flex flex-col">
          <label htmlFor="engine-number" className="font-bold text-lg">
            Engine Number :
          </label>
          <input
            className="border-ternary_light border-solid border-2 rounded-full px-4 py-1 focus:border-primary focus:outline-none"
            type="text"
            id="engine-number"
            name="engineNumber"
            placeholder="Enter Engine Number"
            value={formData.engineNumber}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2">
          <div className="flex justify-around">
            <div className="mb-4">
              <label htmlFor="ac" className="block text-xl font-semibold mb-2">
                AC
              </label>
              <input
                type="checkbox"
                id="ac"
                name="ac"
                checked={formData.ac}
                onChange={handleChange}
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="wifi"
                className="block text-xl font-semibold mb-2"
              >
                Wi-Fi
              </label>
              <input
                type="checkbox"
                id="wifi"
                name="wifi"
                checked={formData.wifi}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="mb-4 flex flex-col">
            <label htmlFor="fuelType" className="font-bold text-lg">
              Fuel Type:
            </label>
            <select
              id="fuelType"
              name="fuelType"
              className="border-ternary_light border-solid border-2 rounded-full px-4 py-1 focus:border-primary focus:outline-none"
              value={formData.fuelType}
              onChange={handleChange}
              required
            >
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
            </select>
          </div>
        </div>

        <div className="mb-4 flex gap-4">
          <label className="block text-xl font-semibold mb-2">Standard:</label>
          <label className=" text-xl">
            <input
              type="radio"
              name="standard"
              value="economy"
              checked={formData.standard === "economy"}
              onChange={handleChange}
            />
            Economy
          </label>
          <label className="ml-4 text-xl">
            <input
              type="radio"
              name="standard"
              value="executive"
              checked={formData.standard === "executive"}
              onChange={handleChange}
            />
            Executive
          </label>
          <label className="ml-4 text-xl">
            <input
              type="radio"
              name="standard"
              value="business"
              checked={formData.standard === "business"}
              onChange={handleChange}
            />
            Business
          </label>
        </div>

        <div>
          <div className="bg-primary my-2 border-2 border-solid rounded-full px-4 py-1 text-main text-xl w-full">
            <button
              className="text-main text-lg w-full flex justify-center items-center gap-2"
              type="submit"
            >
              {loading ? (
                <Loader />
              ) : isEditMode ? (
                "Update Vehicle"
              ) : (
                "Register Vehicle"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default VehiclesForm;

/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import { GrUserWorker } from "react-icons/gr";
import { useDispatch, useSelector } from "react-redux";
import { formatDate } from "../components/utils/utilityFunctions.";
import {
  deleteBus,
  fetchAdminBuses,
  updateBus,
} from "../store/slices/busesSlice";
import Loader from "../components/utils/Loader";

const BusesPage = () => {
  const buses = useSelector((state) => state.buses.data);
  const drivers = useSelector((state) => state.drivers.data);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState("");

  const handleEditClick = (busId) => {
    navigate(`/edit-bus/${busId}`);
  };

  const handleDeleteClick = (busId) => {
    if (window.confirm("Are you sure you want to delete this bus?")) {
      dispatch(deleteBus(busId));
    }
  };

  const handleDriverAddClick = (bus) => {
    setSelectedBus(bus);
    setIsModalOpen(true);
  };

  const handleSubmitDriver = async () => {
    setLoading(true);
    if (!selectedDriverId) {
      toast.error("Please select a driver!");
      return;
    }
    const updatedData = { ...selectedBus, driverId: selectedDriverId };

    try {
      await Promise.all([
        dispatch(
          updateBus({ busId: selectedBus._id, data: updatedData })
        ).unwrap(),
        dispatch(fetchAdminBuses()).unwrap(),
      ]);
      setIsModalOpen(false);
      dispatch(fetchAdminBuses());
      toast.success("Driver assigned successfully!");
    } catch (error) {
      console.error("Error assigning driver:", error);
      toast.error("Failed to assign driver");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedDriverId("");
  };

  const handleAddBusClick = () => {
    navigate("/add-bus");
  };

  return (
    <div className="content px-6 py-4 pb-16 min-h-screen w-full rounded-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Available Buses</h1>
        <button
          className="bg-primary text-white px-6 py-2 rounded-full shadow-sm"
          onClick={handleAddBusClick}
        >
          Add New Bus
        </button>
      </div>

      {/* Bus Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {buses
          .filter((bus) => {
            const busDateTime = new Date(bus?.date);
            const now = new Date();
            return busDateTime > now;
          })
          .map((bus) => (
            <div
              key={bus._id}
              className="bg-white rounded-xl shadow-lg p-6 transition transform hover:scale-105 hover:shadow-xl"
            >
              <p className="text-gray-600 mb-2 app-btn text-center">
                {bus?.route?.startCity + " to " + bus?.route?.endCity}
              </p>
              <p className="text-gray-600 mb-2">{formatDate(bus?.date)}</p>
              <p className="text-gray-600 mb-2">
                Time: {bus?.departureTime + " to " + bus?.arrivalTime}
              </p>
              <p className="text-gray-600 mb-2">
                Total Seats: {bus?.busDetails?.busCapacity}
              </p>
              <p className="text-gray-600 mb-2">
                Details: {bus?.busDetails?.busNumber}
              </p>
              <p className="text-gray-600 mb-2">
                Fare: {bus?.fare?.actualPrice}
              </p>
              <div className="mt-4 flex justify-between">
                <button
                  className="bg-green-800 text-white px-8 py-2 rounded-full flex items-center"
                  onClick={() => handleEditClick(bus._id)}
                >
                  <FaEdit className="mr-2" />
                  Edit
                </button>
                <button
                  className="bg-red-700 text-white py-2 px-8 rounded-full hover:bg-red-500 flex items-center"
                  onClick={() => handleDeleteClick(bus._id)}
                >
                  <FaTrashAlt className="mr-2" />
                  Delete
                </button>
              </div>
              <div className="mt-4 flex justify-between">
                <button
                  className={`${`px-4 py-2 text-white w-full rounded-full flex justify-center items-center gap-2`} ${
                    bus.driverId ? "bg-green-700" : "bg-gray-500"
                  }`}
                  onClick={() => handleDriverAddClick(bus)}
                >
                  {bus.driverId
                    ? `Assigned to ${bus?.driverName}`
                    : "Add a Driver"}
                  <GrUserWorker className="mr-2" />
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-96">
            <h1 className="text-lg font-bold mb-4">
              Choose Driver for Bus#{selectedBus?.busDetails?.busNumber} going
              from {selectedBus?.route?.startCity} to{" "}
              {selectedBus?.route?.endCity}
            </h1>
            <select
              className="w-full px-4 py-2 border rounded-full mb-4"
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
            >
              <option value="">Select a driver</option>
              {drivers.map((driver) => (
                <option key={driver._id} value={driver._id}>
                  {driver.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end">
              <button
                className="bg-gray-500 text-white px-6 py-2 rounded-full mr-2"
                onClick={handleModalClose}
              >
                Cancel
              </button>
              <button
                className="bg-primary text-white px-6 py-2 rounded-full"
                onClick={handleSubmitDriver}
              >
                {loading ? <Loader /> : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusesPage;

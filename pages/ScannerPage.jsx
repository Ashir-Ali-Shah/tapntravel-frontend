import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RiRfidLine } from "react-icons/ri";
import toast from "react-hot-toast";
import ScannerAnimation from "../components/utils/ScannerAnimation";
import { apiBaseUrl } from "../components/apis/setting";
import axios from "axios";

const ScannerPage = () => {
  const navigate = useNavigate();
  const { id: busId } = useParams();

  const handleScan = async (scannedRFID) => {
    try {
      const response = await axios.post(
        `${apiBaseUrl}/ticket/user/information`,
        {
          RFIDCardNumber: scannedRFID,
          busId,
        }
      );

      const data = response.data;

      const userId = data?.active?.[0]?.userId;
      if (!userId) {
        throw new Error("No tickets found for this user.");
      }

      toast.success("Card scanned successfully!");
      navigate(`/user/bookings/${userId}/${busId}`);
    } catch (error) {
      const apiMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong.";
      toast.error(apiMessage);
    }
  };

  // Simulate RFID scanning via keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!window.scannerBuffer) window.scannerBuffer = "";
      if (e.key !== "Enter") {
        window.scannerBuffer += e.key; // Accumulate scanned characters
      } else {
        if (window.scannerBuffer) {
          handleScan(window.scannerBuffer); // Pass scanned RFID to the handler
        }
        window.scannerBuffer = ""; // Clear buffer after handling
      }
    };

    // Attach event listener for keyboard input
    window.addEventListener("keypress", handleKeyPress);
    return () => {
      // Cleanup listener on component unmount
      window.removeEventListener("keypress", handleKeyPress);
    };
  }, []);

  return (
    <div className="content flex flex-col justify-center items-center gap-4">
      <div className="shadow-xl flex flex-col justify-center items-center p-4 rounded-2xl">
        <div className="p-6 rounded-full bg-gray-200">
          <ScannerAnimation />
        </div>
      </div>
    </div>
  );
};

export default ScannerPage;

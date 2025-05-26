import React, { useEffect, useState } from "react";
import { apiBaseUrl } from "../apis/setting";
import { formatPhoneNumber } from "../utils/utilityFunctions.";
import { MdEdit, MdDelete } from "react-icons/md";
import ScannerAnimation from "../utils/ScannerAnimation";
import toast from "react-hot-toast";
import { capitalizeFirstLetter } from "../utils/HelperFunctions";

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [scannerBuffer, setScannerBuffer] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [rfidToDelete, setRfidToDelete] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${apiBaseUrl}/user/req`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);
  const handleAddRFID = (user) => {
    setSelectedUser(user);
    setShowScanner(true);
  };
  const handleScanSuccess = async (rfid) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiBaseUrl}/user/rfid-add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: selectedUser.email,
          RFIDCardNumber: rfid,
          RFIDCardStatus: "delivered",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add RFID");
      }

      const data = await response.json();
      toast.success(data.message);

      console.log("RFID added:", data);
      const usersResponse = await fetch(`${apiBaseUrl}/user/req`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!usersResponse.ok) {
        throw new Error("Failed to fetch updated users");
      }

      const updatedData = await usersResponse.json();
      console.log("Updated Data", updatedData);
      setUsers(updatedData.users);
      setShowScanner(false);
    } catch (error) {
      toast.error(error.message);
      console.error("Error adding RFID:", error);
    }

    setShowScanner(false);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key !== "Enter") {
        setScannerBuffer((prevBuffer) => prevBuffer + e.key);
      } else {
        if (scannerBuffer) {
          handleScanSuccess(scannerBuffer);
        }
        setScannerBuffer("");
      }
    };

    // Attach event listener for keyboard input
    window.addEventListener("keypress", handleKeyPress);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener("keypress", handleKeyPress);
    };
  }, [scannerBuffer]);

  const handleDeleteRFID = (user) => {
    // Check if the user has a valid RFID card
    if (!user.RFIDCardNumber) {
      alert("No RFID card assigned to this user.");
      return;
    }

    // Show confirmation dialog to the admin
    const confirmed = window.confirm(
      `Are you sure you want to delete the RFID card for user: ${user.email}?`
    );

    if (confirmed) {
      // Proceed with the delete operation if confirmed
      deleteRfid(user);
    } else {
      // User canceled, nothing to do
      console.log("RFID deletion canceled.");
    }
  };

  const deleteRfid = async (user) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiBaseUrl}/user/rfid-delete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete RFID");
      }

      // If RFID is successfully deleted, fetch updated users
      const data = await response.json();
      toast.success(data.message);
      console.log("RFID deleted:", data);

      // Fetch the updated user list after successfully deleting the RFID
      const usersResponse = await fetch(`${apiBaseUrl}/user/req`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!usersResponse.ok) {
        throw new Error("Failed to fetch updated users");
      }

      const updatedData = await usersResponse.json();
      setUsers(updatedData.users);
    } catch (error) {
      console.error("Error deleting RFID:", error);
      toast.error("Error deleting RFID: " + error.message);
    }
  };

  return (
    <div>
      {showScanner && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="p-6 rounded-xl bg-white flex flex-col justify-center items-center mt-2">
            <ScannerAnimation message={`Scan RFID for ${selectedUser.email}`} />
            <button onClick={() => setShowScanner(false)}>Cancel</button>
          </div>
        </div>
      )}
      <div
        className={`container mx-auto pt-4 pb-8 bg-main rounded-lg ${
          showScanner ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <div className="text-center items-center mb-2 flex-col sm:flex-row">
          <h1 className="text-2xl font-bold mb-4 sm:mb-0 sm:pl-4">
            Registered Users
          </h1>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Phone Number</th>
                <th className="py-2 px-4 border-b">Order Status</th>
                <th className="py-2 px-4 border-b">Card Number</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index} className="text-center">
                  <td className="py-2 px-4 border-b">{user?.email}</td>
                  <td className="py-2 px-4 border-b">
                    {formatPhoneNumber(user?.phoneNumber)}
                  </td>
                  <td className="py-2 px-4 border-b relative group">
                    <span
                      className={`py-1 px-3 rounded-full text-white cursor-pointer ${
                        user?.RFIDCardStatus === "pending"
                          ? "bg-gray-500"
                          : user.RFIDCardStatus === "delivered"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    >
                      {capitalizeFirstLetter(user.RFIDCardStatus)}
                    </span>

                    {/* Tooltip shown only if RFIDCardStatus is not "pending" */}
                    {user?.RFIDCardStatus !== "pending" && (
                      <div className="absolute z-10 w-64 bg-white text-black border border-gray-300 rounded-md shadow-lg p-2 text-sm left-1/2 transform -translate-x-1/2 mt-2 hidden group-hover:block">
                        <div>
                          <span className="font-semibold">Address:</span>{" "}
                          {user?.address?.address || "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold">City:</span>{" "}
                          {user?.address?.city || "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold">Province:</span>{" "}
                          {user?.address?.province || "N/A"}
                        </div>
                        <div>
                          <span className="font-semibold">Postal Code:</span>{" "}
                          {user?.address?.postalCode || "N/A"}
                        </div>
                      </div>
                    )}
                  </td>

                  <td className="py-2 px-4 border-b">{user.RFIDCardNumber}</td>
                  <td className="py-2 px-4 border-b flex justify-center items-center gap-2">
                    <button>
                      <MdEdit
                        onClick={() => handleAddRFID(user)}
                        className="text-green-700 text-2xl"
                      />
                    </button>
                    <button>
                      <MdDelete
                        onClick={() => handleDeleteRFID(user)}
                        className="text-red-700 text-2xl"
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersTable;

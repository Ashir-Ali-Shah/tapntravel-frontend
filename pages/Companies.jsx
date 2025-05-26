import React, { useEffect, useState } from "react";
import BusList from "../components/buses/BusList";
import { apiBaseUrl } from "../components/apis/setting";

const App = () => {
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${apiBaseUrl}/admin`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        // Filter the data to get only the admins
        const adminBuses = data.filter((admin) => admin.role === "admin");
        console.log("Admins", adminBuses);
        setAdmins(adminBuses);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAdmins();
  }, []);

  return (
    <div className="container p-6 bg-main w-full m-5 rounded-xl">
      <h1 className="text-2xl font-bold mb-8 pt-2">Companies Registered</h1>
      <BusList admins={admins} />
    </div>
  );
};

export default App;

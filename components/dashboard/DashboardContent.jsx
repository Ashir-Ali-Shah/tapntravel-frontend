import React from "react";
import { jwtDecode } from "jwt-decode";
import SuperAdminDashboard from "./SuperAdminDashboard";
import AdminDashboard from "./AdminDashboard";
import DriverDashboard from "./DriverDashboard";

const DashboardContent = () => {
  const token = localStorage.getItem("token");
  let role = "";

  if (token) {
    const decodedToken = jwtDecode(token);
    role = decodedToken.role;
    role = role.trim().toLowerCase();
  }

  if (role === "admin") {
    console.log("In admin Dashboard");
    return <AdminDashboard />;
  } else if (role === "superadmin") {
    return <SuperAdminDashboard />;
  } else if (role === "driver") {
    return <DriverDashboard />;
  } else {
    return <div>Access Denied: Invalid Role</div>;
  }
};

export default DashboardContent;

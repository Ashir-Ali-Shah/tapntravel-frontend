import { useState, useEffect } from "react";
import Navbar from "../navbar/Navbar";
import Sidebar from "../sidebar/Sidebar";
import { Outlet } from "react-router-dom";

function DashboardLayout() {
  const [windowActive, setWindowActive] = useState(false);
  useEffect(() => addRequiredClass(), []);
  window.addEventListener("resize", function () {
    addRequiredClass();
  });
  function addRequiredClass() {
    if (window.innerWidth > 860) {
      setWindowActive(true);
    }
  }

  return (
    <div className="dashboard max-h-screen">
      <Navbar />
      <div className="flex">
        {windowActive ? <Sidebar /> : null}
        <Outlet className="outlet" />
      </div>
    </div>
  );
}

export default DashboardLayout;

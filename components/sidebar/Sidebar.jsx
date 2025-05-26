import React, { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { VscTarget } from "react-icons/vsc";
import { BiLogOutCircle } from "react-icons/bi";
import { IoMdHome } from "react-icons/io";
import { BsBuildingsFill } from "react-icons/bs";
import { FaBusAlt } from "react-icons/fa";
import { FaUser, FaRoute } from "react-icons/fa6";
import { MdPayment } from "react-icons/md";
import { GrUserWorker } from "react-icons/gr";
import { FaUserShield, FaVanShuttle } from "react-icons/fa6";
import { RiRfidLine } from "react-icons/ri";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import { ImLocation } from "react-icons/im";
import SidebarItem from "./SidebarItem";

const Sidebar = () => {
  const navigate = useNavigate();
  let role = "";
  const token = localStorage.getItem("token");
  if (token) {
    const decodedToken = jwtDecode(token);
    role = decodedToken.role;
    console.log("Role", role);
  }

  const commonItems = [];

  const adminItems = [
    { to: "/buses", icon: FaBusAlt, label: "Buses" },
    { to: "/payments", icon: MdPayment, label: "Payments" },
    { to: "/drivers", icon: GrUserWorker, label: "Drivers" },
    { to: "/vehicles", icon: FaVanShuttle, label: "Vehicles" },
    { to: "/routes", icon: FaRoute, label: "Routes" },
    { to: "/navigation", icon: ImLocation, label: "GPS Tracking" },
  ];

  const driverItems = [
    { to: "/", icon: IoMdHome, label: "Dashboard" },
    { to: "/scanner", icon: RiRfidLine, label: "Scanner" },
  ];

  const superAdminItems = [
    { to: "/companies", icon: BsBuildingsFill, label: "Companies" },
    { to: "/newadmin", icon: FaUserShield, label: "New Admin" },
    { to: "/regusers", icon: FaUser, label: "Users" },
    // { to: "/routes", icon: FaRoute, label: "Routes" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
    toast.success("User Logged out Successfully");
  };
  return (
    <div className="w-1/6 sidebar-height bg-headline sticky top-0 px-2 py-4 shadow-md">
      <Link to="/">
        <div className="flex items-center justify-center font-bold mb-4">
          <VscTarget />
          <span className="text-black text-lg ml-2">Menu</span>
        </div>
      </Link>
      <div className="flex-col justify-end border-t-2 font-bold my-4"></div>

      <div className="h-[70vh] grid grid-rows-[auto,auto]">
        <div>
          <ul className="space-y-4 w-full">
            {commonItems.map((item, index) => (
              <SidebarItem
                key={index}
                to={item.to}
                icon={item.icon}
                label={item.label}
              />
            ))}
            {role === "admin" &&
              adminItems.map((item, index) => (
                <SidebarItem
                  key={index}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                />
              ))}

            {role === "driver" &&
              driverItems.map((item, index) => (
                <SidebarItem
                  key={index}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                />
              ))}

            {role === "superadmin" &&
              superAdminItems.map((item, index) => (
                <SidebarItem
                  key={index}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                />
              ))}
          </ul>
        </div>
        <div className="px-4 flex flex-col-reverse ">
          <NavLink
            to="/login"
            onClick={handleLogout}
            className="flex items-center gap-4 app-side-li"
          >
            <BiLogOutCircle />
            <span>Logout</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

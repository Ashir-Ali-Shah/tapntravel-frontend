import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { BiSolidDashboard, BiLogOutCircle } from "react-icons/bi";
import { IoBus } from "react-icons/io5";
import { IoMdHome } from "react-icons/io";
import { BsBuildingsFill } from "react-icons/bs";
import { FaUser, FaRoute, FaUserShield } from "react-icons/fa6";
import { FaBusAlt } from "react-icons/fa";
import { MdPayment } from "react-icons/md";
import { RiRfidLine } from "react-icons/ri";
import { GiTeamUpgrade } from "react-icons/gi";
import { jwtDecode } from "jwt-decode";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  let role = "";

  const token = localStorage.getItem("token");
  if (token) {
    const decodedToken = jwtDecode(token);
    role = decodedToken.role;
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const commonItems = [
    { to: "/", icon: IoMdHome, label: "Dashboard" },
    // { to: "/", icon: GiTeamUpgrade, label: "Teams" },
  ];

  const adminItems = [
    { to: "/buses", icon: FaBusAlt, label: "Buses" },
    { to: "/payments", icon: MdPayment, label: "Payments" },
    { to: "/routes", icon: FaRoute, label: "Routes" },
    { to: "/drivers", icon: FaUser, label: "Drivers" },
  ];

  const driverItems = [{ to: "/scanner", icon: RiRfidLine, label: "Scanner" }];

  const superAdminItems = [
    { to: "/companies", icon: BsBuildingsFill, label: "Companies" },
    { to: "/newadmin", icon: FaUserShield, label: "New Admin" },
  ];

  const renderNavItems = (items) =>
    items.map((item, index) => (
      <NavLink
        key={index}
        to={item.to}
        className="app-nav-li flex items-center gap-2"
      >
        <item.icon />
        <span>{item.label}</span>
      </NavLink>
    ));

  return (
    <nav className="bg-primary text-white top-0 left-0 w-full px-4 py-2">
      <div className="mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center ml-2">
          <IoBus className="text-2xl lg:mt-1" />
          <span className="text-white font-bold text-lg ml-2">
            Tap & Travel
          </span>
        </Link>
        <div className="lg:hidden">
          {/* Hamburger Icon */}
          <button
            className="text-white hover:text-gray-300 mt-2 focus:outline-none"
            onClick={toggleMobileMenu}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
        {/* Horizontal Menu for Large Screens */}
        <div className="hidden lg:flex space-x-6">
          {renderNavItems(commonItems)}
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } fixed top-0 right-0 h-full w-1/2 bg-primary py-4 pl-1 transition-transform duration-300 ease-in-out transform z-50 lg:hidden`}
      >
        <div className="h-[80vh] grid grid-rows-[auto,auto]">
          <div>
            <ul className="space-y-4 w-full">
              {renderNavItems(commonItems)}
              {role === "admin" && renderNavItems(adminItems)}
              {role === "driver" && renderNavItems(driverItems)}
              {role === "superadmin" && renderNavItems(superAdminItems)}
            </ul>
          </div>
          <div className="px-4 flex flex-col-reverse">
            <NavLink
              to="/login"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.reload();
              }}
              className="app-nav-li flex items-center gap-2"
            >
              <BiLogOutCircle />
              <span>Logout</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Dark Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50"
          onClick={toggleMobileMenu}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;

import React from "react";
import { NavLink } from "react-router-dom";

const SideBarItem = ({ to, icon: Icon, label }) => {
  return (
    <li className="app-side-li">
      <NavLink to={to} className="flex items-center gap-4">
        <Icon />
        <span>{label}</span>
      </NavLink>
    </li>
  );
};

export default SideBarItem;

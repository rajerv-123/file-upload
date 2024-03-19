import React, { useState } from "react";
import "./Sidebar.css";
import { FaUpload, FaList } from "react-icons/fa";
import { Link } from "react-router-dom";

const Sidebar = ({ setComponent }) => {
  const [collapsed, setCollapsed] = useState(false);

  const handleUploadClick = () => {
    setComponent("upload");
  };

  const handleListClick = () => {
    setComponent("list");
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <button className="toggle-btn" onClick={toggleCollapse}>
          {collapsed ? <>&#x2192;</> : <>&#x2190;</>}
        </button>
      </div>
      <ul className="sidebar-menu">
        <li>
          <Link to="/upload" onClick={handleUploadClick}>
            <a href="#" className={`menu-item ${collapsed ? "hidden" : ""}`}>
              <FaUpload className="icon" /> {!collapsed && "Upload"}
            </a>
          </Link>
        </li>
        <li>
          <Link to="/list" onClick={handleListClick}>
            <a href="#" className={`menu-item ${collapsed ? "hidden" : ""}`}>
              <FaList className="icon" /> {!collapsed && "List"}
            </a>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;

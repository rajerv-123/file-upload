import React from "react";
import "./Header.css";

const Header = () => {
  return (
    <div className="header">
      <div className="logo">
        <h1>Task</h1>
      </div>
      <nav className="navbar">
        <ul>
          <li>
            <a href="#">Upload</a>
          </li>
          <li>
            <a href="#">List</a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Header;

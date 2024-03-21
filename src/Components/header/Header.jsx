import React from "react";
import "./Header.css";
import logo from "../../assets/Logo.jpg";

const Header = () => {
  return (
    <div className="header">
      <div className="logo">
        <img src={logo} alt="Logo" />
        <span style={{ fontSize: "1.7rem" }}>FileDrop</span>
      </div>
    </div>
  );
};

export default Header;

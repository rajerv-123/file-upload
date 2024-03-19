// AllRoute.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Import Routes
import Sidebar from "./Components/Sidebar/Sidebar";
import UploadFile from "./Components/upload/UploadFileImageAndVideo";
import List from "./Components/list/List";
import Header from "./Components/header/Header";

function AllRoute() {
  const [component, setComponent] = useState("");

  return (
    <Router>
      <Header />
      <div style={{ display: "flex" }}>
        <Sidebar setComponent={setComponent} />
        <Routes>
          <Route path="/upload" element={<UploadFile />} />
          <Route path="/list" element={<List />} />
        </Routes>
      </div>
    </Router>
  );
}

export default AllRoute;

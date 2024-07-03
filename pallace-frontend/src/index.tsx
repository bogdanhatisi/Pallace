import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import reportWebVitals from "./reportWebVitals";
import Invoice from "./pages/Invoice";
import TransactionHistory from "./pages/TransactionHistory";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/invoice" element={<Invoice />} />
        <Route path="/home" element={<Home />} />
        <Route path="/transaction" element={<TransactionHistory />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();

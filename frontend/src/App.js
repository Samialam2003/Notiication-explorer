import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "./config";

import HostPage from "./Component/HostPage";
import Register from "./Component/Register";
import Login from "./Component/Login";
import Home from "./Component/Home";
import Websitename from "./Component/Websitename";

// Always send cookies with axios requests
axios.defaults.withCredentials = true;

// ProtectedRoute that checks the session ON RENDER
function ProtectedRoute({ children }) {
  const [loading, setLoading] = React.useState(true);
  const [ok, setOk] = React.useState(false);

  React.useEffect(() => {
    axios
      .get(`${BACKEND_URL}/student/logged-in-user`)
      .then(() => setOk(true))
      .catch(() => setOk(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: "white", padding: 20 }}>Checking session…</p>;

  return ok ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Websitename />
              <Home />
            </ProtectedRoute>
          }
        />

        {/* host page (left open for now) */}
        <Route path="/hostpage" element={<HostPage />} />

        {/* default */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

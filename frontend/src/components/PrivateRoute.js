import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem("dema_wallet");

  if (!isAuthenticated) {
    // Redirect to login and store the intended path in state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;

import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../utilis/Firebase";

const ProtectedRoute = ({ children }) => {
  return auth.currentUser ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;

/* eslint-disable react/prop-types */
import { Navigate } from "react-router-dom";
import useAuthStore from "../store";
import { jwtDecode } from "jwt-decode";

export const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  

  return isAuthenticated ? <>{children}</> : <Navigate to="/auth/login" />;
};

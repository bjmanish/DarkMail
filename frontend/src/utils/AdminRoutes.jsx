import { Navigate } from "react-router-dom";
import { auth } from "./auth";

export function AdminRoute({ children }) {
  if (!auth.isAuthenticated() || !auth.isAdmin()) {
    return <Navigate to="/login" replace />;
  }

  // return children;
  return auth.isAdmin() ? children : <Navigate to="/user" />;
}

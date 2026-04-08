import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

interface Props {
  children: JSX.Element;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const location = useLocation();

  // ✅ Public routes that do NOT require token
  const publicRoutes = ["/set-password"];

  if (publicRoutes.some((route) => location.pathname.startsWith(route))) {
    return children; // allow freely
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      setIsValid(false);
      return;
    }

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        if (allowedRoles && !allowedRoles.includes(role || "")) {
          setIsValid(false);
        } else {
          setIsValid(true);
        }
      })
      .catch(() => {
        localStorage.clear();
        setIsValid(false);
      });
  }, []);

  if (isValid === null) return <div>Loading...</div>;

  return isValid ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
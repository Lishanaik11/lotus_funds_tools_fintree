import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

interface Props {
    children: JSX.Element;
    allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
    const [isValid, setIsValid] = useState<boolean | null>(null);

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

    // 🔑 always redirect to /login if not authenticated
    if (!isValid) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
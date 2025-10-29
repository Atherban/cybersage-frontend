import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppStore } from "../stores/use.store.js";

const ProtectedRoute = ({ children }) => {
  const { auth } = useAppStore();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      if (!auth.isAuthenticated && auth.token) {
        // Token exists but we need to verify it
        await auth.checkAuth();
      }
      setIsChecking(false);
    };

    checkAuthentication();
  }, [auth]);

  if (isChecking) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner-large"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;

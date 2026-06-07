import { Navigate, Outlet } from 'react-router-dom';
import { getUserLocal } from '../utils/authUtils';

const ProtectedRoute = () => {
    // Check if user exists in localStorage
    const user = getUserLocal();

    // If no user found, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If user exists, show the child component (Dashboard)
    return <Outlet />;
};

export default ProtectedRoute;

import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  let role;

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem('token');
        return <Navigate to="/login" />;
      }
      role = decodedToken.role;
    } catch (error) {
      console.error("Failed to decode token", error);
      return <Navigate to="/login" />;
    }
  }

  if (!token || !allowedRoles.includes(role)) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Add propTypes validation
ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired,  // Ensure allowedRoles is an array of strings
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;

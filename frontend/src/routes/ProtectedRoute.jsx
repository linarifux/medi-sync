import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  // If there is no user token in Redux, send them back to the login page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Otherwise, allow them to view the page
  return children;
};

export default ProtectedRoute;
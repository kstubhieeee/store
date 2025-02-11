import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminRequired = false }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.isAdmin;

  if (!user) {
    return <Navigate to="/" />;
  }

  if (adminRequired && !isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
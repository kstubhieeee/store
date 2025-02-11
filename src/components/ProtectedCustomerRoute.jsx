import { Navigate } from 'react-router-dom';

const ProtectedCustomerRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  // Redirect if not logged in or if user is admin
  if (!user || user.isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedCustomerRoute;
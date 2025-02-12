import { Navigate } from 'react-router-dom';

const ProtectedMerchantRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  // Redirect if not logged in or if user is not a merchant
  if (!user || !user.isMerchant) {
    return <Navigate to="/merchant/login" />;
  }

  return children;
};

export default ProtectedMerchantRoute;
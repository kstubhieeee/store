import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(5);
  const [user, setUser] = useState(null);

  const success = location.state?.success;
  const error = location.state?.error;
  const paymentId = location.state?.paymentId;

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    if (success) {
      clearCart();
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [success, navigate]);

  const clearCart = async () => {
    try {
      if (user?._id) {
        // Clear the entire cart for the user
        await axios.delete(`http://localhost:5000/api/cart/${user._id}`);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        {success ? (
          <>
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Payment Successful!</h2>
            <p className="text-gray-300 mb-4">
              Your payment has been processed successfully.
              {paymentId && (
                <span className="block mt-2 text-sm text-gray-400">
                  Payment ID: {paymentId}
                </span>
              )}
            </p>
          </>
        ) : (
          <>
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Payment Failed</h2>
            <p className="text-gray-300 mb-4">
              {error || 'There was an error processing your payment. Please try again.'}
            </p>
          </>
        )}

        <div className="mt-6 space-y-4">
          <p className="text-gray-400">
            Redirecting to home in {countdown} seconds...
          </p>
          <button
            onClick={handleHomeClick}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultPage;
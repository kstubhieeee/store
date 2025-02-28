import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const success = location.state?.success;
  const error = location.state?.error;
  const paymentId = location.state?.paymentId;
  const cartItems = location.state?.items;
  const totalAmount = location.state?.totalAmount;
  const appliedCoupon = location.state?.appliedCoupon;

  const [transactionCreated, setTransactionCreated] = useState(false);
  const transactionCreatedRef = useRef(false);

  useEffect(() => {
    if (success && user?._id && paymentId && !transactionCreatedRef.current) {
      createTransaction();
      clearCart();
      sendConfirmationEmail();
      transactionCreatedRef.current = true;
      setTransactionCreated(true);
    }

    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [success, navigate, user, paymentId, transactionCreated]);

  const createTransaction = async () => {
    try {
      await axios.post('http://localhost:5000/api/transactions', {
        userId: user._id,
        items: cartItems.map(item => ({
          productId: item._id,
          quantity: item.cartQuantity
        })),
        totalAmount,
        paymentMethod: location.state?.paymentMethod || 'card',
        paymentId,
        status: 'completed',
        couponApplied: appliedCoupon ? {
          couponId: appliedCoupon.id,
          code: appliedCoupon.code,
          discountPercentage: appliedCoupon.discountPercentage,
          discountAmount: appliedCoupon.discountAmount
        } : null
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const sendConfirmationEmail = async () => {
    try {
      const emailData = {
        to: user.email,
        subject: 'Order Confirmation - TechMart',
        orderId: paymentId,
        items: cartItems,
        totalAmount,
        customerName: `${user.firstName} ${user.lastName}`,
        shippingAddress: user.address,
        paymentMethod: location.state?.paymentMethod || 'card'
      };

      await axios.post('http://localhost:5000/api/send-order-confirmation', emailData);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/cart/${user._id}`);
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
            {appliedCoupon && (
              <div className="mt-4 mb-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <p className="text-purple-400 text-sm">
                  Coupon "{appliedCoupon.code}" applied: {appliedCoupon.discountPercentage}% off
                </p>
                <p className="text-purple-400 text-sm">
                  You saved ${appliedCoupon.discountAmount.toFixed(2)}
                </p>
              </div>
            )}
            <p className="text-gray-300 mt-4">
              A confirmation email has been sent to your email address.
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
            Redirecting to home in 5 seconds...
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
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from 'react-hot-toast';
import axios from 'axios';

function Checkout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('domestic');
  const [totalAmount, setTotalAmount] = useState(0);
  const [originalTotal, setOriginalTotal] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchCart(parsedUser._id);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const fetchCart = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/cart/${userId}`);
      setCartItems(response.data.items);
      const total = response.data.items.reduce((sum, item) => {
        const price = item.price * (1 - item.discount / 100);
        return sum + (price * item.cartQuantity);
      }, 0);
      setTotalAmount(total);
      setOriginalTotal(total);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Error loading cart items');
      setLoading(false);
    }
  };

  const handleCouponChange = (e) => {
    setCouponCode(e.target.value);
    setCouponError('');
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      const response = await axios.post('http://localhost:5000/api/checkout/apply-coupon', {
        code: couponCode,
        userId: user._id
      });

      const { couponId, discountPercentage, merchantId } = response.data;

      // Check if the coupon is applicable to any items in the cart
      const applicableItems = cartItems.filter(item => item.merchantId === merchantId);
      
      if (applicableItems.length === 0) {
        setCouponError('This coupon is not applicable to any items in your cart');
        setCouponLoading(false);
        return;
      }

      // Calculate discount only on applicable items
      let discountAmount = 0;
      applicableItems.forEach(item => {
        const itemPrice = item.price * (1 - item.discount / 100) * item.cartQuantity;
        discountAmount += (itemPrice * discountPercentage / 100);
      });

      // Apply the discount to the total
      const newTotal = originalTotal - discountAmount;
      setTotalAmount(newTotal);
      
      setAppliedCoupon({
        id: couponId,
        code: couponCode,
        discountPercentage,
        discountAmount,
        merchantId
      });

      toast.success(`Coupon applied! You saved $${discountAmount.toFixed(2)}`);
    } catch (error) {
      setCouponError(error.response?.data?.message || 'Invalid or expired coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setTotalAmount(originalTotal);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const handleRazorpayPayment = async () => {
    try {
      // Mark coupon as used if one is applied
      if (appliedCoupon) {
        try {
          await axios.put(`http://localhost:5000/api/coupons/${appliedCoupon.id}/use`);
        } catch (error) {
          console.error('Error marking coupon as used:', error);
        }
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: totalAmount * 100,
        currency: "INR",
        name: "TechMart",
        description: "Payment for your order",
        handler: function(response) {
          navigate('/payment/result', {
            state: {
              success: true,
              paymentId: response.razorpay_payment_id,
              items: cartItems,
              totalAmount,
              paymentMethod: 'razorpay',
              appliedCoupon
            }
          });
        },
        prefill: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          contact: user.phone
        },
        theme: {
          color: "#2563eb"
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Razorpay payment error:', error);
      navigate('/payment/result', {
        state: {
          success: false,
          error: 'There was an error initiating the payment'
        }
      });
    }
  };

  const handlePayPalPayment = () => {
    return {
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [
            {
              amount: {
                value: totalAmount.toFixed(2),
                currency_code: "USD"
              }
            }
          ]
        });
      },
      onApprove: async (data, actions) => {
        // Mark coupon as used if one is applied
        if (appliedCoupon) {
          try {
            await axios.put(`http://localhost:5000/api/coupons/${appliedCoupon.id}/use`);
          } catch (error) {
            console.error('Error marking coupon as used:', error);
          }
        }

        const order = await actions.order.capture();
        navigate('/payment/result', {
          state: {
            success: true,
            paymentId: order.id,
            items: cartItems,
            totalAmount,
            paymentMethod: 'paypal',
            appliedCoupon
          }
        });
      },
      onError: () => {
        navigate('/payment/result', {
          state: {
            success: false,
            error: 'PayPal payment failed'
          }
        });
      },
      onCancel: () => {
        navigate('/payment/result', {
          state: {
            success: false,
            error: 'Payment was cancelled'
          }
        });
      }
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

        <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Order Summary</h2>
            <span className="text-2xl font-bold text-green-400">
              ${totalAmount.toFixed(2)}
            </span>
          </div>

          <div className="space-y-4 mb-8">
            {cartItems.map((item) => (
              <div key={item._id} className="flex items-center justify-between py-4 border-b border-gray-700">
                <div className="flex items-center">
                  <img
                    src={`http://localhost:5000${item.imagePath}`}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="ml-4">
                    <h3 className="text-white font-medium">{item.name}</h3>
                    <p className="text-gray-400">Quantity: {item.cartQuantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">
                    ${(item.price * (1 - item.discount / 100) * item.cartQuantity).toFixed(2)}
                  </p>
                  {item.discount > 0 && (
                    <p className="text-sm text-gray-400 line-through">
                      ${(item.price * item.cartQuantity).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Coupon Code Section */}
          <div className="mb-8 border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Apply Coupon</h3>
            {appliedCoupon ? (
              <div className="bg-gray-700 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">{appliedCoupon.code}</p>
                    <p className="text-sm text-gray-400">
                      {appliedCoupon.discountPercentage}% off - You saved ${appliedCoupon.discountAmount.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={handleCouponChange}
                  placeholder="Enter coupon code"
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={applyCoupon}
                  disabled={couponLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {couponLoading ? 'Applying...' : 'Apply'}
                </button>
              </div>
            )}
            {couponError && (
              <p className="mt-2 text-red-400 text-sm">{couponError}</p>
            )}
            {appliedCoupon && (
              <div className="mt-4 flex justify-between text-white">
                <span>Subtotal:</span>
                <span>${originalTotal.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  value="domestic"
                  checked={paymentMethod === 'domestic'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="text-white">Domestic Payment (Razorpay)</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  value="international"
                  checked={paymentMethod === 'international'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="form-radio h-5 w-5 text-blue-600"
                />
                <span className="text-white">International Payment (PayPal)</span>
              </label>
            </div>
          </div>

          {paymentMethod === 'domestic' ? (
            <button
              onClick={handleRazorpayPayment}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Pay with Razorpay
            </button>
          ) : (
            <PayPalScriptProvider options={{ 
              "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID 
            }}>
              <PayPalButtons
                {...handlePayPalPayment()}
                style={{ layout: "horizontal" }}
              />
            </PayPalScriptProvider>
          )}
        </div>
      </div>
    </div>
  );
}

export default Checkout;
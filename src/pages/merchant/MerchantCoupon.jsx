import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

function MerchantCoupon() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    discountPercentage: '',
    expiryDate: '',
    description: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
      fetchMerchantCoupons(userData._id);
    } else {
      navigate('/merchant/login');
    }
    setLoading(false);
  }, [navigate]);

  const fetchMerchantCoupons = async (merchantId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/coupons/merchant/${merchantId}`);
      setCoupons(response.data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupons');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateCouponCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Validate discount percentage
      const discount = Number(formData.discountPercentage);
      if (isNaN(discount) || discount <= 0 || discount > 100) {
        setError('Discount percentage must be between 1 and 100');
        return;
      }

      // Validate expiry date
      const expiryDate = new Date(formData.expiryDate);
      const today = new Date();
      if (expiryDate <= today) {
        setError('Expiry date must be in the future');
        return;
      }

      const couponCode = generateCouponCode();
      
      const couponData = {
        code: couponCode,
        discountPercentage: discount,
        expiryDate: formData.expiryDate,
        description: formData.description,
        merchantId: user._id,
        merchantName: user.businessName,
        isUsed: false,
        isActive: true
      };

      await axios.post('http://localhost:5000/api/coupons', couponData);
      
      toast.success('Coupon created successfully');
      setFormData({
        discountPercentage: '',
        expiryDate: '',
        description: ''
      });
      
      // Refresh the coupons list
      fetchMerchantCoupons(user._id);
    } catch (error) {
      console.error('Error creating coupon:', error);
      setError(error.response?.data?.message || 'Failed to create coupon');
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    try {
      await axios.delete(`http://localhost:5000/api/coupons/${couponId}`);
      toast.success('Coupon deleted successfully');
      fetchMerchantCoupons(user._id);
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Failed to delete coupon');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Coupon Management</h1>
          <button
            onClick={() => navigate('/merchant/dashboard')}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Create New Coupon</h2>
          
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Discount Percentage (%)
              </label>
              <input
                type="number"
                name="discountPercentage"
                value={formData.discountPercentage}
                onChange={handleChange}
                required
                min="1"
                max="100"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Special discount for..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Coupon
            </button>
          </form>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Your Coupons</h2>
          
          {loading ? (
            <div className="text-white text-center py-4">Loading...</div>
          ) : coupons.length === 0 ? (
            <div className="text-gray-400 text-center py-4">No coupons found</div>
          ) : (
            <div className="space-y-4">
              {coupons.map((coupon) => (
                <div key={coupon._id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-white">{coupon.code}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          coupon.isUsed 
                            ? 'bg-gray-500/10 text-gray-400' 
                            : coupon.isActive 
                              ? 'bg-green-500/10 text-green-400'
                              : 'bg-red-500/10 text-red-400'
                        }`}>
                          {coupon.isUsed 
                            ? 'Used' 
                            : coupon.isActive 
                              ? 'Active' 
                              : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-1">
                        {coupon.discountPercentage}% off
                      </p>
                      <p className="text-gray-400 text-xs">
                        Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                      </p>
                      {coupon.description && (
                        <p className="text-gray-400 text-sm mt-2">{coupon.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteCoupon(coupon._id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      disabled={coupon.isUsed}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default MerchantCoupon;
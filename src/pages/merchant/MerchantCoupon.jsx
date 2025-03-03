import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

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
  const [sendModal, setSendModal] = useState({ isOpen: false, coupon: null });
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

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

  const fetchMerchantCustomers = async (merchantId) => {
    try {
      setLoadingCustomers(true);
      const response = await axios.get(`http://localhost:5000/api/merchant/${merchantId}/customers`);
      
      // Extract unique customers from transactions
      const uniqueCustomers = [];
      const customerIds = new Set();
      
      response.data.forEach(transaction => {
        if (transaction.customer && !customerIds.has(transaction.customer._id)) {
          customerIds.add(transaction.customer._id);
          uniqueCustomers.push(transaction.customer);
        }
      });
      
      setCustomers(uniqueCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoadingCustomers(false);
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

  const handleSendClick = (coupon) => {
    setSendModal({ isOpen: true, coupon });
    fetchMerchantCustomers(user._id);
    setSelectedCustomers([]);
  };

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomers(prev => {
      if (prev.includes(customerId)) {
        return prev.filter(id => id !== customerId);
      } else {
        return [...prev, customerId];
      }
    });
  };

  const handleSendCoupon = async () => {
    if (selectedCustomers.length === 0) {
      toast.error('Please select at least one customer');
      return;
    }

    try {
      // Call the API endpoint to send the coupon to selected customers
      await axios.post('http://localhost:5000/api/coupons/send', {
        couponId: sendModal.coupon._id,
        customerIds: selectedCustomers
      });

      toast.success(`Coupon sent to ${selectedCustomers.length} customer(s)`);
      setSendModal({ isOpen: false, coupon: null });
    } catch (error) {
      console.error('Error sending coupon:', error);
      toast.error('Failed to send coupon');
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
                    <div className="flex gap-2">
                      {!coupon.isUsed && coupon.isActive && (
                        <button
                          onClick={() => handleSendClick(coupon)}
                          className="text-blue-400 hover:text-blue-300 transition-colors px-3 py-1 bg-blue-500/10 rounded-md"
                        >
                          Send
                        </button>
                      )}
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
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Send Coupon Modal */}
      <Transition.Root show={sendModal.isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSendModal({ isOpen: false, coupon: null })}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div>
                    <div className="mt-3 sm:mt-5">
                      <Dialog.Title as="h3" className="text-2xl font-semibold leading-6 text-white mb-4">
                        Send Coupon to Customers
                      </Dialog.Title>
                      
                      {sendModal.coupon && (
                        <div className="bg-gray-700 p-4 rounded-lg mb-6">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-bold text-white">{sendModal.coupon.code}</span>
                            <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                              {sendModal.coupon.discountPercentage}% off
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm">
                            Expires: {new Date(sendModal.coupon.expiryDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <h4 className="text-lg font-medium text-white mb-3">Select Customers</h4>
                        
                        {loadingCustomers ? (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-2 text-gray-400">Loading customers...</p>
                          </div>
                        ) : customers.length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-gray-400">No customers found</p>
                          </div>
                        ) : (
                          <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                            {customers.map(customer => (
                              <div 
                                key={customer._id} 
                                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                  selectedCustomers.includes(customer._id) 
                                    ? 'bg-blue-500/20 border border-blue-500/40' 
                                    : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                                onClick={() => handleCustomerSelect(customer._id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-white font-medium">{customer.firstName} {customer.lastName}</p>
                                    <p className="text-gray-400 text-sm">{customer.email}</p>
                                  </div>
                                  <div className="flex items-center justify-center h-5 w-5 rounded-full border border-gray-500">
                                    {selectedCustomers.includes(customer._id) && (
                                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 flex gap-3">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      onClick={handleSendCoupon}
                      disabled={selectedCustomers.length === 0 || loadingCustomers}
                    >
                      Send Coupon
                    </button>
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                      onClick={() => setSendModal({ isOpen: false, coupon: null })}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}

export default MerchantCoupon;
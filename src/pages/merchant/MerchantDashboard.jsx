import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { Bars3Icon } from "@heroicons/react/24/solid";
import { XCircleIcon } from "@heroicons/react/24/outline";

function MerchantDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/merchant/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Show inactive account message if status is inactive or not set
  if (!user?.status || user.status === 'inactive') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Account Inactive</h2>
          <p className="text-gray-300 mb-6">
            Your merchant account is currently inactive. Please wait for an admin to review and activate your account.
          </p>
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              This usually takes 1-2 business days. You'll be notified via email once your account is activated.
            </p>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="h-16 bg-gray-800 border-b border-gray-700 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-200"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold text-white">
            Welcome, {user?.businessName || 'Merchant'}
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </header>
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-white mb-2">Total Products</h3>
                <p className="text-3xl font-bold text-blue-400">0</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-white mb-2">Total Orders</h3>
                <p className="text-3xl font-bold text-green-400">0</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-white mb-2">Revenue</h3>
                <p className="text-3xl font-bold text-yellow-400">$0.00</p>
              </div>
            </div>

            <div className="mt-8 bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Recent Orders</h2>
              <div className="text-gray-400 text-center py-8">
                No orders yet
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default MerchantDashboard;
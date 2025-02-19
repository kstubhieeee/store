import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bars3Icon } from "@heroicons/react/24/solid";
import { XCircleIcon } from "@heroicons/react/24/outline";
import DataTable from 'react-data-table-component';

function MerchantDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
      fetchMerchantProducts(userData._id);
    }
    setLoading(false);
  }, []);

  const fetchMerchantProducts = async (merchantId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products?merchantId=${merchantId}`);
      setProducts(response.data.filter(product => product.merchantId === merchantId));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/merchant/login');
  };

  const handleAddProduct = () => {
    navigate('/merchant/add');
  };

  const columns = [
    {
      name: "Image",
      cell: row => (
        <div className="w-16 h-16">
          {row.imagePath ? (
            <img
              src={`http://localhost:5000${row.imagePath}`}
              alt={row.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-xs">No image</span>
            </div>
          )}
        </div>
      ),
      width: '100px',
    },
    {
      name: "Product Name",
      selector: row => row.name,
      sortable: true,
    },
    {
      name: "Price",
      selector: row => row.price,
      sortable: true,
      cell: row => (
        <div className="text-green-400 font-medium">
          ₹{Number(row.price).toFixed(2)}
        </div>
      ),
    },
    {
      name: "Status",
      selector: row => row.status,
      sortable: true,
      cell: row => (
        <div className={`px-3 py-1 rounded-full text-sm font-medium
          ${row.status === 'approved' ? 'bg-green-500/10 text-green-400' :
            row.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
              'bg-red-500/10 text-red-400'}`}>
          {row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : 'Pending'}
        </div>
      ),
    },
    {
      name: "Quantity",
      selector: row => row.quantity,
      sortable: true,
    },
  ];

  const filteredItems = products.filter(
    item => item.name && item.name.toLowerCase().includes(filterText.toLowerCase())
  );

  const subHeaderComponentMemo = (
    <div className="w-full bg-gray-800 rounded-lg">
      <input
        type="text"
        placeholder="Search products..."
        value={filterText}
        onChange={e => setFilterText(e.target.value)}
        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500/50 transition duration-200"
      />
    </div>
  );

  const customStyles = {
    table: {
      style: {
        backgroundColor: "#1f2937",
      },
    },
    rows: {
      style: {
        backgroundColor: "#1f2937",
        color: "#e5e7eb",
        '&:hover': {
          backgroundColor: "#374151",
        },
      },
    },
    headRow: {
      style: {
        backgroundColor: "#111827",
        color: "#e5e7eb",
      },
    },
    cells: {
      style: {
        padding: '16px',
      },
    },
  };

  if (!user?.status || user.status === 'inactive') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Account Inactive</h2>
          <p className="text-gray-300 mb-6">
            Your merchant account is currently inactive. Please wait for an admin to review and activate your account.
          </p>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">
            Welcome, {user?.businessName || 'Merchant'}
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={handleAddProduct}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add New Product
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl bg-gray-800  mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Your Products</h2>

          <DataTable
            columns={columns}
            data={filteredItems}
            pagination
            subHeader
            subHeaderComponent={subHeaderComponentMemo}
            persistTableHead
            customStyles={customStyles}
            progressPending={loading}
            progressComponent={<div className="text-white text-center py-4">Loading...</div>}
            noDataComponent={<div className="text-white text-center py-4">No products found</div>}
          />
        </div>
      </main>
    </div>
  );
}

export default MerchantDashboard;
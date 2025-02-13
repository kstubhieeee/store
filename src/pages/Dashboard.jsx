import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Bars3Icon } from "@heroicons/react/24/solid";
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { toast } from 'react-hot-toast';

function Dashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [merchants, setMerchants] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/merchant/list');
      setMerchants(response.data);
    } catch (error) {
      console.error('Error fetching merchants:', error);
      toast.error('Failed to load merchants');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (merchantId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/merchant/${merchantId}/status`, {
        status: newStatus
      });
      setMerchants(merchants.map(merchant => 
        merchant._id === merchantId 
          ? { ...merchant, status: newStatus }
          : merchant
      ));
      toast.success(`Merchant ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating merchant status:', error);
      toast.error('Failed to update merchant status');
    }
  };

  const handleEditClick = (row) => {
    setEditingId(row._id);
    setEditForm({
      businessName: row.businessName,
      email: row.email,
      phone: row.phone,
      address: row.address,
      businessType: row.businessType,
      panCard: row.panCard,
      aadharCard: row.aadharCard,
      gstin: row.gstin
    });
  };

  const handleEditChange = (e, field) => {
    setEditForm(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleEditSave = async (id) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/merchant/${id}`, editForm);
      setMerchants(merchants.map(merchant => 
        merchant._id === id ? { ...merchant, ...response.data } : merchant
      ));
      setEditingId(null);
      setEditForm({});
      toast.success('Merchant details updated successfully');
    } catch (error) {
      console.error('Error updating merchant:', error);
      toast.error('Failed to update merchant details');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const columns = [
    {
      name: "Business Name",
      selector: row => row.businessName,
      sortable: true,
      style: {
        minWidth: "200px"
      },
      cell: row => (
        editingId === row._id ? (
          <input
            type="text"
            value={editForm.businessName}
            onChange={(e) => handleEditChange(e, 'businessName')}
            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-200"
          />
        ) : (
          <div className="py-2 font-medium">{row.businessName}</div>
        )
      ),
    },
    {
      name: "Email",
      selector: row => row.email,
      sortable: true,
      style: {
        minWidth: "200px"
      },
      cell: row => (
        editingId === row._id ? (
          <input
            type="email"
            value={editForm.email}
            onChange={(e) => handleEditChange(e, 'email')}
            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-200"
          />
        ) : (
          <div className="py-2">{row.email}</div>
        )
      ),
    },
    {
      name: "Phone",
      selector: row => row.phone,
      sortable: true,
      style: {
        minWidth: "150px"
      },
      cell: row => (
        editingId === row._id ? (
          <input
            type="text"
            value={editForm.phone}
            onChange={(e) => handleEditChange(e, 'phone')}
            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-200"
          />
        ) : (
          <div className="py-2">{row.phone}</div>
        )
      ),
    },
    {
      name: "GSTIN",
      selector: row => row.gstin,
      sortable: true,
      style: {
        minWidth: "150px"
      },
      cell: row => (
        editingId === row._id ? (
          <input
            type="text"
            value={editForm.gstin}
            onChange={(e) => handleEditChange(e, 'gstin')}
            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-200"
          />
        ) : (
          <div className="py-2 font-mono">{row.gstin}</div>
        )
      ),
    },
    {
      name: "PAN Card",
      selector: row => row.panCard,
      sortable: true,
      style: {
        minWidth: "150px"
      },
      cell: row => (
        editingId === row._id ? (
          <input
            type="text"
            value={editForm.panCard}
            onChange={(e) => handleEditChange(e, 'panCard')}
            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-200"
          />
        ) : (
          <div className="py-2 font-mono">{row.panCard}</div>
        )
      ),
    },
    {
      name: "Status",
      selector: row => row.status,
      sortable: true,
      style: {
        minWidth: "120px"
      },
      cell: row => (
        <select
          value={row.status || 'inactive'}
          onChange={(e) => handleStatusChange(row._id, e.target.value)}
          className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-gray-200 focus:outline-none focus:border-blue-500"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      ),
    },
    {
      name: "Actions",
      style: {
        minWidth: "150px"
      },
      cell: row => (
        <div className="flex flex-wrap gap-2">
          {editingId === row._id ? (
            <>
              <button
                onClick={() => handleEditSave(row._id)}
                className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-md hover:bg-green-500/20 transition-colors text-sm font-medium whitespace-nowrap"
              >
                Save
              </button>
              <button
                onClick={handleEditCancel}
                className="px-3 py-1.5 bg-gray-500/10 text-gray-400 rounded-md hover:bg-gray-500/20 transition-colors text-sm font-medium whitespace-nowrap"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => handleEditClick(row)}
              className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-md hover:bg-blue-500/20 transition-colors text-sm font-medium whitespace-nowrap"
            >
              Edit
            </button>
          )}
        </div>
      ),
    },
  ];

  const filteredItems = merchants.filter(
    item => item.businessName && item.businessName.toLowerCase().includes(filterText.toLowerCase())
  );

  const subHeaderComponentMemo = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText("");
      }
    };

    return (
      <div className="w-full gap-4 bg-gray-800 rounded-lg">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by business name..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500 pl-10"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {filterText && (
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-900 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Clear
          </button>
        )}
      </div>
    );
  }, [filterText, resetPaginationToggle]);

  const customStyles = {
    tableWrapper: {
      style: {
        display: 'block',
        width: '100%',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      },
    },
    table: {
      style: {
        backgroundColor: "#1f2937",
        color: "#e5e7eb",
        minWidth: '800px',
        width: '100%',
      },
    },
    rows: {
      style: {
        backgroundColor: "#1f2937",
        color: "#e5e7eb",
        minHeight: "72px",
        fontSize: "14px",
        "&:hover": {
          backgroundColor: "#374151",
        },
      },
    },
    headRow: {
      style: {
        backgroundColor: "#111827",
        color: "#e5e7eb",
        minHeight: "52px",
        fontSize: "14px",
        fontWeight: 600,
      },
    },
    headCells: {
      style: {
        paddingLeft: "16px",
        paddingRight: "16px",
      },
    },
    cells: {
      style: {
        paddingLeft: "16px",
        paddingRight: "16px",
        paddingTop: "12px",
        paddingBottom: "12px",
        wordBreak: "break-word",
      },
    },
    pagination: {
      style: {
        backgroundColor: "#1f2937",
        color: "#e5e7eb",
        fontSize: "13px",
      },
      pageButtonsStyle: {
        color: "#e5e7eb",
        fill: "#e5e7eb",
        backgroundColor: "transparent",
        "&:disabled": {
          opacity: "0.5",
        },
      },
    },
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role'); 
    navigate('/');
    window.location.reload(); 
  };

  return (
    <div className="min-h-screen bg-gray-900 w-full overflow-x-hidden">
      <header className="h-16 bg-gray-800 border-b border-gray-700 px-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-200"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold text-white">Merchant Management</h1>
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
        <main className="flex-1 p-2 sm:p-6 min-w-0">
          <div className="max-w-7xl mx-auto bg-gray-800 rounded-lg shadow-md p-3 sm:p-6 overflow-hidden">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-200 mb-6">Merchants List</h2>

            <div className="overflow-hidden">
              <DataTable
                columns={columns}
                data={filteredItems}
                pagination
                paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 30]}
                paginationResetDefaultPage={resetPaginationToggle}
                subHeader
                subHeaderComponent={subHeaderComponentMemo}
                persistTableHead
                customStyles={customStyles}
                pointerOnHover
                responsive
                progressPending={loading}
                progressComponent={<div className="text-center p-4 text-gray-400">Loading...</div>}
                noDataComponent={<div className="text-center p-4 text-gray-400">No merchants found</div>}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
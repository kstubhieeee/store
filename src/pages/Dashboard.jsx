import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Bars3Icon } from "@heroicons/react/24/solid";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

function Dashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [merchants, setMerchants] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState({ isOpen: false, merchant: null });
  const [viewModal, setViewModal] = useState({ isOpen: false, merchant: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, merchant: null });
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

  const handleEditClick = (merchant) => {
    setEditModal({ 
      isOpen: true, 
      merchant: merchant 
    });
    setEditForm({
      phone: merchant.phone,
      address: merchant.address,
      description: merchant.description
    });
  };

  const handleViewClick = (merchant) => {
    setViewModal({ isOpen: true, merchant });
  };

  const handleDeleteClick = (merchant) => {
    setDeleteModal({ isOpen: true, merchant });
  };

  const handleEditSave = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/merchant/${editModal.merchant._id}`, editForm);
      setMerchants(merchants.map(merchant => 
        merchant._id === editModal.merchant._id ? { ...merchant, ...response.data } : merchant
      ));
      setEditModal({ isOpen: false, merchant: null });
      setEditForm({});
      toast.success('Merchant details updated successfully');
    } catch (error) {
      console.error('Error updating merchant:', error);
      toast.error('Failed to update merchant details');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/merchant/${deleteModal.merchant._id}`);
      if (response.data) {
        setMerchants(merchants.filter(m => m._id !== deleteModal.merchant._id));
        setDeleteModal({ isOpen: false, merchant: null });
        toast.success('Merchant deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting merchant:', error);
      toast.error(error.response?.data?.message || 'Failed to delete merchant');
    }
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
        <div className="py-2 font-medium">{row.businessName}</div>
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
        <div className="py-2 font-mono">{row.gstin}</div>
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
        <div className="py-2 font-mono">{row.panCard}</div>
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
        <div className="flex gap-2">
          <button
            onClick={() => handleViewClick(row)}
            className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
            title="View Details"
          >
            <EyeIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleEditClick(row)}
            className="p-2 text-green-400 hover:text-green-300 transition-colors"
            title="Edit"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDeleteClick(row)}
            className="p-2 text-red-400 hover:text-red-300 transition-colors"
            title="Delete"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
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

      {/* View Modal */}
      <Transition.Root show={viewModal.isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setViewModal({ isOpen: false, merchant: null })}>
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
                        Merchant Details
                      </Dialog.Title>
                      <div className="mt-4 space-y-4">
                        {viewModal.merchant && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-400">Business Name</label>
                              <p className="mt-1 text-white">{viewModal.merchant.businessName}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400">Email</label>
                              <p className="mt-1 text-white">{viewModal.merchant.email}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400">Phone</label>
                              <p className="mt-1 text-white">{viewModal.merchant.phone}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400">Address</label>
                              <p className="mt-1 text-white">{viewModal.merchant.address}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400">Business Type</label>
                              <p className="mt-1 text-white">{viewModal.merchant.businessType}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400">Description</label>
                              <p className="mt-1 text-white">{viewModal.merchant.description}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400">GSTIN</label>
                              <p className="mt-1 text-white font-mono">{viewModal.merchant.gstin}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400">PAN Card</label>
                              <p className="mt-1 text-white font-mono">{viewModal.merchant.panCard}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400">Aadhar Card</label>
                              <p className="mt-1 text-white font-mono">{viewModal.merchant.aadharCard}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400">Status</label>
                              <p className="mt-1 text-white">{viewModal.merchant.status || 'inactive'}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                      onClick={() => setViewModal({ isOpen: false, merchant: null })}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Edit Modal */}
      <Transition.Root show={editModal.isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setEditModal({ isOpen: false, merchant: null })}>
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
                        Edit Merchant Details
                      </Dialog.Title>
                      <div className="mt-4 space-y-4">
                        {editModal.merchant && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-400">Business Name</label>
                              <p className="mt-1 text-white">{editModal.merchant.businessName}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400">Phone</label>
                              <input
                                type="text"
                                value={editForm.phone || ''}
                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                className="mt-1 block w-full rounded-md border-0 py-1.5 bg-gray-700 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400">Address</label>
                              <input
                                type="text"
                                value={editForm.address || ''}
                                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                className="mt-1 block w-full rounded-md border-0 py-1.5 bg-gray-700 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400">Description</label>
                              <textarea
                                value={editForm.description || ''}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-0 py-1.5 bg-gray-700 text-white shadow-sm ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 flex gap-3">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      onClick={handleEditSave}
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                      onClick={() => setEditModal({ isOpen: false, merchant: null })}
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

      {/* Delete Confirmation Modal */}
      <Transition.Root show={deleteModal.isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setDeleteModal({ isOpen: false, merchant: null })}>
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
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title as="h3" className="text-2xl font-semibold leading-6 text-white mb-4">
                        Delete Merchant
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-gray-400">
                          Are you sure you want to delete {deleteModal.merchant?.businessName}? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 flex gap-3">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                      onClick={handleDeleteConfirm}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                      onClick={() => setDeleteModal({ isOpen: false, merchant: null })}
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

export default Dashboard;
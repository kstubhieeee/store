import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { EyeIcon } from "@heroicons/react/24/outline";

function MerchantCustomerListing() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, transaction: null });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
      fetchMerchantCustomers(userData._id);
    } else {
      navigate('/merchant/login');
    }
  }, [navigate]);

  const fetchMerchantCustomers = async (merchantId) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/merchant/${merchantId}/customers`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (transaction) => {
    setDetailsModal({ isOpen: true, transaction });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const columns = [
    {
      name: "Customer Name",
      selector: row => `${row.customer.firstName} ${row.customer.lastName}`,
      sortable: true,
      minWidth: "180px",
    },
    {
      name: "Email",
      selector: row => row.customer.email,
      sortable: true,
      minWidth: "220px",
    },
    {
      name: "Phone",
      selector: row => row.customer.phone,
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "Order Date",
      selector: row => row.date,
      sortable: true,
      minWidth: "180px",
      cell: row => formatDate(row.date),
    },
    {
      name: "Order Total",
      selector: row => {
        // Calculate total for only this merchant's items
        const merchantTotal = row.items.reduce((sum, item) => {
          return sum + (item.price * (1 - item.discount / 100) * item.quantity);
        }, 0);
        return merchantTotal;
      },
      sortable: true,
      minWidth: "150px",
      cell: row => {
        const merchantTotal = row.items.reduce((sum, item) => {
          return sum + (item.price * (1 - item.discount / 100) * item.quantity);
        }, 0);
        return <div className="font-semibold text-green-400">${merchantTotal.toFixed(2)}</div>;
      },
    },
    {
      name: "Items",
      selector: row => row.items.length,
      sortable: true,
      minWidth: "100px",
    },
    {
      name: "Payment Method",
      selector: row => row.paymentMethod,
      sortable: true,
      minWidth: "150px",
      cell: row => <div className="capitalize">{row.paymentMethod}</div>,
    },
    {
      name: "Actions",
      minWidth: "100px",
      cell: row => (
        <button
          onClick={() => handleViewDetails(row)}
          className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
          title="View Details"
        >
          <EyeIcon className="w-5 h-5" />
        </button>
      ),
    },
  ];

  const filteredItems = useMemo(() => {
    return transactions.filter(item => {
      const customerName = `${item.customer.firstName} ${item.customer.lastName}`.toLowerCase();
      const customerEmail = item.customer.email.toLowerCase();
      const searchTerm = filterText.toLowerCase();
      
      return customerName.includes(searchTerm) || customerEmail.includes(searchTerm);
    });
  }, [transactions, filterText]);

  const subHeaderComponentMemo = useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText("");
      }
    };

    return (
      <div className="w-full bg-gray-800 rounded-lg">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by customer name or email..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 pl-10"
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
    table: {
      style: {
        backgroundColor: "#1f2937",
      },
    },
    rows: {
      style: {
        backgroundColor: "#1f2937",
        color: "#e5e7eb",
        minHeight: "72px",
        '&:hover': {
          backgroundColor: "#374151",
        },
      },
    },
    headRow: {
      style: {
        backgroundColor: "#111827",
        color: "#e5e7eb",
        minHeight: "52px",
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
      },
    },
    pagination: {
      style: {
        backgroundColor: "#1f2937",
        color: "#e5e7eb",
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

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Customer Listing</h1>
          <button
            onClick={() => navigate('/merchant/dashboard')}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Customer Purchase History</h2>
          
          <DataTable
            columns={columns}
            data={filteredItems}
            pagination
            paginationRowsPerPageOptions={[10, 25, 50, 100]}
            paginationResetDefaultPage={resetPaginationToggle}
            subHeader
            subHeaderComponent={subHeaderComponentMemo}
            persistTableHead
            customStyles={customStyles}
            progressPending={loading}
            progressComponent={<div className="text-white text-center py-4">Loading...</div>}
            noDataComponent={<div className="text-white text-center py-4">No customer data found</div>}
          />
        </div>
      </main>

      {/* Transaction Details Modal */}
      <Transition.Root show={detailsModal.isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setDetailsModal({ isOpen: false, transaction: null })}>
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
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                  {detailsModal.transaction && (
                    <>
                      <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                          <Dialog.Title as="h3" className="text-2xl font-semibold leading-6 text-white mb-4">
                            Order Details
                          </Dialog.Title>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                              <h4 className="text-lg font-medium text-white mb-3">Customer Information</h4>
                              <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                                <p className="text-white">
                                  <span className="text-gray-400">Name:</span> {detailsModal.transaction.customer.firstName} {detailsModal.transaction.customer.lastName}
                                </p>
                                <p className="text-white">
                                  <span className="text-gray-400">Email:</span> {detailsModal.transaction.customer.email}
                                </p>
                                <p className="text-white">
                                  <span className="text-gray-400">Phone:</span> {detailsModal.transaction.customer.phone}
                                </p>
                                <p className="text-white">
                                  <span className="text-gray-400">Address:</span> {detailsModal.transaction.customer.address}
                                </p>
                                {detailsModal.transaction.customer.city && (
                                  <p className="text-white">
                                    <span className="text-gray-400">City:</span> {detailsModal.transaction.customer.city}
                                  </p>
                                )}
                                {detailsModal.transaction.customer.state && (
                                  <p className="text-white">
                                    <span className="text-gray-400">State:</span> {detailsModal.transaction.customer.state}
                                  </p>
                                )}
                                {detailsModal.transaction.customer.zipCode && (
                                  <p className="text-white">
                                    <span className="text-gray-400">ZIP Code:</span> {detailsModal.transaction.customer.zipCode}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-lg font-medium text-white mb-3">Order Information</h4>
                              <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                                <p className="text-white">
                                  <span className="text-gray-400">Order ID:</span> {detailsModal.transaction._id}
                                </p>
                                <p className="text-white">
                                  <span className="text-gray-400">Date:</span> {formatDate(detailsModal.transaction.date)}
                                </p>
                                <p className="text-white">
                                  <span className="text-gray-400">Payment Method:</span> <span className="capitalize">{detailsModal.transaction.paymentMethod}</span>
                                </p>
                                <p className="text-white">
                                  <span className="text-gray-400">Payment ID:</span> {detailsModal.transaction.paymentId}
                                </p>
                                <p className="text-white">
                                  <span className="text-gray-400">Status:</span> <span className="capitalize">{detailsModal.transaction.status}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <h4 className="text-lg font-medium text-white mb-3">Purchased Items</h4>
                          <div className="bg-gray-700 rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-600">
                              <thead className="bg-gray-800">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Product
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Price
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Quantity
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Total
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-gray-700 divide-y divide-gray-600">
                                {detailsModal.transaction.items.map((item, index) => (
                                  <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        {item.imagePath && (
                                          <img 
                                            src={`http://localhost:5000${item.imagePath}`} 
                                            alt={item.name}
                                            className="w-10 h-10 object-cover rounded-md mr-3"
                                          />
                                        )}
                                        <div className="text-sm font-medium text-white">{item.name}</div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-white">
                                        ${(item.price * (1 - item.discount / 100)).toFixed(2)}
                                        {item.discount > 0 && (
                                          <span className="ml-2 text-xs text-gray-400 line-through">
                                            ${item.price.toFixed(2)}
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-white">{item.quantity}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm font-medium text-green-400">
                                        ${(item.price * (1 - item.discount / 100) * item.quantity).toFixed(2)}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-gray-800">
                                <tr>
                                  <td colSpan="3" className="px-6 py-4 text-right text-sm font-medium text-white">
                                    Total:
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-400">
                                    ${detailsModal.transaction.items.reduce((sum, item) => {
                                      return sum + (item.price * (1 - item.discount / 100) * item.quantity);
                                    }, 0).toFixed(2)}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                          
                          {/* Check if coupon was applied */}
                          {detailsModal.transaction.couponApplied && (
                            <div className="mt-6">
                              <h4 className="text-lg font-medium text-white mb-3">Applied Coupon</h4>
                              <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                                <p className="text-white">
                                  <span className="text-gray-400">Coupon Code:</span> {detailsModal.transaction.couponApplied.code}
                                </p>
                                <p className="text-white">
                                  <span className="text-gray-400">Discount:</span> {detailsModal.transaction.couponApplied.discountPercentage}%
                                </p>
                                <p className="text-white">
                                  <span className="text-gray-400">Amount Saved:</span> ${detailsModal.transaction.couponApplied.discountAmount.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-600 sm:mt-0 sm:w-auto"
                          onClick={() => setDetailsModal({ isOpen: false, transaction: null })}
                        >
                          Close
                        </button>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}

export default MerchantCustomerListing;
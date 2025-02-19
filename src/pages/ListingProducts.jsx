import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, deleteProduct, updateProduct } from "../store/productsSlice";
import { Sidebar } from "../components/Sidebar";
import DataTable from "react-data-table-component";
import { Bars3Icon } from "@heroicons/react/24/solid";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import axios from "axios";

const ListingProducts = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [resetPaginationToggle, setResetPaginationToggle] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const dispatch = useDispatch();
  const products = useSelector((state) => state.products.items);
  const status = useSelector((state) => state.products.status);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchProducts());
    }
  }, [status, dispatch]);

  const handleEditClick = (row) => {
    setEditingId(row._id);
    setEditForm({
      name: row.name,
      price: row.price.toString(),
      discount: row.discount.toString(),
      description: row.description,
      quantity: row.quantity.toString(),
      status: row.status,
    });
  };

  const handleEditChange = (e, field) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const validateNumberField = (value, fieldName) => {
    const num = Number(value);
    if (isNaN(num)) {
      throw new Error(`Please enter a valid number for ${fieldName}`);
    }
    if (fieldName === "discount" && (num < 0 || num > 100)) {
      throw new Error("Discount must be between 0 and 100");
    }
    if ((fieldName === "price" || fieldName === "quantity") && num < 0) {
      throw new Error(`${fieldName} cannot be negative`);
    }
    return num;
  };

  const handleImageChange = (e, row) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }

      const formData = new FormData();
      formData.append("image", file);

      formData.append("name", editForm.name || row.name);
      formData.append("price", editForm.price || row.price);
      formData.append("discount", editForm.discount || row.discount);
      formData.append("description", editForm.description || row.description);
      formData.append("quantity", editForm.quantity || row.quantity);
      formData.append("status", editForm.status || row.status);

      dispatch(updateProduct({ id: row._id, updates: formData }))
        .unwrap()
        .then(() => {
          setEditingId(null);
          setEditForm({});
          setImagePreview("");
        })
        .catch((error) => {
          setError(error.message);
          setTimeout(() => setError(""), 3000);
        });
    }
  };

  const handleEditSave = async (id) => {
    setError("");
    try {
      const price = validateNumberField(editForm.price, "price");
      const discount = validateNumberField(editForm.discount, "discount");
      const quantity = validateNumberField(editForm.quantity, "quantity");

      await dispatch(
        updateProduct({
          id,
          updates: {
            name: editForm.name,
            price,
            discount,
            description: editForm.description,
            quantity,
            status: editForm.status,
          },
        })
      ).unwrap();
      setEditingId(null);
      setEditForm({});
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm({});
    setError("");
  };

  const handleDeleteClick = (row) => {
    setDeleteModal({ isOpen: true, product: row });
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteProduct(deleteModal.product._id)).unwrap();
      setDeleteModal({ isOpen: false, product: null });
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/products/${id}/status`, { status: newStatus });
      dispatch(fetchProducts());
    } catch (error) {
      console.error("Failed to update product status:", error);
    }
  };

  const columns = [
    {
      name: "Image",
      cell: (row) => (
        <div className="w-16 h-16 relative group">
          {row.imagePath ? (
            <>
              <img
                src={`http://localhost:5000${row.imagePath}`}
                alt={row.name}
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, row)}
                  />
                  <i className="bx bx-upload text-white text-xl"></i>
                </label>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center relative">
              <span className="text-gray-400 text-xs">No image</span>
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, row)}
                  />
                  <i className="bx bx-upload text-white text-xl"></i>
                </label>
              </div>
            </div>
          )}
        </div>
      ),
      width: "100px",
    },
    {
      name: "Product Name",
      selector: (row) => row.name,
      sortable: true,
      minWidth: "200px",
      cell: (row) =>
        editingId === row._id ? (
          <input
            type="text"
            value={editForm.name}
            onChange={(e) => handleEditChange(e, "name")}
            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-200"
          />
        ) : (
          <div className="py-2 font-medium">{row.name}</div>
        ),
    },
    {
      name: "Price",
      selector: (row) => row.price,
      sortable: true,
      minWidth: "120px",
      cell: (row) =>
        editingId === row._id ? (
          <input
            type="text"
            value={editForm.price}
            onChange={(e) => handleEditChange(e, "price")}
            className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-200"
          />
        ) : (
          <div className="text-green-400 font-medium">${Number(row.price).toFixed(2)}</div>
        ),
    },
    {
      name: "Discount",
      selector: (row) => row.discount,
      sortable: true,
      minWidth: "120px",
      hide: "sm",
      cell: (row) =>
        editingId === row._id ? (
          <input
            type="text"
            value={editForm.discount}
            onChange={(e) => handleEditChange(e, "discount")}
            className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-200"
          />
        ) : (
          <div className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full text-sm">
            {row.discount}%
          </div>
        ),
    },
    {
      name: "Description",
      selector: (row) => row.description,
      sortable: true,
      minWidth: "250px",
      hide: "md",
      cell: (row) =>
        editingId === row._id ? (
          <input
            type="text"
            value={editForm.description}
            onChange={(e) => handleEditChange(e, "description")}
            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-200"
          />
        ) : (
          <div className="py-2 text-gray-400 truncate max-w-xs">{row.description}</div>
        ),
    },
    {
      name: "Quantity",
      selector: (row) => row.quantity,
      sortable: true,
      minWidth: "120px",
      hide: "sm",
      cell: (row) =>
        editingId === row._id ? (
          <input
            type="text"
            value={editForm.quantity}
            onChange={(e) => handleEditChange(e, "quantity")}
            className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-200"
          />
        ) : (
          <div className="font-medium">{Number(row.quantity).toLocaleString()}</div>
        ),
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      minWidth: "120px",
      cell: (row) => (
        <div className={`px-3 py-1 rounded-full text-sm font-medium
          ${row.status === 'approved' ? 'bg-green-500/10 text-green-400' :
            row.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
              'bg-red-500/10 text-red-400'}`}>
          {row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : 'Pending'}
        </div>
      ),
    },
    {
      name: "Actions",
      minWidth: "200px",
      cell: (row) => (
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
            <>
              <button
                onClick={() => handleEditClick(row)}
                className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-md hover:bg-blue-500/20 transition-colors text-sm font-medium whitespace-nowrap"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteClick(row)}
                className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-md hover:bg-red-500/20 transition-colors text-sm font-medium whitespace-nowrap"
              >
                Delete
              </button>
              <button
                onClick={() => handleStatusChange(row._id, 'approved')}
                className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-md hover:bg-green-500/20 transition-colors text-sm font-medium whitespace-nowrap"
              >
                Approve
              </button>
              <button
                onClick={() => handleStatusChange(row._id, 'declined')}
                className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-md hover:bg-red-500/20 transition-colors text-sm font-medium whitespace-nowrap"
              >
                Decline
              </button>
              <button
                onClick={() => handleStatusChange(row._id, 'pending')}
                className="px-3 py-1.5 bg-yellow-500/10 text-yellow-400 rounded-md hover:bg-yellow-500/20 transition-colors text-sm font-medium whitespace-nowrap"
              >
                Pending
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const filteredItems = products.filter(
    (item) => item.name && item.name.toLowerCase().includes(filterText.toLowerCase())
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
            placeholder="Search by product name..."
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
        display: "block",
        width: "100%",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      },
    },
    table: {
      style: {
        backgroundColor: "#1f2937",
        color: "#e5e7eb",
        minWidth: "800px",
        width: "100%",
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

  if (status === "loading") {
    return <div className="text-white text-center mt-8">Loading...</div>;
  }

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
          <h1 className="text-xl font-semibold text-white">Products Listing</h1>
        </div>
      </header>
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} />
        <main className="flex-1 p-2 sm:p-6 min-w-0">
          <div className="max-w-7xl mx-auto bg-gray-800 rounded-lg shadow-md p-3 sm:p-6 overflow-hidden">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-200 mb-6">Products List</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

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
                progressPending={status === "loading"}
                progressComponent={<div className="text-center p-4 text-gray-400">Loading...</div>}
                noDataComponent={<div className="text-center p-4 text-gray-400">No products found</div>}
              />
            </div>
          </div>
        </main>
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, product: null })}
        onConfirm={handleDeleteConfirm}
        productName={deleteModal.product?.name}
      />
    </div>
  );
};

export default ListingProducts;
import { useState, useMemo, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchProducts, deleteProduct, updateProduct } from "../store/productsSlice"
import { Sidebar } from "../components/Sidebar"
import DataTable from "react-data-table-component"
import { Bars3Icon } from "@heroicons/react/24/solid"
import DeleteConfirmationModal from "../components/DeleteConfirmationModal"

const ListingProducts = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [filterText, setFilterText] = useState("")
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [editForm, setEditForm] = useState({})
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null })

    const dispatch = useDispatch()
    const products = useSelector((state) => state.products.items)
    const status = useSelector((state) => state.products.status)

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchProducts())
        }
    }, [status, dispatch])

    const handleEditClick = (row) => {
        setEditingId(row._id)
        setEditForm({
            name: row.name,
            price: Number(row.price),
            discount: Number(row.discount),
            description: row.description,
            quantity: Number(row.quantity)
        })
    }

    const handleEditChange = (e, field) => {
        const value = field === 'price' || field === 'discount' || field === 'quantity'
            ? Number(e.target.value)
            : e.target.value;
        setEditForm(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleEditSave = async (id) => {
        try {
            await dispatch(updateProduct({ id, updates: editForm })).unwrap()
            setEditingId(null)
            setEditForm({})
        } catch (error) {
            console.error('Failed to update product:', error)
        }
    }

    const handleEditCancel = () => {
        setEditingId(null)
        setEditForm({})
    }

    const handleDeleteClick = (row) => {
        setDeleteModal({ isOpen: true, product: row })
    }

    const handleDeleteConfirm = async () => {
        try {
            await dispatch(deleteProduct(deleteModal.product._id)).unwrap()
            setDeleteModal({ isOpen: false, product: null })
        } catch (error) {
            console.error('Failed to delete product:', error)
        }
    }

    const columns = [
        {
            name: "Product Name",
            selector: row => row.name,
            sortable: true,
            cell: row => (
                editingId === row._id ? (
                    <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => handleEditChange(e, 'name')}
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-200"
                    />
                ) : (
                    <div className="py-2 font-medium">{row.name}</div>
                )
            ),
        },
        {
            name: "Price",
            selector: row => Number(row.price),
            sortable: true,
            cell: row => (
                editingId === row._id ? (
                    <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => handleEditChange(e, 'price')}
                        className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-200"
                    />
                ) : (
                    <div className="text-green-400 font-medium">
                        ${Number(row.price).toFixed(2)}
                    </div>
                )
            ),
        },
        {
            name: "Discount",
            selector: row => Number(row.discount),
            sortable: true,
            cell: row => (
                editingId === row._id ? (
                    <input
                        type="number"
                        value={editForm.discount}
                        onChange={(e) => handleEditChange(e, 'discount')}
                        className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-200"
                    />
                ) : (
                    <div className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full text-sm">
                        {Number(row.discount)}%
                    </div>
                )
            ),
        },
        {
            name: "Description",
            selector: row => row.description,
            sortable: true,
            wrap: true,
            cell: row => (
                editingId === row._id ? (
                    <input
                        type="text"
                        value={editForm.description}
                        onChange={(e) => handleEditChange(e, 'description')}
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-200"
                    />
                ) : (
                    <div className="py-2 text-gray-400">{row.description}</div>
                )
            ),
        },
        {
            name: "Quantity",
            selector: row => Number(row.quantity),
            sortable: true,
            cell: row => (
                editingId === row._id ? (
                    <input
                        type="number"
                        value={editForm.quantity}
                        onChange={(e) => handleEditChange(e, 'quantity')}
                        className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-gray-200"
                    />
                ) : (
                    <div className="font-medium">
                        {Number(row.quantity).toLocaleString()}
                    </div>
                )
            ),
        },
        {
            name: "Actions",
            cell: row => (
                <div className="flex gap-2">
                    {editingId === row._id ? (
                        <>
                            <button
                                onClick={() => handleEditSave(row._id)}
                                className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-md hover:bg-green-500/20 transition-colors text-sm font-medium"
                            >
                                Save
                            </button>
                            <button
                                onClick={handleEditCancel}
                                className="px-3 py-1.5 bg-gray-500/10 text-gray-400 rounded-md hover:bg-gray-500/20 transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => handleEditClick(row)}
                                className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-md hover:bg-blue-500/20 transition-colors text-sm font-medium"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDeleteClick(row)}
                                className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-md hover:bg-red-500/20 transition-colors text-sm font-medium"
                            >
                                Delete
                            </button>
                        </>
                    )}
                </div>
            ),
        },
    ]

    const filteredItems = products.filter(
        (item) => item.name && item.name.toLowerCase().includes(filterText.toLowerCase())
    )

    const subHeaderComponentMemo = useMemo(() => {
        const handleClear = () => {
            if (filterText) {
                setResetPaginationToggle(!resetPaginationToggle)
                setFilterText("")
            }
        }

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
        )
    }, [filterText, resetPaginationToggle])

    const customStyles = {
        table: {
            style: {
                backgroundColor: "#111827",
                color: "#e5e7eb",
            },
        },
        rows: {
            style: {
                backgroundColor: "#111827",
                color: "#e5e7eb",
                minHeight: "60px",
                "&:hover": {
                    backgroundColor: "#1f2937",
                    cursor: "pointer",
                },
            },
        },
        headRow: {
            style: {
                backgroundColor: "#111827",
                color: "#e5e7eb",
                minHeight: "52px",
                borderBottomWidth: "1px",
                borderBottomColor: "#374151",
            },
        },
        headCells: {
            style: {
                paddingLeft: "16px",
                paddingRight: "16px",
                fontWeight: "600",
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
                backgroundColor: "#111827",
                color: "#e5e7eb",
                borderTopWidth: "1px",
                borderTopColor: "#374151",
            },
            pageButtonsStyle: {
                color: "#e5e7eb",
                fill: "#e5e7eb",
                "&:disabled": {
                    opacity: "0.5",
                    cursor: "not-allowed",
                },
            },
        },
    }

    if (status === 'loading') {
        return <div className="text-white text-center mt-8">Loading...</div>;
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
                    <h1 className="text-xl font-semibold text-white">Products Listing</h1>
                </div>
            </header>
            <div className="flex">
                <Sidebar isOpen={isSidebarOpen} />
                <main className="flex-1 p-6">
                    <div className="max-w-7xl mx-auto bg-gray-800 rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-semibold text-gray-200 mb-6">Products List</h2>
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
                        />
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
    )
}

export default ListingProducts
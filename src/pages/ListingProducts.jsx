"use client"

import { useState, useMemo } from "react"
import { Sidebar } from "../components/Sidebar"
import DataTable from "react-data-table-component"

const ListingProducts = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [filterText, setFilterText] = useState("")
    const [resetPaginationToggle, setResetPaginationToggle] = useState(false)

    const data = [
        {
            id: 1,
            name: "Product 1",
            price: 100,
            discount: 10,
            description: "Description for product 1",
            quantity: 50000,
        },
        {
            id: 2,
            name: "Product 2",
            price: 200,
            discount: 15,
            description: "Description for product 2",
            quantity: 30000,
        },
        {
            id: 3,
            name: "Product 3",
            price: 150,
            discount: 5,
            description: "Description for product 3",
            quantity: 40000,
        },
    ]

    const columns = [
        {
            name: "Product Name",
            selector: row => row.name,
            sortable: true,
        },
        {
            name: "Price ($)",
            selector: row => row.price,
            sortable: true,
            cell: row => `$${row.price.toFixed(2)}`,
        },
        {
            name: "Discount (%)",
            selector: row => row.discount,
            sortable: true,
            cell: row => `${row.discount}%`,
        },
        {
            name: "Description",
            selector: row => row.description,
            sortable: true,
            wrap: true,
        },
        {
            name: "Quantity",
            selector: row => row.quantity,
            sortable: true,
            style: {
                justifyContent: "flex-end",
            },
        },
        {
            name: "Actions",
            cell: row => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleDelete(row)}
                        className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            ),
        },
    ]

    const handleEdit = (row) => {
        console.log("Edit:", row)
    }

    const handleDelete = (row) => {
        console.log("Delete:", row)
    }

    const filteredItems = data.filter((item) => item.name && item.name.toLowerCase().includes(filterText.toLowerCase()))

    const subHeaderComponentMemo = useMemo(() => {
        const handleClear = () => {
            if (filterText) {
                setResetPaginationToggle(!resetPaginationToggle)
                setFilterText("")
            }
        }

        return (
            <div className=" w-full  rounded-md">
                <input
                    type="text"
                    placeholder="Search by product name..."
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:border-blue-500 w-full"
                />
                {filterText && (
                    <button
                        onClick={handleClear}
                        className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors sm:w-auto w-full"
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
                backgroundColor: "#1f2937",
                color: "#e5e7eb",
            },
        },
        rows: {
            style: {
                backgroundColor: "#1f2937",
                color: "#e5e7eb",
                minHeight: "52px",
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
            },
        },
        cells: {
            style: {
                paddingLeft: "16px",
                paddingRight: "16px",
                paddingTop: "8px",
                paddingBottom: "8px",
            },
        },
        pagination: {
            style: {
                backgroundColor: "#1f2937",
                color: "#e5e7eb",
                minHeight: "52px",
            },
            pageButtonsStyle: {
                color: "#e5e7eb",
                fill: "#e5e7eb",
            },
        },
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <header className="h-16 bg-gray-800 border-b border-gray-700 px-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-200"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
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
                            paginationResetDefaultPage={resetPaginationToggle}
                            subHeader
                            subHeaderComponent={subHeaderComponentMemo}
                            persistTableHead
                            customStyles={customStyles}
                            highlightOnHover
                            pointerOnHover
                        />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default ListingProducts


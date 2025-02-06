import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addProduct } from '../store/productsSlice';
import { Sidebar } from '../components/Sidebar';
import { Bars3Icon } from "@heroicons/react/24/solid";
import { useNavigate } from 'react-router-dom';

const AddProducts = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [formData, setFormData] = useState({
        productName: '',
        price: '',
        discount: '',
        description: '',
        quantity: ''
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(addProduct({
                name: formData.productName,
                price: Number(formData.price),
                discount: Number(formData.discount),
                description: formData.description,
                quantity: Number(formData.quantity)
            })).unwrap();
            
            // Reset form and navigate to listing
            setFormData({
                productName: '',
                price: '',
                discount: '',
                description: '',
                quantity: ''
            });
            navigate('/listing');
        } catch (error) {
            console.error('Failed to add product:', error);
        }
    };

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
                    <h1 className="text-xl font-semibold text-white">Add Products</h1>
                </div>
            </header>
            <div className="flex">
                <Sidebar isOpen={isSidebarOpen} />
                <main className="flex-1 p-6">
                    <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-semibold text-gray-200 mb-6">Add New Product</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="productName" className="block text-gray-300 mb-2">
                                    Product Name
                                </label>
                                <input
                                    type="text"
                                    id="productName"
                                    name="productName"
                                    value={formData.productName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="price" className="block text-gray-300 mb-2">
                                        Price ($)
                                    </label>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="discount" className="block text-gray-300 mb-2">
                                        Discount (%)
                                    </label>
                                    <input
                                        type="number"
                                        id="discount"
                                        name="discount"
                                        value={formData.discount}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                                        min="0"
                                        max="100"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="quantity" className="block text-gray-300 mb-2">
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    id="quantity"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                                    required
                                    min="0"
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                                    required
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300"
                            >
                                Add Product
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AddProducts;
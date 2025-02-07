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
        quantity: '',
        image: null
    });
    const [error, setError] = useState('');
    const [imagePreview, setImagePreview] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('Image size should be less than 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                setError('Please upload an image file');
                return;
            }
            setFormData(prev => ({
                ...prev,
                image: file
            }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const validateNumberField = (value, fieldName) => {
        const num = Number(value);
        if (isNaN(num)) {
            throw new Error(`Please enter a valid number for ${fieldName}`);
        }
        if (fieldName === 'discount' && (num < 0 || num > 100)) {
            throw new Error('Discount must be between 0 and 100');
        }
        if ((fieldName === 'price' || fieldName === 'quantity') && num < 0) {
            throw new Error(`${fieldName} cannot be negative`);
        }
        return num;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        try {
            const price = validateNumberField(formData.price, 'price');
            const discount = validateNumberField(formData.discount, 'discount');
            const quantity = validateNumberField(formData.quantity, 'quantity');

            if (!formData.image) {
                throw new Error('Please select an image');
            }

            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.productName);
            formDataToSend.append('price', price);
            formDataToSend.append('discount', discount);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('quantity', quantity);
            formDataToSend.append('image', formData.image);

            await dispatch(addProduct(formDataToSend)).unwrap();

            setFormData({
                productName: '',
                price: '',
                discount: '',
                description: '',
                quantity: '',
                image: null
            });
            setImagePreview('');
            navigate('/listing');
        } catch (error) {
            setError(error.message);
            setTimeout(() => setError(''), 3000);
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
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                                {error}
                            </div>
                        )}
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
                                        type="text"
                                        id="price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                                        required
                                        placeholder="Enter price (e.g., 29.99)"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="discount" className="block text-gray-300 mb-2">
                                        Discount (%)
                                    </label>
                                    <input
                                        type="text"
                                        id="discount"
                                        name="discount"
                                        value={formData.discount}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                                        placeholder="Enter discount (0-100)"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="quantity" className="block text-gray-300 mb-2">
                                    Quantity
                                </label>
                                <input
                                    type="text"
                                    id="quantity"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                                    required
                                    placeholder="Enter quantity (e.g., 100)"
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

                            <div>
                                <label htmlFor="image" className="block text-gray-300 mb-2">
                                    Product Image
                                </label>
                                <input
                                    type="file"
                                    id="image"
                                    name="image"
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 focus:outline-none focus:border-blue-500"
                                    required
                                />
                                {imagePreview && (
                                    <div className="mt-2">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="max-w-xs rounded-lg border border-gray-600"
                                        />
                                    </div>
                                )}
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
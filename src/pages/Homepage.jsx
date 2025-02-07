import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/productsSlice';
import { Link } from 'react-router-dom';

const Homepage = () => {
    const dispatch = useDispatch();
    const products = useSelector((state) => state.products.items);
    const status = useSelector((state) => state.products.status);
    const [displayCount, setDisplayCount] = useState(6);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchProducts());
        }
    }, [status, dispatch]);

    const handleViewMore = () => {
        setDisplayCount(prevCount => prevCount + 6);
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    const displayedProducts = products.slice(0, displayCount);

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            <header className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <i className='bx bxs-store text-3xl text-blue-500'></i>
                                <span className="ml-2 text-2xl font-bold text-white">TechMart</span>
                            </div>
                            <nav className="hidden md:flex space-x-8 ml-8">
                                <a href="#" className="text-gray-300 hover:text-white transition-colors">Products</a>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors">Categories</a>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors">Deals</a>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors">About</a>
                            </nav>
                        </div>
                        <div className="flex gap-4">
                            <Link
                                to="/signin"
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {displayedProducts.map((product) => (
                        <div
                            key={product._id}
                            className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                        >
                            <div className="relative w-full pt-[100%]">
                                {product.imagePath ? (
                                    <img
                                        src={`http://localhost:5000${product.imagePath}`}
                                        alt={product.name}
                                        className="absolute top-0 left-0 w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="absolute top-0 left-0 w-full h-full bg-gray-700 flex items-center justify-center">
                                        <span className="text-gray-400">No image</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h2 className="text-xl font-semibold text-white mb-2 overflow-hidden whitespace-nowrap text-ellipsis">
                                    {product.name}
                                </h2>
                                <div className="flex items-baseline mb-2">
                                    <span className="text-2xl font-bold text-green-400">
                                        ${Number(product.price).toFixed(2)}
                                    </span>
                                    {product.discount > 0 && (
                                        <span className="ml-2 text-sm text-blue-400 font-semibold">
                                            {product.discount}% OFF
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-400 text-sm mb-4 overflow-hidden text-ellipsis" style={{
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                }}>
                                    {product.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-300">
                                        {product.quantity} in stock
                                    </span>
                                    <button className="px-4 py-2 ml-5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {displayCount < products.length && (
                    <div className="mt-8 text-center">
                        <button
                            onClick={handleViewMore}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            View More
                        </button>
                    </div>
                )}
            </main>

            <footer className="bg-gray-800 border-t border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center">
                                <i className='bx bxs-store text-3xl text-blue-500'></i>
                                <span className="ml-2 text-xl font-bold text-white">TechMart</span>
                            </div>
                            <p className="mt-4 text-gray-400">Your one-stop shop for all things tech. Quality products, competitive prices, and excellent service.</p>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQs</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-4">Contact Info</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li className="flex items-center">
                                    <i className='bx bx-map mr-2'></i>
                                    <a href="https://www.google.com/maps/place/Tech+Hub/@19.2219867,72.8528759,20.49z/data=!4m10!1m2!2m1!1sTech+Store+Near+City!3m6!1s0x3be7b124b867b72b:0x995b415640967bbe!8m2!3d19.2220172!4d72.8531423!15sChRUZWNoIFN0b3JlIE5lYXIgQ2l0eVoWIhR0ZWNoIHN0b3JlIG5lYXIgY2l0eZIBDmNvbXB1dGVyX3N0b3Jl4AEA!16s%2Fg%2F11v5djr1_k?entry=ttu&g_ep=EgoyMDI1MDIwNC4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                        123 Tech Street, Digital City, 12345
                                    </a>
                                </li>
                                <li className="flex items-center">
                                    <i className='bx bx-phone mr-2'></i>
                                    (555) 123-4567
                                </li>
                                <li className="flex items-center">
                                    <i className='bx bx-envelope mr-2'></i>
                                    info@techmart.com
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-4">Legal</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Return Policy</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Shipping Info</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
                        <p>&copy; {new Date().getFullYear()} TechMart. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Homepage;
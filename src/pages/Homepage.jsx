import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/productsSlice';
import SignInModal from '../components/SignInModal';
import SignUpModal from '../components/SignUpModal';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const Homepage = () => {
    const dispatch = useDispatch();
    const products = useSelector((state) => state.products.items);
    const status = useSelector((state) => state.products.status);
    const [displayCount, setDisplayCount] = useState(6);
    const [isSignInOpen, setIsSignInOpen] = useState(false);
    const [isSignUpOpen, setIsSignUpOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchProducts());
        }

        // Check for user data in localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, [status, dispatch]);

    const handleSignOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        localStorage.removeItem('cart'); // Clear cart on sign out
        setUser(null);
        window.location.reload();
    };

    const handleAddToCart = async (product) => {
        if (!user) {
            setIsSignInOpen(true);
            return;
        }

        if (user.isAdmin) {
            toast.error("Admins cannot add items to cart");
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/cart', {
                userId: user._id,
                productId: product._id,
                quantity: 1
            });

            toast.success(`${product.name} added to cart`);
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Error adding item to cart');
        }
    };

    const handleViewMore = () => {
        setDisplayCount(prevCount => prevCount + 6);
    };

    const handleSignInClick = () => {
        setIsSignInOpen(true);
        setIsSignUpOpen(false);
    };

    const handleSignUpClick = () => {
        setIsSignUpOpen(true);
        setIsSignInOpen(false);
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
                        <div className="flex items-center gap-4">
                            {user ? (
                                <div className="flex items-center gap-4">
                                    {!user.isAdmin && (
                                        <Link
                                            to="/cart"
                                            className="p-2 text-gray-300 hover:text-white transition-colors"
                                        >
                                            <i className='bx bx-cart text-2xl'></i>
                                        </Link>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                            <span className="text-white font-medium">
                                                {user.firstName?.charAt(0)}
                                            </span>
                                        </div>
                                        <span className="text-white">
                                            {user.firstName} {user.lastName}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleSignOut}
                                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleSignInClick}
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                >
                                    Sign In
                                </button>
                            )}
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
                                    <button
                                        className="px-4 py-2 ml-5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        onClick={() => handleAddToCart(product)}
                                    >
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
                        <div className="text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start">
                                <i className='bx bxs-store text-3xl text-blue-500'></i>
                                <span className="ml-2 text-xl font-bold text-white">TechMart</span>
                            </div>
                            <p className="mt-4 text-gray-400">Your one-stop shop for all things tech. Quality products, competitive prices, and excellent service.</p>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-4 text-center md:text-left">Quick Links</h3>
                            <ul className="space-y-2 flex flex-col items-center md:items-start">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQs</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-4 text-center md:text-left">Contact Info</h3>
                            <ul className="space-y-2 text-gray-400 flex flex-col items-center md:items-start">
                                <li className="flex items-center">
                                    <i className='bx bx-map mr-2'></i>
                                    <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
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
                            <h3 className="text-white font-semibold mb-4 text-center md:text-left">Legal</h3>
                            <ul className="space-y-2 flex flex-col items-center md:items-start">
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

            <SignInModal
                isOpen={isSignInOpen}
                onClose={() => setIsSignInOpen(false)}
                onSignUpClick={handleSignUpClick}
            />

            <SignUpModal
                isOpen={isSignUpOpen}
                onClose={() => setIsSignUpOpen(false)}
                onSignInClick={handleSignInClick}
            />
        </div>
    );
};

export default Homepage;
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/productsSlice';
import SignInModal from '../components/SignInModal';
import SignUpModal from '../components/SignUpModal';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faHistory } from '@fortawesome/free-solid-svg-icons';

function Homepage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const allProducts = useSelector((state) => state.products.items);
  const status = useSelector((state) => state.products.status);
  const [displayCount, setDisplayCount] = useState(6);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [status, dispatch]);

  // Filter only approved products
  const products = useMemo(() => {
    return allProducts.filter(product => product.status === 'approved');
  }, [allProducts]);

  const handleSignOut = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('cart');
    setUser(null);
    window.location.reload();
  }, []);

  const handleAddToCart = useCallback(async (product) => {
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
  }, [user]);

  const handleViewMore = useCallback(() => {
    setDisplayCount(prevCount => prevCount + 6);
  }, []);

  const handleSignInClick = useCallback(() => {
    setIsSignInOpen(true);
    setIsSignUpOpen(false);
  }, []);

  const handleSignUpClick = useCallback(() => {
    setIsSignUpOpen(true);
    setIsSignInOpen(false);
  }, []);

  const handleProductClick = useCallback((productId) => {
    navigate(`/product/${productId}`);
  }, [navigate]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      const price = product.price * (1 - product.discount / 100);
      const matchesPrice = (!priceRange.min || price >= Number(priceRange.min)) &&
        (!priceRange.max || price <= Number(priceRange.max));

      return matchesSearch && matchesPrice;
    });
  }, [products, searchQuery, priceRange]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, displayCount);
  }, [filteredProducts, displayCount]);

  const topProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => b.discount - a.discount)
      .slice(0, 5);
  }, [products]);

  const getImageUrl = (path, size) => {
    return `http://localhost:5000${path}?size=${size}`;
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

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
                    <div className="flex items-center gap-4">
                      <Link
                        to="/cart"
                        className="p-2 text-gray-300 hover:text-white transition-colors"
                      >
                        <FontAwesomeIcon icon={faShoppingCart} className="text-2xl" />
                      </Link>
                      <Link
                        to="/history"
                        className="p-2 text-gray-300 hover:text-white transition-colors"
                      >
                        <FontAwesomeIcon icon={faHistory} className="text-2xl" />
                      </Link>
                    </div>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-2xl font-bold text-white mb-6">Featured Products</h2>
        <div className="relative">
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={0}
            slidesPerView={1}
            pagination={{ clickable: true }}
            navigation={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            className="rounded-xl overflow-hidden aspect-[16/9]"
          >
            {topProducts.map((product) => (
              <SwiperSlide key={product._id}>
                <div
                  className="relative w-full h-full cursor-pointer"
                  onClick={() => handleProductClick(product._id)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-10"></div>
                  {product.imagePath ? (
                    <img
                      srcSet={`
                        ${getImageUrl(product.imagePath, '480')} 480w,
                        ${getImageUrl(product.imagePath, '800')} 800w,
                        ${getImageUrl(product.imagePath, '1200')} 1200w
                      `}
                      sizes="(max-width: 480px) 480px,
                             (max-width: 800px) 800px,
                             1200px"
                      src={getImageUrl(product.imagePath, '800')}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-20 text-white">
                    <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-xl font-bold text-green-400">
                        ₹{(product.price * (1 - product.discount / 100)).toFixed(2)}
                      </span>
                      {product.discount > 0 && (
                        <>
                          <span className="text-lg text-gray-300 line-through">
                            ₹{product.price.toFixed(2)}
                          </span>
                          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                            {product.discount}% OFF
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-gray-200 max-w-2xl line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <i className='bx bx-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl'></i>
          </div>
          <div className="flex gap-4">
            <input
              type="number"
              placeholder="Min Price"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              className="w-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              className="w-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No products found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedProducts.map((product) => (
              <div
                key={product._id}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => handleProductClick(product._id)}
              >
                <div className="relative w-full pt-[100%]">
                  {product.imagePath ? (
                    <img
                      srcSet={`
                        ${getImageUrl(product.imagePath, '300')} 300w,
                        ${getImageUrl(product.imagePath, '400')} 400w,
                        ${getImageUrl(product.imagePath, '600')} 600w
                      `}
                      sizes="(max-width: 640px) 300px,
                             (max-width: 768px) 400px,
                             600px"
                      src={getImageUrl(product.imagePath, '400')}
                      alt={product.name}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                      loading="lazy"
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
                      ₹{(product.price * (1 - product.discount / 100)).toFixed(2)}
                    </span>
                    {product.discount > 0 && (
                      <span className="ml-2 text-sm line-through text-blue-400 font-semibold">
                        ₹{product.price.toFixed(2)}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {displayCount < filteredProducts.length && (
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
}

export default Homepage;
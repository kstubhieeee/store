import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Error loading product details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please sign in to add items to cart");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Product not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-4 hover:opacity-90 transition-opacity">
              <i className='bx bxs-store text-3xl text-blue-500'></i>
              <span className="text-2xl font-bold text-white">TechMart</span>
            </Link>
            {user && !user.isAdmin && (
              <Link
                to="/cart"
                className="p-2 text-gray-300 hover:text-white transition-colors relative group"
              >
                <i className='bx bx-cart text-2xl'></i>
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  0
                </span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-[400px] md:h-[500px] relative overflow-hidden">
              {product.imagePath ? (
                <img
                  src={`http://localhost:5000${product.imagePath}`}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-contain bg-gray-700 p-4"
                />
              ) : (
                <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>
            <div className="p-6 flex flex-col">
              <h1 className="text-3xl font-bold text-white mb-4">{product.name}</h1>
              <div className="flex items-baseline mb-6">
                <span className="text-xl font-bold text-green-400">
                  ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                </span>
                {product.discount > 0 && (
                  <div className="ml-4 flex items-center">
                    <span className="text-xl ml-3 text-gray-400 line-through">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="ml-2 px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm font-semibold">
                      {product.discount}% OFF
                    </span>
                  </div>
                )}
              </div>
              <p className="text-gray-300 mb-8 leading-relaxed flex-grow">
                {product.description}
              </p>
              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-t border-gray-700">
                  <span className="text-gray-400">Availability</span>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${product.quantity > 0 ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className={`font-medium ${product.quantity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of Stock'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={product.quantity === 0}
                  className={`w-full py-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2
                    ${product.quantity > 0 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                >
                  <i className='bx bx-cart-add text-xl'></i>
                  {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">SKU</div>
                  <div className="text-white font-mono">{product._id}</div>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="text-gray-400 text-sm mb-1">Category</div>
                  <div className="text-white">Electronics</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProductDetails;
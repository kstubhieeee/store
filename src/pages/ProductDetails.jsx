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
        <div className="text-white">Loading...</div>
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
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-4">
              <i className='bx bxs-store text-3xl text-blue-500'></i>
              <span className="text-2xl font-bold text-white">TechMart</span>
            </Link>
            {user && !user.isAdmin && (
              <Link
                to="/cart"
                className="p-2 text-gray-300 hover:text-white transition-colors"
              >
                <i className='bx bx-cart text-2xl'></i>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <div className="relative pt-[100%]">
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
            </div>
            <div className="p-6 md:w-1/2">
              <h1 className="text-3xl font-bold text-white mb-4">{product.name}</h1>
              <div className="flex items-baseline mb-4">
                <span className="text-4xl font-bold text-green-400">
                  ${Number(product.price * (1 - product.discount / 100)).toFixed(2)}
                </span>
                {product.discount > 0 && (
                  <div className="ml-4">
                    <span className="text-xl text-gray-400 line-through">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    <span className="ml-2 text-blue-400 font-semibold">
                      {product.discount}% OFF
                    </span>
                  </div>
                )}
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                {product.description}
              </p>
              <div className="flex items-center justify-between mb-6">
                <span className="text-gray-300">
                  {product.quantity} in stock
                </span>
                <button
                  onClick={handleAddToCart}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={product.quantity === 0}
                >
                  {product.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
              <div className="border-t border-gray-700 pt-6">
                <h2 className="text-xl font-semibold text-white mb-4">Product Details</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">SKU</span>
                    <span className="text-white">{product._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Category</span>
                    <span className="text-white">Electronics</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Availability</span>
                    <span className={`${product.quantity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
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
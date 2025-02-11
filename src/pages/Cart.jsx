import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function Cart() {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
    
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || user.isAdmin) {
    return <Navigate to="/" />;
  }

  const removeFromCart = (productId, productName) => {
    const updatedCart = cartItems.filter(item => item._id !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success(`${productName} removed from cart`);
  };

  const updateQuantity = (productId, newQuantity, productName) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item => {
      if (item._id === productId) {
        return { ...item, cartQuantity: newQuantity };
      }
      return item;
    });
    
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    toast.success(`Updated ${productName} quantity to ${newQuantity}`);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.price * (1 - item.discount / 100);
      return total + (price * item.cartQuantity);
    }, 0);
  };

  const handleCheckout = () => {
    toast.success('Checkout functionality coming soon!');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Your Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Your cart is empty</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg shadow-xl p-6">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg">
                  <img
                    src={`http://localhost:5000${item.imagePath}`}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-xl font-bold text-green-400">
                        ${(item.price * (1 - item.discount / 100)).toFixed(2)}
                      </span>
                      {item.discount > 0 && (
                        <span className="text-sm text-gray-400 line-through">
                          ${item.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item._id, item.cartQuantity - 1, item.name)}
                      className="p-1 rounded-md bg-gray-600 text-white hover:bg-gray-500"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-white">{item.cartQuantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.cartQuantity + 1, item.name)}
                      className="p-1 rounded-md bg-gray-600 text-white hover:bg-gray-500"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item._id, item.name)}
                    className="p-2 text-red-400 hover:text-red-300"
                  >
                    <i className='bx bx-trash text-xl'></i>
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-8 border-t border-gray-700 pt-6">
              <div className="flex justify-between items-center text-lg font-semibold text-white">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              <button
                className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
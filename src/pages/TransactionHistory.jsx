import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      // Fetch transaction history
      fetchTransactions(JSON.parse(userData)._id);
    }
  }, []);

  const fetchTransactions = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/transactions/${userId}`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
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
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Transaction History</h1>

        {transactions.length === 0 ? (
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 text-center">
            <p className="text-gray-400">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {transactions.map((transaction) => (
              <div key={transaction._id} className="bg-gray-800 rounded-lg shadow-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-sm text-gray-400">Order ID</span>
                    <p className="text-white font-mono">{transaction._id}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-400">Date</span>
                    <p className="text-white">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {transaction.items.map((item) => (
                    <div key={item._id} className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg">
                      <img
                        src={`http://localhost:5000${item.imagePath}`}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                        <p className="text-gray-400">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-green-400">
                          ₹{(item.price * (1 - item.discount / 100)).toFixed(2)}
                        </p>
                        {item.discount > 0 && (
                          <p className="text-sm text-gray-400 line-through">
                            ₹{item.price.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Amount</span>
                    <span className="text-xl font-bold text-white">
                      ${transaction.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-400">Payment Method</span>
                    <span className="text-white capitalize">{transaction.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-400">Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium
                      ${transaction.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                        transaction.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-red-500/10 text-red-400'}`}>
                      {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default TransactionHistory;
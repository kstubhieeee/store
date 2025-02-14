import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function SignIn() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // First, try admin login
      try {
        const adminResponse = await axios.post('http://localhost:5000/api/admin/signin', formData);
        localStorage.setItem('token', adminResponse.data.token);
        localStorage.setItem('user', JSON.stringify(adminResponse.data.user));
        navigate('/admin/dashboard');
        return;
      } catch (adminError) {
        // If admin login fails, continue to merchant login
      }

      // Try merchant login
      try {
        const merchantResponse = await axios.post('http://localhost:5000/api/merchant/login', formData);
        localStorage.setItem('token', merchantResponse.data.token);
        localStorage.setItem('user', JSON.stringify(merchantResponse.data.user));
        navigate('/merchant/dashboard');
        return;
      } catch (merchantError) {
        // If merchant login fails, continue to customer login
      }

      // Try customer login
      try {
        // Get reCAPTCHA token for customer login
        const token = await window.grecaptcha.execute('6LfhjNMqAAAAAGDDBrgB9nBG0hR1-gcMrWsF4Gzn', { action: 'signin' });
        
        const customerResponse = await axios.post('http://localhost:5000/api/signin', {
          ...formData,
          recaptchaToken: token
        });
        localStorage.setItem('token', customerResponse.data.token);
        localStorage.setItem('user', JSON.stringify(customerResponse.data.user));
        navigate('/');
        return;
      } catch (customerError) {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Error signing in');
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-white mb-8">Sign In</h2>
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-gray-400">Don't have an account? </span>
          <Link to="/signup" className="text-blue-400 hover:text-blue-300">Sign up</Link>
        </div>

        <div className="mt-4 text-center">
          <Link to="/merchant/registration" className="text-blue-400 hover:text-blue-300">
            Register as Merchant
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
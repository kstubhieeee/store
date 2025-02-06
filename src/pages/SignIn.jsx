import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function SignIn() {
  const navigate = useNavigate();
  const [tracker, setTracker] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-white mb-8">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="text-right">
            <a href="#" className="text-sm text-blue-400 hover:text-blue-300">Forgot password?</a>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-gray-400">Don't have an account? </span>
          <Link to="/signup" className="text-blue-400 hover:text-blue-300">Sign up</Link>
        </div>

        <div className="relative mt-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition duration-300 text-white">
            <i className='bx bxl-facebook text-xl text-blue-500'></i>
            <span>Login with Facebook</span>
          </button>

          <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition duration-300 text-white">
            <img src="/google.png" alt="" className="w-5 h-5" />
            <span>Login with Google</span>
          </button>
        </div>

        {tracker && (
          <div className="mt-4 text-center text-red-500">{tracker}</div>
        )}
      </div>
    </div>
  );
}

export default SignIn;
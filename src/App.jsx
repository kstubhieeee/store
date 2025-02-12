import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Homepage from "./pages/Homepage";
import Cart from "./pages/Cart";
import 'boxicons/css/boxicons.min.css';
import './styles.css';
import AddProducts from "./pages/AddProducts";
import ListingProducts from "./pages/ListingProducts";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedCustomerRoute from "./components/ProtectedCustomerRoute";
import MerchantRegistration from "./pages/merchant/MerchantRegistration";
import MerchantLogin from "./pages/merchant/MerchantLogin";
import MerchantDashboard from "./pages/merchant/MerchantDashboard";
import ProtectedMerchantRoute from "./components/ProtectedMerchantRoute";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2000,
          style: {
            background: '#1f2937',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/admin/signin" element={<SignIn />} />
        <Route path="/admin/signup" element={<SignUp />} />
        <Route path="/merchant/registration" element={<MerchantRegistration />} />
        <Route path="/merchant/login" element={<MerchantLogin />} />
        <Route
          path="/merchant/dashboard"
          element={
            <ProtectedMerchantRoute>
              <MerchantDashboard />
            </ProtectedMerchantRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedCustomerRoute>
              <Cart />
            </ProtectedCustomerRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute adminRequired={true}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/product/add"
          element={
            <ProtectedRoute adminRequired={true}>
              <AddProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/product/listing"
          element={
            <ProtectedRoute adminRequired={true}>
              <ListingProducts />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
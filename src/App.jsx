import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedCustomerRoute from "./components/ProtectedCustomerRoute";
import ProtectedMerchantRoute from "./components/ProtectedMerchantRoute";

// Lazy load components
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Homepage = lazy(() => import("./pages/Homepage"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const ResultPage = lazy(() => import("./pages/ResultPage"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const AddProducts = lazy(() => import("./pages/AddProducts"));
const ListingProducts = lazy(() => import("./pages/ListingProducts"));
const MerchantRegistration = lazy(() => import("./pages/merchant/MerchantRegistration"));
const MerchantLogin = lazy(() => import("./pages/merchant/MerchantLogin"));
const MerchantDashboard = lazy(() => import("./pages/merchant/MerchantDashboard"));
const MerchantAddProduct = lazy(() => import("./pages/merchant/MerchantAddProduct"));
const MerchantCoupon = lazy(() => import("./pages/merchant/MerchantCoupon"));
const MerchantCustomerListing = lazy(() => import("./pages/merchant/MerchantCustomerListing"));
const TransactionHistory = lazy(() => import("./pages/TransactionHistory"));

// Loading component for Suspense fallback
const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-white">Loading...</div>
  </div>
);

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
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/product/:id" element={<ProductDetails />} />
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
            path="/merchant/add"
            element={
              <ProtectedMerchantRoute>
                <MerchantAddProduct />
              </ProtectedMerchantRoute>
            }
          />
          <Route
            path="/merchant/coupon"
            element={
              <ProtectedMerchantRoute>
                <MerchantCoupon />
              </ProtectedMerchantRoute>
            }
          />
          <Route
            path="/merchant/customer-listing"
            element={
              <ProtectedMerchantRoute>
                <MerchantCustomerListing />
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
            path="/checkout"
            element={
              <ProtectedCustomerRoute>
                <Checkout />
              </ProtectedCustomerRoute>
            }
          />
          <Route
            path="/payment/result"
            element={
              <ProtectedCustomerRoute>
                <ResultPage />
              </ProtectedCustomerRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedCustomerRoute>
                <TransactionHistory />
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
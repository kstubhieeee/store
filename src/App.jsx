import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import 'boxicons/css/boxicons.min.css';
import './styles.css';
import AddProducts from "./pages/AddProducts";
import ListingProducts from "./pages/ListingProducts";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add" element={<AddProducts />} />
        <Route path="/listing" element={<ListingProducts />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
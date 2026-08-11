import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home.jsx";
import About from "./pages/About/About.jsx";
import Account from "./pages/Account/Account.jsx";
import ProductDetails from "./pages/ProductDetails/ProductDetails.jsx";
import Products from "./pages/Products/Products.jsx";
import Blog from "./pages/Blog/Blog.jsx";
import Login from "./pages/Login/Login.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy/PrivacyPolicy.jsx";
import Register from "./pages/Register/Register.jsx";
import ReturnRefundPolicy from "./pages/ReturnRefundPolicy/ReturnRefundPolicy.jsx";
import ShippingPolicy from "./pages/ShippingPolicy/ShippingPolicy.jsx";
import TermsAndConditions from "./pages/TermsAndConditions/TermsAndConditions.jsx";
import Testimonials from "./pages/Testimonials/Testimonials.jsx";
import Admin from "./pages/Admin/Admin.jsx";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/account" element={<Account />} />
        <Route path="/products/:slug" element={<ProductDetails />} />
        <Route path="/products" element={<Products />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/register" element={<Register />} />
        <Route path="/return-refund-policy" element={<ReturnRefundPolicy />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

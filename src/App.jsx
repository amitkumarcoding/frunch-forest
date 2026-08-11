import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home/Home.jsx";
import About from "./Pages/About/About.jsx";
import Account from "./Pages/Account/Account.jsx";
import ProductDetails from "./Pages/ProductDetails/ProductDetails.jsx";
import Products from "./Pages/Products/Products.jsx";
import Blog from "./Pages/Blog/Blog.jsx";
import Login from "./Pages/Login/Login.jsx";
import PrivacyPolicy from "./Pages/PrivacyPolicy/PrivacyPolicy.jsx";
import Register from "./Pages/Register/Register.jsx";
import ReturnRefundPolicy from "./Pages/ReturnRefundPolicy/ReturnRefundPolicy.jsx";
import ShippingPolicy from "./Pages/ShippingPolicy/ShippingPolicy.jsx";
import TermsAndConditions from "./Pages/TermsAndConditions/TermsAndConditions.jsx";
import Testimonials from "./Pages/Testimonials/Testimonials.jsx";
import Admin from "./Pages/Admin/Admin.jsx";


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

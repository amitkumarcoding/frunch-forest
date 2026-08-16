import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToHash from "./components/ScrollToHash.jsx";
import Home from "./Pages/Home/Home.jsx";
import { Analytics } from '@vercel/analytics/react';

const NotFound = lazy(() => import("./Pages/NotFound/NotFound.jsx"));
const About = lazy(() => import("./Pages/About/About.jsx"));
const Account = lazy(() => import("./Pages/Account/Account.jsx"));
const ProductDetails = lazy(() => import("./Pages/ProductDetails/ProductDetails.jsx"));
const Products = lazy(() => import("./Pages/Products/Products.jsx"));
const Blog = lazy(() => import("./Pages/Blog/Blog.jsx"));
const Login = lazy(() => import("./Pages/Login/Login.jsx"));
const PrivacyPolicy = lazy(() => import("./Pages/PrivacyPolicy/PrivacyPolicy.jsx"));
const Register = lazy(() => import("./Pages/Register/Register.jsx"));
const ReturnRefundPolicy = lazy(() => import("./Pages/ReturnRefundPolicy/ReturnRefundPolicy.jsx"));
const ShippingPolicy = lazy(() => import("./Pages/ShippingPolicy/ShippingPolicy.jsx"));
const TermsAndConditions = lazy(() => import("./Pages/TermsAndConditions/TermsAndConditions.jsx"));
const Testimonials = lazy(() => import("./Pages/Testimonials/Testimonials.jsx"));
const Admin = lazy(() => import("./Pages/Admin/Admin.jsx"));

function App() {
  return (
    <BrowserRouter>
      <ScrollToHash />
      {/* Vercel Analytics */}
      <Analytics />
      <Suspense fallback={null}>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

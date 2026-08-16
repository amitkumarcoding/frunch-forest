import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./NotFound.css";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="notfound-page">
        <span className="notfound-code">404</span>
        <h1>This page wandered off the shelf</h1>
        <p>The page you're looking for doesn't exist or may have moved.</p>
        <Link className="btn-primary" to="/">Back to home</Link>
      </main>
      <Footer />
    </>
  );
}

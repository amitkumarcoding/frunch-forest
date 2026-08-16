import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PRODUCTS as LOCAL_PRODUCTS } from "../../data/products";
import { loadProductsFromFirestore } from "../../services/firebaseProducts";
import { isOutOfStock } from "../../utils/stock";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import SEO from "../../components/SEO/SEO";
import "./ProductDetails.css"

export default function ProductDetails() {
  const { slug } = useParams();
  const [products, setProducts] = useState(LOCAL_PRODUCTS);
  const product = products[slug];
  const outOfStock = product ? isOutOfStock(product) : true;

  // Same source as Home.jsx — picks up admin-managed fields (inStock,
  // name, tag, packs) without a code deploy.
  useEffect(() => {
    loadProductsFromFirestore().then((firestoreProducts) => {
      if (!firestoreProducts) return;
      // Merge per-slug over local defaults, and only override a field
      // when Firestore actually has a value for it — an admin-edited
      // doc missing/blank on e.g. image shouldn't blank out the good
      // local default (data/products.js).
      setProducts((prev) => {
        const next = { ...prev };
        Object.entries(firestoreProducts).forEach(([slug, data]) => {
          const base = next[slug] || {};
          const filled = Object.fromEntries(
            Object.entries(data).filter(([, v]) => v !== "" && v !== null && v !== undefined)
          );
          next[slug] = { ...base, ...filled };
        });
        return next;
      });
    });
  }, []);

  // scroll reveal (same pattern as About.jsx)
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealElements = Array.from(document.querySelectorAll(".reveal"));
    if (reduceMotion) {
      revealElements.forEach((el) => el.classList.add("in"));
      return;
    }
    const groups = new Map();
    revealElements.forEach((el) => {
      const parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, 0);
      const idx = groups.get(parent);
      el.style.transitionDelay = `${Math.min(idx * 90, 450)}ms`;
      groups.set(parent, idx + 1);
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    revealElements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [product]);

  const related = Object.entries(products)
    .filter(([key]) => key !== slug)
    .slice(0, 3);

  const seoDescription = product
    ? `Buy ${product.name}${product.hindi ? ` (${product.hindi})` : ""} online from Frunch Forest — ${product.bullets?.[0]?.toLowerCase() || "handpicked, natural quality"}. Pan-India delivery, no preservatives.`
    : "Browse handpicked, natural dry fruits from Frunch Forest.";

  return (
    <>
      <SEO
        title={product ? product.name : "Product Details"}
        description={seoDescription}
        path={`/products/${slug}`}
        image={product?.image ? `https://frunchforest.com${product.image}` : undefined}
        noindex={!product}
        jsonLd={
          product
            ? {
                "@context": "https://schema.org",
                "@type": "Product",
                name: product.name,
                image: `https://frunchforest.com${product.image}`,
                description: seoDescription,
                brand: { "@type": "Brand", name: "Frunch Forest" },
                offers: product.packs?.[0]
                  ? {
                      "@type": "Offer",
                      priceCurrency: "INR",
                      price: product.packs[0].price,
                      availability: outOfStock
                        ? "https://schema.org/OutOfStock"
                        : "https://schema.org/InStock",
                      url: `https://frunchforest.com/products/${slug}`,
                    }
                  : undefined,
              }
            : null
        }
      />
      <Header />
      <main id="main">
        <section className="detail-hero">
          <div className="wrap">
            <div className="detail-crumb">
              <Link to="/">Home</Link>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              <Link to="/#products">Products</Link>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              <span>{product ? product.name : "Details"}</span>
            </div>

            {!product ? (
              <div className="empty-state">
                <h2 style={{ fontSize: "1.6rem", marginBottom: 14 }}>We couldn't find that product</h2>
                <p>Head back to <Link to="/#products">the range</Link> and pick one to see its details.</p>
              </div>
            ) : (
              <div className="detail-grid">
                <div className="photo-frame reveal">
                  {outOfStock ? (
                    <div className="best-badge out-of-stock-badge">Out of Stock</div>
                  ) : product.bestSeller ? (
                    <div className="best-badge">★ Best seller</div>
                  ) : null}
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="reveal">
                  <span className="eyebrow">{product.tag || "Frunch Forest staple"}</span>
                  <h1 className="product-name">{product.name}</h1>
                  <span className="hindi-name accent-serif">{product.hindi}</span>
                  <p className="detail-lede">
                    Farm-fresh {product.name.toLowerCase()}, hand-sorted and sealed with nothing added and nothing hidden — just the product, as nature made it.
                  </p>

                  <div className="section-label">Why you'll love it</div>
                  <ul className="feature-list">
                    {product.bullets.map((b) => <li key={b}>{b}</li>)}
                  </ul>

                  <div className="section-label">Available pack sizes</div>
                  <div className="detail-pack-sizes">
                    {product.packs.map((p) => (
                      <span key={p.size} className={outOfStock ? "is-disabled" : ""}>{p.size}</span>
                    ))}
                  </div>

                  <div className="detail-cta-row">
                    {outOfStock ? (
                      <button type="button" className="btn-primary is-disabled" disabled>
                        Out of Stock
                      </button>
                    ) : (
                      <a className="btn-primary" href={`mailto:frunchforest@gmail.com?subject=Order enquiry: ${encodeURIComponent(product.name)}`}>
                        Enquire to order →
                      </a>
                    )}
                    <Link className="btn-ghost" to="/#products">View full range</Link>
                  </div>

                  <div className="promise-strip">
                    <div><b>No preservatives</b>Nothing artificial goes in.</div>
                    <div><b>No additives</b>Just the product, as nature made it.</div>
                    <div><b>Quality guaranteed</b>Every batch checked before it ships.</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {related.length > 0 && (
          <div className="wrap">
            <div className="related-section">
              <div className="related-header">
                <h2>You may also like</h2>
              </div>
              <div className="related-grid">
                {related.map(([key, p]) => {
                  const rOutOfStock = isOutOfStock(p);
                  const cardBody = (
                    <>
                      <div className="rc-photo"><img src={p.image} alt={p.name} loading="lazy" /></div>
                      <div className="rc-body">
                        <span className="rc-tag">{p.tag}</span>
                        <h3>{p.name}</h3>
                        <span className="rc-hindi">{p.hindi}</span>
                        {rOutOfStock && <span className="rc-out-of-stock">Out of Stock</span>}
                      </div>
                    </>
                  );
                  return rOutOfStock ? (
                    <div key={key} className="related-card out-of-stock" aria-disabled="true">
                      {cardBody}
                    </div>
                  ) : (
                    <Link key={key} className="related-card" to={`/products/${key}`}>
                      {cardBody}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
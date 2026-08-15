import { useEffect, useMemo, useState } from "react";
import { PRODUCTS as LOCAL_PRODUCTS } from "../../data/products";
import { loadProductsFromFirestore } from "../../services/firebaseProducts";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import ProductCard from "../../components/ProductCard/ProductCard";
import SEO from "../../components/SEO/SEO";

const FAV_KEY = "ff_favourites";

export default function Products() {
  const [products, setProducts] = useState(
    Object.entries(LOCAL_PRODUCTS).map(([slug, p]) => ({ ...p, slug }))
  );
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortMode, setSortMode] = useState("popular");
  const [favourites, setFavourites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    async function load() {
      const firestoreProducts = await loadProductsFromFirestore();
      if (!firestoreProducts) return;
      // Merge per-slug over local defaults, and only override a field
      // when Firestore actually has a value for it — an admin-edited
      // doc missing/blank on e.g. image shouldn't blank out the good
      // local default (data/products.js).
      setProducts((prev) => {
        const bySlug = Object.fromEntries(prev.map((p) => [p.slug, p]));
        Object.entries(firestoreProducts).forEach(([slug, data]) => {
          const base = bySlug[slug] || {};
          const filled = Object.fromEntries(
            Object.entries(data).filter(([, v]) => v !== "" && v !== null && v !== undefined)
          );
          bySlug[slug] = { ...base, ...filled, slug };
        });
        return Object.values(bySlug);
      });
    }
    load();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(FAV_KEY, JSON.stringify(favourites));
    } catch {}
  }, [favourites]);

  // scroll reveal
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealElements = Array.from(document.querySelectorAll(".reveal"));
    if (reduceMotion) {
      revealElements.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealElements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [products]);

  const toggleFavorite = (slug) => {
    setFavourites((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const haystack = [p.name, p.hindi, p.tag, (p.bullets || []).join(' ')].join(' ').toLowerCase();
      const matchesSearch = q === '' || haystack.includes(q);
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'favourites' ? favourites.includes(p.slug) : activeFilter === 'best-seller' ? !!p.bestSeller : true);
      return matchesSearch && matchesFilter;
    });
  }, [products, search, activeFilter, favourites]);

  const sorted = useMemo(() => {
    const list = filtered.slice();
    if (sortMode === 'price-asc') list.sort((a, b) => a.packs[0].price - b.packs[0].price);
    else if (sortMode === 'price-desc') list.sort((a, b) => b.packs[0].price - a.packs[0].price);
    return list;
  }, [filtered, sortMode]);

  return (
    <>
      <SEO
        title="Shop All Products"
        description="Browse Frunch Forest's full range of natural dry fruits — almonds, cashews, walnuts, raisins, pistachios, dates, fox nuts and more. Handpicked, no preservatives, pan-India delivery."
        path="/products"
      />
      <Header />
      <main id="main">
        <section className="hero" id="productsPageHero">
          <div className="wrap">
            <div className="section-head reveal">
              <div className="eyebrow">The range</div>
              <h1 style={{ fontFamily: "'Anton', sans-serif", textTransform: 'uppercase', fontSize: 'clamp(2.4rem,5vw,3.6rem)', lineHeight: 0.95 }}>
                All Our Products
              </h1>
              <p>Every product ships in four pack sizes with the same promise: no preservatives, no additives, quality guaranteed.</p>
            </div>
          </div>
        </section>

        <section id="products">
          <div className="wrap">
            <div className="product-search-wrap reveal">
              <div className="product-search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input
                  type="text"
                  placeholder="Search products… (e.g. Almonds, Badam, Trail blend)"
                  autoComplete="off"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  type="button"
                  className={`product-search-clear${search ? ' show' : ''}`}
                  aria-label="Clear search"
                  onClick={() => setSearch('')}
                >
                  &times;
                </button>
              </div>
              <p className="product-search-count">
                {(search || activeFilter !== 'all') && `${sorted.length} ${sorted.length === 1 ? 'product' : 'products'} found`}
              </p>
              <div className="filter-group">
                <span className="filter-group-label">Quick filters</span>
                <div className="product-filter-chips" role="group" aria-label="Filter products by badge">
                  {[
                    ['all', 'All'],
                    ['best-seller', 'Best Seller'],
                    ['favourites', '♥ Favourites'],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      className={`filter-chip${activeFilter === key ? ' active' : ''}`}
                      onClick={() => setActiveFilter(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="filter-group product-toolbar-row">
                <div className="product-sort-wrap">
                  <label htmlFor="productSort">Sort by</label>
                  <div className="select-wrap">
                    <select id="productSort" value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
                      <option value="popular">Featured</option>
                      <option value="price-asc">Price: Low → High</option>
                      <option value="price-desc">Price: High → Low</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {sorted.length === 0 ? (
              <div className="product-no-results">
                No products match your search. Try a different name, like "Almonds" or "Cashew".
              </div>
            ) : (
              <div className="product-grid">
                {sorted.map((product) => (
                  <ProductCard
                    key={product.slug}
                    product={product}
                    collapsible
                    favorite={favourites.includes(product.slug)}
                    onToggleFavorite={toggleFavorite}
                    badges={product.bestSeller ? [] : []}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
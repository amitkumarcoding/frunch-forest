import { useState } from "react";
import { Link } from "react-router-dom";
import "./ProductCard.css";

const BADGE_LABELS = {
  combo: ["badge-combo", "Combo"],
  popular: ["badge-popular", "🔥 Popular"],
  new: ["badge-new", "NEW"],
};

// Same WhatsApp number the static site sends "Buy Now" orders to.
const BUY_NOW_WHATSAPP_NUMBER = "919582122419";

export default function ProductCard({
  product,
  collapsible = false,
  favorite = false,
  onToggleFavorite,
  badges = [],
}) {
  const [packIdx, setPackIdx] = useState(
    product.packs.findIndex((p) => p.bestValue) !== -1
      ? product.packs.findIndex((p) => p.bestValue)
      : 0
  );
  const [showNutrients, setShowNutrients] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const pack = product.packs[packIdx];
  const discount = Math.round(((pack.mrp - pack.price) / pack.mrp) * 100);
  const perUnit = (pack.price / parseInt(pack.size)) * 100;

  const visibleBullets = collapsible && !expanded ? product.bullets.slice(0, 1) : product.bullets;

  // Matches the original site's WhatsApp deep-link behaviour (see
  // bindProductCardEvents() -> "Buy Now" handler in index.html).
  function handleBuyNow(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    const detailsUrl = `${window.location.origin}/products/${product.slug}`;
    const message = encodeURIComponent(
      `Hi Frunch Forest, I'd like to buy:\n${product.name} (${pack.size}) - ₹${pack.price}\n${detailsUrl}`
    );
    window.open(`https://wa.me/${BUY_NOW_WHATSAPP_NUMBER}?text=${message}`, "_blank", "noopener");
  }

  return (
    <div className={`product-card${product.bestSeller ? ' featured' : ''}${!product.inStock ? ' out-of-stock' : ''}`}>
      <div className="card-photo">
        {badges.length > 0 && (
          <div className="card-badges">
            {badges.map((key) => {
              const def = BADGE_LABELS[key];
              if (!def) return null;
              return <span key={key} className={`badge ${def[0]}`}>{def[1]}</span>;
            })}
          </div>
        )}
        <img src={product.image} alt={product.name} loading="lazy" />
        <button
          type="button"
          className="nutrient-toggle"
          onClick={() => setShowNutrients((v) => !v)}
          aria-label="Show nutrients"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </button>
        <div className={`nutrient-overlay${showNutrients ? ' active' : ''}`}>
          <h4>Nutrients (per 100g)</h4>
          <ul>
            {product.nutrition.map((n) => (
              <li key={n.label}>{n.label}<span>{n.value}</span></li>
            ))}
          </ul>
          <p className="nutrient-basis">Approximate values</p>
        </div>
        {product.bestSeller && (
          <div className="best-strip">{product.bestSellerLabel}</div>
        )}
        {onToggleFavorite && (
          <button
            type="button"
            className={`fav-btn${favorite ? ' active' : ''}`}
            aria-pressed={favorite}
            aria-label="Add to favourites"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(product.slug);
            }}
          >
            <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-6.7-4.35-9.33-8.2C.86 10.1 1.6 6.6 4.6 5.1c2.2-1.1 4.6-.3 6 1.4l1.4 1.7 1.4-1.7c1.4-1.7 3.8-2.5 6-1.4 3 1.5 3.74 5 1.93 7.7C18.7 16.65 12 21 12 21Z"></path>
            </svg>
          </button>
        )}
      </div>

      <div className="card-body">
        <div className="tag">{product.tag}</div>
        <h3>{product.name}</h3>
        <span className="hi">{product.hindi}</span>

        <ul>
          {visibleBullets.map((b) => <li key={b}>{b}</li>)}
        </ul>
        {collapsible && product.bullets.length > 1 && (
          <button type="button" className={`see-all-toggle${expanded ? ' expanded' : ''}`} onClick={() => setExpanded((v) => !v)}>
            {expanded ? 'See less ' : 'See all details '}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"></path></svg>
          </button>
        )}

        <div className="card-price">
          <span className="price-now">₹{pack.price}</span>
          <span className="price-mrp">₹{pack.mrp}</span>
          <span className={`discount-badge${!product.inStock ? ' out-of-stock-badge' : ''}`}>
            {product.inStock ? `${discount}% OFF` : 'Out of Stock'}
          </span>
        </div>
        <p className="tax-note">Inclusive of all taxes</p>

        <div className="pack-sizes">
          {product.packs.map((p, i) => (
            <button
              key={p.size}
              type="button"
              className={`pack-size-btn${i === packIdx ? ' active' : ''}${p.bestValue ? ' best-value' : ''}`}
              disabled={!product.inStock}
              onClick={() => setPackIdx(i)}
            >
              {p.bestValue && <span className="best-value-tag">Best value</span>}
              {p.size}
            </button>
          ))}
        </div>
        <p className="per-unit-price">≈ ₹{perUnit.toFixed(1)} per 100g</p>

        <div className="card-actions">
          <button
            type="button"
            className={`card-buy-now-btn${!product.inStock ? ' is-disabled' : ''}`}
            disabled={!product.inStock}
            onClick={handleBuyNow}
          >
            {product.inStock && (
              <img src="https://cdn.simpleicons.org/whatsapp/132A1E" alt="" width="16" height="16" />
            )}
            {product.inStock ? 'Buy Now' : 'Out of Stock'}
          </button>
          <Link className="card-details-btn" to={`/products/${product.slug}`}>View details →</Link>
        </div>
      </div>
    </div>
  );
}
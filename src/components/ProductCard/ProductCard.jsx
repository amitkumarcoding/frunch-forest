import { useState } from "react";
import { Link } from "react-router-dom";
import { isOutOfStock } from "../../utils/stock";
import "./ProductCard.css";

const BADGE_LABELS = {
  combo: ["badge-combo", "Combo"],
  popular: ["badge-popular", "🔥 Popular"],
  new: ["badge-new", "NEW"],
};

// Same WhatsApp number the static site sends "Buy Now" orders to.
const BUY_NOW_WHATSAPP_NUMBER = "919582122419";

// Inline glyph instead of the old cdn.simpleicons.org <img>: it inherits
// `currentColor`, so it always matches the button's brand text color
// (no separate hex to keep in sync, and no external request to fail).
function WhatsAppIcon() {
  return (
    <svg className="whatsapp-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.5c-5.25 0-9.5 4.25-9.5 9.5 0 1.68.44 3.25 1.2 4.62L2.5 21.5l5.02-1.32a9.44 9.44 0 0 0 4.48 1.14c5.25 0 9.5-4.25 9.5-9.5s-4.25-9.32-9.5-9.32Zm0 17.28a7.7 7.7 0 0 1-3.93-1.08l-.28-.17-2.98.78.8-2.9-.18-.3a7.76 7.76 0 1 1 6.57 3.67Zm4.26-5.82c-.23-.12-1.37-.68-1.58-.75-.21-.08-.37-.12-.52.11-.15.23-.6.75-.74.9-.14.15-.27.17-.5.06-.23-.12-.98-.36-1.87-1.15-.69-.62-1.16-1.38-1.3-1.61-.14-.23-.02-.36.1-.48.1-.1.23-.27.35-.4.11-.14.15-.23.23-.38.08-.15.04-.29-.02-.4-.06-.12-.52-1.25-.71-1.71-.19-.45-.38-.39-.52-.4h-.44c-.15 0-.4.06-.6.29-.21.23-.79.77-.79 1.87s.81 2.17.92 2.32c.11.15 1.6 2.44 3.87 3.43.54.23.96.37 1.29.47.54.17 1.03.15 1.42.09.43-.06 1.37-.56 1.56-1.1.19-.54.19-1 .13-1.1-.06-.1-.21-.15-.44-.27Z"/>
    </svg>
  );
}

export default function ProductCard({
  product,
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
  const outOfStock = isOutOfStock(product);
  const pack = product.packs[packIdx];
  const discount = Math.round(((pack.mrp - pack.price) / pack.mrp) * 100);

  // Matches the original site's WhatsApp deep-link behaviour (see
  // bindProductCardEvents() -> "Buy Now" handler in index.html).
  function handleBuyNow(e) {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    const detailsUrl = `${window.location.origin}/products/${product.slug}`;
    const message = encodeURIComponent(
      `Hi Frunch Forest, I'd like to buy:\n${product.name} (${pack.size}) - ₹${pack.price}\n${detailsUrl}`
    );
    window.open(`https://wa.me/${BUY_NOW_WHATSAPP_NUMBER}?text=${message}`, "_blank", "noopener");
  }

  return (
    <div className={`product-card${product.bestSeller ? ' featured' : ''}${outOfStock ? ' out-of-stock' : ''}`}>
      {/*
        `.card-photo` is intentionally NOT clipped (overflow is on the
        `.card-photo-media` layer below instead). The nutrient toggle's
        tooltip and the overlay both need to render past the photo's
        edge; when they lived inside the same overflow:hidden box as
        the image, the tooltip got cut off instead of floating over
        the card.
      */}
      <div className="card-photo">
        <div className="card-photo-media">
          <img src={product.image} alt={product.name} loading="lazy" />
        </div>

        {badges.length > 0 && (
          <div className="card-badges">
            {badges.map((key) => {
              const def = BADGE_LABELS[key];
              if (!def) return null;
              return <span key={key} className={`badge ${def[0]}`}>{def[1]}</span>;
            })}
          </div>
        )}

        <button
          type="button"
          className="nutrient-toggle"
          onClick={() => setShowNutrients((v) => !v)}
          aria-label="Show nutrients"
          aria-expanded={showNutrients}
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

        {outOfStock && <div className="oos-stamp">Out of Stock</div>}

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
        <div className="card-heading">
          <h3>{product.name}</h3>
        </div>
        <span className="hi">{product.hindi}</span>

        <div className="card-price">
          <span className="price-now">₹{pack.price}</span>
          <span className="price-mrp">₹{pack.mrp}</span>
          {!outOfStock && (
            <span className="discount-badge">{discount}% OFF</span>
          )}
        </div>

        <div className="pack-sizes">
          {product.packs.map((p, i) => (
            <button
              key={p.size}
              type="button"
              className={`pack-size-btn${i === packIdx ? ' active' : ''}${p.bestValue ? ' best-value' : ''}`}
              disabled={outOfStock}
              onClick={() => setPackIdx(i)}
              title={p.bestValue ? `${p.size} · Best value` : p.size}
            >
              {p.size}
            </button>
          ))}
        </div>

        <div className={`card-actions${outOfStock ? ' out-of-stock-actions' : ''}`}>
          <button
            type="button"
            className={`card-buy-now-btn${outOfStock ? ' is-disabled' : ''}`}
            disabled={outOfStock}
            onClick={handleBuyNow}
          >
            {!outOfStock && (
              <span className="btn-icon">
                <WhatsAppIcon />
              </span>
            )}
            {outOfStock ? 'Out of Stock' : 'Buy Now'}
          </button>
          {/* Details link only renders in stock — when sold out, "Buy
              Now" collapsing into a single "Out of Stock" status button
              reads cleaner than pairing it with a second, dead button. */}
          {!outOfStock && (
            <Link className="card-details-btn" to={`/products/${product.slug}`}>
              Details →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
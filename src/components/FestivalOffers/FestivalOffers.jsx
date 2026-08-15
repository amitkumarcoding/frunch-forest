import "./FestivalOffers.css";

// Admin-managed festival offers/discount cards — data comes from the
// "offers" Firestore collection via firebaseOffers.js and is edited in
// the Admin console. Renders nothing when there are no active offers.
export default function FestivalOffers({ offers }) {
  if (!offers || offers.length === 0) return null;

  return (
    <section id="festival-offers" className="reveal">
      <span className="sec-line"></span>
      <div className="offers-glow" aria-hidden="true"></div>
      <div className="wrap">
        <div className="section-head reveal">
          <div className="eyebrow">
            <span className="dot"></span>Festival offers
          </div>
          <h2>
            Deals worth <em>celebrating</em>
          </h2>
          <p>Handpicked discounts, live for a limited time — grab yours before the festival ends.</p>
        </div>

        <div className="offers-grid">
          {offers.map((offer) => (
            <article key={offer.id} className="offer-card reveal">
              <span className="offer-card-corner tl" aria-hidden="true"></span>
              <span className="offer-card-corner br" aria-hidden="true"></span>

              {offer.image && (
                <div className="offer-card-media">
                  <img src={offer.image} alt={offer.title} loading="lazy" />
                  <div className="offer-card-media-fade"></div>
                </div>
              )}

              <div className="offer-card-body">
                {offer.discount && <span className="offer-card-badge">{offer.discount}</span>}
                <h3>{offer.title}</h3>
                {offer.description && <p>{offer.description}</p>}

                <div className="offer-card-footer">
                  {offer.code && (
                    <div className="offer-card-code">
                      <span className="offer-card-code-label">Code</span>
                      <span className="offer-card-code-value">{offer.code}</span>
                    </div>
                  )}
                  {offer.link && (
                    <a className="offer-card-cta" href={offer.link}>
                      Shop now
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

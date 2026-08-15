import "./FestivalOffers.css";

// Admin-managed festival offers/discount cards — data comes from the
// "offers" Firestore collection via firebaseOffers.js and is edited in
// the Admin console. Renders nothing when there are no active offers.
export default function FestivalOffers({ offers }) {
  if (!offers || offers.length === 0) return null;

  return (
    <section id="festival-offers" className="reveal">
      <span className="sec-line"></span>
      <div className="wrap">
        <div className="section-head reveal">
          <div className="eyebrow">
            <span className="pulse-dot" aria-hidden="true"></span>Festival offers
          </div>
          <h2>
            Deals worth <span className="accent-serif">celebrating</span>
          </h2>
        </div>

        <div className="offers-grid">
          {offers.map((offer) => (
            <article key={offer.id} className="offer-card reveal">
              {offer.image && (
                <div className="offer-card-media">
                  <img src={offer.image} alt={offer.title} loading="lazy" />
                </div>
              )}
              <div className="offer-card-body">
                {offer.discount && <span className="offer-card-badge">{offer.discount}</span>}
                <h3>{offer.title}</h3>
                {offer.description && <p>{offer.description}</p>}
                {offer.code && (
                  <div className="offer-card-code">
                    Use code <strong>{offer.code}</strong>
                  </div>
                )}
                {offer.link && (
                  <a className="offer-card-cta" href={offer.link}>
                    Shop now →
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

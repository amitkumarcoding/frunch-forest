import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import SEO from "../../components/SEO/SEO";
import { loadBlogPostsFromFirestore } from "../../services/firebaseBlog";
import "./Blog.css"

// Fallback shown while Firestore loads, and used as-is if the
// "blogPosts" collection is empty or unreachable — see firebaseBlog.js.
// The Admin console's "Blog / Field notes" section manages the live
// version of this list.
const DEFAULT_SPECIMENS = [
  {
    no: "NO. 01", label: "PROTEIN", title: "Protein",
    lede: "The building block your body uses to repair muscle and stay full for longer.",
    sources: ["Almonds", "Cashews"],
    note: "A small handful of almonds or cashews carries a meaningful dose of plant protein alongside fibre, which is why they curb hunger far better than a snack of refined carbs. Pair them with a fruit or yoghurt for a more complete amino acid profile.",
  },
  {
    no: "NO. 02", label: "OMEGA-3 FATS", title: "Healthy Fats",
    lede: "Not all fat is equal — these are the kind that support heart and brain health.",
    sources: ["Walnuts"],
    note: "Walnuts are one of the few plant sources with a genuinely useful amount of alpha-linolenic acid, a plant-based omega-3. Regularly including a few walnuts in the diet is commonly associated with better cholesterol balance and steadier energy through the day.",
  },
  {
    no: "NO. 03", label: "DIETARY FIBRE", title: "Fibre",
    lede: "Keeps digestion moving and helps even out blood sugar swings after meals.",
    sources: ["Raisins", "Almonds"],
    note: "Because raisins concentrate the fibre of fresh grapes into a smaller bite, a small portion goes a long way toward daily fibre needs. Combined with almond skins, which carry their own fibre and antioxidants, this pairing is a simple way to support gut health.",
  },
  {
    no: "NO. 04", label: "IRON", title: "Iron",
    lede: "Essential for carrying oxygen through the blood and staving off fatigue.",
    sources: ["Raisins", "Cashews"],
    note: "Raisins and cashews both carry non-heme iron, the plant-based form the body absorbs best when paired with vitamin C. A squeeze of lemon over a trail mix, or eating them alongside citrus, helps the body take up more of it.",
  },
  {
    no: "NO. 05", label: "MAGNESIUM", title: "Magnesium",
    lede: "A quiet mineral behind muscle recovery, sleep quality and steady mood.",
    sources: ["Cashews", "Fox Nuts"],
    note: "Cashews are one of the more magnesium-dense nuts, and roasted fox nuts (makhana) add their own light, low-fat contribution. Together they make an easy evening snack that doesn't sit heavy before bed.",
  },
  {
    no: "NO. 06", label: "ANTIOXIDANTS", title: "Antioxidants",
    lede: "Plant compounds that help the body manage everyday cellular wear and tear.",
    sources: ["Walnuts", "Raisins"],
    note: "The thin brown skin on a walnut and the dark skin of a raisin both concentrate polyphenols — so resist the urge to peel them. Left whole, both snacks do double duty as flavour and quiet cellular support.",
  },
];

// Maps a specimen's "sources" name to its real product page slug, so the
// pill links straight to the product (internal linking + gives crawlers a
// real path from nutrient content to buyable pages). Names with no matching
// product yet (e.g. Fox Nuts) render as plain text instead of a dead link.
const SOURCE_SLUGS = {
  Almonds: "almonds",
  Cashews: "cashews",
  Walnuts: "walnuts",
  Raisins: "raisins",
  Pistachios: "pistachios",
  Dates: "dates",
};

function SpecimenDetail({ specimen }) {
  return (
    <div className="almanac-detail" key={specimen.id || specimen.no}>
      <div className="specimen-tag"><span className="no">{specimen.no}</span><span>{specimen.label}</span></div>
      <h3>{specimen.title}</h3>
      <p className="lede">{specimen.lede}</p>
      <div className="specimen-sources">
        {specimen.sources.map((s) =>
          SOURCE_SLUGS[s] ? (
            <Link key={s} to={`/products/${SOURCE_SLUGS[s]}`}>{s}</Link>
          ) : (
            <span key={s}>{s}</span>
          )
        )}
      </div>
      <p className="detail-note">{specimen.note}</p>
    </div>
  );
}

export default function Blog() {
  const [specimens, setSpecimens] = useState(DEFAULT_SPECIMENS);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    let cancelled = false;
    loadBlogPostsFromFirestore().then((posts) => {
      if (cancelled) return;
      if (posts && posts.length) {
        setSpecimens(posts);
        setActiveIdx(0);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [specimens]);

  const active = specimens[activeIdx] || specimens[0];

  return (
    <>
      <SEO
        title="Dry Fruits Nutrition Guide — Protein, Fibre, Iron & More | The Nutrient Almanac"
        description="A dry fruits nutrition guide to the protein, healthy fats, fibre, iron, magnesium and antioxidants in almonds, cashews, walnuts, raisins and fox nuts — what each nutrient does and which dry fruit carries it."
        path="/blog"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "The Nutrient Almanac — A Dry Fruits Nutrition Guide",
            description: "A field guide to the protein, healthy fats, fibre, iron, magnesium and antioxidants found in almonds, cashews, walnuts, raisins and fox nuts.",
            image: "https://frunchforest.com/image/logo.png",
            author: { "@type": "Organization", name: "Frunch Forest" },
            publisher: { "@type": "Organization", name: "Frunch Forest" },
            mainEntityOfPage: "https://frunchforest.com/blog",
            keywords: "dry fruits nutrition, nutrients in dry fruits, almonds protein, walnuts omega-3, cashews magnesium, raisins iron, healthy snacking",
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://frunchforest.com/" },
              { "@type": "ListItem", position: 2, name: "Blog", item: "https://frunchforest.com/blog" },
            ],
          },
        ]}
      />
      <Header />
      <main id="main">
        <section className="blog-hero">
          <div className="blog-hero-wrap">
            <span className="eyebrow">Field Notes From The Forest</span>
            <h1>The Nutrient <em>Almanac</em></h1>
            <p>A dry fruits nutrition guide to what's actually inside every handful — the protein, healthy fats, fibre, iron, magnesium and antioxidants that almonds, cashews, walnuts, raisins and fox nuts quietly carry to your plate.</p>
          </div>
        </section>

        <div className="almanac-note reveal">
          <div>
            <span className="k">How to read this page</span>
            <p>Each specimen below covers one nutrient found in our dry fruits — what it does in the body, and which of our products carry it. Pick a specimen from the index to read its full note. We're also building a premium spice range — see our <Link to="/#coming">upcoming spices</Link> for what's coming next.</p>
          </div>
          <div className="almanac-legend">
            <span>{String(specimens.length).padStart(2, "0")} SPECIMENS</span>
            <span>{new Set(specimens.flatMap((s) => s.sources)).size} SOURCE FRUITS</span>
            <span>UPDATED 2026</span>
          </div>
        </div>

        <section className="specimens">
          <div className="specimens-head reveal">
            <span>Specimen Index</span>
            <h2>{specimens.length} nutrient{specimens.length === 1 ? "" : "s"} worth knowing</h2>
          </div>
          <div className={`almanac-browser reveal${loading ? " loading" : ""}`}>
            <div className="almanac-index">
              {specimens.map((s, i) => (
                <button
                  key={s.id || s.no}
                  type="button"
                  className={`index-item${i === activeIdx ? " active" : ""}`}
                  onClick={() => setActiveIdx(i)}
                  aria-pressed={i === activeIdx}
                >
                  <span className="idx-no">{s.no}</span>
                  <span className="idx-copy">
                    <span className="idx-title">{s.title}</span>
                    <span className="idx-label">{s.label}</span>
                  </span>
                  <svg className="idx-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 6 15 12 9 18"></polyline></svg>
                </button>
              ))}
            </div>
            {active && <SpecimenDetail specimen={active} />}
          </div>
        </section>

        <div className="blog-cta reveal">
          <div className="blog-cta-inner">
            <div>
              <h3>Taste the almanac</h3>
              <p>Every specimen on this page is sitting in our current range — handpicked, farm-fresh, and shipped across India.</p>
            </div>
            <Link to="/#products">Shop the range →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
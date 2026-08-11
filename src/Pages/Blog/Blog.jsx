import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./Blog.css"

const SPECIMENS = [
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

function SpecimenCard({ specimen }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`specimen-card reveal${open ? ' open' : ''}`} onClick={() => setOpen((v) => !v)}>
      <div className="specimen-tag"><span className="no">{specimen.no}</span><span>{specimen.label}</span></div>
      <h3>{specimen.title}</h3>
      <p className="lede">{specimen.lede}</p>
      <div className="specimen-sources">
        {specimen.sources.map((s) => <span key={s}>{s}</span>)}
      </div>
      <div className="specimen-toggle">
        Read the field note
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>
      <div className="specimen-note">
        <p>{specimen.note}</p>
      </div>
    </div>
  );
}

export default function Blog() {
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <Header />
      <main id="main">
        <section className="blog-hero">
          <div className="blog-hero-wrap">
            <span className="eyebrow">Field Notes From The Forest</span>
            <h1>The Nutrient <em>Almanac</em></h1>
            <p>A short field guide to what's actually inside every handful — the vitamins, minerals and healthy fats that almonds, cashews, walnuts, raisins and fox nuts quietly carry to your plate.</p>
          </div>
        </section>

        <div className="almanac-note reveal">
          <div>
            <span className="k">How to read this page</span>
            <p>Each specimen card below covers one nutrient found in our dry fruits — what it does in the body, and which of our products carry it. Tap a card to open its full note.</p>
          </div>
          <div className="almanac-legend">
            <span>06 SPECIMENS</span>
            <span>5 SOURCE FRUITS</span>
            <span>UPDATED 2026</span>
          </div>
        </div>

        <section className="specimens">
          <div className="specimens-head reveal">
            <span>Specimen Index</span>
            <h2>Six nutrients worth knowing</h2>
          </div>
          <div className="specimen-grid">
            {SPECIMENS.map((s) => <SpecimenCard key={s.no} specimen={s} />)}
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
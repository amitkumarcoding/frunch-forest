import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import { PRODUCTS as LOCAL_PRODUCTS } from "../../data/products";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import ProductCard from "../../components/ProductCard/ProductCard";
import SEO from "../../components/SEO/SEO";
import { getFestiveGreeting, DEFAULT_FESTIVALS } from "../../utils/festiveGreeting";
import { getFestiveTheme } from "../../utils/festiveTheme";
import { getFestiveIcon } from "../../utils/festiveIcons";
import { getTimeGreeting } from "../../utils/timeGreeting";
import { getTimeTheme } from "../../utils/timeTheme";
import { getTimeIcon } from "../../utils/timeIcons";
import { loadFestivalsFromGoogleCalendar } from "../../services/googleFestivalCalendar";
import FestivalOffers from "../../components/FestivalOffers/FestivalOffers";
import FestiveParticles from "../../components/FestiveParticles";
import FestiveWelcomeOverlay from "../../components/FestiveWelcomeOverlay";
import FestiveGarland from "../../components/FestiveGarland";
import MoonScene from "../../components/MoonScene/MoonScene";

// Converts "#RRGGBB" (or "#RGB") to an rgba() string with the given alpha.
// Used instead of CSS color-mix() for the festive backdrop wash, since
// color-mix() isn't supported on some Android WebViews / older browsers.
function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const FAQS = [
  { q: "Are Frunch Forest dry fruits preservative-free?", a: "Yes. Our dry fruits are carefully sourced and packed without added preservatives or artificial colours. We focus on fresh, natural quality instead of chemical shortcuts." },
  { q: "Where are your dry fruits sourced from?", a: "We work with trusted sourcing partners and bring in quality nuts and dry fruits from reliable origins, with a strong focus on freshness, grade and consistency." },
  { q: "What is the shelf life of your products?", a: "Most products have a shelf life of around 6 to 12 months depending on the item and storage conditions. We recommend keeping them sealed and stored in a cool, dry place." },
  { q: "How should I store them?", a: "Store the packs in a cool, dry place away from direct sunlight. Once opened, transfer the contents to an airtight container to preserve their crunch and freshness." },
  { q: "Do you offer COD?", a: "Cash on Delivery availability may vary by location and order value. Please reach out to us directly for the latest options on your delivery area." },
  { q: "Do you deliver across India?", a: "Yes, we ship across India. Delivery timelines vary by city and pin code, but we aim to make the process smooth and reliable for every order." },
  { q: "What payment methods do you accept?", a: "We accept common online payment methods for customer convenience. For specific payment options on a particular order, feel free to contact us before checkout." },
  { q: "Do you offer bulk orders?", a: "Absolutely. We support bulk and wholesale requirements for gifting, weddings, corporate orders and festive occasions. Contact us with your quantity and timeline for a custom quote." },
  { q: "Can I request custom gifting?", a: "Yes. We can help with gifting assortments and special packaging ideas for occasions such as festivals, weddings, corporate gifting and personal celebrations." },
  { q: "How can I report a damaged package?", a: "Please contact us within 48 hours of delivery with photos of the package and contents so we can review the issue and assist with a replacement or resolution." },
];

const PACK_ITEMS = [
  { name: "Almond", img: "/image/packaging/almonds.jpeg" },
  { name: "Cashews", img: "/image/packaging/cashew.png" },
  { name: "Raisin", img: "/image/packaging/raisin.png" },
  { name: "Dates", img: "/image/packaging/datespackage.png" },
  { name: "Dried Apricots", img: "/image/packaging/driedapricotsPackage.png" },
  { name: "Dried Figs", img: "/image/packaging/driedfigspackage.png" },
  { name: "Makhana", img: "/image/packaging/makhanapackage.png" },
  { name: "Mixed Nuts", img: "/image/packaging/mixednutspackage.png" },
  { name: "Pistachios", img: "/image/packaging/pistachiospackage.png" },
  { name: "Walnuts", img: "/image/packaging/walnutspackage.png" },
  { name: "Cardamom", img: "/image/packaging/spice/cardamom.png" },
  { name: "Chilli", img: "/image/packaging/spice/chilli.png" },
  { name: "Coriander", img: "/image/packaging/spice/coriander.png" },
  { name: "Pepper", img: "/image/packaging/spice/pepper.png" },
  { name: "Turmeric", img: "/image/packaging/spice/turmeric.png" },
];

function Home() {
  const [products, setProducts] = useState(
    Object.entries(LOCAL_PRODUCTS).map(([slug, p]) => ({ ...p, slug }))
  );
  const [loading, setLoading] = useState(true);
  // const TEST_DATE = new Date('2026-08-02'); // ← change this line only to test a festival
  const TEST_DATE = null
  const [festive, setFestive] = useState(() => getFestiveGreeting(TEST_DATE || undefined));
  // Fallback hero theme for days with no festival — swaps between
  // morning/afternoon/evening/night as the clock moves. Refreshed every
  // few minutes so a tab left open across a slot boundary picks it up.
  const [timeGreeting, setTimeGreeting] = useState(() => getTimeGreeting(TEST_DATE || undefined));
  useEffect(() => {
    const id = setInterval(() => setTimeGreeting(getTimeGreeting()), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Festival takes priority when one's active; otherwise the hero falls
  // back to the time-of-day theme. `active` drives the hero banner,
  // backdrop and emblem for both — they share the same {key,text,eyebrow,emoji}
  // shape so the rest of the render tree doesn't need to branch.
  const isFestival = Boolean(festive);
  const active = festive || timeGreeting;
  const activeTheme = isFestival ? getFestiveTheme(active.key) : getTimeTheme(active.key);
  const ActiveIcon = isFestival ? getFestiveIcon(active.key) : getTimeIcon(active.key);
  // Hero mode — festivals always keep the dark aurora look. Otherwise each
  // time slot gets its own background (see .hero--morning/afternoon/evening/
  // night in Home.css); morning + afternoon additionally get the shared
  // "daylight" text/UI treatment (dark text on a light background).
  const heroMode = isFestival ? "dark" : active.key;
  const isDaylight = heroMode === "morning" || heroMode === "afternoon";
  const festiveVars = activeTheme
    ? {
        "--tc-1": activeTheme.colors[0],
        "--tc-2": activeTheme.colors[1],
        "--tc-3": activeTheme.colors[2],
        "--tc-1-a": hexToRgba(activeTheme.colors[0], 0.24),
        "--tc-2-a": hexToRgba(activeTheme.colors[1], 0.3),
        "--tc-3-a": hexToRgba(activeTheme.colors[2], 0.2),
        // Lighter alpha, used for the full-hero background wash (see
        // .hero in Home.css) — same colours, subtler than the top strip.
        "--tc-1-wash": hexToRgba(activeTheme.colors[0], 0.1),
        "--tc-2-wash": hexToRgba(activeTheme.colors[1], 0.18),
        "--tc-3-wash": hexToRgba(activeTheme.colors[2], 0.14),
      }
    : undefined;
  // FAQ accordion — only one answer open at a time; clicking the open
  // question again closes it.
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [offerPhone, setOfferPhone] = useState("");
  const [offerError, setOfferError] = useState("");
  const [offerSent, setOfferSent] = useState(false);

  const [activeGiftItem, setActiveGiftItem] = useState("diwali");
  const [giftImgErrors, setGiftImgErrors] = useState({});

  // ---- Pack showcase slider (arrows + dots) ----
  const packTrackRef = useRef(null);
  const [packActiveIndex, setPackActiveIndex] = useState(0);

  const scrollToPackIndex = (index) => {
    const track = packTrackRef.current;
    if (!track) return;
    const card = track.children[index];
    if (!card) return;
    track.scrollTo({
      left: card.offsetLeft - track.offsetLeft,
      behavior: "smooth",
    });
  };

  const scrollShowcase = (direction) => {
    const track = packTrackRef.current;
    if (!track) return;
    const nextIndex = Math.min(
      Math.max(packActiveIndex + direction, 0),
      PACK_ITEMS.length - 1
    );
    scrollToPackIndex(nextIndex);
  };

  useEffect(() => {
    const track = packTrackRef.current;
    if (!track) return;

    let raf = null;
    const handleScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const cards = Array.from(track.children);
        if (!cards.length) return;
        const trackCenter = track.scrollLeft + track.clientWidth / 2;
        let closest = 0;
        let closestDist = Infinity;
        cards.forEach((card, i) => {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const dist = Math.abs(cardCenter - trackCenter);
          if (dist < closestDist) {
            closestDist = dist;
            closest = i;
          }
        });
        setPackActiveIndex(closest);
      });
    };

    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", handleScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // ---- Pack preview lightbox ----
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const showPrevInLightbox = () =>
    setLightboxIndex((i) => (i === null ? i : (i - 1 + PACK_ITEMS.length) % PACK_ITEMS.length));
  const showNextInLightbox = () =>
    setLightboxIndex((i) => (i === null ? i : (i + 1) % PACK_ITEMS.length));

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrevInLightbox();
      if (e.key === "ArrowRight") showNextInLightbox();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex]);

  useEffect(() => {
    async function loadProducts() {
      const { loadProductsFromFirestore } = await import("../../services/firebaseProducts");
      const firestoreProducts = await loadProductsFromFirestore();

      if (firestoreProducts) {
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
      setLoading(false);
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function loadFestivals() {
      // Google Calendar (or the local fallback list) provides the base
      // year of festivals; admin-managed Firestore overrides are merged
      // on top and always win on a shared date — see
      // firebaseFestivals.js and festiveGreeting.js's priority sort.
      const { loadFestivalOverridesFromFirestore } = await import("../../services/firebaseFestivals");
      const [googleFestivals, adminOverrides] = await Promise.all([
        loadFestivalsFromGoogleCalendar(),
        loadFestivalOverridesFromFirestore(),
      ]);
      const base = googleFestivals && googleFestivals.length ? googleFestivals : DEFAULT_FESTIVALS;
      const merged = adminOverrides.length ? [...base, ...adminOverrides] : base;
      setFestive(getFestiveGreeting(TEST_DATE || new Date(), merged));
    }

    loadFestivals();
  }, []);

  const [offers, setOffers] = useState([]);
  useEffect(() => {
    import("../../services/firebaseOffers").then(({ loadOffersFromFirestore }) =>
      loadOffersFromFirestore().then(setOffers)
    );
  }, []);

  // Keep the original site's preloader timing, but let React control it.
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // The original site used IntersectionObserver in legacy.js to reveal
  // every .reveal element. Keep the exact same CSS/classes, but do it in React.
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealElements = Array.from(document.querySelectorAll(".reveal"));

    if (reduceMotion) {
      revealElements.forEach((el) => el.classList.add("in"));
      document.querySelectorAll("section, footer").forEach((el) => el.classList.add("sec-in"));
      return;
    }

    const revealGroups = new Map();
    revealElements.forEach((el) => {
      const parent = el.parentElement;
      if (!revealGroups.has(parent)) revealGroups.set(parent, 0);
      const index = revealGroups.get(parent);
      el.style.transitionDelay = `${Math.min(index * 90, 450)}ms`;
      revealGroups.set(parent, index + 1);
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealElements.forEach((el) => io.observe(el));

    const sectionIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("sec-in");
          sectionIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });

    document.querySelectorAll("section, footer").forEach((el) => sectionIO.observe(el));

    return () => {
      io.disconnect();
      sectionIO.disconnect();
    };
  }, [products, openFaqIndex]);

  // Keep the original scroll progress + scroll-to-top behaviour.
  useEffect(() => {
    const progress = document.getElementById("progressBar");
    const scrollTop = document.getElementById("scrollTopBtn");
    let ticking = false;

    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (progress) progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
      if (scrollTop) scrollTop.classList.toggle("visible", window.scrollY > 480);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    const onTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
    scrollTop?.addEventListener("click", onTop);

    return () => {
      window.removeEventListener("scroll", onScroll);
      scrollTop?.removeEventListener("click", onTop);
    };
  }, []);


  return (
    <>
      <SEO
        title="Frunch Forest — Natural Dry Fruits"
        description="Frunch Forest brings handpicked almonds, cashews, walnuts, raisins, fox nuts and more from farm to your table — no preservatives, no shortcuts, just honest quality. Pan-India delivery, gifting and bulk orders."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Frunch Forest",
          url: "https://frunchforest.com",
          logo: "https://frunchforest.com/image/logo.png",
        }}
      />

      <a className="skip-link" href="#main">Skip to content</a>

      <div className="cursor-ring" id="cursorRing" aria-hidden="true"></div>
      <div className="cursor-dot" id="cursorDot" aria-hidden="true"></div>

      {loading && (
        <div id="preloader">
          <div className="preloader-inner">
            <div className="preloader-ring-wrap">
              <div className="preloader-ring"></div>
              <div className="preloader-ring ring2"></div>
              <img className="preloader-logo" src="/image/logo.png" alt="Frunch Forest" />
            </div>
            <div className="preloader-word" aria-label="Frunch Forest">
              <span>F</span><span>r</span><span>u</span><span>n</span><span>c</span><span>h</span><span>&nbsp;</span><span>F</span><span>o</span><span>r</span><span>e</span><span>s</span><span>t</span>
            </div>
            <div className="preloader-sub">crunch in every bite</div>
          </div>
        </div>
      )}

      <div className="progress-bar" id="progressBar"></div>

      {!loading && (
        <FestiveWelcomeOverlay festive={festive} theme={activeTheme} Icon={ActiveIcon} />
      )}

      <Header dark={!isDaylight} />

      <main id="main">
        <section className={`hero hero--${heroMode}${isDaylight ? " hero--daylight" : ""}`} id="heroSection" style={festiveVars}>
          {heroMode === "night" ? (
            <>
              <div className="hero-mesh" aria-hidden="true"></div>
              <div className="hero-grid-overlay" aria-hidden="true"></div>
              <MoonScene />
              <div className="hero-noise" aria-hidden="true"></div>
              <div className="hero-vignette" aria-hidden="true"></div>
            </>
          ) : (
            <>
              <div className="hero-mesh" aria-hidden="true"></div>
              <div className="hero-grid-overlay" aria-hidden="true"></div>
              <div className="hero-orb hero-orb-1" aria-hidden="true"></div>
              <div className="hero-orb hero-orb-2" aria-hidden="true"></div>
              <div className="hero-orb hero-orb-3" aria-hidden="true"></div>
              <div className="hero-noise" aria-hidden="true"></div>
            </>
          )}
          {active && heroMode !== "night" && (
            <div
              className="hero-festive-layer"
              aria-hidden="true"
            >
              <div className={`hero-festive-backdrop hero-festive-backdrop--${activeTheme.pattern}`}></div>
              <FestiveParticles pattern={activeTheme.pattern} colors={activeTheme.colors} />
              {isFestival && <FestiveGarland theme={activeTheme} />}
            </div>
          )}
          {(active?.key === "independence-day" || active?.key === "republic-day") && (
            <div className="indep-decor" aria-hidden="true">
              <div className="indep-chakra"></div>
              <div className="indep-leaf indep-leaf-1"></div>
              <div className="indep-leaf indep-leaf-2"></div>
              <div className="indep-grain"></div>
            </div>
          )}
          {active && heroMode !== "night" && active.key !== "independence-day" && active.key !== "republic-day" && ActiveIcon && (
            <div className="festive-emblem-decor" aria-hidden="true">
              <div className="festive-emblem-glow"></div>
              {/* eslint-disable-next-line react-hooks/static-components -- ActiveIcon is a lookup into a module-level map, same key always yields the same stable component reference */}
              <div className="festive-emblem-icon"><ActiveIcon /></div>
              <div className="indep-leaf indep-leaf-1"></div>
              <div className="indep-leaf indep-leaf-2"></div>
              <div className="indep-grain"></div>
            </div>
          )}
          <div className="wrap hero-grid hero-inner">
            <div className="hero-copy">
              {active && (
                <div className="festive-banner hero-anim a1" data-festival={active.key}>
                  <span className="festive-banner-ambient" aria-hidden="true"></span>
                  <span className="festive-banner-icon">
                    <span className="festive-banner-icon-ring" aria-hidden="true"></span>
                    <span className="festive-banner-icon-glow" aria-hidden="true"></span>
                    <span className="festive-banner-icon-spark s1" aria-hidden="true"></span>
                    <span className="festive-banner-icon-spark s2" aria-hidden="true"></span>
                    <span className="festive-banner-icon-emoji">
                      {/* eslint-disable-next-line react-hooks/static-components -- same stable lookup as above */}
                    {ActiveIcon && <ActiveIcon width={20} height={20} />}
                    </span>
                  </span>
                  <span className="festive-banner-copy">
                    <span className="festive-banner-eyebrow">{active.eyebrow}</span>
                    <span className="festive-banner-text">{active.text}</span>
                  </span>
                </div>
              )}
              <div className="eyebrow hero-anim a1"><span className="dot"></span> Handpicked · Farm-fresh · Pan-India delivery</div>
              <h1 className="hero-anim a2">Natural dry fruits,<em>a crunch of nature in every bite</em></h1>
              <p className="lede hero-anim a3">Frunch Forest brings almonds, cashews, walnuts, raisins and fox nuts from farm to your table — no preservatives, no shortcuts, just honest quality in every pack.</p>
              <div className="hero-ctas hero-anim a4">
                <a className="btn-primary" href="#products">Shop Now →</a>
                <a className="btn-ghost" href="#products">Explore Products</a>
                <a className="btn-download" href="/frunch-forest-catalog.pdf" download><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>Download Catalog</a>
              </div>
              <div className="hero-stats hero-anim a5">
                <div className="stat">
                  <span className="stat-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C8 6 4 9 4 14a8 8 0 0 0 16 0c0-5-4-8-8-12Z"/></svg></span>
                  <span className="stat-copy"><b data-count="5" data-suffix="+">5+</b><span>Core products</span></span>
                </div>
                <div className="stat">
                  <span className="stat-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8 12 3 3 8l9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg></span>
                  <span className="stat-copy"><b data-count="4">8</b><span>Pack sizes each</span></span>
                </div>
                <div className="stat">
                  <span className="stat-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg></span>
                  <span className="stat-copy"><b data-count="0">0</b><span>Preservatives added</span></span>
                </div>
                <div className="stat">
                  <span className="stat-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"/></svg></span>
                  <span className="stat-copy"><b>FSSAI</b><span>&amp; GST licensed</span></span>
                </div>
              </div>
            </div>
            <div className="hero-visual hero-anim a6">
              <div className="hero-visual-card" aria-hidden="true">
                <span className="hvc-corner tl"></span>
                <span className="hvc-corner tr"></span>
                <span className="hvc-corner bl"></span>
                <span className="hvc-corner br"></span>
              </div>
              <div className="hero-visual-ring" aria-hidden="true"></div>
              <div className="fruit-chip chip-almond" aria-hidden="true">
                <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="almondSkin" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#F1D48A" />
                      <stop offset="55%" stopColor="#C9973B" />
                      <stop offset="100%" stopColor="#8B6420" />
                    </linearGradient>
                  </defs>
                  <path d="M32 3 C45 8 50 24 47 39 C44 53 35 61 27 58 C14 53 10 36 14 21 C18 8 25 1 32 3 Z" fill="url(#almondSkin)" />
                  <path d="M32 9 C39 15 41 27 39 37 C37 46 33 52 28 53" stroke="#8B6420" strokeWidth="1.3" fill="none" opacity="0.45" strokeLinecap="round" />
                  <ellipse cx="24" cy="16" rx="4.5" ry="7" fill="#F8E3AE" opacity="0.55" transform="rotate(-18 24 16)" />
                </svg>
                <span className="chip-label">Almond</span>
              </div>
              <div className="fruit-chip chip-cashew" aria-hidden="true">
                <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="cashewSkin" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#FBF3DE" />
                      <stop offset="60%" stopColor="#F1D48A" />
                      <stop offset="100%" stopColor="#C9973B" />
                    </linearGradient>
                  </defs>
                  <path d="M15 41 C9 28 15 12 27 9 C39 6 49 13 47 22 C45 30 35 27 32 35 C29 43 39 47 34 55 C26 62 20 54 15 41 Z" fill="url(#cashewSkin)" />
                  <path d="M20 40 C17 31 20 20 28 15" stroke="#C9973B" strokeWidth="1.3" fill="none" opacity="0.4" strokeLinecap="round" />
                </svg>
                <span className="chip-label">Cashew</span>
              </div>
              <div className="fruit-chip chip-walnut" aria-hidden="true">
                <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="walnutSkin" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#C9973B" />
                      <stop offset="100%" stopColor="#5B3A24" />
                    </linearGradient>
                  </defs>
                  <circle cx="32" cy="32" r="27" fill="url(#walnutSkin)" />
                  <path d="M32 8 C27 16 30 22 32 26 C34 22 37 16 32 8 Z" fill="#5B3A24" opacity="0.55" />
                  <path d="M14 24 C20 22 24 27 24 32 C24 37 19 41 14 40" stroke="#3E240F" strokeWidth="1.4" fill="none" opacity="0.55" strokeLinecap="round" />
                  <path d="M50 24 C44 22 40 27 40 32 C40 37 45 41 50 40" stroke="#3E240F" strokeWidth="1.4" fill="none" opacity="0.55" strokeLinecap="round" />
                  <path d="M20 46 C25 43 28 47 32 47 C36 47 39 43 44 46" stroke="#3E240F" strokeWidth="1.4" fill="none" opacity="0.45" strokeLinecap="round" />
                </svg>
                <span className="chip-label">Walnut</span>
              </div>
              <div className="fruit-chip chip-pistachio" aria-hidden="true">
                <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="pistaShell" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#FBF3DE" />
                      <stop offset="100%" stopColor="#E9DFCC" />
                    </linearGradient>
                  </defs>
                  <path d="M32 4 C44 4 50 18 48 30 C47 36 41 38 32 38 C23 38 17 36 16 30 C14 18 20 4 32 4 Z" fill="url(#pistaShell)" />
                  <path d="M32 6 C41 6 45 17 43 27 C42 32 38 34 32 34" fill="none" stroke="#C9973B" strokeWidth="1" opacity="0.3" />
                  <path d="M32 10 C39 12 42 20 40 27 C38 32 35 33 32 33 C29 33 26 32 24 27 C22 20 25 12 32 10 Z" fill="var(--forest-mid)" opacity="0.9" />
                  <ellipse cx="28" cy="17" rx="2.6" ry="4" fill="var(--forest-light)" opacity="0.7" />
                  <path d="M32 38 C27 46 26 52 32 60 C38 52 37 46 32 38 Z" fill="url(#pistaShell)" />
                </svg>
                <span className="chip-label">Pistachio</span>
              </div>
              <div className="hero-badge">
                <span className="badge-sparkle sp1"></span>
                <span className="badge-sparkle sp2"></span>
                <span className="badge-sparkle sp3"></span>
                <img src="/image/background/bg1.png" alt="" className="badge-bg" loading="lazy" />
                <div className="badge-mark"><img style={{ width: "150px", height: "150px" }} src="/image/logo.png" alt="" /></div>

              </div>
              <div className="hero-tag">Almonds · Cashew · Walnut</div>
              <div className="hero-tag two">No additives</div>
            </div>
          </div>
        </section>
        <FestivalOffers offers={offers} />
        <section id="products">
          <span className="sec-line"></span>
          <div className="wrap">
            <div className="section-head reveal">
              <div className="eyebrow">The range</div>
              <h2>Five staples, done right</h2>
              <p>Every product ships in four pack sizes with the same promise: no preservatives, no additives, quality guaranteed.</p>
              <Link className="btn-primary all-products-btn" to="/products">All Products
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </Link>
            </div>
            <div className="best-sellers reveal">
              <div className="best-seller-item">
                <div>
                  <strong>🥇 Almonds</strong>
                  <span>Our most-loved everyday staple</span>
                </div>
                <div className="best-seller-badge">1</div>
              </div>
              <div className="best-seller-item">
                <div>
                  <strong>🥈 Cashews</strong>
                  <span>Rich, creamy and perfect for gifting</span>
                </div>
                <div className="best-seller-badge">2</div>
              </div>
              <div className="best-seller-item">
                <div>
                  <strong>🥉 Makhana</strong>
                  <span>A light, crunchy favourite</span>
                </div>
                <div className="best-seller-badge">3</div>
              </div>
            </div>
            {/* <div className="product-grid" id="productGrid"></div> */}
            <div className="product-grid">

              {products.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>

            <div className="see-all-products-wrap reveal">
              <Link className="btn-primary see-all-products-btn" to="/products">See All Products
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </Link>
            </div>
          </div>
        </section>
        <section id="why">
          <span className="sec-line"></span>
          <div className="wrap">
            <div className="section-head reveal">
              <div className="eyebrow">Why Frunch Forest</div>
              <h2>Built on freshness, not shortcuts</h2>
              <p>Six commitments that sit behind every pouch we seal.</p>
            </div>
            <div className="why-grid">
              <div className="why-item reveal"><span className="why-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2"></path><path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2"></path><path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8"></path><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-4.53a2 2 0 0 1 3.12-2.5L7 15"></path></svg></span><span className="num">01</span><h3>Handpicked quality</h3><p>Each nut and fruit is selected by hand before it ever reaches a pack.</p></div>
              <div className="why-item reveal"><span className="why-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 11 13.5 12 12"></path></svg></span><span className="num">02</span><h3>Farm-fresh, no preservatives</h3><p>Nothing artificial goes in — just the product, as nature made it.</p></div>
              <div className="why-item reveal"><span className="why-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.09 3 12.25c0 2.22 1.8 4.05 4 4.05Z"></path><path d="M12.56 6.6A18.15 18.15 0 0 1 16 11.34"></path><path d="M16 17.65a4.05 4.05 0 0 0 4-4.05c0-1.16-.57-2.26-1.71-3.19"></path></svg></span><span className="num">03</span><h3>Hygienically processed</h3><p>Cleaned, sorted and packed under strict hygiene standards.</p></div>
              <div className="why-item reveal"><span className="why-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 6v2m0 8v2"></path></svg></span><span className="num">04</span><h3>Affordable rates</h3><p>Premium quality priced for everyday families, not just special occasions.</p></div>
              <div className="why-item reveal"><span className="why-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="7" width="14" height="10"></rect><path d="M15 10h4l3 3v4h-7"></path><circle cx="5.5" cy="18.5" r="1.8"></circle><circle cx="17.5" cy="18.5" r="1.8"></circle></svg></span><span className="num">05</span><h3>Fast delivery across India</h3><p>From our stores to your doorstep, wherever you are in the country.</p></div>
              <div className="why-item reveal"><span className="why-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></span><span className="num">06</span><h3>Trusted by families &amp; businesses</h3><p>Stocked for home kitchens, gifting, and bulk business orders alike.</p></div>
            </div>

            <div className="compare-wrap reveal">
              <div className="compare-head">
                <h3>Frunch Forest vs. Ordinary Dry Fruits</h3>
                <p>See the difference our process makes before it ever reaches your bowl.</p>
              </div>
              <div className="compare-table-outer">
                <table className="compare-table">
                  <colgroup>
                    <col className="feature-col" />
                    <col /><col />
                  </colgroup>
                  <thead>
                    <tr>
                      <th scope="col"></th>
                      <th scope="col" className="brand-col">Frunch Forest</th>
                      <th scope="col">Ordinary Dry Fruits</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Quality checked</td>
                      <td className="yes brand-cell"><span className="cell-label">Frunch Forest</span><span className="cell-badge"><span className="check-icon"></span></span></td>
                      <td className="no"><span className="cell-label">Ordinary</span><span className="cell-badge"><span className="dash-icon"></span></span></td>
                    </tr>
                    <tr>
                      <td>Hygienic packing</td>
                      <td className="yes brand-cell"><span className="cell-label">Frunch Forest</span><span className="cell-badge"><span className="check-icon"></span></span></td>
                      <td className="no"><span className="cell-label">Ordinary</span><span className="cell-badge"><span className="dash-icon"></span></span></td>
                    </tr>
                    <tr>
                      <td>Freshness-focused packaging</td>
                      <td className="yes brand-cell"><span className="cell-label">Frunch Forest</span><span className="cell-badge"><span className="check-icon"></span></span></td>
                      <td className="no"><span className="cell-label">Ordinary</span><span className="cell-badge"><span className="dash-icon"></span></span></td>
                    </tr>
                    <tr>
                      <td>No added preservatives*</td>
                      <td className="yes brand-cell"><span className="cell-label">Frunch Forest</span><span className="cell-badge"><span className="check-icon"></span></span></td>
                      <td className="no"><span className="cell-label">Ordinary</span><span className="cell-badge"><span className="dash-icon"></span></span></td>
                    </tr>
                    <tr>
                      <td>Multiple pack sizes</td>
                      <td className="yes brand-cell"><span className="cell-label">Frunch Forest</span><span className="cell-badge"><span className="check-icon"></span></span></td>
                      <td className="no"><span className="cell-label">Ordinary</span><span className="cell-badge"><span className="dash-icon"></span></span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="compare-note">*Naturally preserved through proper drying and hygienic handling — no artificial preservatives added.</p>
            </div>
          </div>
        </section>
        <section id="pack-showcase" className="pack-showcase">
          <div className="wrap">
            <div className="section-head reveal">
              <div className="eyebrow"><span className="dot"></span> Fresh off the line</div>
              <h2>Every pack,<em className="accent-serif">sealed with care</em></h2>
              <p>No stock photos here — this is exactly what lands on your doorstep: hygienically packed, zip-locked, and bursting with flavour.</p>
            </div>
            <div className="showcase-slider">
              <button type="button" className="showcase-arrow prev" onClick={() => scrollShowcase(-1)} aria-label="Previous">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <div className="showcase-track" ref={packTrackRef}>
                {PACK_ITEMS.map((item, i) => (
                  <div className="pack-card reveal" key={item.name}>
                    <div className="pack-photo" onClick={() => openLightbox(i)}>
                      <img src={item.img} alt={`Frunch Forest ${item.name} pack`} loading="lazy" />
                      <span className="pack-index">№ {String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="pack-label"><span className="pack-name">{item.name}</span><span className="pack-tag">100% Natural</span></div>
                  </div>
                ))}
              </div>
              <button type="button" className="showcase-arrow next" onClick={() => scrollShowcase(1)} aria-label="Next">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
            <div className="showcase-dots">
              {PACK_ITEMS.map((item, i) => (
                <button
                  key={item.name}
                  type="button"
                  className={`showcase-dot${i === packActiveIndex ? " active" : ""}`}
                  aria-label={`Go to ${item.name}`}
                  onClick={() => scrollToPackIndex(i)}
                />
              ))}
            </div>
            <p className="showcase-swipe-hint">Swipe to explore ⟶</p>

            {lightboxIndex !== null && (
              <div className="pack-lightbox open" onClick={closeLightbox}>
                <button type="button" className="pack-lightbox-close" onClick={closeLightbox} aria-label="Close preview">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"></path></svg>
                </button>
                <button
                  type="button"
                  className="pack-lightbox-arrow prev"
                  aria-label="Previous pack"
                  onClick={(e) => { e.stopPropagation(); showPrevInLightbox(); }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <img
                  className="pack-lightbox-img"
                  src={PACK_ITEMS[lightboxIndex].img}
                  alt={`Frunch Forest ${PACK_ITEMS[lightboxIndex].name} pack`}
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="pack-lightbox-caption">{PACK_ITEMS[lightboxIndex].name}</span>
                <button
                  type="button"
                  className="pack-lightbox-arrow next"
                  aria-label="Next pack"
                  onClick={(e) => { e.stopPropagation(); showNextInLightbox(); }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
            )}
          </div>
        </section>
        <section id="testimonials">
          <span className="sec-line"></span>
          <div className="wrap">
            <div className="section-head reveal">
              <div className="eyebrow">Testimonials</div>
              <h2>Our happy<br />customers say</h2>
              <p>Real words from the families and businesses who keep coming back for another pack.</p>
            </div>
            <div className="testimonial-grid">
              <div className="testimonial-card featured reveal">
                <span className="watermark-quote">"</span>
                <div className="stars">★★★★★</div>
                <span className="verified-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
                  Verified Buyer
                </span>
                <p className="quote-text">The almonds taste like they were roasted at home — genuinely fresh, and the pouch kept them crisp all the way from Delhi to Bengaluru.</p>
                <div className="testimonial-who">
                  <div className="testimonial-avatar">P</div>
                  <div>
                    <span className="name">Priya Sharma</span>
                    <span className="loc">Bengaluru, Karnataka</span>
                  </div>
                </div>
              </div>
              <div className="testimonial-card reveal">
                <span className="watermark-quote">"</span>
                <div className="stars">★★★★★</div>
                <span className="verified-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
                  Verified Buyer
                </span>
                <p className="quote-text">We order the mixed nuts and fox nuts every month for the office pantry now. No weird aftertaste, no preservatives — just honest quality.</p>
                <div className="testimonial-who">
                  <div className="testimonial-avatar">R</div>
                  <div>
                    <span className="name">Rohit Malhotra</span>
                    <span className="loc">Gurugram, Haryana</span>
                  </div>
                </div>
              </div>
              <div className="testimonial-card reveal">
                <span className="watermark-quote">"</span>
                <div className="stars">★★★★★</div>
                <span className="verified-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>
                  Verified Buyer
                </span>
                <p className="quote-text">Gifted the assorted box for Diwali and every single relative asked where it was from. The packaging alone felt premium.</p>
                <div className="testimonial-who">
                  <div className="testimonial-avatar">A</div>
                  <div>
                    <span className="name">Anjali Verma</span>
                    <span className="loc">New Delhi</span>
                  </div>
                </div>
              </div>
              <div className="testimonial-strip reveal">
                <div className="stat"><b>4.9★</b><span>Average rating</span></div>
                <div className="stat"><b>500+</b><span>Happy families</span></div>
                <div className="stat"><b>98%</b><span>Repeat orders</span></div>
              </div>
            </div>
            <div className="see-all-wrap">
              <a className="btn-primary see-all-btn" href="testimonials">See All Reviews
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </a>
            </div>
          </div>
        </section>
        <section id="gifting">
          <span className="sec-line"></span>
          <div className="gb-shell">
            <div className="wrap gb-wrap reveal">

              <div className="gb-head">
                <span className="eyebrow">Gifting &amp; Bulk Orders</span>
                <span className="gb-badge">🎗️ Festive Season Special</span>
                <h2>Make every celebration <em className="accent-serif gb-shine">crunchier</em></h2>
                <p>Whether it's <span className="gb-chip">🎁 a hamper for the moment</span> or <span className="gb-chip">📦 a standing supply for the business</span> — same freshness, same promise, packed to fit.</p>
              </div>

              <div className="gb-diptych">

                <article className="gb-panel gb-panel--gift">
                  <div className="gb-panel-head">
                    <span className="gb-path">Path 01 · Retail</span>
                    <h3>Occasion Gifting</h3>
                    <p>Premium dry-fruit gifting for Diwali, corporate gifting, weddings, events, and employee appreciation.</p>
                  </div>

                  <div className="gb-visual" id="giftingVisual">
                    <div className={`gb-visual-item${activeGiftItem === "diwali" ? " active" : ""}`} data-item="diwali" style={{ "--GvA": "#C9973B", "--GvB": "#8B6420" }}>
                      {!giftImgErrors.diwali && (
                        <img src="/image/gifts/diwali.png" alt="Diwali dry-fruit gifting hampers" loading="lazy" onError={() => setGiftImgErrors((prev) => ({ ...prev, diwali: true }))} />
                      )}
                      {giftImgErrors.diwali && <span className="gv-fallback">🎁</span>}
                    </div>
                    <div className={`gb-visual-item${activeGiftItem === "corporate" ? " active" : ""}`} data-item="corporate" style={{ "--GvA": "#3E7C4A", "--GvB": "#132A1E" }}>
                      {!giftImgErrors.corporate && (
                        <img src="/image/gifts/corporate.png" alt="Corporate gifting boxes" loading="lazy" onError={() => setGiftImgErrors((prev) => ({ ...prev, corporate: true }))} />
                      )}
                      {giftImgErrors.corporate && <span className="gv-fallback">💼</span>}
                    </div>
                    <div className={`gb-visual-item${activeGiftItem === "wedding" ? " active" : ""}`} data-item="wedding" style={{ "--GvA": "#8FBF6E", "--GvB": "#3E7C4A" }}>
                      {!giftImgErrors.wedding && (
                        <img src="/image/gifts/wedding.png" alt="Wedding favour gifting" loading="lazy" onError={() => setGiftImgErrors((prev) => ({ ...prev, wedding: true }))} />
                      )}
                      {giftImgErrors.wedding && <span className="gv-fallback">💍</span>}
                    </div>
                    <div className={`gb-visual-item${activeGiftItem === "events" ? " active" : ""}`} data-item="events" style={{ "--GvA": "#F1D48A", "--GvB": "#C9973B" }}>
                      {!giftImgErrors.events && (
                        <img src="/image/gifts/events.png" alt="Event gifting spread" loading="lazy" onError={() => setGiftImgErrors((prev) => ({ ...prev, events: true }))} />
                      )}
                      {giftImgErrors.events && <span className="gv-fallback">🎉</span>}
                    </div>
                    <div className={`gb-visual-item${activeGiftItem === "employee" ? " active" : ""}`} data-item="employee" style={{ "--GvA": "#5B3A24", "--GvB": "#221E17" }}>
                      {!giftImgErrors.employee && (
                        <img src="/image/gifts/employee.png" alt="Employee appreciation gifts" loading="lazy" onError={() => setGiftImgErrors((prev) => ({ ...prev, employee: true }))} />
                      )}
                      {giftImgErrors.employee && <span className="gv-fallback">🏢</span>}
                    </div>
                    <span className="gb-visual-tag">Gift ready</span>
                  </div>

                  <div className="gb-occasions" role="tablist" aria-label="Gifting occasions">
                    <span
                      className={`gb-occasion${activeGiftItem === "diwali" ? " active" : ""}`}
                      data-target="diwali" tabIndex="0" role="tab" aria-selected={activeGiftItem === "diwali"}
                      onMouseEnter={() => setActiveGiftItem("diwali")}
                      onClick={() => setActiveGiftItem("diwali")}
                    >🎁 Diwali</span>
                    <span
                      className={`gb-occasion${activeGiftItem === "corporate" ? " active" : ""}`}
                      data-target="corporate" tabIndex="0" role="tab" aria-selected={activeGiftItem === "corporate"}
                      onMouseEnter={() => setActiveGiftItem("corporate")}
                      onClick={() => setActiveGiftItem("corporate")}
                    >💼 Corporate</span>
                    <span
                      className={`gb-occasion${activeGiftItem === "wedding" ? " active" : ""}`}
                      data-target="wedding" tabIndex="0" role="tab" aria-selected={activeGiftItem === "wedding"}
                      onMouseEnter={() => setActiveGiftItem("wedding")}
                      onClick={() => setActiveGiftItem("wedding")}
                    >💍 Weddings</span>
                    <span
                      className={`gb-occasion${activeGiftItem === "events" ? " active" : ""}`}
                      data-target="events" tabIndex="0" role="tab" aria-selected={activeGiftItem === "events"}
                      onMouseEnter={() => setActiveGiftItem("events")}
                      onClick={() => setActiveGiftItem("events")}
                    >🎉 Events</span>
                    <span
                      className={`gb-occasion${activeGiftItem === "employee" ? " active" : ""}`}
                      data-target="employee" tabIndex="0" role="tab" aria-selected={activeGiftItem === "employee"}
                      onMouseEnter={() => setActiveGiftItem("employee")}
                      onClick={() => setActiveGiftItem("employee")}
                    >🏢 Employee gifts</span>
                  </div>

                  <a className="btn-primary gb-cta" href="#contact">Request a Gifting Quote →</a>
                </article>

                <div className="gb-seam" aria-hidden="true"><span>or</span></div>

                <article className="gb-panel gb-panel--bulk">
                  <div className="gb-panel-head">
                    <span className="gb-path">Path 02 · Wholesale</span>
                    <h3>Bulk &amp; Business Orders</h3>
                    <p>Stocking a pantry, planning an event, or sourcing for resale? We supply premium dry fruits at scale — consistent quality, reliable timelines, and pricing built for bulk.</p>
                  </div>

                  <div className="gb-block">
                    <span className="gb-block-label">Perfect for</span>
                    <div className="gb-tagcloud">
                      <span className="gb-pill">🏢 Corporate gifting</span>
                      <span className="gb-pill">💍 Weddings</span>
                      <span className="gb-pill">🎉 Festivals</span>
                      <span className="gb-pill">🎊 Events</span>
                      <span className="gb-pill">☕ Office pantries</span>
                      <span className="gb-pill">🏬 Retailers</span>
                      <span className="gb-pill">🔁 Resellers</span>
                      <span className="gb-pill">🏨 Hotels &amp; restaurants</span>
                    </div>
                  </div>

                  <div className="gb-block">
                    <span className="gb-block-label">Includes</span>
                    <div className="gb-includes">
                      <div className="gb-include">MOQ</div>
                      <div className="gb-include">Custom packaging</div>
                      <div className="gb-include">Private labeling</div>
                      <div className="gb-include">Delivery timelines</div>
                      <div className="gb-include">GST invoice</div>
                      <div className="gb-include">Bulk pricing</div>
                    </div>
                  </div>

                  <div className="gb-cta-row">
                    <div className="gb-cta-copy"><strong>Need 10kg+?</strong><span>Tell us your requirement and we'll get back with a custom quote.</span></div>
                    <a className="btn-primary gb-cta" href="#contact">Request Bulk Pricing →</a>
                  </div>
                </article>

              </div>
            </div>
          </div>
        </section>
        <section id="offer">
          <span className="sec-line"></span>
          <div className="wrap">
            <div className="offer-banner reveal">
              <div>
                <p>Get 10% OFF on your first order — tell us your WhatsApp number and we'll send the code.</p>
              </div>

              <form
                className="offer-capture"
                id="offerCaptureForm"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  const digits = offerPhone.replace(/\D/g, "");
                  if (digits.length !== 10) {
                    setOfferError("Enter a valid 10-digit WhatsApp number.");
                    return;
                  }
                  setOfferError("");
                  const msg = encodeURIComponent(
                    `Hi Frunch Forest, please send my 10% OFF code. My WhatsApp number is ${digits}.`
                  );
                  window.open(`https://wa.me/919582122419?text=${msg}`, "_blank", "noopener");
                  setOfferSent(true);
                }}
              >
                <div className="offer-capture-panel active" data-panel="whatsapp">
                  <input
                    type="tel"
                    id="offerPhoneInput"
                    placeholder="10-digit WhatsApp number"
                    autoComplete="tel"
                    inputMode="numeric"
                    maxLength="10"
                    aria-label="WhatsApp number"
                    value={offerPhone}
                    onChange={(e) => setOfferPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  />
                  <button type="submit" className="offer-capture-submit">Send Code on WhatsApp →</button>
                </div>

                <p className="offer-capture-error" id="offerCaptureError">{offerError}</p>
                <p className="offer-capture-wa-note">Opens WhatsApp with your code request pre-filled — just hit send.</p>

                {offerSent && (
                  <div className="offer-capture-success" id="offerCaptureSuccess">
                    <p className="offer-capture-waiting">
                      <span className="offer-capture-spinner" aria-hidden="true"></span>
                      We're sending your code on WhatsApp — keep waiting, it'll land in your chat shortly!
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </section>
        <section id="coming">
          <span className="sec-line"></span>
          <div className="wrap">
            <div className="coming-band reveal">
              <div className="coming-corner tl" aria-hidden="true"></div>
              <div className="coming-corner tr" aria-hidden="true"></div>
              <div className="coming-corner bl" aria-hidden="true"></div>
              <div className="coming-corner br" aria-hidden="true"></div>
              <div className="coming-copy">
                <div className="eyebrow" style={{ color: "var(--walnut)", borderColor: "rgba(107,66,36,0.35)", background: "rgba(107,66,36,0.06)" }}><span className="pulse-dot" aria-hidden="true"></span>Coming soon</div>
                <h2>A <span className="accent-serif" style={{ color: "var(--gold-3)" }}>premium</span> spice range is on its way</h2>
                <p>Pure and aromatic spices — sourced with the same care as our nuts and dry fruits. Stay tuned for the launch.</p>
                <form className="coming-notify" id="comingNotifyForm">
                  <input type="email" placeholder="Your email address" aria-label="Email address" required />
                  <button type="submit" className="btn-primary">Notify me →</button>
                </form>
                <div className="coming-notify-note" id="comingNotifyNote">Thanks — we'll let you know at launch.</div>
              </div>
              <div className="spice-dots">
                <span style={{ background: "linear-gradient(150deg,#D2582A,#B5451B)" }}><span className="spice-emoji">🌶️</span>Chilli</span>
                <span style={{ background: "linear-gradient(150deg,#E0AC4F,#C9973B)" }}><span className="spice-emoji">🫚</span>Turmeric</span>
                <span style={{ background: "linear-gradient(150deg,#93A566,#7A8B4F)" }}><span className="spice-emoji">🌿</span>Cardamom</span>
                <span style={{ background: "linear-gradient(150deg,#A6813F,#8E6C3A)" }}><span className="spice-emoji">🌱</span>Coriander</span>
                <span style={{ background: "linear-gradient(150deg,#83583A,#6B4226)" }}><span className="spice-emoji">⚫</span>Pepper</span>
                <span style={{ background: "linear-gradient(150deg,#749274,#5B7A5B)" }}><span className="spice-emoji">🌾</span>Fennel</span>
              </div>
            </div>
          </div>
        </section>
        <section id="packaging">
          <span className="sec-line"></span>
          <div className="wrap pack-grid">
            <div>
              <div className="eyebrow">Packaging &amp; certifications</div>
              <h2 style={{ fontSize: "clamp(1.9rem,4vw,2.6rem)", marginBottom: "26px" }}>Sealed for freshness,<br />backed on paper</h2>
              <ul className="pack-list">
                <li><span className="ico mono">01</span><div><h3>Moisture-resistant pouches</h3><p>Keeps every batch crisp from our facility to your kitchen.</p></div></li>
                <li><span className="ico mono">02</span><div><h3>GST &amp; FSSAI licensed</h3><p>Fully compliant for retail, gifting and bulk business orders.</p></div></li>
                <li><span className="ico mono">03</span><div><h3>Hygienically processed &amp; packed</h3><p>Handled under controlled, sanitary conditions throughout.</p></div></li>
              </ul>
            </div>
            <div className="certs-visual reveal">
              <span className="stamp">✓ Verified</span>
              <h3>Quality you can check.</h3>
              <p>Every pouch of Frunch Forest is licensed, labelled and packed to standard — so what you see is exactly what you get.</p>
              <div className="certs-badges">
                <span>FSSAI Licensed</span>
                <span>GST Registered</span>
                <span>No Preservatives</span>
                <span>Hygienically Packed</span>
              </div>
              <p className="certs-link"><Link to="/about#compliance">See our licence &amp; registration numbers →</Link></p>
            </div>
          </div>
        </section>
        <section id="faq">
          <span className="sec-line"></span>
          <div className="wrap">
            <div className="section-head reveal">
              <div className="eyebrow">Questions</div>
              <h2>Frequently asked<br />questions</h2>
              <p>Everything you need to know before you order. Can't find your answer? Reach out and we'll help directly.</p>
            </div>
            <div className="faq-list">
              {FAQS.map((item, i) => {
                const isOpen = openFaqIndex === i;
                return (
                  <div key={item.q} className={`faq-item reveal${isOpen ? ' open' : ''}`}>
                    <button
                      type="button"
                      className="faq-question"
                      aria-expanded={isOpen}
                      onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    >
                      <span>{item.q}</span>
                      <span className="faq-icon">+</span>
                    </button>
                    <div
                      className="faq-answer"
                      style={{ maxHeight: isOpen ? '800px' : '0' }}
                    >
                      <p>{item.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        <section id="contact" className="contact-form-section">
          <div className="cf-bg" aria-hidden="true">
            <div className="cf-bg-glow g1"></div>
            <div className="cf-bg-glow g2"></div>
            <div className="cf-bg-grain"></div>
          </div>
          <div className="wrap cf-wrap-outer">
            <div className="section-head reveal cf-head">
              <div className="eyebrow cf-eyebrow"><span className="dot"></span> Get in touch</div>
              <h2 className="cf-heading">Let's talk<em className="accent-serif gold-text">crunch</em></h2>
              <div className="cf-head-divider" aria-hidden="true"></div>
              <p className="cf-sub">Questions, bulk orders, gifting needs, or just want to say hi — drop us a line and we'll get back within 24 hours.</p>
            </div>

            <div className="contact-form-wrap reveal">
              <form action="https://api.web3forms.com/submit" method="POST" className="contact-form" id="contactForm">
                <input type="hidden" name="access_key" value="0e77d3ce-4a2f-48ea-82a9-f1211a3e2501" />
                <input type="hidden" name="subject" value="New enquiry — Frunch Forest website" />
                <input type="checkbox" name="botcheck" className="cf-honeypot" tabIndex="-1" autoComplete="off" />

                <div className="cf-row">
                  <div className="cf-field">
                    <label htmlFor="cfName">Full name</label>
                    <input type="text" id="cfName" name="name" placeholder="Your name" required />
                  </div>
                  <div className="cf-field">
                    <label htmlFor="cfEmail">Email address</label>
                    <input type="email" id="cfEmail" name="email" placeholder="you@example.com" required />
                  </div>
                </div>

                <div className="cf-field">
                  <label htmlFor="cfMessage">Message</label>
                  <textarea id="cfMessage" name="message" rows="5" placeholder="Tell us what you're looking for — bulk order, gifting, product query..." required></textarea>
                </div>

                <button type="submit" className="btn-primary cf-submit">
                  <span className="cf-submit-text">Send message</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="17" height="17"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </button>
                <p className="cf-status" id="cfStatus" role="status" aria-live="polite"></p>
              </form>

              <div className="contact-side-card">
                <span className="cf-side-mark">✦</span>
                <div className="cf-side-top">
                  <h3>Prefer to chat directly?</h3>
                  <p>Reach us on WhatsApp for the fastest response, especially for bulk and gifting orders.</p>
                  <a className="cf-whatsapp" href="https://wa.me/919582122419?text=Hi%20Frunch%20Forest%2C%20I%27d%20like%20to%20know%20more%20about%20your%20products." target="_blank" rel="noopener">
                    <svg viewBox="0 0 32 32" fill="currentColor" width="19" height="19"><path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.34.652 4.527 1.786 6.393L4 29l7.86-1.746A11.93 11.93 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.818a9.77 9.77 0 0 1-4.98-1.362l-.357-.213-4.66 1.035 1.005-4.55-.234-.372A9.76 9.76 0 0 1 5.182 15c0-5.966 4.856-10.818 10.822-10.818 5.965 0 10.818 4.852 10.818 10.818 0 5.966-4.853 10.818-10.818 10.818Zm5.938-8.109c-.325-.163-1.924-.95-2.222-1.058-.298-.109-.515-.163-.732.163-.217.325-.84 1.058-1.03 1.276-.19.217-.38.244-.705.081-.325-.163-1.372-.505-2.613-1.61-.966-.861-1.618-1.925-1.808-2.25-.19-.325-.02-.5.143-.663.146-.146.325-.38.488-.57.163-.19.217-.325.325-.542.108-.217.054-.407-.027-.57-.081-.163-.732-1.766-1.003-2.419-.264-.635-.532-.549-.732-.56-.19-.008-.407-.01-.624-.01-.217 0-.57.081-.868.407-.298.325-1.138 1.113-1.138 2.716 0 1.603 1.166 3.152 1.328 3.369.163.217 2.294 3.502 5.559 4.912.777.335 1.383.535 1.856.685.78.248 1.489.213 2.05.13.625-.093 1.924-.786 2.196-1.545.271-.759.271-1.41.19-1.545-.081-.136-.298-.217-.623-.38Z" /></svg>
                    Chat on WhatsApp
                  </a>
                </div>
                <div className="cf-side-divider"></div>
                <div className="cf-side-badges">
                  <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><polyline points="20 6 9 17 4 12"></polyline></svg>FSSAI Licensed</span>
                  <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><polyline points="20 6 9 17 4 12"></polyline></svg>GST Registered</span>
                  <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15"><polyline points="20 6 9 17 4 12"></polyline></svg>Pan-India Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </section>



      </main>

      <Footer />



      <a className="whatsapp-float" href="https://wa.me/919582122419?text=Hi%20Frunch%20Forest%2C%20I%27d%20like%20to%20know%20more%20about%20your%20products." target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
        <img src="https://cdn.simpleicons.org/whatsapp/FFFFFF" alt="" width="26" height="26" />
      </a>

      <button type="button" className="scroll-top-float" id="scrollTopBtn" aria-label="Back to top">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5"></path><path d="m5 12 7-7 7 7"></path></svg>
      </button>




    </>
  );
}

export default Home;
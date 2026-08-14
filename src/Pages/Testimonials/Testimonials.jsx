import { useEffect, useRef, useState } from 'react';
import './Testimonials.css';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import SEO from '../../components/SEO/SEO';

const WA_STORAGE_KEY = 'wa-float-pos-v2';
const SCROLL_TOP_THRESHOLD = 480;
const PRELOADER_FALLBACK_MS = 2500;

const PRELOADER_LETTERS = [
  { char: 'F', delay: '0s' },
  { char: 'r', delay: '.07s' },
  { char: 'u', delay: '.14s' },
  { char: 'n', delay: '.21s' },
  { char: 'c', delay: '.28s' },
  { char: 'h', delay: '.35s' },
  { char: '\u00A0', delay: '.46s' },
  { char: 'F', delay: '.53s' },
  { char: 'o', delay: '.6s' },
  { char: 'r', delay: '.67s' },
  { char: 'e', delay: '.74s' },
  { char: 's', delay: '.81s' },
  { char: 't', delay: '.88s' },
];

const FILTERS = [
  { key: 'all', label: 'All Reviews' },
  { key: 'family', label: 'Home & Family' },
  { key: 'corporate', label: 'Corporate & Bulk' },
  { key: 'gifting', label: 'Gifting & Events' },
];

const TESTIMONIALS = [
  {
    id: 't1',
    category: 'family',
    avatar: 'P',
    name: 'Priya Sharma',
    loc: 'Bengaluru, Karnataka',
    tag: 'Family',
    quote:
      'The almonds taste like they were roasted at home — genuinely fresh, and the pouch kept them crisp all the way from Delhi to Bengaluru.',
  },
  {
    id: 't2',
    category: 'corporate',
    avatar: 'R',
    name: 'Rohit Malhotra',
    loc: 'Gurugram, Haryana',
    tag: 'Corporate',
    quote:
      'We order the mixed nuts and fox nuts every month for the office pantry now. No weird aftertaste, no preservatives — just honest quality.',
  },
  {
    id: 't3',
    category: 'gifting',
    avatar: 'A',
    name: 'Anjali Verma',
    loc: 'New Delhi',
    tag: 'Gifting',
    quote:
      'Gifted the assorted box for Diwali and every single relative asked where it was from. The packaging alone felt premium.',
  },
  {
    id: 't4',
    category: 'corporate',
    avatar: 'S',
    name: 'Sanjeev Kumar',
    loc: 'Jaipur, Rajasthan',
    tag: 'Corporate',
    quote:
      "Cashews are consistently large and creamy, batch after batch. That consistency is rare — it's why we haven't switched suppliers.",
  },
  {
    id: 't5',
    category: 'family',
    avatar: 'N',
    name: 'Neha Kapoor',
    loc: 'Pune, Maharashtra',
    tag: 'Family',
    quote:
      'My kids actually ask for raisins and makhaana as snacks now instead of chips. Clean ingredients you can actually pronounce.',
  },
  {
    id: 't6',
    category: 'gifting',
    avatar: 'V',
    name: 'Vikram Singh',
    loc: 'Lucknow, Uttar Pradesh',
    tag: 'Events',
    quote:
      'Bulk ordered for a wedding function and the team was responsive, delivery was on time, and every pack was sealed perfectly.',
  },
];

// TODO: replace with your real shared header/footer components
// (originally injected into #site-header / #site-footer by nav-footer.js)
function SiteHeader() {
  return <div id="site-header" />;
}
function SiteFooter() {
  return <div id="site-footer" />;
}

export default function Testimonials() {
  const waButtonRef = useRef(null);
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [preloaderRemoved, setPreloaderRemoved] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [scrollTopVisible, setScrollTopVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Respect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const handler = (e) => setReduceMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Preloader: hide on window load, or after a fallback timeout
  useEffect(() => {
    let hidden = false;
    const hidePreloader = () => {
      if (hidden) return;
      hidden = true;
      setPreloaderDone(true);
      setTimeout(() => setPreloaderRemoved(true), 700);
    };
    if (document.readyState === 'complete') {
      hidePreloader();
    } else {
      window.addEventListener('load', hidePreloader);
    }
    const fallback = setTimeout(hidePreloader, PRELOADER_FALLBACK_MS);
    return () => {
      window.removeEventListener('load', hidePreloader);
      clearTimeout(fallback);
    };
  }, []);

  // Scroll-to-top button visibility
  useEffect(() => {
    let ticking = false;
    const update = () => {
      setScrollTopVisible(window.scrollY > SCROLL_TOP_THRESHOLD);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };
    update();
    document.addEventListener('scroll', onScroll, { passive: true });
    return () => document.removeEventListener('scroll', onScroll);
  }, []);

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  // Draggable WhatsApp float button (pointer devices only), remembered position
  useEffect(() => {
    const btn = waButtonRef.current;
    if (!btn) return;

    const isTouch = window.matchMedia('(hover:none), (pointer:coarse)').matches;
    if (isTouch) return;

    let dragging = false;
    let moved = false;
    let startX, startY, startLeft, startTop;

    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

    const applyPosition = (left, top) => {
      const rect = btn.getBoundingClientRect();
      const maxLeft = window.innerWidth - rect.width - 8;
      const maxTop = window.innerHeight - rect.height - 8;
      left = clamp(left, 8, Math.max(8, maxLeft));
      top = clamp(top, 8, Math.max(8, maxTop));
      btn.style.left = `${left}px`;
      btn.style.top = `${top}px`;
      btn.style.right = 'auto';
      btn.style.bottom = 'auto';
    };

    try {
      const saved = JSON.parse(localStorage.getItem(WA_STORAGE_KEY));
      if (saved && typeof saved.left === 'number' && typeof saved.top === 'number') {
        requestAnimationFrame(() => applyPosition(saved.left, saved.top));
      }
    } catch (e) {
      // ignore malformed storage
    }

    const onDragStart = (e) => e.preventDefault();

    const onPointerDown = (e) => {
      dragging = true;
      moved = false;
      const rect = btn.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      startLeft = rect.left;
      startTop = rect.top;
      btn.classList.add('dragging');
      btn.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
      if (moved) applyPosition(startLeft + dx, startTop + dy);
    };

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      btn.classList.remove('dragging');
      if (moved) {
        const rect = btn.getBoundingClientRect();
        try {
          localStorage.setItem(WA_STORAGE_KEY, JSON.stringify({ left: rect.left, top: rect.top }));
        } catch (err) {
          // ignore storage errors (e.g. private browsing)
        }
      }
    };

    const onClick = (e) => {
      if (moved) e.preventDefault();
    };

    const onResize = () => {
      if (btn.style.left && btn.style.top) {
        applyPosition(parseFloat(btn.style.left), parseFloat(btn.style.top));
      }
    };

    btn.addEventListener('dragstart', onDragStart);
    btn.addEventListener('pointerdown', onPointerDown);
    btn.addEventListener('pointermove', onPointerMove);
    btn.addEventListener('pointerup', endDrag);
    btn.addEventListener('pointercancel', endDrag);
    btn.addEventListener('click', onClick);
    window.addEventListener('resize', onResize);

    return () => {
      btn.removeEventListener('dragstart', onDragStart);
      btn.removeEventListener('pointerdown', onPointerDown);
      btn.removeEventListener('pointermove', onPointerMove);
      btn.removeEventListener('pointerup', endDrag);
      btn.removeEventListener('pointercancel', endDrag);
      btn.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Scroll-reveal with automatic stagger for elements grouped in the same parent
  useEffect(() => {
    const revealEls = Array.from(document.querySelectorAll('.reveal'));
    if (revealEls.length === 0) return;

    const revealGroups = new Map();
    revealEls.forEach((el) => {
      const parent = el.parentElement;
      if (!revealGroups.has(parent)) revealGroups.set(parent, 0);
      const idx = revealGroups.get(parent);
      if (!reduceMotion) {
        el.style.transitionDelay = `${Math.min(idx * 90, 450)}ms`;
      }
      revealGroups.set(parent, idx + 1);
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, [reduceMotion]);

  // Section-to-section scroll transition line
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('section, footer'));
    if (sections.length === 0) return;

    const sectionIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('sec-in');
            sectionIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );
    sections.forEach((sec) => sectionIO.observe(sec));

    return () => sectionIO.disconnect();
  }, []);

  return (
    <>
    <SEO
      title="Customer Testimonials"
      description="See what customers are saying about Frunch Forest's handpicked, natural dry fruits — real reviews on quality, freshness and delivery."
      path="/testimonials"
    />
    <Header />
      {!preloaderRemoved && (
        <div id="preloader" className={preloaderDone ? 'loaded' : ''}>
          <div className="preloader-inner">
            <div className="preloader-ring-wrap">
              <div className="preloader-ring" />
              <div className="preloader-ring ring2" />
              <img className="preloader-logo" src="./image/logo.png" alt="" />
            </div>
            <div className="preloader-word" aria-label="Frunch Forest">
              {PRELOADER_LETTERS.map((l, i) => (
                <span key={i} style={{ animationDelay: l.delay }}>
                  {l.char}
                </span>
              ))}
            </div>
            <div className="preloader-sub">crunch in every bite</div>
          </div>
        </div>
      )}

      <div className="progress-bar" id="progressBar" />

      <SiteHeader />

      <section className="page-hero">
        <span className="sec-line" />
        <div className="wrap">
          <div className="eyebrow">
            <span className="dot" /> 500+ happy families
          </div>
          <h1>
            Every review, <em className="accent-serif">unfiltered</em>
          </h1>
          <p>Real words from the families and businesses who keep coming back for another pack.</p>
        </div>
      </section>

      <section id="allTestimonials">
        <span className="sec-line" />
        <div className="wrap">
          <a className="back-link" href="/">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            Back to home
          </a>

          <div className="tm-featured reveal">
            <div className="tm-featured-side">
              <div className="tm-featured-avatar">A</div>
              <span className="stars">★★★★★</span>
              <span className="name">Anjali Verma</span>
              <span className="loc">New Delhi</span>
              <span className="tag">Gifting &amp; Events</span>
            </div>
            <div className="tm-featured-quote">
              <span className="quote-mark">&ldquo;</span>
              <p>
                Gifted the assorted box for Diwali and every single relative asked where it was
                from — the packaging alone felt premium.
              </p>
            </div>
          </div>

          <div className="tm-filters reveal" id="tmFilters">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`tm-filter${activeFilter === f.key ? ' active' : ''}`}
                onClick={() => setActiveFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="testimonial-grid" id="tmGrid">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                className={`testimonial-card reveal${
                  activeFilter !== 'all' && t.category !== activeFilter ? ' tm-hide' : ''
                }`}
              >
                <div className="tm-top-row">
                  <div className="stars">★★★★★</div>
                  <span className="tm-verified">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    Verified Buyer
                  </span>
                </div>
                <span className="quote-mark">&ldquo;</span>
                <p className="quote-text">{t.quote}</p>
                <div className="testimonial-who">
                  <div className="testimonial-avatar">{t.avatar}</div>
                  <div>
                    <span className="name">{t.name}</span>
                    <span className="loc">{t.loc}</span>
                  </div>
                  <span className="tm-cat-tag">{t.tag}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="testimonial-strip reveal">
            <div className="stat">
              <span className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </span>
              <span className="stat-text">
                <b>4.9★</b>
                <span>Average rating</span>
              </span>
            </div>
            <div className="stat">
              <span className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              <span className="stat-text">
                <b>500+</b>
                <span>Happy families</span>
              </span>
            </div>
            <div className="stat">
              <span className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="m17 2 4 4-4 4" />
                  <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                  <path d="m7 22-4-4 4-4" />
                  <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                </svg>
              </span>
              <span className="stat-text">
                <b>98%</b>
                <span>Repeat orders</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />

      <a
        className="whatsapp-float"
        ref={waButtonRef}
        href="https://wa.me/919582122419?text=Hi%20Frunch%20Forest%2C%20I%27d%20like%20to%20know%20more%20about%20your%20products."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <img src="https://cdn.simpleicons.org/whatsapp/FFFFFF" alt="" width={26} height={26} />
      </a>

      <button
        type="button"
        className={`scroll-top-float${scrollTopVisible ? ' visible' : ''}`}
        aria-label="Back to top"
        onClick={handleScrollTop}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5" />
          <path d="m5 12 7-7 7 7" />
        </svg>
      </button>
      <Footer />
    </>
  );
}
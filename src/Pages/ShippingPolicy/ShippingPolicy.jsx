import { useEffect, useRef, useState } from 'react';
import './ShippingPolicy.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import SEO from '../../components/SEO/SEO';

// TODO: replace these with your real shared header/footer components
// (originally injected into #site-header / #site-footer by nav-footer.js)
function SiteHeader() {
  return <div id="site-header" />;
}
function SiteFooter() {
  return <div id="site-footer" />;
}

const STORAGE_KEY = 'wa-float-pos-v2';
const SCROLL_TOP_THRESHOLD = 480;

export default function ShippingPolicy() {
  const waButtonRef = useRef(null);
  const [scrollTopVisible, setScrollTopVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Respect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const handler = (e) => setReduceMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
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

  // Draggable WhatsApp float button (pointer devices only) with remembered position
  useEffect(() => {
    const btn = waButtonRef.current;
    if (!btn) return;

    const isTouch = window.matchMedia('(hover:none), (pointer:coarse)').matches;
    // On touch devices, keep it pinned to its CSS position (bottom-right)
    // so it never drifts into the scroll-to-top button while scrolled.
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

    // Restore last dragged position, if any
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
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
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ left: rect.left, top: rect.top }));
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

  return (
    <>
      <SEO
        title="Shipping Policy"
        description="Read Frunch Forest's shipping policy — delivery timelines, charges and coverage across India for your dry fruits order."
        path="/shipping-policy"
      />
      {/*
        Fonts: move these <link> tags to your document head (index.html /
        _document.js) once, rather than per-page, to avoid re-fetching:
        Anton, Fraunces, JetBrains Mono, Manrope — see fonts.googleapis.com
      */}

      <Header />
      <div className="progress-bar" id="progressBar" />

      <SiteHeader />

      <main id="main">
        <section className="policy-hero">
          <div className="wrap">
            <span className="updated mono">Last updated: August 2026</span>
            <h1>
              Shipping <span className="accent-serif">Policy</span>
            </h1>
            <p className="lede">
              We pack every order with care and ship across India. Here&rsquo;s what to expect from
              checkout to doorstep.
            </p>
          </div>
        </section>

        <section className="policy-body">
          <div className="wrap">
            <h2>1. Where We Ship</h2>
            <p>
              We currently ship to <strong>all serviceable pin codes across India</strong> through our
              trusted courier partners. If your pin code isn&rsquo;t serviceable, you&rsquo;ll be
              notified at checkout.
            </p>

            <h2>2. Order Processing Time</h2>
            <p>
              Orders are freshly packed and typically handed over to our courier partner within{' '}
              <strong>1-2 business days</strong> of confirmation. Orders placed on Sundays or public
              holidays are processed the next business day.
            </p>

            <h2>3. Delivery Timelines</h2>
            <table className="rates">
              <tbody>
                <tr>
                  <th>Region</th>
                  <th>Estimated Delivery</th>
                </tr>
                <tr>
                  <td>Delhi NCR</td>
                  <td>1-3 business days</td>
                </tr>
                <tr>
                  <td>Rest of North India</td>
                  <td>2-4 business days</td>
                </tr>
                <tr>
                  <td>Rest of India</td>
                  <td>4-7 business days</td>
                </tr>
                <tr>
                  <td>Remote / hilly areas</td>
                  <td>7-10 business days</td>
                </tr>
              </tbody>
            </table>
            <p>
              These are estimates and can occasionally be affected by weather, courier delays, or
              regional restrictions beyond our control.
            </p>

            <h2>4. Shipping Charges</h2>
            <ul>
              <li>
                <strong>Free shipping</strong> on prepaid orders above ₹999.
              </li>
              <li>
                A flat shipping fee of <strong>₹79</strong> applies to orders below this value.
              </li>
              <li>
                Cash on Delivery (where available) carries an additional <strong>₹49</strong> COD
                handling fee.
              </li>
            </ul>
            <div className="note-box">
              These thresholds and fees are shown as a starting point — adjust them to match your
              actual courier rates before publishing.
            </div>

            <h2>5. Order Tracking</h2>
            <p>
              Once your order is dispatched, you&rsquo;ll receive a tracking link via email/SMS/WhatsApp.
              You can also reach out to us directly for a status update at any time.
            </p>

            <h2>6. Delays &amp; Failed Deliveries</h2>
            <p>
              If a delivery attempt fails due to an incorrect address, unavailability, or refusal at the
              doorstep, our courier partner will usually attempt redelivery. Orders undelivered after
              multiple attempts may be returned to us, in which case we&rsquo;ll get in touch to arrange
              redelivery (additional shipping charges may apply) or a refund as per our Return &amp;
              Refund Policy.
            </p>

            <h2>7. Damaged Packages</h2>
            <p>
              Please inspect your package on arrival. If it appears visibly damaged, we recommend
              recording an unboxing video and contacting us within 48 hours — see our{' '}
              <a href="/return-refund-policy">Return &amp; Refund Policy</a> for details.
            </p>

            <div className="contact-box">
              <h3>Questions about your shipment?</h3>
              <ul>
                <li>
                  Email: <a href="mailto:frunchforest@gmail.com">frunchforest@gmail.com</a>
                </li>
                <li>
                  Phone: <a href="tel:+919582122419">+91 95821 22419</a>
                </li>
                <li>Address: A-15, Ramesh Enclave, Kirari Suleman Nagar, New Delhi – 110086, India</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

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
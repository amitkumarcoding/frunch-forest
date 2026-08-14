import { useEffect, useRef, useState } from 'react';
import './TermsAndConditions.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import SEO from '../../components/SEO/SEO';

const WA_STORAGE_KEY = 'wa-float-pos-v2';
const SCROLL_TOP_THRESHOLD = 480;

export default function TermsAndConditions() {
  const mainRef = useRef(null);
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
    const root = mainRef.current;
    if (!root) return;
    const revealEls = Array.from(root.querySelectorAll('.reveal'));
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
        title="Terms & Conditions"
        description="Read the terms and conditions for using the Frunch Forest website and placing orders for natural dry fruits."
        path="/terms-and-conditions"
      />
      <Header />
      <div className="progress-bar" id="progressBar" />

      <div id="site-header" />

      <main id="main" ref={mainRef}>
        <section className="policy-hero">
          <div className="wrap">
            <span className="updated mono">Last updated: August 2026</span>
            <h1>
              Terms &amp; <span className="accent-serif">Conditions</span>
            </h1>
            <p className="lede">
              Please read these terms carefully before using our website or placing an order with
              Frunch Forest.
            </p>
          </div>
        </section>

        <section className="policy-body">
          <div className="wrap">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Frunch Forest website and placing an order, you agree to be
              bound by these Terms &amp; Conditions, along with our{' '}
              <a href="/privacy-policy">Privacy Policy</a>,{' '}
              <a href="/shipping-policy">Shipping Policy</a>, and{' '}
              <a href="/return-refund-policy">Return &amp; Refund Policy</a>.
            </p>

            <h2>2. About Us</h2>
            <p>
              Frunch Forest is an FSSAI-licensed, GST-registered business dealing in natural,
              handpicked dry fruits, based at A-15, Ramesh Enclave, Kirari Suleman Nagar, New Delhi
              – 110086, India.
            </p>

            <h2>3. Products &amp; Pricing</h2>
            <ul>
              <li>
                All product descriptions, weights, and images are provided as accurately as
                possible, though slight natural variation in colour, size, and shape is normal for
                whole/raw dry fruits.
              </li>
              <li>
                Prices listed are in Indian Rupees (₹) and are inclusive of applicable taxes unless
                stated otherwise.
              </li>
              <li>
                We reserve the right to modify prices, availability, or pack sizes at any time
                without prior notice.
              </li>
            </ul>

            <h2>4. Orders &amp; Payment</h2>
            <ul>
              <li>
                Placing an order constitutes an offer to purchase, which we may accept or decline
                at our discretion (for example, in cases of stock unavailability or pricing
                errors).
              </li>
              <li>
                We accept payments via the methods listed at checkout, including UPI, cards, net
                banking, and Cash on Delivery where available.
              </li>
              <li>
                An order is confirmed only once payment is successfully received (or, for COD
                orders, once the order is accepted).
              </li>
            </ul>

            <h2>5. Shipping &amp; Delivery</h2>
            <p>
              Shipping timelines, charges, and delivery terms are detailed in our{' '}
              <a href="/shipping-policy">Shipping Policy</a>.
            </p>

            <h2>6. Returns &amp; Refunds</h2>
            <p>
              Since our products are perishable food items, returns and refunds are handled per
              our <a href="/return-refund-policy">Return &amp; Refund Policy</a>.
            </p>

            <h2>7. Intellectual Property</h2>
            <p>
              All content on this website — including our logo, product photography, text, and
              design — is the property of Frunch Forest and may not be copied, reproduced, or used
              without our written permission.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              While we take great care in sourcing, packing, and shipping our products, Frunch
              Forest shall not be liable for indirect, incidental, or consequential damages
              arising from the use of our products or website, except where such liability cannot
              be excluded under Indian law.
            </p>

            <h2>9. Allergen &amp; Health Disclaimer</h2>
            <p>
              Our products are processed in a facility that also handles tree nuts and other
              allergens. Customers with allergies or specific health conditions should check
              product details carefully and consult a medical professional before consumption
              where needed.
            </p>

            <h2>10. Governing Law</h2>
            <p>
              These Terms &amp; Conditions are governed by the laws of India, and any disputes
              shall be subject to the exclusive jurisdiction of the courts in New Delhi.
            </p>

            <h2>11. Changes to These Terms</h2>
            <p>
              We may revise these Terms &amp; Conditions from time to time. Continued use of our
              website after changes are posted constitutes acceptance of the updated terms.
            </p>

            <div className="note-box">
              This is a general template and should be reviewed against India&rsquo;s Consumer
              Protection (E-Commerce) Rules, 2020, and other applicable laws before publishing.
            </div>

            <div className="contact-box">
              <h3>Questions about these terms?</h3>
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

      <div id="site-footer" />

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
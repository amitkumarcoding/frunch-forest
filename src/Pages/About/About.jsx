import { useEffect } from "react";
import "./About.css";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import SEO from "../../components/SEO/SEO";

export default function About() {
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
  }, []);

  // "our journey" timeline: line fills, marker travels as section scrolls into view
  useEffect(() => {
    const path = document.getElementById("journeyPath");
    const fill = document.getElementById("journeyFill");
    const marker = document.getElementById("journeyMarker");
    if (!path || !fill || !marker) return;

    let ticking = false;
    function update() {
      ticking = false;
      const rect = path.getBoundingClientRect();
      const vh = window.innerHeight;
      const startY = vh * 0.82;
      const endY = vh * 0.3;
      const span = (startY - endY) + rect.height;
      let progress = span > 0 ? (startY - rect.top) / span : 0;
      progress = Math.max(0, Math.min(1, progress));
      const usable = Math.max(rect.height - 12, 0);
      fill.style.height = `${progress * 100}%`;
      marker.style.top = `${6 + progress * usable}px`;
    }
    function onScrollOrResize() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }
    document.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    update();

    return () => {
      document.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  return (
    <>
      <SEO
        title="About Us"
        description="Learn how Frunch Forest sources handpicked, natural dry fruits — almonds, cashews, walnuts and more — with no preservatives and honest quality, from farm to your table."
        path="/about"
      />
      <Header />
      <main id="main">
        <section id="about-hero" style={{ paddingTop: 150 }}>
          <div className="wrap">
            <div className="section-head reveal">
              <div className="eyebrow">About Frunch Forest</div>
              <h2>Our story, our process</h2>
              <p>Everything that goes into getting natural, hygienically processed dry fruits from the forest to your table.</p>
            </div>
          </div>
        </section>

        <section id="about">
          <span className="sec-line"></span>
          <div className="wrap about-grid">
            <div className="about-art reveal">
              <img src="/image/aboutus/about-us.png" alt="Frunch Forest" />
              <div className="about-float-badge">
                <span className="icon-ring">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 6v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6l-8-4Z"></path><path d="m9 12 2 2 4-4"></path></svg>
                </span>
                <span className="label"><strong>100% Natural</strong><span>No additives, ever</span></span>
              </div>
              <div className="about-art-fade"></div>
              <div className="card mono">frunchforest.in — est. 2025</div>
            </div>
            <div className="about-copy reveal">
              <div className="eyebrow">Our Story</div>
              <p className="cap">"Good dry fruits shouldn't be a gamble — you should know exactly what's in the pack, where it came from, and how fresh it is."</p>
              <p>That's the standard we hold every batch to. The dry fruits market is full of packs that look premium on the shelf but say little about sourcing, freshness, or how long they've sat in storage. We built Frunch Forest to close that gap — working directly with trusted growers and putting every lot through the same checks before it's cleared to ship.</p>
              <p>It's also why we don't stop at "handpicked." Freshness has to survive the journey too, so we seal each pack the moment it's ready and keep the cold chain honest from our facility to your door — for a family in a metro apartment or a business ordering in bulk, all the way across India.</p>

              <div className="about-stats">
                <div className="about-stat"><b className="gold-text">5+</b><span>Years of Trust</span></div>
                <div className="about-stat"><b className="gold-text">10k+</b><span>Happy Customers</span></div>
                <div className="about-stat"><b className="gold-text">50+</b><span>Premium Products</span></div>
              </div>

              <div className="about-features">
                <div className="about-feature"><span className="check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>Direct relationships with growers</div>
                <div className="about-feature"><span className="check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>No preservatives, no shortcuts</div>
                <div className="about-feature"><span className="check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>Freshness checked, not assumed</div>
                <div className="about-feature"><span className="check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>Answerable to every customer, directly</div>
              </div>

              <div className="about-actions">
                <a className="btn-primary" href="/#products">Shop Now →</a>
                <span className="signature">— Team Frunch Forest</span>
              </div>
            </div>
          </div>
        </section>

        <section id="compliance">
          <span className="sec-line"></span>
          <div className="wrap">
            <div className="section-head reveal">
              <div className="eyebrow">Packaging &amp; Certifications</div>
              <h2>Quality you can check</h2>
              <p>Every pouch of Frunch Forest is licensed, labelled and packed to standard — so what you see is exactly what you get.</p>
            </div>
            <div className="certs-visual reveal" style={{ maxWidth: 520, margin: "0 auto" }}>
              <span className="stamp">✓ Verified</span>
              <div className="certs-badges">
                <span>FSSAI Licensed</span>
                <span>GST Registered</span>
                <span>No Preservatives</span>
                <span>Hygienically Packed</span>
              </div>
              <div className="certs-numbers">
                <div className="certs-numbers-title">Certifications &amp; Compliance</div>
                <dl>
                  <div className="row"><dt>FSSAI License No.</dt><dd>23325001005101</dd></div>
                  <div className="row"><dt>GSTIN</dt><dd>07IVZPM4999G1Z9</dd></div>
                </dl>
              </div>
            </div>
          </div>
        </section>

        <section id="farm-journey">
          <span className="sec-line"></span>
          <div className="wrap">
            <div className="section-head reveal">
              <div className="eyebrow">Our Journey</div>
              <h2>From the source to your doorstep</h2>
              <p>Every pouch carries a story of care — from sourcing to quality checks, processing, packing, and final delivery.</p>
            </div>
            <div className="journey-path" id="journeyPath">
              <div className="journey-track"></div>
              <div className="journey-fill" id="journeyFill"></div>
              <div className="journey-marker" id="journeyMarker" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 16V6a1 1 0 0 1 1-1h9l4 4h3a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2"></path><circle cx="7" cy="17" r="2"></circle><circle cx="17" cy="17" r="2"></circle></svg>
              </div>
              <div className="journey-step reveal">
                <div className="journey-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c4-1 7-5 7-10 0-3-2-6-7-8-5 2-7 5-7 8 0 5 3 9 7 10Z"></path><path d="M12 14V6"></path></svg>
                </div>
                <span className="journey-num">01 — Sourced</span>
                <h3>Carefully selected suppliers</h3>
                <p>We begin with trusted sources so the journey starts with quality, consistency, and respect for the produce.</p>
              </div>
              <div className="journey-step reveal">
                <div className="journey-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"></circle><path d="m21 21-4.3-4.3"></path><path d="m8.5 11 2 2 4-4"></path></svg>
                </div>
                <span className="journey-num">02 — Quality Checked</span>
                <h3>Every batch inspected</h3>
                <p>Each lot is reviewed for freshness, cleanliness, and standards before it moves forward.</p>
              </div>
              <div className="journey-step reveal">
                <div className="journey-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"></path></svg>
                </div>
                <span className="journey-num">03 — Hygienically Processed</span>
                <h3>Cleaned &amp; sorted</h3>
                <p>The product is carefully prepared and sorted to preserve its natural goodness and texture.</p>
              </div>
              <div className="journey-step reveal">
                <div className="journey-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"></path><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>
                </div>
                <span className="journey-num">04 — Packed</span>
                <h3>Sealed for freshness</h3>
                <p>We seal every pack to protect quality and keep the experience as fresh as possible.</p>
              </div>
              <div className="journey-step reveal">
                <div className="journey-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 16V6a1 1 0 0 1 1-1h9l4 4h3a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2"></path><circle cx="7" cy="17" r="2"></circle><circle cx="17" cy="17" r="2"></circle></svg>
                </div>
                <span className="journey-num">05 — Delivered</span>
                <h3>From Frunch Forest to your doorstep</h3>
                <p>The final step is simple: bringing premium dry fruits to homes across India with care and consistency.</p>
              </div>
            </div>
            <div className="journey-final reveal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0L12 5.34l-.77-.76a5.4 5.4 0 0 0-7.65 0 5.4 5.4 0 0 0 0 7.65l.77.76L12 21l7.65-7.99.77-.76a5.4 5.4 0 0 0 0-7.65Z"></path></svg>
              <span>One continuous journey — from forest to your family's table.</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ALLOWED_ADMINS } from "../../utils/admins";
import "./Header.css";

// Matches the actual file location in /public — it's served from the
// root, not /resources. (Was previously pointing at a path that 404'd.)
const catalog = "/frunch-forest-catalog.pdf";

export function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

// `route: true` entries are real pages and use React Router's <Link>
// (client-side nav, no full reload). The "/#section" entries jump to an
// anchor on the home page — those stay as plain <a> tags on purpose:
// browsers natively scroll to a matching id on load, which is simpler
// and more reliable here than teaching React Router to scroll-restore
// a hash after a route change.
const navLinks = [
  { label: "About", href: "/about", route: true },
  { label: "Why Us", href: "/#why" },
  { label: "Products", href: "/products", route: true },
  { label: "Reviews", href: "/#testimonials" },
  { label: "FAQ", href: "/#faq" },
  { label: "Blog", href: "/blog", route: true },
  { label: "Contact", href: "/#contact" },
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authLabel, setAuthLabel] = useState("Log in");
  const [authHref, setAuthHref] = useState("/login");

  useEffect(() => {
    const onScroll = () => {
      document.getElementById("siteHeader")?.classList.toggle(
        "scrolled",
        window.scrollY > 20
      );

      const progressBar = document.getElementById("progressBar");
      if (progressBar) {
        const h = document.documentElement;
        const max = h.scrollHeight - h.clientHeight;
        progressBar.style.width =
          `${max > 0 ? (h.scrollTop / max) * 100 : 0}%`;
      }
    };

    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => document.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  useEffect(() => {
    let unsubscribe;

    async function setupAuth() {
      try {
        const [{ onAuthStateChanged }, { auth }] = await Promise.all([
          import("firebase/auth"),
          import("../../services/firebase"),
        ]);
        unsubscribe = onAuthStateChanged(auth, (user) => {
          if (!user) {
            setAuthLabel("Log in");
            setAuthHref("/login");
            return;
          }

          if (ALLOWED_ADMINS.includes(user?.email)) {
            setAuthLabel("Hi, Admin");
            setAuthHref("/admin");
            return;
          }

          const rawLabel = (user.displayName || "My account").split(" ")[0];
          const label =
            rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);

          setAuthLabel(`Hi, ${label}`);
          setAuthHref("/account");
        });
      } catch (error) {
        console.warn("Auth-aware nav unavailable:", error);
      }
    }

    setupAuth();
    return () => unsubscribe?.();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header id="siteHeader">
        <div className="nav">
          <Link className="nav-brand" to="/" aria-label="Frunch Forest — home">
            <span className="brand-mark">
              <img src="/image/logo.png" alt="" width="80" height="80" />
            </span>
            <span className="brand-lockup">
              <span className="brand-name">Frunch Forest</span>
              <span className="brand-tag">Natural Dry Fruits</span>
            </span>
          </Link>

          <nav className="nav-links">
            {navLinks.map(({ label, href, route }) =>
              route ? (
                <Link key={label} to={href}>{label}</Link>
              ) : (
                <a key={label} href={href}>{label}</a>
              )
            )}
          </nav>

          <div className="nav-actions">
            <a className="btn-download" href={catalog} download>
              <DownloadIcon />
              Download Catalog
            </a>
            <Link className="nav-cta" to={authHref}>{authLabel}</Link>
          </div>

          <button
            className={`nav-burger ${menuOpen ? "open" : ""}`}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="mobileMenu"
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span className="burger-line" />
            <span className="burger-line" />
            <span className="burger-line" />
          </button>
        </div>
      </header>

      <div
        className={`mobile-menu-backdrop ${menuOpen ? "open" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <nav
        className={`mobile-menu ${menuOpen ? "open" : ""}`}
        id="mobileMenu"
        aria-hidden={!menuOpen}
      >
        <button
          className="mobile-menu-close"
          onClick={closeMenu}
          aria-label="Close menu"
        >
          ✕
        </button>

        <div className="mobile-menu-links">
          {navLinks.map(({ label, href, route }, index) =>
            route ? (
              <Link key={label} to={href} onClick={closeMenu}>
                <span className="mm-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {label}
              </Link>
            ) : (
              <a key={label} href={href} onClick={closeMenu}>
                <span className="mm-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {label}
              </a>
            )
          )}
        </div>

        <div className="mobile-menu-actions">
          <a className="btn-download" href={catalog} download onClick={closeMenu}>
            <DownloadIcon />
            Download Catalog
          </a>
          <Link className="btn-download" to={authHref} onClick={closeMenu}>
            {authLabel}
          </Link>
          <a className="btn-primary" href="#contact" onClick={closeMenu}>
            Get in touch →
          </a>
        </div>
      </nav>
    </>
  );
}

export default Header;

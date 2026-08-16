import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// React Router (v6+) doesn't restore/reset scroll position on navigation —
// clicking a Link while scrolled down keeps that same scroll offset on the
// new page. Most noticeable on the "You may also like" related-product
// cards: click one from deep in that section and you land on the new
// product's page still scrolled to roughly the same spot, not its hero.
//
// Several links also point at a hash target on another page — e.g.
// ProductDetails' "Products" breadcrumb and "View full range" button both
// go to `/#products` (the showcase section on Home). A plain scrollTo(0,0)
// on every navigation stomps on that: it'd dump you at the very top of
// Home instead of the section the link promised. So: hash present → scroll
// to that element once it exists; otherwise scroll to top as before.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    const id = hash.slice(1);
    let attempts = 0;
    let raf;

    // The destination route's content — including the anchor target —
    // usually commits in the same render pass, but some sections (e.g.
    // ones waiting on Firestore data) can mount a beat later, so retry
    // briefly rather than giving up after one missed frame.
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }
      attempts += 1;
      if (attempts < 20) {
        raf = requestAnimationFrame(tryScroll);
      } else {
        window.scrollTo(0, 0);
      }
    };
    raf = requestAnimationFrame(tryScroll);

    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);

  return null;
}


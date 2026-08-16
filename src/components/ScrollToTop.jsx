import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// React Router (v6+) doesn't restore/reset scroll position on navigation —
// clicking a Link while scrolled down keeps that same scroll offset on the
// new page. Most noticeable on the "You may also like" related-product
// cards: click one from deep in that section and you land on the new
// product's page still scrolled to roughly the same spot, not its hero.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

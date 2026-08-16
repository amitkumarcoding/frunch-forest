import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Plain browsers scroll to a matching #id automatically on a full page
// load, but React Router's client-side navigation skips that step. This
// re-adds it for links like <Link to="/about#compliance">, run after
// the new page's content has painted so the target element exists.
export default function ScrollToHash() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    const timer = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => clearTimeout(timer);
  }, [hash, pathname]);

  return null;
}

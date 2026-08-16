import { useEffect, useRef, useState } from "react";
import SEO from "../../components/SEO/SEO";
import "./Login.css";

export default function LoginPage() {
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState("");
  const [progress, setProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const emailRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const h = document.documentElement;
      setProgress((h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100);
    };
    onScroll();
    document.addEventListener("scroll", onScroll, { passive: true });
    return () => document.removeEventListener("scroll", onScroll);
  }, []);

  const isAdmin = role === "admin";

  async function handleSubmit(e) {
    e.preventDefault();
    if (isAdmin) return;
    setSubmitting(true);
    setStatusType("");
    setStatus("Signing in…");
    try {
      const { loginUser } = await import("../../services/firebaseAuth.js");
      await loginUser({ email: email.trim(), password });
      setStatusType("ok");
      setStatus("Login successful — redirecting…");
      setTimeout(() => {
        window.location.href = "/account";
      }, 700);
    } catch (err) {
      setSubmitting(false);
      const { friendlyAuthError } = await import("../../services/firebaseAuth.js");
      setStatusType("err");
      setStatus(friendlyAuthError(err));
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    const target = email.trim() || prompt("Enter your account email:") || "";
    if (!target) return;
    setStatusType("");
    setStatus("Sending reset link…");
    try {
      const { resetPassword } = await import("../../services/firebaseAuth.js");
      await resetPassword(target);
      setStatusType("ok");
      setStatus("Reset link sent — check your inbox.");
    } catch (err) {
      const { friendlyAuthError } = await import("../../services/firebaseAuth.js");
      setStatusType("err");
      setStatus(friendlyAuthError(err));
    }
  }

  function handleGoogleAdmin() {
    setStatusType("ok");
    setStatus("Opening Gmail sign-in…");
    window.location.href = "/admin";
  }

  return (
    <>
      <SEO
        title="Login"
        description="Log in to your Frunch Forest account."
        path="/login"
        noindex
      />
      <div className="progress-bar" style={{ width: `${progress}%` }} />

      <header id="siteHeader" className={scrolled ? "scrolled" : ""}>
        <div className="nav">
          <a className="nav-brand" href="/" aria-label="Frunch Forest — home">
            <span className="brand-mark">
              <img src="/image/logo.png" alt="" width={80} height={80} />
            </span>
            <span className="brand-lockup">
              <span className="brand-name">Frunch Forest</span>
              <span className="brand-tag">Natural Dry Fruits</span>
            </span>
          </a>
          <nav className="nav-links">
            <a href="/">Home</a>
            <a href="/products">Products</a>
            <a href="/#why">Why Us</a>
            <a href="/#faq">FAQ</a>
            <a href="/#contact">Contact</a>
          </nav>
          <div className="nav-actions">
            <a className="nav-cta" href="/register">Create account</a>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="auth-section">
          <div className="auth-bg" aria-hidden="true">
            <div className="auth-glow g1" />
            <div className="auth-glow g2" />
            <div className="auth-grain" />
          </div>
          <div className="wrap auth-wrap">
            <div className="auth-card">
              <div className="auth-visual">
                <div className="auth-brand">
                  <img src="/image/logo.png" alt="" />
                  <span>Frunch Forest</span>
                </div>
                <div>
                  <h2>
                    Welcome back
                    <em>crunch in every bite</em>
                  </h2>
                  <p>Sign in to track orders, save your favourite packs and reorder in a couple of taps.</p>
                  <div className="auth-perks">
                    <div className="auth-perk">
                      <span className="dot">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><rect x={1} y={7} width={14} height={10} /><path d="M15 10h4l3 3v4h-7" /><circle cx={5.5} cy={18.5} r={1.8} /><circle cx={17.5} cy={18.5} r={1.8} /></svg>
                      </span>
                      Track every order in real time
                    </div>
                    <div className="auth-perk">
                      <span className="dot">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><circle cx={12} cy={12} r={10} /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 6v2m0 8v2" /></svg>
                      </span>
                      Saved pricing for bulk and gifting
                    </div>
                    <div className="auth-perk">
                      <span className="dot">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></svg>
                      </span>
                      Secure, FSSAI-registered account
                    </div>
                  </div>
                </div>
              </div>

              <div className="auth-form-side">
                <div className="role-toggle" role="tablist" aria-label="Login as">
                  <button type="button" className={!isAdmin ? "active" : ""} role="tab" aria-selected={!isAdmin} onClick={() => setRole("user")}>
                    Login as user
                  </button>
                  <button type="button" className={isAdmin ? "active" : ""} role="tab" aria-selected={isAdmin} onClick={() => setRole("admin")}>
                    Login as admin
                  </button>
                </div>

                <div className="auth-heading">
                  <div className="eyebrow">
                    <span className="dot" /> <span>{isAdmin ? "Admin login" : "Customer login"}</span>
                  </div>
                  <h1>{isAdmin ? "Sign in to the admin console" : "Sign in to your account"}</h1>
                  <p>{isAdmin ? "Continue with your Gmail account to manage the store." : "Enter your details to continue shopping."}</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                  {!isAdmin && (
                    <div id="userFields">
                      <div className="af-field">
                        <label htmlFor="loginEmail">Email address</label>
                        <input
                          ref={emailRef}
                          type="email"
                          id="loginEmail"
                          name="email"
                          placeholder="you@example.com"
                          autoComplete="username"
                          required={!isAdmin}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="af-field">
                        <label htmlFor="loginPassword">Password</label>
                        <div className="af-input-wrap">
                          <input
                            type={showPw ? "text" : "password"}
                            id="loginPassword"
                            name="password"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required={!isAdmin}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            className="af-toggle-eye"
                            aria-label={showPw ? "Hide password" : "Show password"}
                            onClick={() => setShowPw((v) => !v)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" /><circle cx={12} cy={12} r={3} /></svg>
                          </button>
                        </div>
                      </div>
                      <div className="af-row">
                        <label className="af-remember">
                          <input type="checkbox" name="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me
                        </label>
                        <a href="#" onClick={handleForgot}>Forgot password?</a>
                      </div>
                      <button type="submit" className="af-submit" disabled={submitting}>
                        <span>Log in</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={17} height={17}><line x1={5} y1={12} x2={19} y2={12} /><polyline points="12 5 19 12 12 19" /></svg>
                      </button>
                    </div>
                  )}

                  {isAdmin && (
                    <>
                      <button type="button" className="google-btn" onClick={handleGoogleAdmin}>
                        <svg width={18} height={18} viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z" /><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z" /><path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z" /><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z" /></svg>
                        <span>Continue with Gmail</span>
                      </button>
                      <p className="af-hint" style={{ textAlign: "center", marginTop: 2 }}>
                        Admin sign-in is restricted to @gmail.com accounts.
                      </p>
                    </>
                  )}

                  <p className={`af-status${statusType ? ` ${statusType}` : ""}`} role="status" aria-live="polite">
                    {status}
                  </p>
                </form>

                {!isAdmin && (
                  <div>
                    <div className="af-divider">or</div>
                    <p className="af-switch">
                      New to Frunch Forest? <a href="/register">Create an account</a>
                    </p>
                  </div>
                )}
                {isAdmin && (
                  <div>
                    <div className="af-divider">note</div>
                    <p className="af-admin-note">
                      Admin access is provisioned by the Frunch Forest team and requires a Gmail address. Contact{" "}
                      <a href="mailto:frunchforest@gmail.com" style={{ color: "var(--gold-1)" }}>frunchforest@gmail.com</a> if you need an account.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="siteFooter" style={{ background: "var(--forest-dark)", padding: "28px 0" }}>
        <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "rgba(243,236,224,0.5)", fontSize: "0.82rem" }}>© 2026 Frunch Forest. All rights reserved.</span>
        </div>
      </footer>
    </>
  );
}
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import { registerUser, friendlyAuthError } from "../../services/firebaseAuth";
import "./Register.css"

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { name, phone, email, password, confirm } = form;

    if (password !== confirm) {
      setStatus({ type: "err", text: "Passwords don't match." });
      return;
    }

    setSubmitting(true);
    setStatus({ type: "", text: "Creating your account…" });

    try {
      await registerUser({ name: name.trim(), phone: phone.trim(), email: email.trim(), password });
      setStatus({ type: "ok", text: "Account created — redirecting…" });
      setTimeout(() => navigate("/account"), 900);
    } catch (err) {
      console.error("Registration failed:", err);
      setSubmitting(false);
      if (err?.code === "auth/email-already-in-use") {
        setStatus({ type: "err", text: "exists" });
      } else {
        setStatus({ type: "err", text: friendlyAuthError(err) });
      }
    }
  }

  return (
    <>
      <Header />
      <main id="main">
        <section className="auth-section">
          <div className="auth-bg" aria-hidden="true">
            <div className="auth-glow g1"></div>
            <div className="auth-glow g2"></div>
            <div className="auth-grain"></div>
          </div>
          <div className="wrap auth-wrap">
            <div className="auth-card">
              <div className="auth-visual">
                <div className="auth-brand">
                  <img src="/image/logo.png" alt="" />
                  <span>Frunch Forest</span>
                </div>
                <div>
                  <h2>Join the forest<em>crunch in every bite</em></h2>
                  <p>Create an account to check out faster, track orders and unlock pricing for bulk and gifting.</p>
                  <div className="auth-perks">
                    <div className="auth-perk">
                      <span className="dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M20 6 9 17l-5-5"></path></svg></span>
                      Faster checkout, saved addresses
                    </div>
                    <div className="auth-perk">
                      <span className="dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M20 6 9 17l-5-5"></path></svg></span>
                      Order history and reorder in a tap
                    </div>
                    <div className="auth-perk">
                      <span className="dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M20 6 9 17l-5-5"></path></svg></span>
                      Early access to new products
                    </div>
                  </div>
                </div>
              </div>

              <div className="auth-form-side">
                <div className="auth-heading">
                  <div className="eyebrow"><span className="dot"></span> Create account</div>
                  <h1>Start your Frunch Forest account</h1>
                  <p>Takes less than a minute — no card required.</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                  <div className="af-row2">
                    <div className="af-field">
                      <label htmlFor="regName">Full name</label>
                      <input type="text" id="regName" name="name" placeholder="Your name" required autoComplete="name" value={form.name} onChange={handleChange} />
                    </div>
                    <div className="af-field">
                      <label htmlFor="regPhone">Phone number</label>
                      <input type="tel" id="regPhone" name="phone" placeholder="98765 43210" required autoComplete="tel" value={form.phone} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="af-field">
                    <label htmlFor="regEmail">Email address</label>
                    <input type="email" id="regEmail" name="email" placeholder="you@example.com" required autoComplete="email" value={form.email} onChange={handleChange} />
                  </div>

                  <div className="af-row2">
                    <div className="af-field">
                      <label htmlFor="regPassword">Password</label>
                      <div className="af-input-wrap">
                        <input
                          type={showPw ? "text" : "password"}
                          id="regPassword"
                          name="password"
                          placeholder="Create a password"
                          required
                          minLength={8}
                          autoComplete="new-password"
                          value={form.password}
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          className="af-toggle-eye"
                          aria-label={showPw ? "Hide password" : "Show password"}
                          onClick={() => setShowPw((v) => !v)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                      </div>
                      <span className="af-hint">At least 8 characters</span>
                    </div>
                    <div className="af-field">
                      <label htmlFor="regConfirm">Confirm password</label>
                      <input type="password" id="regConfirm" name="confirm" placeholder="Re-enter password" required minLength={8} autoComplete="new-password" value={form.confirm} onChange={handleChange} />
                    </div>
                  </div>

                  <label className="af-terms">
                    <input type="checkbox" required checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                    <span>I agree to the <Link to="/terms-and-conditions">Terms &amp; Conditions</Link> and <Link to="/privacy-policy">Privacy Policy</Link>.</span>
                  </label>

                  <button type="submit" className="af-submit" disabled={submitting}>
                    <span>Create account</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="17" height="17"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>

                  <p className={`af-status${status.type ? ` ${status.type}` : ""}`} role="status" aria-live="polite">
                    {status.text === "exists" ? (
                      <>An account with this email already exists. <Link to="/login" style={{ color: "var(--gold-1)", fontWeight: 700 }}>Log in instead</Link></>
                    ) : (
                      status.text
                    )}
                  </p>
                </form>

                <div className="af-divider">or</div>
                <p className="af-switch">Already have an account? <Link to="/login">Log in</Link></p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
import { useEffect } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import SEO from "../../components/SEO/SEO";
import "./PrivacyPolicy.css"

export default function PrivacyPolicy() {
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <SEO
        title="Privacy Policy"
        description="Read Frunch Forest's privacy policy to understand how we collect, use and protect your personal information."
        path="/privacy-policy"
      />
      <Header />
      <main id="main">
        <section className="policy-hero">
          <div className="wrap">
            <span className="updated mono">Last updated: August 2026</span>
            <h1>Privacy <span className="accent-serif">Policy</span></h1>
            <p className="lede">Your trust matters to us. Here's what information we collect, why we collect it, and how we keep it safe.</p>
          </div>
        </section>

        <section className="policy-body">
          <div className="wrap">

            <h2>1. Information We Collect</h2>
            <p>When you browse our website or place an order, we may collect:</p>
            <ul>
              <li><strong>Contact details</strong> — name, phone number, email address, and delivery address.</li>
              <li><strong>Order information</strong> — items purchased, order value, and order history.</li>
              <li><strong>Payment information</strong> — processed securely by our payment gateway partners; we do not store your card, UPI, or banking details on our own servers.</li>
              <li><strong>Technical data</strong> — browser type, device information, and pages visited, via cookies and similar technologies.</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <ul>
              <li>To process, pack, and deliver your orders.</li>
              <li>To communicate order updates, tracking details, and respond to your queries.</li>
              <li>To send promotional offers and updates — only where you've opted in, and you can unsubscribe at any time.</li>
              <li>To improve our website, products, and customer experience.</li>
              <li>To meet legal, tax, and regulatory requirements.</li>
            </ul>

            <h2>3. Sharing of Information</h2>
            <p>We do not sell your personal information. We share limited data only with:</p>
            <ul>
              <li><strong>Courier and logistics partners</strong>, to deliver your order.</li>
              <li><strong>Payment gateway providers</strong>, to process transactions securely.</li>
              <li><strong>Analytics and communication tools</strong> (e.g. email/WhatsApp providers), to support day-to-day operations.</li>
              <li>Government or regulatory authorities, where required by law.</li>
            </ul>

            <h2>4. Cookies</h2>
            <p>Our website uses cookies to remember your preferences, understand site usage, and improve performance. You can disable cookies in your browser settings, though some site features may not work as intended.</p>

            <h2>5. Data Security</h2>
            <p>We use reasonable technical and organisational safeguards to protect your personal information from unauthorised access, alteration, or disclosure. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>

            <h2>6. Your Rights</h2>
            <p>You can request access to, correction of, or deletion of your personal data at any time by contacting us at <a href="mailto:frunchforest@gmail.com">frunchforest@gmail.com</a>. We'll respond to reasonable requests within a reasonable timeframe.</p>

            <h2>7. Third-Party Links</h2>
            <p>Our website may contain links to third-party sites (such as social media). We are not responsible for the privacy practices of those external sites.</p>

            <h2>8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time to reflect changes in our practices. The "Last updated" date at the top of this page will always reflect the most recent revision.</p>

            <div className="note-box">This policy is provided as a general template for a small e-commerce business and should be reviewed against India's IT Act, 2000, the DPDP Act, 2023, and any other applicable regulations before publishing.</div>

            <div className="contact-box">
              <h3>Questions about your data?</h3>
              <ul>
                <li>Email: <a href="mailto:frunchforest@gmail.com">frunchforest@gmail.com</a></li>
                <li>Phone: <a href="tel:+919582122419">+91 95821 22419</a></li>
                <li>Address: A-15, Ramesh Enclave, Kirari Suleman Nagar, New Delhi – 110086, India</li>
              </ul>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
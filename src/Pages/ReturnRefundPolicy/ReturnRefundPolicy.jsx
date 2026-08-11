import { useEffect } from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import "./ReturnRefundPolicy.css"

export default function ReturnRefundPolicy() {
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
      <Header />
      <main id="main">
        <section className="policy-hero">
          <div className="wrap">
            <span className="updated mono">Last updated: August 2026</span>
            <h1>Return &amp; <span className="accent-serif">Refund</span> Policy</h1>
            <p className="lede">Because we sell fresh, perishable food, our return process works a little differently from ordinary retail — here's exactly how it works.</p>
          </div>
        </section>

        <section className="policy-body">
          <div className="wrap">

            <h2>1. Our Approach to Returns</h2>
            <p>As all Frunch Forest products are natural, perishable food items, we <strong>do not accept returns for reasons of taste preference or change of mind</strong> once an order has been dispatched. We do, however, stand fully behind the quality and safety of what we ship, and will make it right if something goes wrong.</p>

            <h2>2. When You're Eligible for a Replacement or Refund</h2>
            <p>You can request a replacement or refund if:</p>
            <ul>
              <li>The product arrives <strong>damaged, spoiled, or spilled</strong> in transit.</li>
              <li>You received the <strong>wrong item</strong> or an incorrect quantity/pack size.</li>
              <li>The product is found to be <strong>expired or near expiry</strong> at the time of delivery.</li>
              <li>The packaging has been <strong>tampered with</strong> or is not sealed.</li>
            </ul>

            <div className="note-box">
              <strong>Please note:</strong> All claims must be raised within <strong>48 hours of delivery</strong> and be supported by clear photos (and, where possible, an unboxing video) of the product and its packaging. Claims raised after this window may not be honoured.
            </div>

            <h2>3. How to Request a Return or Refund</h2>
            <p>Reach out to us with your order number and photo/video evidence via:</p>
            <ul>
              <li>Email: <a href="mailto:frunchforest@gmail.com">frunchforest@gmail.com</a></li>
              <li>Phone / WhatsApp: <a href="https://wa.me/919582122419">+91 95821 22419</a></li>
            </ul>
            <p>Our team typically responds within 24-48 business hours with the next steps.</p>

            <h2>4. Refund Process</h2>
            <p>Once your claim is approved:</p>
            <ul>
              <li>We will either dispatch a <strong>free replacement</strong> of the same item, or process a <strong>full/partial refund</strong>, based on your preference and product availability.</li>
              <li>Refunds are issued to your <strong>original payment method</strong> (or bank account, for COD orders) within <strong>7-10 business days</strong> of approval.</li>
              <li>You will receive a confirmation email/message once the refund has been initiated.</li>
            </ul>

            <h2>5. Non-Returnable Situations</h2>
            <ul>
              <li>Products that have been opened, used, or consumed (unless the defect itself is the reason for the claim).</li>
              <li>Delays or issues caused by an incorrect address provided by the customer.</li>
              <li>Minor variations in colour, size, or shape natural to whole/raw dry fruits — these are not considered defects.</li>
            </ul>

            <h2>6. Order Cancellations</h2>
            <p>Orders can be cancelled free of charge as long as they haven't been dispatched yet. Once an order is out for delivery, it can no longer be cancelled, though you may refuse delivery at your doorstep, after which our standard refund process will apply.</p>

            <div className="contact-box">
              <h3>Need help with an order?</h3>
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

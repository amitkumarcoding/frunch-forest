import "./Footer.css";

const footerLinks = {
  "Quick Links": [
    ["About", "/about"],
    ["Why Us", "/#why"],
    ["Products", "/products"],
    ["Packaging", "/#packaging"],
    ["Reviews", "/#testimonials"],
    ["FAQ", "/#faq"],
    ["Blog", "/blog"],
  ],
  "Our Products": [
    ["Almonds", "/products"],
    ["Cashews", "/products"],
    ["Walnuts", "/products"],
    ["Raisins", "/products"],
    ["Fox Nuts (Makhaana)", "/products"],
  ],
  Policies: [
    ["Return & Refund Policy", "/return-refund-policy"],
    ["Shipping Policy", "/shipping-policy"],
    ["Privacy Policy", "/privacy-policy"],
    ["Terms & Conditions", "/terms-and-conditions"],
  ],
};

const socials = [
  ["Instagram", "https://www.instagram.com/frunchforest", "instagram"],
  ["Facebook", "https://www.facebook.com/share/18dqsVznoS/", "facebook"],
  ["Threads", "https://www.threads.com/@frunchforest", "threads"],
  ["YouTube", "https://youtube.com/@frunchforest", "youtube"],
  ["X (Twitter)", "https://x.com/frunchforest", "x"],
];

const catalog = "/frunch-forest-catalog.pdf";
const whatsapp =
  "https://wa.me/919582122419?text=Hi%20Frunch%20Forest%2C%20I%27d%20like%20to%20know%20more%20about%20your%20products.";

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 6c0-1.1-.9-2-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6Z" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21l1.65-4.95A9 9 0 1 1 8.05 19.35Z" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Zm0 0c0 2 2 4.5 4 5m1-.5a.5.5 0 0 1-.5.5H13" />
    </svg>
  );
}

const socialIconPaths = {
  instagram:
    "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
  facebook:
    "M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z",
  threads:
    "M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.014v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717-1.334 1.66-2.023 4.049-2.052 7.107.029 3.06.718 5.45 2.052 7.109 1.43 1.781 3.63 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.617 1.618-3.604 1.09-4.798-.31-.705-.873-1.29-1.634-1.72-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.732 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.75-2.964-.065-1.19.408-2.285 1.33-3.082.883-.762 2.127-1.199 3.6-1.264 1.041-.046 2.023.008 2.921.16-.12-.732-.365-1.313-.732-1.734-.502-.576-1.288-.87-2.334-.874h-.028c-.844 0-1.992.234-2.72 1.316l-1.73-1.17c.98-1.454 2.578-2.256 4.497-2.256h.028c3.19.019 5.08 1.964 5.271 5.371.11.048.219.099.325.153 1.478.752 2.564 1.892 3.14 3.297.798 1.937.869 5.09-1.723 7.64-1.912 1.883-4.24 2.73-7.545 2.756z",
  youtube:
    "M23.498 6.186a2.994 2.994 0 0 0-2.107-2.117C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.391.524A2.994 2.994 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.994 2.994 0 0 0 2.107 2.117c1.886.524 9.391.524 9.391.524s7.505 0 9.391-.524a2.994 2.994 0 0 0 2.107-2.117C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.75 15.568V8.432L15.818 12l-6.068 3.568z",
  x: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
};

function SocialIcon({ icon }) {
  const d = socialIconPaths[icon];
  if (!d) return null;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16.5 9.4 7.5 4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="M3.27 6.96 12 12.01l8.73-5.05" />
      <path d="M12 22.08V12" />
    </svg>
  );
}

const footerBadges = [
  { label: "FSSAI Licensed", Icon: ShieldCheckIcon },
  { label: "GST Registered", Icon: FileTextIcon },
  { label: "No Preservatives", Icon: LeafIcon },
  { label: "Hygienically Packed", Icon: PackageIcon },
];

function Footer() {
  return (
    <footer id="siteFooter">
      <span className="sec-line" />

      <div className="wrap">
        <div className="footer-newsletter reveal">
          <div className="footer-newsletter-copy">
            <h3>Questions before you order?</h3>
            <p>
              Our team is happy to help — reach out on whichever channel is
              easiest for you.
            </p>
          </div>

          <div className="footer-quick-contact">
            <a className="footer-quick-contact-item" href="tel:+919582122419">
              <span className="icon-dot"><PhoneIcon /></span>
              <span className="footer-quick-contact-text">
                <span className="k mono">Call</span>
                <span>+91 95821 22419</span>
              </span>
            </a>

            <a className="footer-quick-contact-item" href="mailto:frunchforest@gmail.com">
              <span className="icon-dot"><MailIcon /></span>
              <span className="footer-quick-contact-text">
                <span className="k mono">Email</span>
                <span>frunchforest@gmail.com</span>
              </span>
            </a>

            <a
              className="footer-quick-contact-item"
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="icon-dot"><WhatsAppIcon /></span>
              <span className="footer-quick-contact-text">
                <span className="k mono">WhatsApp</span>
                <span>Chat with us</span>
              </span>
            </a>
          </div>
        </div>

        <div className="footer-top">
          <div className="footer-col footer-about">
            <div className="footer-brand">
              <img
                className="footer-logo-anim"
                style={{ height: "44px", width: "auto", objectFit: "contain" }}
                src="/image/logo.png"
                alt="Frunch Forest Logo"
              />
              <div>
                <span className="name">Frunch Forest</span>
                <span className="tag">crunch in every bite</span>
              </div>
            </div>

            <p>
              Handpicked, farm-fresh dry fruits — no preservatives, no
              shortcuts. Packed with care and shipped across India for
              families and businesses alike.
            </p>

            <div className="social-links">
              {socials.map(([label, href, icon]) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                >
                  <SocialIcon icon={icon} />
                </a>
              ))}
            </div>
          </div>

          <div className="footer-link-groups">
            {Object.entries(footerLinks).map(([heading, links]) => (
              <div className="footer-col" key={heading}>
                <h4>{heading}</h4>
                <ul className="footer-links">
                  {links.map(([label, href]) => (
                    <li key={label}>
                      <a href={href}>{label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="footer-col footer-contact-card">
            <h4>Get In Touch</h4>

            <ul className="footer-contact-list">
              <li>
                <span className="k mono">Phone</span>
                <a href="tel:+919582122419">+91 95821 22419</a>
              </li>
              <li>
                <span className="k mono">Email</span>
                <a href="mailto:frunchforest@gmail.com">
                  frunchforest@gmail.com
                </a>
              </li>
              <li>
                <span className="k mono">Catalog</span>
                <a href={catalog} target="_blank" rel="noopener noreferrer">
                  Download our catalog
                </a>
              </li>
              <li>
                <span className="k mono">Address</span>
                <span className="addr">
                  A-15, Ramesh Enclave, Kirari Suleman Nagar, New Delhi –
                  110086, India
                </span>
              </li>
            </ul>

            <a className="btn-primary" href="mailto:frunchforest@gmail.com">
              Email us →
            </a>
          </div>
        </div>

        <div className="footer-badges reveal">
          {footerBadges.map(({ label, Icon }) => (
            <span key={label}>
              <span className="icon-dot"><Icon /></span>
              {label}
            </span>
          ))}
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <span>© 2026 Frunch Forest. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}


export default Footer;
import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import emailjs from "@emailjs/browser";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Container,
  Cog,
  Droplets,
  Factory,
  Fan,
  Grid3x3,
  Headphones,
  Layers,
  Mail,
  MapPin,
  Menu,
  Package,
  Phone,
  Plug,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { products, categories } from "./products.js";
import { wholesaleProducts } from "./wholesaleProducts.js";
import "./wholesale.css";
import "./styles.css";

// Set to true to show the retail rate on each product card. Wholesale rates are never shown on the site.
const SHOW_RETAIL_PRICE = false;
// How many products to show before the "Show more" button.
const PAGE_SIZE = 12;

// Business contact details (from the Shiv Manufacturing visiting card). Update the email before publishing.
const COMPANY = {
  owners: [
    {
      name: "Samadhan Mahajan",
      role: "Proprietor",
      phone: "+91 98601 54751",
      phoneLink: "+919860154751",
      whatsapp: "919975684751",
    },
    {
      name: "Mahesh Mahajan",
      role: "Proprietor",
      phone: "+91 90221 56321",
      phoneLink: "+919022156321",
      whatsapp: "919022156321",
    },
  ],
  phone: "+91 98601 54751",
  phoneLink: "+919860154751",
  email: "shivmanufacturingcompany2023@gmail.com",
  address:
    "Behind Spartav Plaza, Yawal – Chopda Road, near Sarvajanik Vidyalaya, Adavad, Tal. Chopda, Dist. Jalgaon",
  addressMr:
    "स्पार्तव प्लाझा च्या मागे, यावल - चोपडा रोड, सार्वजनिक विद्यालय, अडावद ता. चोपडा जि. जळगाव",
  mapLink:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Shiv Manufacturing Company, Adavad, Chopda, Jalgaon"),
  gst: "27HKRPM0666J1ZF",
  hours: "Monday – Saturday, 9:00 AM – 9:00 PM",
};

// Normalize text to make product search flexible
const normalizeSearchText = (value = "") => {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
};
// Icon shown on a product card when it has no photo / illustration yet.
const CATEGORY_ICONS = {
  Motors: Cog,
  "Fan Bladess": Fan,
  Pumps: Droplets,
  "Cooler Bodies": Package,
  "Cooler Tanks": Container,
  "Grass Pads": Grid3x3,
  "Cooler Accessories": Layers,
  "Wires & Leads": Plug,
  Claims: Wrench,
  "Ceiling Fans": Fan,
};
const fmtPrice = (n) => `₹${n.toLocaleString("en-IN")}`;

function Logo() {
  return (
    <a className="brand" href="#home" aria-label="Shiv Manufacturing home">
      <span className="brand-mark">
        <span>S</span>
      </span>
      <span className="brand-name">
        Shiv<small>Manufacturing</small>
      </span>
    </a>
  );
}
function ProductArt({ src, name, category }) {
  const Icon = CATEGORY_ICONS[category] || Package;
  return (
    <div className="product-art">
      {src ? (
        <img src={src} alt={name} loading="lazy" />
      ) : (
        <span className="product-art-icon" role="img" aria-label={name}>
          <Icon size={54} strokeWidth={1.4} />
        </span>
      )}
    </div>
  );
}
function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("");
  const [sent, setSent] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const filtered = useMemo(() => {
    const q = normalizeSearchText(search);

    return products.filter((p) => {
      const matchesCategory =
        activeCategory === "All Products" || p.category === activeCategory;

      // Combine all searchable product information
      const searchableText = normalizeSearchText(
        [p.name, p.code, p.category, p.description, ...(p.specs || [])].join(
          " "
        )
      );

      const matchesSearch = !q || searchableText.includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);
  const shown = filtered.slice(0, visible);

  const groupedProducts = useMemo(
    () =>
      categories
        .slice(1)
        .map((c) => [c, products.filter((p) => p.category === c)]),
    []
  );

  const pickCategory = (c) => {
    setActiveCategory(c);
    setVisible(PAGE_SIZE);
  };

  const changeSearch = (v) => {
    setSearch(v);
    setVisible(PAGE_SIZE);
  };

  const closeMenu = () => setMenuOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    const data = new FormData(form);

    const name = data.get("name");
    const phone = data.get("phone");
    const email = data.get("email") || "Not provided";
    const product = data.get("product") || "General enquiry";
    const message = data.get("message");

    // Prepare enquiry details
    const enquiryMessage = `
New Enquiry - Shiv Manufacturing

Name: ${name}
Phone: ${phone}
Email: ${email}
Product: ${product}

Message:
${message}
  `.trim();

    // Open WhatsApp with pre-filled enquiry
    const whatsappNumber = COMPANY.owners[0].whatsapp;

    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
      enquiryMessage
    )}`;

    // Open before awaiting email to avoid popup blockers
    window.open(whatsappURL, "_blank", "noopener,noreferrer");

    setSubmitting(true);
    setError("");
    setSent(false);

    try {
      // Send email automatically
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: name,
          phone: phone,
          from_email: email,
          product: product,
          message: message,
        },
        {
          publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
        }
      );

      setSent(true);
      form.reset();
      setSelected("");
    } catch (err) {
      console.error("Email sending failed:", err);
      setError("Email could not be sent. Please contact us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToEnquiryForm = () => {
  const contactSection = document.getElementById("contact");
  const enquiryForm = document.querySelector(".contact-form");

  if (window.innerWidth <= 768) {
    // Mobile: scroll directly to the enquiry form
    enquiryForm?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  } else {
    // Desktop: scroll to the contact section
    contactSection?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};

 return (
    <>
      <header className="header">
        <div className="nav-wrap">
          <Logo />
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
          <nav className={menuOpen ? "nav open" : "nav"}>
            <a href="#home" onClick={closeMenu}>
              Home
            </a>
            <a href="#products" onClick={closeMenu}>
              Products
            </a>
            <a href="#wholesale" onClick={closeMenu}>
              Wholesale
            </a>
            <a href="#about" onClick={closeMenu}>
              About Us
            </a>
            <a href="#why-us" onClick={closeMenu}>
              Why Choose Us
            </a>
            <a href="#contact" onClick={closeMenu}>
              Contact
            </a>
          </nav>
          <a className="nav-call" href={`tel:${COMPANY.phoneLink}`}>
            <Phone size={16} /> <span>Call Us</span>
          </a>
        </div>
      </header>

      <main>
        {/* ================= HERO ================= */}
        <section className="hero" id="home">
          <div className="hero-shape shape-one" />
          <div className="hero-inner">
            <div className="hero-copy">
              <div className="eyebrow">
                <span /> MANUFACTURER • SUPPLIER • WHOLESALER
              </div>
              <h1>
                We make it.
                <br />
                <em>We supply it.</em>
              </h1>
              <p className="hero-sub">
                Shiv Manufacturing Company manufactures cooling components and
                also supplies a wide range of fans and home appliances to
                households, dealers and bulk buyers.
              </p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#products">
                  Explore Products <ArrowRight size={17} />
                </a>
                <a className="btn btn-outline" href="#wholesale">
                  Dealer &amp; Bulk Rates
                </a>
              </div>
              <div className="hero-proof">
                <span>
                  <CheckCircle2 /> Own manufacturing
                </span>
                <span>
                  <CheckCircle2 /> Wide supply range
                </span>
                <span>
                  <CheckCircle2 /> Dealer-friendly pricing
                </span>
              </div>

            </div>

            {/* <div className="hero-visual">
              <div className="visual-glow" />
              {wholesaleProducts.slice(0, 3).map((p, i) => (
                <div
                  key={p.id}
                  className={`hero-product hero-photo ${
                    ["hero-fan", "hero-motor", "hero-cooler"][i]
                  }`}
                >
                  <img src={p.image} alt={p.name} />
                </div>
              ))}
              <div className="floating-note">
                <span className="note-icon">
                  <ShieldCheck />
                </span>
                <span>
                  <b>Made with care</b>
                  <small>Quality in every detail</small>
                </span>
              </div>
            </div> */}
          </div>
          <div className="hero-bottom-line" />
        </section>

        {/* ================= PRODUCTS ================= */}
        <section className="products-section section" id="products">
          <div className="section-heading">
            <div className="eyebrow centered">OUR PRODUCT RANGE</div>
            <h2>
              Made by us. <em>Supplied by us.</em>
            </h2>
            <p>
              Explore the components we manufacture and the appliances we
              supply.
            </p>
          </div>
          <div className="catalog-tools">
            <div className="category-tabs">
              {categories.map((c) => (
                <button
                  key={c}
                  className={activeCategory === c ? "active" : ""}
                  onClick={() => pickCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <label className="search-box">
              <Search size={18} />
              <input
                value={search}
                onChange={(e) => changeSearch(e.target.value)}
                placeholder="Search name, size or code..."
                aria-label="Search products"
              />
              {search && (
                <button
                  onClick={() => changeSearch("")}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </label>
          </div>
          <p className="result-count" aria-live="polite">
            Showing {shown.length} of {filtered.length} product
            {filtered.length === 1 ? "" : "s"}
          </p>
          <div className="product-grid">
            {shown.map((p) => (
              <article className="product-card" key={p.code}>
                <div className="product-card-top">
                  <span className="product-number">{p.code}</span>
                  <span className="product-category">{p.category}</span>
                </div>
                <ProductArt src={p.image} name={p.name} category={p.category} />
                <div className="product-info">
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  {p.specs.length > 0 && (
                    <div className="spec-list">
                      {p.specs.map((sp) => (
                        <span key={sp}>{sp}</span>
                      ))}
                    </div>
                  )}
                  {SHOW_RETAIL_PRICE && (
                    <div className="product-price">
                      {p.retail ? fmtPrice(p.retail) : "Price on request"}
                    </div>
                  )}
                  <button
                    className="text-link"
                    onClick={() => {
                      setSelected(`${p.name} (${p.code})`);
                      setTimeout(() => {
                        scrollToEnquiryForm();
                      }, 100);
                    }}
                  >
                    Enquire about this <ArrowUpRight size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
          {filtered.length > visible && (
            <div className="load-more">
              <button
                className="btn btn-outline"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
              >
                Show more products <ChevronDown size={16} />
              </button>
            </div>
          )}
          {filtered.length === 0 && (
            <div className="empty-state">
              No products found. Try another search or category.
            </div>
          )}
          <div className="catalog-note">
            <Sparkles />
            <span>
              <b>Need a specific size or specification?</b> Talk to our team
              about product availability and bulk requirements.
            </span>
            <a href="#contact">
              Ask our team <ArrowRight size={16} />
            </a>
          </div>
        </section>

        {/* ================= WHOLESALE ================= */}
        <section className="wholesale-section section" id="wholesale">
          <div className="wholesale-banner">
            <div className="wholesale-kicker">
              DEALER • DISTRIBUTOR • BULK BUYER
            </div>
            <h2>
              More products. <em>Better wholesale value.</em>
            </h2>
            <p>
              Stock your store with trusted fans and home appliances from Shiv
              Manufacturing Company. Attractive bulk quotations, dependable
              support and a growing product range.
            </p>
            <a className="btn btn-primary" href="#contact">
              Get Wholesale Rates <ArrowRight size={17} />
            </a>
            <span className="wholesale-promise">
              WHOLESALE ENQUIRIES WELCOME · ADAVAD, JALGAON
            </span>
          </div>

          <div className="section-heading wholesale-heading">
            <div className="eyebrow centered">NEW WHOLESALE COLLECTION</div>
            <h2>
              Everyday appliances, <em>business-ready prices.</em>
            </h2>
            <p>
              Explore the latest additions. Contact us for current stock,
              dealer rates and bulk-order quotations.
            </p>
          </div>

          <div className="wholesale-grid">
            {wholesaleProducts.map((p) => (
              <article className="wholesale-card" key={p.id}>
                <div className="wholesale-image-wrap">
                  <img src={p.image} alt={p.name} loading="lazy" />
                  <span className="wholesale-tag">WHOLESALE</span>
                </div>
                <div className="wholesale-card-content">
                  <span className="wholesale-category">{p.category}</span>
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  <div className="wholesale-models">
                    {p.models.map((model) => (
                      <span key={model}>{model}</span>
                    ))}
                  </div>
                  {p.offerNote && (
                    <small className="wholesale-offer-note">
                      {p.offerNote}
                    </small>
                  )}
                  <div className="wholesale-card-bottom">
                    <strong>Wholesale price on enquiry</strong>
                    <button
                      className="text-link"
                      onClick={() => {
                        setSelected(`${p.name} (Wholesale enquiry)`);
                        setTimeout(scrollToEnquiryForm, 100);
                      }}
                    >
                      Get a bulk quote <ArrowUpRight size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="wholesale-cta">
            <div>
              <b>Planning a bulk purchase?</b>
              <span>
                Share your required models and quantity. Our team will help
                with the latest wholesale quotation.
              </span>
            </div>
            <a className="btn btn-dark" href="#contact">
              Enquire Now <ArrowRight size={17} />
            </a>
          </div>
        </section>

        {/* ================= ABOUT ================= */}
        <section className="about-section section" id="about">
          <div className="about-image">
            <div className="about-image-inner">
              <div className="factory-illustration">
                <Factory size={76} />
                <span>
                  SHIV
                  <br />
                  MANUFACTURING
                </span>
              </div>
              <div className="image-caption">
                <span>BUILT ON TRUST</span>
                <b>Quality that works hard.</b>
              </div>
            </div>
            <div className="about-stamp">
              <ShieldCheck />
              <span>
                Committed to
                <br />
                quality
              </span>
            </div>
          </div>
          <div className="about-copy">
            <div className="eyebrow">ABOUT SHIV MANUFACTURING</div>
            <h2>
              Manufacturing quality.
              <br />
              <em>Supplying with confidence.</em>
            </h2>
            <p>
              At Shiv Manufacturing, our focus is on delivering dependable
              cooling products and components that meet practical, everyday
              requirements. We believe in consistent quality, thoughtful
              workmanship and building long-term relationships with our
              customers.
            </p>
            <p>
              We manufacture fan blades, cooler motors, bodies and pumps, and
              we also supply fans and home appliances to retailers, dealers and
              bulk buyers, so you can source from one trusted place.
            </p>
            <a className="btn btn-dark" href="#contact">
              Connect with us <ArrowRight size={17} />
            </a>
          </div>
        </section>

        {/* ================= WHY US ================= */}
        <section className="why-section" id="why-us">
          <div className="section section-inner">
            <div className="section-heading">
              <div className="eyebrow centered">THE SHIV ADVANTAGE</div>
              <h2>
                A partner you can <em>count on.</em>
              </h2>
              <p>
                We keep the essentials simple: reliable products, responsive
                service and a focus on your needs.
              </p>
            </div>
            <div className="benefits">
              <div className="benefit">
                <span>
                  <ShieldCheck />
                </span>
                <h3>Quality Focus</h3>
                <p>
                  Careful attention to product quality and dependable
                  performance.
                </p>
              </div>
              <div className="benefit">
                <span>
                  <Wrench />
                </span>
                <h3>Product Know-how</h3>
                <p>
                  Hands-on manufacturing experience across cooling components
                  and appliances.
                </p>
              </div>
              <div className="benefit">
                <span>
                  <Zap />
                </span>
                <h3>Reliable Supply</h3>
                <p>Responsive coordination for product and bulk enquiries.</p>
              </div>
              <div className="benefit">
                <span>
                  <Headphones />
                </span>
                <h3>Customer Support</h3>
                <p>Friendly assistance to help you find the right product.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CONTACT ================= */}
        <section className="contact-section" id="contact">
          <div className="contact-bg-mark">S</div>
          <div className="contact-inner">
            <div className="contact-copy">
              <div className="eyebrow light">LET'S WORK TOGETHER</div>
              <h2>
                Have a requirement?
                <br />
                <em>Let's talk.</em>
              </h2>
              <p>
                Tell us what you need. Our team will be happy to help with
                product details, availability and quotations.
              </p>
              <div className="contact-details">
                {COMPANY.owners.map((o) => (
                  <div className="owner-row" key={o.phoneLink}>
                    <span>
                      <Phone />
                    </span>
                    <div>
                      <small>{o.role.toUpperCase()} · CALL OR WHATSAPP</small>
                      <b>{o.name}</b>
                      <div className="owner-actions">
                        <a href={`tel:${o.phoneLink}`}>{o.phone}</a>
                        <a
                          href={`https://wa.me/${o.whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
                <a href={`mailto:${COMPANY.email}`}>
                  <span>
                    <Mail />
                  </span>
                  <div>
                    <small>EMAIL US</small>
                    <b>{COMPANY.email}</b>
                  </div>
                </a>
                <a
                  href={COMPANY.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>
                    <MapPin />
                  </span>
                  <div>
                    <small>VISIT US</small>
                    <b>{COMPANY.address}</b>
                    <em className="address-mr" lang="mr">
                      {COMPANY.addressMr}
                    </em>
                  </div>
                </a>
                <div>
                  <span>
                    <ShieldCheck />
                  </span>
                  <div>
                    <small>GST NUMBER</small>
                    <b>{COMPANY.gst}</b>
                  </div>
                </div>
              </div>
              <div className="hours">
                <span className="hours-dot" /> {COMPANY.hours}
              </div>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-heading">
                <div>
                  <span>ENQUIRY FORM</span>
                  <h3>Send us a message</h3>
                </div>
                <Send />
              </div>
              <div className="form-grid">
                <label>
                  Your name *
                  <input name="name" required placeholder="Enter your name" />
                </label>
                <label>
                  Phone number *
                  <input
                    name="phone"
                    required
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    minLength={10}
                    pattern="[6-9][0-9]{9}"
                    title="Enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9."
                    placeholder="Enter 10-digit mobile number"
                    onChange={(e) => {
                      e.target.value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                    }}
                  />
                </label>
                <label>
                  Email address
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                  />
                </label>
                <label>
                  Product interested in
                  <select
                    name="product"
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                  >
                    <option value="">Select a product</option>
                    {selected &&
                      !products.some(
                        (p) => `${p.name} (${p.code})` === selected
                      ) && <option value={selected}>{selected}</option>}
                    {groupedProducts.map(([c, list]) => (
                      <optgroup key={c} label={c}>
                        {list.map((p) => (
                          <option key={p.code} value={`${p.name} (${p.code})`}>
                            {p.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <option>Other / General enquiry</option>
                  </select>
                </label>
                <label className="full">
                  Your message *
                  <textarea
                    name="message"
                    required
                    rows="4"
                    placeholder="Tell us about your requirement, quantity or specifications..."
                  />
                </label>
              </div>
              <button
                className="btn btn-orange submit-btn"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Sending..." : "Send Enquiry"}
                <ArrowRight size={17} />
              </button>

              {sent && (
                <p className="form-hint">
                  Your enquiry email has been sent successfully! Please send the
                  pre-filled WhatsApp message as well.
                </p>
              )}

              {error && (
                <p className="form-hint" style={{ color: "red" }}>
                  {error}
                </p>
              )}
              <p className="privacy-note">
                Your details will only be used to respond to your enquiry.
              </p>
            </form>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="footer">
        <div className="footer-main">
          <Logo />
          <p>
            Manufacturing and supplying fans, coolers and home appliances
            <br />
            with quality at the centre.
          </p>
          <div className="footer-links">
            <a href="#home">Home</a>
            <a href="#products">Products</a>
            <a href="#wholesale">Wholesale</a>
            <a href="#about">About Us</a>
            <a href="#contact">Contact</a>
          </div>
          <a className="back-top" href="#home">
            Back to top ↑
          </a>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Shiv Manufacturing. All rights
            reserved.
          </span>
          <span>Designed for quality. Built for trust.</span>
        </div>
      </footer>

      <a
        className="floating-call"
        href={`tel:${COMPANY.phoneLink}`}
        aria-label="Call Shiv Manufacturing"
      >
        <Phone size={20} />
      </a>
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

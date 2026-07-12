import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { services, features, testimonials, footerLinks } from '../data/constants';

export function HomePage({ onNavigate, theme, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-page">
      {/* ── Navbar ─────────────────────── */}
      <nav className="navbar">
        <div className="navbar-inner">
          <a href="#" className="navbar-logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <span className="navbar-logo-icon">✦</span>
            Serenity Wellness
          </a>

          <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
            <button className="nav-link" onClick={() => scrollTo('home-services')}>Services</button>
            <button className="nav-link" onClick={() => scrollTo('home-features')}>Why Us</button>
            <button className="nav-link" onClick={() => scrollTo('home-testimonials')}>Testimonials</button>
            <button className="nav-link" onClick={() => scrollTo('home-contact')}>Contact</button>
            <div className="nav-actions-mobile">
              <button className="btn btn-primary" onClick={() => onNavigate('login')}>Get Started</button>
              <button className="btn btn-ghost" onClick={() => onNavigate('login')}>Sign In</button>
            </div>
          </div>

          <div className="navbar-actions">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <button className="btn btn-ghost nav-desktop" onClick={() => onNavigate('login')}>Sign In</button>
            <button className="btn btn-primary nav-desktop" onClick={() => onNavigate('login')}>Get Started</button>
            <button
              className={`hamburger ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────── */}
      <section className="home-hero">
        <div className="home-hero-bg">
          <div className="home-hero-bg-shape shape-1" />
          <div className="home-hero-bg-shape shape-2" />
          <div className="home-hero-bg-shape shape-3" />
        </div>
        <div className="home-hero-content">
          <p className="eyebrow">Serenity Wellness</p>
          <h1>Your journey to<br />relaxation begins here</h1>
          <p className="home-hero-text">
            Discover a sanctuary of wellness where expert care meets tranquil luxury.
            Book premium salon and massage services tailored to your needs.
          </p>
          <div className="home-hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => onNavigate('login')}>
              Book an Appointment
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => scrollTo('home-services')}>
              Explore Services
            </button>
          </div>
          <div className="home-hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">15+</span>
              <span className="hero-stat-label">Years Experience</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">50K+</span>
              <span className="hero-stat-label">Happy Clients</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">4.9★</span>
              <span className="hero-stat-label">Average Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────── */}
      <section className="home-section" id="home-features">
        <div className="home-section-inner">
          <div className="section-heading centered">
            <p className="eyebrow">Why Choose Us</p>
            <h2>Elevate your wellness experience</h2>
            <p className="section-subtitle">
              We combine expert care with a serene environment to give you the ultimate relaxation.
            </p>
          </div>
          <div className="features-grid">
            {features.map((f) => (
              <div className="feature-card" key={f.title}>
                <span className="feature-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ────────────────────── */}
      <section className="home-section home-section-alt" id="home-services">
        <div className="home-section-inner">
          <div className="section-heading centered">
            <p className="eyebrow">Our Treatments</p>
            <h2>Premium care, every time</h2>
            <p className="section-subtitle">
              From therapeutic massages to rejuvenating facials, find your perfect treatment.
            </p>
          </div>
          <div className="home-services-grid">
            {services.slice(0, 4).map((s) => (
              <div className="home-service-card" key={s.title}>
                <div className="home-service-body">
                  <h3>{s.title}</h3>
                  <p>{s.time}</p>
                </div>
                <div className="home-service-footer">
                  <span className="home-service-price">{s.price}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="centered" style={{ marginTop: 32 }}>
            <button className="btn btn-primary" onClick={() => onNavigate('login')}>
              View All Services
            </button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────── */}
      <section className="home-section" id="home-testimonials">
        <div className="home-section-inner">
          <div className="section-heading centered">
            <p className="eyebrow">Testimonials</p>
            <h2>What our clients say</h2>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t) => (
              <div className="testimonial-card" key={t.name}>
                <div className="testimonial-stars">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>
                <p className="testimonial-text">"{t.text}"</p>
                <span className="testimonial-author">— {t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────── */}
      <section className="home-cta">
        <div className="home-cta-inner">
          <h2>Ready to unwind?</h2>
          <p>Book your appointment today and experience true relaxation.</p>
          <button className="btn btn-primary btn-lg" onClick={() => onNavigate('login')}>
            Get Started Now
          </button>
        </div>
      </section>

      {/* ── Footer ───────────────────────── */}
      <footer className="home-footer" id="home-contact">
        <div className="home-footer-inner">
          <div className="footer-brand">
            <h3>✦ Serenity Wellness</h3>
            <p>Your sanctuary for relaxation and rejuvenation. Premium salon and massage services in a tranquil setting.</p>
            <div className="footer-social">
              <span>📸</span>
              <span>📘</span>
              <span>🐦</span>
              <span>📌</span>
            </div>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            {footerLinks.map((link) => (
              <button key={link.label} className="footer-link" onClick={() => { scrollTo(link.href.slice(1)); }}>
                {link.label}
              </button>
            ))}
          </div>
          <div className="footer-hours">
            <h4>Hours</h4>
            <p>Mon–Fri: 9am – 7pm</p>
            <p>Saturday: 10am – 6pm</p>
            <p>Sunday: Closed</p>
          </div>
          <div className="footer-contact">
            <h4>Contact</h4>
            <p>123 Wellness Ave.</p>
            <p>Serenity City, SC 90210</p>
            <p>(555) 123-4567</p>
            <p>hello@serenitywellness.com</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Serenity Wellness. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// frontend/src/components/AstroServices.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AstroServices.css';
import KundaliTool from '../components/astro/KundaliTool';
import HoroscopeTool from '../components/astro/HoroscopeTool';

/* ── Decorative SVG: Temple arch / Kalash motif ── */
const TempleArch = ({ color = '#D4AF37', opacity = 0.18 }) => (
  <svg width="100%" height="8" viewBox="0 0 300 8" preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
    <path
      d="M0,8 Q15,0 30,8 Q45,0 60,8 Q75,0 90,8 Q105,0 120,8
         Q135,0 150,8 Q165,0 180,8 Q195,0 210,8 Q225,0 240,8
         Q255,0 270,8 Q285,0 300,8"
      fill="none" stroke={color} strokeWidth="1.5" opacity={opacity}
    />
  </svg>
);

/* ── Decorative: Lotus separator ── */
const LotusRule = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', margin: '6px 0'
  }}>
    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,transparent,rgba(212,175,55,0.4))' }} />
    <span style={{ color: '#D4AF37', fontSize: '10px', letterSpacing: '6px' }}>✦ ✦ ✦</span>
    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,rgba(212,175,55,0.4),transparent)' }} />
  </div>
);

const AstroServices = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [serviceType, setServiceType] = useState('free');
  const [activeCard, setActiveCard] = useState(null);
  const [activeTool, setActiveTool] = useState(null); // 'kundali' | 'horoscope' | null

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', '/astro-services');
      alert('Please login to access Astrology Services');
      navigate('/user/login');
    }
    const t = setTimeout(() => setIsVisible(true), 60);
    return () => clearTimeout(t);
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  /* ── Free Services ── */
  const freeServices = [
    {
      id: 'free-kundli',
      sanskritName: 'प्रारम्भिक कुण्डली',
      title: 'Basic Birth Chart Reading',
      shortDesc: 'Get a glimpse of your cosmic blueprint',
      description:
        'A beautiful introduction to your celestial birth chart. Understand your Lagna, Rashi, and the three pillars — Sun, Moon & Rising sign — through simple, illuminating explanations perfect for those newly stepping onto the path of Jyotish.',
      features: [
        'Sun sign, Moon sign & Rising sign (Lagna) calculation',
        'Basic personality traits & elemental nature analysis',
        'Simple, beginner-friendly explanation of your chart',
        'Delivered by email within 24 hours',
      ],
      mantra: 'ॐ नमः शिवाय',
      deity: 'Lord Ganesha — Vighnaharta',
      bestFor: 'Astrology beginners & Curiosity seekers',
      planet: '☿ Mercury',
      price: 'Free',
      icon: '🌿',
      color: '#2E8B57',
      gradient: 'linear-gradient(135deg, #2E8B57 0%, #1B6B3A 100%)',
    },
    {
      id: 'free-horoscope',
      sanskritName: 'दैनिक राशिफल',
      title: 'Daily Horoscope',
      shortDesc: 'Your daily guidance from the stars',
      description:
        'Receive a personalised daily horoscope drawn from your birth chart. Each morning, gain insights into the day\'s opportunities, challenges, and auspicious Muhurta timings — so you may move in harmony with the cosmic tide.',
      features: [
        'Personalised daily predictions based on your chart',
        'Auspicious timings (Muhurta) highlighted for the day',
        'Daily Mantra recommendation for protection & clarity',
        'Delivered each morning via email / WhatsApp',
      ],
      mantra: 'ॐ सूर्याय नमः',
      deity: 'Surya Dev — The Radiant One',
      bestFor: 'Daily guidance & Conscious planning',
      planet: '☉ Surya (Sun)',
      price: 'Free',
      icon: '☀️',
      color: '#E07800',
      gradient: 'linear-gradient(135deg, #FF9933 0%, #E07800 100%)',
    },
    {
      id: 'free-compatibility',
      sanskritName: 'प्रारम्भिक मिलान',
      title: 'Quick Compatibility Check',
      shortDesc: 'Basic compatibility analysis',
      description:
        'Discover the elemental harmony between two souls with a swift overview of Guna Milan. Includes a basic Ashtakoota score and elemental compatibility — a gentle first look before a deeper sacred reading.',
      features: [
        'Basic Guna Milan — 8 Gunas scored',
        'Elemental (Tattva) compatibility overview',
        'Simple Mangal Dosha indicator check',
        'Written report delivered within 48 hours',
      ],
      mantra: 'ॐ कामदेवाय नमः',
      deity: 'Lord Krishna — Divine Love',
      bestFor: 'Initial relationship assessment',
      planet: '♀ Shukra (Venus)',
      price: 'Free',
      icon: '💕',
      color: '#B5476A',
      gradient: 'linear-gradient(135deg, #DB7093 0%, #B5476A 100%)',
    },
  ];

  /* ── Paid Services ── */
  const paidServices = [
    {
      id: 'kundli',
      sanskritName: 'जन्म कुण्डली',
      title: 'Birth Chart / Kundli Reading',
      shortDesc: "Unveil the cosmic blueprint of your soul's journey",
      description:
        "Your birth chart is a sacred celestial map — the universe frozen at your exact moment of arrival. A Kundli reading reveals your dharma, karma, and the planetary forces shaping your destiny across all twelve houses of life.",
      features: [
        'Lagna (ascendant) & Rashi analysis with full planetary positions',
        'Nakshatra (lunar mansion) reading & Dasha periods (Mahadasha/Antardasha)',
        'Career, health, wealth & spiritual life insights',
        'Remedies: Mantras, Gemstones, Yantras & Charitable offerings',
        'Detailed written report + 60-min consultation call',
      ],
      mantra: 'ॐ ग्रह शांति मंत्र',
      deity: 'Lord Ganesha & Navagrahas',
      bestFor: 'Self-discovery & Life path clarity',
      planet: '♃ Guru (Jupiter)',
      price: '₹2,100',
      icon: '🕉️',
      color: '#D4700A',
      gradient: 'linear-gradient(135deg, #FF8C42 0%, #D4700A 100%)',
    },
    {
      id: 'horoscope',
      sanskritName: 'ग्रह दशा',
      title: 'Horoscope & Predictions',
      shortDesc: 'Navigate the tides of time with Vedic wisdom',
      description:
        'Navigate the tides of time with Vedic horoscope readings. From annual forecasts to precise life-event timing, our Jyotishi reads the transits of the nine Grahas to guide your choices and steady your course.',
      features: [
        'Annual Varshaphal (solar return) horoscope reading',
        'Monthly & weekly planetary transit forecasts (Gochar)',
        'Specific event timing — marriage, career, travel, health',
        'Sade Sati, Kaal Sarp Dosha & special yogas analysis',
        'Remedial measures for challenging planetary periods',
      ],
      mantra: 'ॐ नवग्रह स्तोत्र',
      deity: 'Navagraha Devatas',
      bestFor: 'Future planning & Auspicious timing',
      planet: '☽ Chandra (Moon)',
      price: '₹1,600',
      icon: '⭐',
      color: '#A8860C',
      gradient: 'linear-gradient(135deg, #D4AF37 0%, #A8860C 100%)',
    },
    {
      id: 'compatibility',
      sanskritName: 'कुण्डली मिलान',
      title: 'Compatibility / Matchmaking',
      shortDesc: 'Discover cosmic harmony between two souls',
      description:
        "The ancient Ashtakoota system of Kundli Milan evaluates 36 Gunas across eight sacred categories to determine cosmic harmony between two souls — a time-honoured science for enduring, blissful unions.",
      features: [
        '36-Guna Milan (Ashtakoota) score with detailed category analysis',
        'Mangal Dosha, Nadi Dosha, Bhakoot Dosha & specific remedies',
        'Emotional, physical, intellectual & spiritual compatibility map',
        'Auspicious wedding Muhurta (dates) selection',
        'Compatibility for marriage, business, or life partnership',
      ],
      mantra: 'ॐ सौम्य मैत्री मंत्र',
      deity: 'Lord Shiva & Goddess Parvati',
      bestFor: 'Marriage & Relationship harmony',
      planet: '♀ Shukra (Venus)',
      price: '₹2,500',
      icon: '🔗',
      color: '#8B3A3A',
      gradient: 'linear-gradient(135deg, #CD5C5C 0%, #8B3A3A 100%)',
    },
  ];

  const currentServices = serviceType === 'free' ? freeServices : paidServices;

  const handleBook = (service) => {
    if (serviceType === 'free') {
      if (service.id === 'free-kundli') {
        navigate('/astro/kundali');
        // setActiveTool('kundali');
        // setTimeout(() => document.getElementById('astro-tool-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
      } else if (service.id === 'free-horoscope') {
        navigate('/astro/horoscope');
        // setActiveTool('horoscope');
        // setTimeout(() => document.getElementById('astro-tool-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
      } else if (service.id === 'free-compatibility') {
        navigate('/astro/compatibility');
      } else {
        alert(`Free Service: ${service.title}\n\nYou will receive this service within 24 hours. Please check your email.`);
      }
    } else {
      sessionStorage.setItem('selectedAstroService', JSON.stringify(service));
      navigate('/services', { state: { selectedService: service.title, category: 'astrology' } });
    }
  };

  return (
    <div className={`astro-container ${isVisible ? 'fade-in' : ''}`}>

      {/* ── Sacred Top Border ── */}
      <div className="sacred-border">
        <div className="border-line" />
        <div className="border-om">ॐ</div>
        <div className="border-line" />
      </div>

      {/* ── Hero ── */}
      <section className="astro-hero">
        <div className="hero-background">
          <div className="mandala-bg" />
          <div className="mandala-bg mandala-2" />
        </div>

        <div className="hero-content">
          {/* Top sacred symbols */}
          <div className="sacred-symbol">
            <span className="symbol-om">ॐ</span>
            <span className="symbol-sri">श्री</span>
          </div>

          {/* Sanskrit shloka */}
          <div className="hero-sanskrit">
            <p className="sanskrit-text">विद्या ददाति विनयं, विनयाद् याति पात्रताम्</p>
            <p className="sanskrit-meaning">"Wisdom gives humility, humility makes one worthy"</p>
          </div>

          {/* Main title */}
          <h1 className="hero-title">
            <span className="title-accent">Celestial</span>
            <span className="title-main">Astrology Services</span>
          </h1>

          {/* Ornate divider */}
          <div className="hero-divider">
            <span className="divider-diamond">◆</span>
            <span className="divider-line" />
            <span className="divider-diamond">◆</span>
          </div>

          <p className="hero-subtitle">
            Illuminate your life's path through the sacred science of{' '}
            <strong>Jyotish</strong> — the eye of the Vedas
          </p>

          {/* Free / Paid Toggle */}
          <div className="service-toggle">
            <button
              className={`toggle-btn ${serviceType === 'free' ? 'active' : ''}`}
              onClick={() => setServiceType('free')}
            >
              <span>🌿</span> Free Services
            </button>

            <button
              className="toggle-btn"
              onClick={() => {
                alert('✨ Premium Astrology Services are Coming Soon! Till that Please use Our Free Services.');
              }}
            >
              <span>✨</span> Paid Services
            </button>


            {/* <button
              className={`toggle-btn ${serviceType === 'paid' ? 'active' : ''}`}
              onClick={() => setServiceType('paid')}
            >
              <span>✨</span> Paid Services
            </button> */}
          </div>

          {/* Trust badges */}
          <div className="hero-trust">
            <span>✦ 25+ Years of Tradition ✦</span>
            <span>✦ Vedic Lineage ✦</span>
            <span>✦ 12,000+ Kundlis Studied ✦</span>
          </div>
        </div>
      </section>

      {/* ── Services Section ── */}
      <div className="services-container">
        <div className="section-header">
          <div className="header-decoration">✧༺❀༻✧</div>
          <h2 className="section-title">
            {serviceType === 'free' ? 'Free Spiritual Guidance' : 'Premium Sacred Offerings'}
          </h2>
          <p className="section-subtitle">
            {serviceType === 'free'
              ? 'Begin your journey with these complimentary blessings'
              : 'Choose the path of deep cosmic wisdom'}
          </p>
        </div>

        <div className="services-grids">
          {currentServices.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              onBook={handleBook}
              activeCard={activeCard}
              setActiveCard={setActiveCard}
              serviceType={serviceType}
            />
          ))}
        </div>
      </div>

      {/* ── Upgrade Banner (free tab only) ── */}
      {/* ── Live Astro Tools Section ── */}
      {activeTool && (
        <div id="astro-tool-section" style={{ padding: '20px 0' }}>
          <div style={{ textAlign: 'right', marginBottom: '12px' }}>
            <button
              onClick={() => setActiveTool(null)}
              style={{
                background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
                color: '#D4AF37', borderRadius: '20px', padding: '6px 16px',
                cursor: 'pointer', fontSize: '13px'
              }}
            >
              ✕ Close Tool
            </button>
          </div>
          {activeTool === 'kundali' && <KundaliTool />}
          {activeTool === 'horoscope' && <HoroscopeTool />}
        </div>
      )}

      {serviceType === 'free' && (
        <div className="upgrade-section">
          <div className="upgrade-symbol">✦</div>
          <h3>Ready for Deeper Insights?</h3>
          <p>
            Switch to <strong>Paid Services</strong> for detailed personalised
            consultations with our lineage-trained expert astrologers.
          </p>
          <button className="upgrade-btn" onClick={() => setServiceType('paid')}>
            Explore Premium Services <span>→</span>
          </button>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="astro-footer">
        <div className="footer-sanskrit">
          ॐ सर्वे भवन्तु सुखिनः &nbsp;|&nbsp; सर्वे सन्तु निरामयाः ॥
        </div>
        <p className="footer-meaning">
          "May all be happy, may all be free from disease"
        </p>
        <p className="footer-guidance">
          {serviceType === 'free'
            ? 'Free services'
            : 'Each paid session includes a personalised ritual recommendation based on your chart'}
        </p>
      </footer>
    </div>
  );
};

/* ══════════════════════════════════════════
   SERVICE CARD COMPONENT
══════════════════════════════════════════ */
const ServiceCard = ({ service, index, onBook, activeCard, setActiveCard, serviceType }) => {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  /* Intersection Observer for staggered reveal */
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isFree = serviceType === 'free';

  return (
    <div
      ref={cardRef}
      className={`service-card ${activeCard === service.id ? 'expanded' : ''}`}
      style={{
        transitionDelay: `${index * 0.12}s`,
        opacity: 0,
        transform: 'translateY(36px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease, box-shadow 0.45s ease, border-color 0.45s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="card-inner">

        {/* Gradient top bar */}
        <div className="card-patra" style={{ background: service.gradient }} />

        {/* Scallop arch detail below patra */}
        <TempleArch color={service.color} opacity={0.22} />

        {/* ── Icon Row ── */}
        <div
          className="card-icon-wrapper"
          style={{ background: `${service.color}12`, borderColor: `${service.color}28` }}
        >
          <div className="card-icon">{service.icon}</div>
          <div style={{ textAlign: 'right' }}>
            <div className="card-sanskrit-badge">{service.sanskritName}</div>
            <div style={{
              fontSize: '10px',
              color: service.color,
              fontFamily: "'Cinzel', serif",
              letterSpacing: '1px',
              marginTop: '4px',
              opacity: 0.8,
            }}>
              {service.planet}
            </div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="card-content">
          <div className="card-badge" style={{ color: service.color }}>{service.deity}</div>
          <h3 className="card-title">{service.title}</h3>
          <p className="card-short-desc">{service.shortDesc}</p>

          <div className="card-divider" style={{ background: `linear-gradient(90deg, ${service.color}, transparent)` }} />

          <p className="card-description">{service.description}</p>

          {/* Features */}
          <div className="card-features">
            <div className="features-title">✦ What's Included ✦</div>
            <ul className="features-list">
              {service.features.map((feat, i) => (
                <li key={i}>
                  <span className="feature-symbol">✦</span>
                  {feat}
                </li>
              ))}
            </ul>
          </div>

          {/* Meta info */}
          <div className="card-meta">
            <div className="meta-item">
              <span className="meta-label">Sacred Mantra</span>
              <span className="meta-value">{service.mantra}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Best For</span>
              <span className="meta-value">{service.bestFor}</span>
            </div>
          </div>

          {/* Footer: price + CTA */}
          <div className="card-footer">
            <div className="price-container">
              <span className="price-label">
                {isFree ? 'Complimentary' : 'Dakshina (Offering)'}
              </span>
              <div className="price-value">
                {service.price}
                {!isFree && <small className="price-note">+ as per your sankalp</small>}
              </div>
            </div>

            <button
              className={`book-btn ${isFree ? 'free-btn' : ''}`}
              onClick={() => onBook(service)}
              style={isFree ? {} : { background: service.gradient }}
            >
              <span>{isFree ? 'Get Free Service' : 'Book Consultation'}</span>
              <span className="btn-symbol">→</span>
            </button>
          </div>
        </div>

        {/* Bottom decoration */}
        <div className="card-bottom-deco">
          <span>ॐ</span>
          <span>।</span>
          <span>श्री</span>
          <span>।</span>
          <span>॥</span>
        </div>
      </div>
    </div>
  );
};

export default AstroServices;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/About.css';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="about-page">

      {/* HERO */}
      <section className="about-hero">
        <motion.h1 initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          Experience Divine Connections ✨
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          Pujanam bridges tradition with technology — bringing sacred rituals to your fingertips.
        </motion.p>
      </section>

      {/* STATS SECTION */}
      <section className="about-stats">
        {[
          { num: '1000+', label: 'Pujas Completed' },
          { num: '500+', label: 'Happy Devotees' },
          { num: '150+', label: 'Verified Pandits' },
        ].map((item, i) => (
          <motion.div key={i} className="stat-box" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }}>
            <h2>{item.num}</h2>
            <p>{item.label}</p>
          </motion.div>
        ))}
      </section>

      {/* MISSION */}
      <section className="about-section">
        <motion.div className="about-card glass" whileHover={{ scale: 1.05 }}>
          <h2>Our Mission</h2>
          <p>To simplify spiritual services and make them accessible, authentic, and trustworthy.</p>
        </motion.div>

        <motion.div className="about-card glass" whileHover={{ scale: 1.05 }}>
          <h2>Our Vision</h2>
          <p>To be India’s most trusted digital platform for all religious needs.</p>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="about-features">
        <h2>Why Choose Us</h2>
        <div className="features-grid">
          {[
            'Verified Experts',
            'Easy Booking',
            'Wide Services',
            'Secure Platform'
          ].map((text, i) => (
            <motion.div key={i} className="feature-box glass" whileHover={{ scale: 1.08 }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: i * 0.2 }}>
              <h3>{text}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
          Begin Your Spiritual Journey
        </motion.h2>
        <p>Discover rituals, connect with pandits, and bring peace to your life.</p>

        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/services')}
        >
          Explore Services →
        </motion.button>
      </section>

    </div>
  );
};

export default About;

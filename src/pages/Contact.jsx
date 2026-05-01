import React from 'react';
import { motion } from 'framer-motion';
import '../styles/Contact.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons';

const Contact = () => {
  return (
    <div className="contact-page">

      {/* HERO */}
      <section className="contact-hero">
        <motion.h1 initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }}>
          Get in Touch 🙏
        </motion.h1>
        <p>We’re here to help you with all your spiritual needs.</p>
      </section>

      {/* MAIN */}
      <section className="contact-container">

        {/* FORM */}
        <motion.div className="contact-form glass" initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }}>
          <h2>Send a Message</h2>

          <input type="text" placeholder="Your Name" />
          <input type="email" placeholder="Your Email" />
          <textarea placeholder="Your Message" rows="5"></textarea>

          <button>Send Message</button>
        </motion.div>

        {/* INFO */}
        <motion.div className="contact-info glass" initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }}>
          <h2>Contact Info</h2>

          <p>📞 +91 9373120370</p>
          <p>📧 info@pujanam.com</p>
          <p>📍 Pune, India</p>

          <div className="social-links">
           <a href="#" target="_blank" rel="noreferrer">
                           <FontAwesomeIcon icon={faFacebookF} />
                         </a>
           
                         <a href="#" target="_blank" rel="noreferrer">
                           <FontAwesomeIcon icon={faTwitter} />
                         </a>
           
                         <a href="https://instagram.com/bhushan_0919" target="_blank" rel="noreferrer">
                           <FontAwesomeIcon icon={faInstagram} />
                         </a>
           
                         <a href="https://youtube.com/@pujanamIndia" target="_blank" rel="noreferrer">
                           <FontAwesomeIcon icon={faYoutube} />
                         </a>
          </div>
        </motion.div>

      </section>

      {/* MAP */}
      <section className="contact-map">
        <iframe
          src="https://maps.google.com/maps?q=pune&t=&z=13&ie=UTF8&iwloc=&output=embed"
          title="map"
        ></iframe>
      </section>

    </div>
  );
};

export default Contact;


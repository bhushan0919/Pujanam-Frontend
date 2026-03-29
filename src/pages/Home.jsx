// Frontend/src/pages/Home.jsx

import React, { useState, useEffect } from 'react';
import '../styles/Home.css';

const images = [
  '/images/slider1.webp',
  '/images/slider2.webp',
  '/images/slider3.webp',
  '/images/slider4.webp',
  '/images/slider5.webp',
];

function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Change slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const prevSlide = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const nextSlide = () => {
    setCurrentIndex((currentIndex + 1) % images.length);
  };

  return (
    <div className="home-slider">
      <div className="slider-wrapper">
        <img src={images[currentIndex]} alt={`Slide ${currentIndex + 1}`} />
        <button className="prev-btn" onClick={prevSlide}>‹</button>
        <button className="next-btn" onClick={nextSlide}>›</button>
      </div>
    </div>
  );
}

export default Home;

// Frontend/src/pages/Home.jsx

import React, { useState, useEffect } from 'react';
import '../styles/Home.css';
import JoinPandit from './JoinPandit';
import Skeleton from '../components/common/Skeleton';

import { useNavigate } from 'react-router-dom';

const images = [
  '/images/slider1.webp',
  '/images/slider2.webp',
  '/images/slider3.webp',
  '/images/slider4.webp',
  '/images/slider5.webp',
];

function Home() {
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();


  // Change slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

   useEffect(() => {
    // Simulate loading or wait for images to load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const prevSlide = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const nextSlide = () => {
    setCurrentIndex((currentIndex + 1) % images.length);
  };


  const steps = [
    {
      img: "images/puja.png",

      title: "Pick your Puja",
    },
    {
      img: "images/calendar.png",
      title: "Select Muhurth",
    },
    {
      img: "images/mobile.png",
      title: "Book your Puja",
    },
    {
      img: "images/havan.png",
      title: "Perform Puja at Muhurth",
    },
  ];

   if (loading) {
    return (
      <>
        <Skeleton.Banner />
        <Skeleton.HowItWorks />
        <Skeleton.JoinPandit />
      </>
    );
  }

  return (
    <>

      <div className="home-slider">
        <div className="slider-wrapper">
          <img src={images[currentIndex]} alt={`Slide ${currentIndex + 1}`} />
          <button className="prev-btn" onClick={prevSlide}>‹</button>
          <button className="next-btn" onClick={nextSlide}>›</button>
        </div>
      </div>

      <div className="how-container">
        <h2>PANDIT FOR PUJA</h2>
        <h3>HOW IT WORKS</h3>

        <div className="steps">
          {steps.map((step, index) => (
            <div key={index} className="nostep">
              <div className="icon-circle">
                <img src={step.img} alt={step.title} />
              </div>
              <p>{step.title}</p>
            </div>
          ))}
        </div>
      </div>

    

<div className='join-pandit-section'>
  <div className='join-pandit-content'>
    <div className='join-pandit-icon'>
  <span>🕉️</span>
</div>
    <h2>Join Us as a <span>Pandit Ji</span></h2>
    <p>Become a part of our spiritual community. Share your knowledge,<br /> 
       perform pujas, and connect with devotees across India.</p>
    <div className='join-pandit-benefits'>
      <div className='benefit'>
        <span>✓</span> Flexible Schedule
      </div>
      <div className='benefit'>
        <span>✓</span> Earn Respect & Income
      </div>
      <div className='benefit'>
        <span>✓</span> Reach More Devotees
      </div>
      <div className='benefit'>
        <span>✓</span> Verified Platform
      </div>
    </div>
    <button onClick={() => navigate('/join-pandit')} className='join-now-btn'>
      Join Now <span>→</span>
    </button>
    
  </div>
</div>



    </>
  );
}

export default Home;

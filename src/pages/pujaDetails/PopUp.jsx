// Frontend/src/pages/pujaDetails/PopUp.jsx

import React from "react";

export default function Popup({ service, onClose }) {
  if (!service) return null;

  return (
    <div className="popup" onClick={onClose}>
      <div
        className="popup-content"
        onClick={(e) => e.stopPropagation()} // prevents closing when clicking inside
      >
        <button className="close-btn" onClick={onClose}>✖</button>
        <h2>{service.name}</h2>
        {/* <img src={service.image} alt={service.name} /> */}
        <p><strong>Details:</strong></p>
        <ul className="popup-details numbered">
          {service.details.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
        <p className="price">{service.price}</p>
        <button className="book-btn">Book Now</button>
      </div>
    </div>
  );
}

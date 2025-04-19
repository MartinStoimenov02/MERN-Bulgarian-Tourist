import React, { useEffect, useState, useRef } from "react";
import "../style/GuestPage.css";

const imageFolder = "/images/";

const allImages = [
  "imgage1.jpg", "imgage2.jpg", "imgage3.jpg", "imgage4.jpg", "imgage5.jpg",
  "imgage6.jpg", "imgage7.jpg", "imgage8.jpg", "imgage9.jpg", "imgage10.jpg",
  "imgage11.jpg", "imgage12.jpg", "imgage13.jpg", "imgage14.jpg", "imgage15.jpg",
  "imgage16.jpg", "imgage17.jpg", "imgage18.jpg", "imgage19.jpg", "imgage20.jpg",
];

const slideTexts = [
  {
    title: "Открий България с едно приложение",
    description: "Разгледай забележителности, научи интересни факти и събирай печати на местата, които си посетил!"
  },
  {
    title: "Създай свой туристически паспорт",
    description: "Създай свой туристически профил и следи всички места, които си посетил."
  },
  {
    title: "Събирай печати",
    description: "Събирай печати за всяко посетено място и се конкурай с другите потребители за страхотни награди!"
  },
  {
    title: "Наблизо? Винаги има какво да видиш",
    description: "С функцията за откриване на близки дестинации няма да пропуснеш нищо интересно около теб."
  },
];

export default function GuestPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedImages, setSelectedImages] = useState([]);
  const intervalRef = useRef(null);

  const startAutoSlide = () => {
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 4);
    }, 8000);
  };

  const resetAutoSlide = () => {
    clearInterval(intervalRef.current);
    startAutoSlide();
  };

  useEffect(() => {
    const shuffled = [...allImages].sort(() => 0.5 - Math.random());
    setSelectedImages(shuffled.slice(0, 4));
  }, []);

  useEffect(() => {
    startAutoSlide();
    return () => clearInterval(intervalRef.current);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 4);
    resetAutoSlide();
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 4) % 4);
    resetAutoSlide();
  };

  return (
    <div className="guest-slider">
      <div className="slides">
        {selectedImages.map((img, index) => (
          <div
            key={index}
            className={`slide ${index === currentSlide ? "active" : ""}`}
            style={{ backgroundImage: `url(${imageFolder + img})` }}
          >
            <div className="slide-text">
              <h1>{slideTexts[index].title}</h1>
              <p>{slideTexts[index].description}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="nav left" onClick={prevSlide}>‹</button>
      <button className="nav right" onClick={nextSlide}>›</button>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button"; // Componente Button de shadcn/ui
import { ChevronLeft, ChevronRight } from "lucide-react"; // Iconos para navegación

interface Image {
  imageUrl: string; // URL de la imagen
  targetUrl: string; // URL de destino al hacer clic
}

interface ImageSliderProps {
  images: Image[]; // Array de objetos con URLs de imágenes y URLs de destino
  autoPlay?: boolean; // Autoplay habilitado/deshabilitado
  autoPlayInterval?: number; // Intervalo de tiempo para el autoplay
  transitionType?: "fade" | "slide"; // Tipo de transición (fade o slide)
}

const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  autoPlay = false,
  autoPlayInterval = 3000,
  transitionType = "slide",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Navegación: Siguiente imagen
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // Navegación: Anterior imagen
  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  // Autoplay
  useEffect(() => {
    if (autoPlay) {
      const interval = setInterval(nextSlide, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [autoPlay, autoPlayInterval]);

  return (
    <div className="relative w-full h-[400px] overflow-hidden group">
      {/* Contenedor de imágenes */}
      {transitionType === "slide" ? (
        // Animación Slide
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`, // Desplaza el contenedor horizontalmente
            width: `${images.length * 100}%`, // Ancho total del contenedor
          }}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="w-full h-full flex-shrink-0" // Cada imagen ocupa el 100% del ancho del contenedor
            >
              <a
                href={image.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={image.imageUrl}
                  alt={`Slide ${index}`}
                  className="w-full h-full object-cover cursor-pointer"
                />
              </a>
            </div>
          ))}
        </div>
      ) : (
        // Animación Fade
        <div className="relative w-full h-full">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <a
                href={image.targetUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={image.imageUrl}
                  alt={`Slide ${index}`}
                  className="w-full h-full object-cover cursor-pointer"
                />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Botón de navegación: Anterior */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      {/* Botón de navegación: Siguiente */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Indicadores de paginación */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full transition-colors ${
              index === currentIndex ? "bg-white" : "bg-white/50"
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;

import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-800 to-blue-900 text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70 z-10"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 animate-pulse pb-2 leading-tight">
            Mundo Mágico
            <br />
            de Hongos
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 max-w-2xl px-4 text-white/90">
            Descubre la magia y el misterio de los hongos en nuestra colección
            única
          </p>
          <button
            onClick={() => navigate("/tienda")}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50"
          >
            Explorar Colección
          </button>
        </div>

        {/* Floating elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/10 backdrop-blur-sm"
              style={{
                width: `${Math.random() * 15 + 5}px`,
                height: `${Math.random() * 15 + 5}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${
                  Math.random() * 15 + 10
                }s infinite ease-in-out ${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      </section>

      {/* Slider Section */}
      <section className="py-16 bg-gradient-to-b from-blue-900/80 to-purple-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
            Nuestra Colección
          </h2>

          <Slider
            dots={true}
            infinite={true}
            speed={600}
            slidesToShow={3}
            slidesToScroll={1}
            autoplay={true}
            autoplaySpeed={3500}
            pauseOnHover={true}
            arrows={false}
            responsive={[
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: 2,
                  dots: false,
                },
              },
              {
                breakpoint: 640,
                settings: {
                  slidesToShow: 1,
                  dots: true,
                },
              },
            ]}
            className="mx-auto max-w-5xl"
          >
            {[
              "https://i.pinimg.com/736x/80/44/53/80445355939eb54cfe276f3b2e881c30.jpg",
              "https://aldianews.com/sites/default/files/styles/850x520/public/articles/111320_ls_mushroom_feat-1030x580.jpg?itok=7j7Wf4G0",
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStd5zBqQe6rF8yi88Vfcl561HjWBykf1-xEGIJa8lJntju9kJ9BrIQCxGQeWbAuqOLNDE",
            ].map((item) => (
              <div key={item} className="px-2 outline-none">
                <div className="bg-white/10 rounded-xl p-4 h-72 flex items-center justify-center transition-all duration-300 hover:bg-white/20 hover:shadow-lg">
                  <img
                    src={`${item}`}
                    // src={`/Productos_Images/${item}.jpg`}
                    alt={`Hongos mágicos ${item}`}
                    className="max-h-full max-w-full object-contain transition-transform duration-500 hover:scale-110"
                  />
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          Nuestros Hongos Mágicos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              name: "Psilocybe cubensis",
              desc: "Conocido por sus efectos psicodélicos y propiedades espirituales",
            },
            {
              name: "Amanita muscaria",
              desc: "El icónico hongo rojo con puntos blancos, usado en rituales chamánicos",
            },
            {
              name: "Panaeolus cyanescens",
              desc: "Potente y apreciado por su intensidad y claridad mental",
            },
          ].map((mushroom, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-pink-500 transition-all duration-300 hover:shadow-lg hover:bg-white/20"
            >
              <div className="w-full h-48 mb-4 rounded-lg bg-gradient-to-br from-purple-500/70 to-pink-600/70 flex items-center justify-center overflow-hidden">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-red-500 rounded-full animate-spin-slow"></div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">
                {mushroom.name}
              </h3>
              <p className="text-white/80 mb-4">{mushroom.desc}</p>
              <button
                className="w-full py-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all text-white font-medium"
                onClick={() => navigate("/tienda")}
              >
                Ver en Tienda
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Download, X, Smartphone, Zap, Wifi } from "lucide-react";
import { useIsMobile } from "../hooks/useIsMobile";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const Landing = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Verificar si ya se mostró el prompt antes
    const hasSeenInstallPrompt = localStorage.getItem("hasSeenInstallPrompt");

    // Listener para el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const beforeInstallPromptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(beforeInstallPromptEvent);
      setIsInstallable(true);

      // Mostrar el prompt solo si no se ha visto antes
      if (!hasSeenInstallPrompt && isMobile) {
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000); // Mostrar después de 3 segundos
      }
    };

    // Verificar si ya está instalada
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;

    if (!isStandalone && !isInWebAppiOS) {
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("Usuario aceptó la instalación");
    } else {
      console.log("Usuario rechazó la instalación");
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
    localStorage.setItem("hasSeenInstallPrompt", "true");
  };

  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
    localStorage.setItem("hasSeenInstallPrompt", "true");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-800 to-blue-900 text-white overflow-x-hidden">
      {/* PWA Install Dialog */}
      <Dialog open={showInstallPrompt} onOpenChange={setShowInstallPrompt}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-purple-900/95 to-indigo-900/95 border-purple-500/50 text-white">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                ¡Instala nuestra App!
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismissInstall}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-white/80">
              Obtén la mejor experiencia instalando nuestra aplicación
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm text-white/80">Más rápida</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm text-white/80">Nativa</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                  <Wifi className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm text-white/80">Sin conexión</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleInstallClick}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                disabled={!deferredPrompt}
              >
                <Download className="h-5 w-5 mr-2" />
                Instalar App
              </Button>

              <Button
                variant="outline"
                onClick={handleDismissInstall}
                className="w-full border-white/30 text-white/80 hover:bg-white/10 hover:text-white"
              >
                Ahora no
              </Button>
            </div>

            <p className="text-xs text-white/60 text-center">
              Podrás instalar la app más tarde desde el menú de tu navegador
            </p>
          </div>
        </DialogContent>
      </Dialog>

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

      {/* PWA Install Section */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-r from-purple-900/50 to-indigo-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-purple-400 transition-all duration-300">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                ¡Lleva la Magia Contigo!
              </h2>
              <p className="text-lg text-white/80 mb-6 max-w-2xl mx-auto">
                Instala nuestra aplicación y disfruta de una experiencia más
                rápida, acceso sin conexión y notificaciones de nuevos
                productos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Súper Rápida
                </h3>
                <p className="text-sm text-white/70 text-center">
                  Carga instantánea y navegación fluida
                </p>
              </div>

              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <Smartphone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Experiencia Nativa
                </h3>
                <p className="text-sm text-white/70 text-center">
                  Como una app real en tu dispositivo
                </p>
              </div>

              <div className="flex flex-col items-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                  <Wifi className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Funciona Sin Internet
                </h3>
                <p className="text-sm text-white/70 text-center">
                  Accede a tu contenido favorito offline
                </p>
              </div>
            </div>

            {isInstallable && deferredPrompt ? (
              <Button
                onClick={handleInstallClick}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Download className="h-6 w-6 mr-3" />
                Instalar App Ahora
              </Button>
            ) : (
              <div className="space-y-4">
                <p className="text-white/60 text-sm">
                  {window.matchMedia("(display-mode: standalone)").matches ||
                  (window.navigator as any).standalone
                    ? "¡App ya instalada! Gracias por usar nuestra aplicación."
                    : "Para instalar la app, usa el menú de tu navegador o espera la notificación automática."}
                </p>
                <Button
                  onClick={() => navigate("/tienda")}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover:text-white py-3 px-6 rounded-full"
                >
                  Ir a la Tienda
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

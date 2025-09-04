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
import {
  Download,
  X,
  Smartphone,
  Zap,
  Wifi,
  Star,
  Shield,
  Award,
} from "lucide-react";
import { useIsMobile } from "../hooks/useIsMobile";
// import { useFilter } from "../contexts/filter-context";

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
  // const { setActiveFilter } = useFilter();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const hasSeenInstallPrompt = localStorage.getItem("hasSeenInstallPrompt");

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const beforeInstallPromptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(beforeInstallPromptEvent);
      setIsInstallable(true);

      if (!hasSeenInstallPrompt && isMobile) {
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000);
      }
    };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-white overflow-x-hidden">
      {/* PWA Install Dialog */}
      <Dialog open={showInstallPrompt} onOpenChange={setShowInstallPrompt}>
        <DialogContent className="sm:max-w-md bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 text-white shadow-2xl mx-4">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg sm:text-xl font-semibold text-white">
                Instalar Aplicación
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismissInstall}
                className="text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-slate-300 text-sm">
              Obtén la mejor experiencia con nuestra aplicación empresarial
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400" />
                </div>
                <span className="text-xs text-slate-300 font-medium">
                  Rápida
                </span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Smartphone className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400" />
                </div>
                <span className="text-xs text-slate-300 font-medium">
                  Nativa
                </span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Wifi className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400" />
                </div>
                <span className="text-xs text-slate-300 font-medium">
                  Offline
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleInstallClick}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                disabled={!deferredPrompt}
              >
                <Download className="h-4 w-4 mr-2" />
                Instalar Aplicación
              </Button>

              <Button
                variant="outline"
                onClick={handleDismissInstall}
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-white rounded-xl"
              >
                Más tarde
              </Button>
            </div>

            <p className="text-xs text-slate-400 text-center leading-relaxed">
              También puedes instalar desde el menú de tu navegador
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(245, 158, 11, 0.1) 0%, transparent 50%),
                             radial-gradient(circle at 75% 75%, rgba(148, 163, 184, 0.1) 0%, transparent 50%)`,
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-6xl mx-auto w-full">
          <div className="mb-6 sm:mb-8">
            {/* Company Logo/Name */}
            <div className="flex items-center justify-center mb-6 sm:mb-8">
              <img
                src="/pwa-512x512.png"
                alt="Zeta Dorada Logo"
                className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 mr-3 sm:mr-4"
              />
              <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-amber-500 tracking-wide">
                ZETA DORADA
              </span>
            </div>

            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              <span className="block text-white font-light">
                Especialistas en
              </span>
              <span className="block bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent font-bold">
                Hongos Premium
              </span>
              <span className="block text-slate-300 text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-light mt-1 sm:mt-2">
                de Calidad
              </span>
            </h1>
          </div>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-6 sm:mb-8 lg:mb-10 max-w-3xl mx-auto text-slate-300 font-light leading-relaxed px-4">
            Líder en distribución de hongos especializados con más de una década
            de experiencia
          </p>

          {/* Slider integrado en la sección principal */}
          <div className="mb-8 sm:mb-10 lg:mb-12">
            <Slider
              dots={true}
              infinite={true}
              speed={600}
              slidesToShow={3}
              slidesToScroll={1}
              autoplay={true}
              autoplaySpeed={4000}
              pauseOnHover={true}
              arrows={false}
              responsive={[
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 2,
                    dots: true,
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
              className="mx-auto max-w-6xl"
            >
              {[
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLCDRfBPz_qZFNxCfcs4hvYg6RTsP6WwXpYA&s",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSl45fUA0Q_P7Z1e60lSFlLODyhE6ZpMAsbiQ&s",
                "https://m.media-amazon.com/images/I/61VilH2DjjL._AC_SL1024_.jpg",
                "https://upload.wikimedia.org/wikipedia/commons/1/15/Austernseitling-1.jpg",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQC_FFF8zwX_LtzDJyIXSjzvHx9Ack6cSS_nA&s",
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7-LtNfS24g0sNuAh-kNdOGm9oM3lt-CE7ZA&s",
              ].map((item, index) => (
                <div key={item} className="px-2 sm:px-3 outline-none">
                  <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-4 sm:p-6 h-48 sm:h-56 lg:h-64 flex items-center justify-center transition-all duration-300 hover:bg-slate-800/60 hover:shadow-2xl border border-slate-700/30 hover:border-amber-500/30">
                    <img
                      src={item}
                      alt={`Producto premium ${index + 1}`}
                      className="max-h-full max-w-full object-contain transition-transform duration-500 hover:scale-105 rounded-xl"
                    />
                  </div>
                </div>
              ))}
            </Slider>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Button
              onClick={() => navigate("/tienda")}
              className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-medium py-3 sm:py-4 px-6 sm:px-8 rounded-xl text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Ver Catálogo
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto border-slate-600 text-slate-300 hover:bg-slate-800/50 hover:text-white py-3 sm:py-4 px-6 sm:px-8 rounded-xl text-base sm:text-lg font-medium"
            >
              Conocer Empresa
            </Button>
          </div>
        </div>

        {/* Subtle Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-amber-500/5 backdrop-blur-sm"
              style={{
                width: `${Math.random() * 12 + 6}px`,
                height: `${Math.random() * 12 + 6}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${
                  Math.random() * 25 + 20
                }s infinite ease-in-out ${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      </section>

      {/* Company Values Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-white">
              ¿Por qué Zeta Dorada?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed px-4">
              Comprometidos con la excelencia y la calidad en cada producto que
              ofrecemos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Star,
                title: "Calidad Certificada",
                description:
                  "Productos rigurosamente seleccionados y verificados por nuestro equipo de expertos",
                gradient: "from-amber-500 to-amber-600",
              },
              {
                icon: Shield,
                title: "Confianza y Seguridad",
                description:
                  "Procesos seguros y transparentes respaldados por años de experiencia en el sector",
                gradient: "from-slate-500 to-slate-600",
              },
              {
                icon: Award,
                title: "Experiencia Comprobada",
                description:
                  "Más de 10 años liderando el mercado especializado con resultados excepcionales",
                gradient: "from-blue-500 to-blue-600",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300 hover:bg-slate-800/50"
              >
                <div
                  className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-105 transition-transform duration-300 shadow-lg`}
                >
                  <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4 text-white group-hover:text-amber-100 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PWA Install Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-slate-800/20 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto text-center">
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-3xl p-8 sm:p-12 border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300">
            <div className="mb-6 sm:mb-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl">
                <Smartphone className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-white">
                Aplicación Empresarial
              </h2>

              <p className="text-base sm:text-lg lg:text-xl text-slate-400 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
                Accede a nuestra plataforma empresarial optimizada con
                funcionalidades avanzadas y acceso sin conexión.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
              {[
                {
                  icon: Zap,
                  title: "Alto Rendimiento",
                  description:
                    "Plataforma optimizada para máxima eficiencia y velocidad",
                  gradient: "from-amber-600 to-amber-700",
                },
                {
                  icon: Smartphone,
                  title: "Interfaz Profesional",
                  description:
                    "Diseño empresarial adaptado para uso profesional",
                  gradient: "from-slate-600 to-slate-700",
                },
                {
                  icon: Wifi,
                  title: "Acceso Sin Conexión",
                  description:
                    "Funcionalidad completa incluso sin conexión a internet",
                  gradient: "from-blue-600 to-blue-700",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center space-y-3 sm:space-y-4"
                >
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-xl`}
                  >
                    <feature.icon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white text-center">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-400 text-center leading-relaxed px-2">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-4 sm:space-y-6">
              {isInstallable && deferredPrompt ? (
                <Button
                  onClick={handleInstallClick}
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-3 sm:py-4 px-8 sm:px-10 rounded-xl text-base sm:text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <Download className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                  Instalar Aplicación
                </Button>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-500 text-sm max-w-2xl mx-auto leading-relaxed px-4">
                    {window.matchMedia("(display-mode: standalone)").matches ||
                    (window.navigator as any).standalone
                      ? "¡Aplicación instalada correctamente! Gracias por confiar en Zeta Dorada."
                      : "Para instalar la aplicación, utiliza el menú de tu navegador o espera la notificación automática."}
                  </p>
                  <Button
                    onClick={() => navigate("/tienda")}
                    variant="outline"
                    className="w-full sm:w-auto border-slate-600 text-slate-300 hover:bg-slate-800/50 hover:text-white py-3 sm:py-4 px-6 sm:px-8 rounded-xl text-base sm:text-lg font-medium"
                  >
                    Acceder al Catálogo
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

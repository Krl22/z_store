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
  Leaf,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
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
  // const [isInstallable, setIsInstallable] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const hasSeenInstallPrompt = localStorage.getItem("hasSeenInstallPrompt");

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const beforeInstallPromptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(beforeInstallPromptEvent);
      // setIsInstallable(true);

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
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-gray-900/90" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 20%, rgba(245, 158, 11, 0.15) 0%, transparent 40%),
                radial-gradient(circle at 80% 80%, rgba(34, 197, 94, 0.1) 0%, transparent 40%),
                radial-gradient(circle at 40% 60%, rgba(168, 85, 247, 0.08) 0%, transparent 40%)
              `,
            }}
          />
          {/* Animated mesh gradient */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-amber-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
            <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-7xl mx-auto w-full px-4">
          {/* Company Logo/Name with enhanced animation */}
          <div className="mb-6 sm:mb-8 md:mb-12 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row items-center justify-center mb-6 sm:mb-8 md:mb-10 group">
              <div className="relative mb-4 sm:mb-0">
                <img
                  src="/pwa-512x512.png"
                  alt="Zeta Dorada Logo"
                  className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 sm:mr-4 md:mr-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 mx-auto sm:mx-0"
                />
                <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
              </div>
              <div className="relative">
                <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 tracking-wide drop-shadow-2xl">
                  ZETA DORADA
                </span>
                <div className="absolute inset-0 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-amber-400/10 tracking-wide transform translate-x-1 translate-y-1">
                  ZETA DORADA
                </div>
              </div>
            </div>

            {/* Enhanced title with better typography */}
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight animate-fade-in-up animation-delay-300">
                <span className="block text-slate-200 font-light mb-1 sm:mb-2">
                  Especialistas en
                </span>
                <span className="block bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600 bg-clip-text text-transparent font-black tracking-tight">
                  Hongos Premium
                </span>
                <span className="block text-emerald-300 text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light mt-1 sm:mt-2 tracking-wide">
                  de Calidad Superior
                </span>
              </h1>
            </div>
          </div>

          {/* Minimalist CTA Button */}
          <div className="flex justify-center items-center mb-12 sm:mb-16 md:mb-20 animate-fade-in-up animation-delay-600 px-4">
            <button
              onClick={() => navigate("/home")}
              className="group relative px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-lg sm:text-xl md:text-2xl rounded-2xl shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105 hover:from-amber-400 hover:to-amber-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center gap-3">
                <span>Ver Tienda</span>
                <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </button>
          </div>
        </div>

        {/* Enhanced floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-amber-500/10 to-emerald-500/10 backdrop-blur-sm"
              style={{
                width: `${Math.random() * 20 + 8}px`,
                height: `${Math.random() * 20 + 8}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${
                  Math.random() * 30 + 20
                }s infinite ease-in-out ${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-12 sm:py-20 md:py-32 px-4 sm:px-6 bg-gradient-to-b from-slate-800/50 to-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16 md:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent">
              ¿Por qué elegirnos?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed px-4">
              Somos líderes en el mercado de hongos especializados con un
              compromiso inquebrantable hacia la calidad y la innovación
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            {[
              {
                icon: Shield,
                title: "Calidad Garantizada",
                description:
                  "Productos certificados con los más altos estándares de calidad y seguridad alimentaria",
                color: "from-emerald-500 to-emerald-600",
              },
              {
                icon: Clock,
                title: "10+ Años de Experiencia",
                description:
                  "Más de una década perfeccionando nuestros procesos y técnicas de cultivo",
                color: "from-amber-500 to-amber-600",
              },
              {
                icon: Users,
                title: "Atención Personalizada",
                description:
                  "Equipo especializado para asesorarte en cada paso de tu experiencia",
                color: "from-purple-500 to-purple-600",
              },
              {
                icon: Leaf,
                title: "100% Natural",
                description:
                  "Productos orgánicos cultivados sin químicos ni aditivos artificiales",
                color: "from-green-500 to-green-600",
              },
              {
                icon: Star,
                title: "Productos Premium",
                description:
                  "Selección exclusiva de las mejores variedades y cepas disponibles",
                color: "from-yellow-500 to-yellow-600",
              },
              {
                icon: Zap,
                title: "Entrega Rápida",
                description:
                  "Sistema de distribución eficiente para garantizar frescura y rapidez",
                color: "from-blue-500 to-blue-600",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative bg-slate-800/40 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-700/50 hover:border-amber-500/30 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 to-slate-900/40 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4 group-hover:text-amber-300 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Product Showcase */}
      <section className="relative py-12 sm:py-20 md:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16 md:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">
              Nuestros Productos Destacados
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed px-4">
              Descubre nuestra selección premium de hongos especializados,
              cultivados con técnicas avanzadas
            </p>
          </div>

          <div className="relative">
            <Slider
              dots={true}
              infinite={true}
              speed={800}
              slidesToShow={3}
              slidesToScroll={1}
              autoplay={true}
              autoplaySpeed={5000}
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
              className="mx-auto"
            >
              {[
                {
                  url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLCDRfBPz_qZFNxCfcs4hvYg6RTsP6WwXpYA&s",
                  title: "Hongos Shiitake Premium",
                  description:
                    "Cultivados orgánicamente con técnicas tradicionales japonesas",
                },
                {
                  url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSl45fUA0Q_P7Z1e60lSFlLODyhE6ZpMAsbiQ&s",
                  title: "Setas Ostra Gourmet",
                  description:
                    "Frescas y nutritivas, perfectas para la alta cocina",
                },
                {
                  url: "https://m.media-amazon.com/images/I/61VilH2DjjL._AC_SL1024_.jpg",
                  title: "Kit de Cultivo Completo",
                  description:
                    "Todo lo necesario para cultivar tus propios hongos en casa",
                },
                {
                  url: "https://upload.wikimedia.org/wikipedia/commons/1/15/Austernseitling-1.jpg",
                  title: "Hongos Medicinales",
                  description:
                    "Variedades especializadas con propiedades terapéuticas",
                },
                {
                  url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQC_FFF8zwX_LtzDJyIXSjzvHx9Ack6cSS_nA&s",
                  title: "Hongos Exóticos",
                  description:
                    "Especies raras y exclusivas para paladares aventureros",
                },
                {
                  url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7-LtNfS24g0sNuAh-kNdOGm9oM3lt-CE7ZA&s",
                  title: "Sustratos Especializados",
                  description:
                    "Medios de cultivo optimizados para máximo rendimiento",
                },
              ].map((item, index) => (
                <div key={index} className="px-2 sm:px-3 md:px-4 outline-none">
                  <div className="group relative bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 h-72 sm:h-80 md:h-96 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/10 border border-slate-700/30 hover:border-amber-500/30 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 h-full flex flex-col">
                      <div className="flex-1 flex items-center justify-center mb-4 sm:mb-6">
                        <img
                          src={item.url}
                          alt={item.title}
                          className="max-h-32 sm:max-h-40 max-w-full object-contain transition-transform duration-700 group-hover:scale-110 rounded-xl sm:rounded-2xl shadow-lg"
                        />
                      </div>
                      <div className="text-center">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3 group-hover:text-amber-300 transition-colors duration-300">
                          {item.title}
                        </h3>
                        <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>

          {/* Enhanced CTA */}
          <div className="text-center mt-10 sm:mt-16 md:mt-20 px-4">
            <Button
              onClick={() => navigate("/tienda")}
              className="group w-full sm:w-auto bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 hover:from-emerald-700 hover:via-emerald-800 hover:to-emerald-900 text-white font-bold py-3 sm:py-4 md:py-5 px-8 sm:px-10 md:px-12 rounded-2xl text-base sm:text-lg md:text-xl transition-all duration-500 shadow-2xl hover:shadow-emerald-500/25 hover:scale-105 border border-emerald-400/20"
            >
              <span className="flex items-center justify-center gap-3">
                Explorar Catálogo Completo
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-r from-slate-800/30 to-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 text-center">
            {[
              { number: "10+", label: "Años de Experiencia", icon: Clock },
              { number: "5000+", label: "Clientes Satisfechos", icon: Users },
              { number: "50+", label: "Variedades Disponibles", icon: Leaf },
              {
                number: "99%",
                label: "Calidad Garantizada",
                icon: CheckCircle,
              },
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="flex justify-center mb-4">
                  <stat.icon className="h-8 w-8 sm:h-10 sm:w-10 text-amber-400 group-hover:text-emerald-400 transition-colors duration-300" />
                </div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 group-hover:text-amber-300 transition-colors duration-300">
                  {stat.number}
                </div>
                <div className="text-slate-300 font-medium text-sm sm:text-base group-hover:text-slate-200 transition-colors duration-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

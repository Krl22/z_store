import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { User, ShoppingCart, Search, Filter, ChevronDown } from "lucide-react";
import { useFilter } from "../contexts/filter-context";
import { useState, useEffect } from "react";
import { PriceFilter } from "./price-filter";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CartDrawerContent } from "./CartDrawerContent";
import { FavoritesDrawerContent } from "./FavoritesDrawerContent";
import { CartBadge } from "./CartBadge";
import { useAuth } from "../contexts/auth-context";
import { useFavorites } from "../contexts/favorites-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bookmark, LogOut } from "lucide-react";
import { NotificationSettings } from "./NotificationSettings";
import { ProfileDialog } from "./ProfileDialog";

export const TopNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, user, logout } =
    useAuth();
  const { state: favoritesState } = useFavorites();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      setIsOpen(false);
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    if (!isLoginMode) {
      // Validación para registro
      if (password !== confirmPassword) {
        setMessage({ type: "error", text: "Las contraseñas no coinciden" });
        setIsSubmitting(false);
        return;
      }
      if (password.length < 6) {
        setMessage({
          type: "error",
          text: "La contraseña debe tener al menos 6 caracteres",
        });
        setIsSubmitting(false);
        return;
      }
    }

    try {
      if (isLoginMode) {
        await signInWithEmail(email, password);
        setIsOpen(false);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setMessage(null);
      } else {
        const result = await signUpWithEmail(email, password);

        if (result.success) {
          setMessage({ type: "success", text: result.message });
          // No cerrar el dialog inmediatamente para que el usuario lea el mensaje
          setEmail("");
          setPassword("");
          setConfirmPassword("");

          // Opcional: cerrar después de unos segundos
          setTimeout(() => {
            setIsOpen(false);
            setMessage(null);
          }, 8000);
        } else {
          setMessage({ type: "error", text: result.message });
        }
      }
    } catch (error: any) {
      console.error(
        isLoginMode ? "Error al iniciar sesión:" : "Error al registrarse:",
        error
      );

      setMessage({
        type: "error",
        text:
          error.message ||
          (isLoginMode ? "Error al iniciar sesión" : "Error al registrarse"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para resetear el formulario al cambiar de modo
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setMessage(null); // Limpiar mensajes
  };

  const { activeFilter, setActiveFilter, setSearchQuery, priceRange } =
    useFilter();
  const [localSearchQuery, setLocalSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearchQuery.toLowerCase());
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchQuery, setSearchQuery]);

  const handleSearch = () => {
    setSearchQuery(localSearchQuery.toLowerCase());
    setActiveFilter("");
  };
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const filters = [
    { id: "all", name: "Todos" },
    { id: "promociones", name: "Promociones" },
    { id: "cubensis", name: "Cubensis" },
    { id: "medicinal", name: "Medicinal" },
    { id: "comestible", name: "Comestible" },
    { id: "Hongo", name: "Hongos" },
    { id: "Sustrato", name: "Sustratos" },
    { id: "Cultivo", name: "Cultivos" },
    { id: "Grano", name: "Granos" },
    { id: "Kits", name: "Kits" },
  ];

  // Verificar si hay un filtro de precio activo
  const isPriceFilterActive =
    priceRange.min !== null || priceRange.max !== null;

  return (
    <div className="bg-emerald-700 dark:bg-gray-900">
      <nav className="flex flex-col md:flex-row items-center justify-between px-6 py-3">
        {/* Logo y Botón Toggle */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2">
            <img
              src="/pwa-512x512.png"
              alt="Logo Zeta Dorada"
              className="h-10 w-10 rounded-full"
            />
            <div className="text-2xl font-bold text-amber-300 dark:text-amber-300 ">
              Zeta Dorada
            </div>
          </div>
          <div className="md:hidden">
            <ModeToggle />
          </div>
        </div>

        {/* Buscador */}
        <div className="w-full md:flex-1 md:mx-2 lg:mx-4 mt-4 md:mt-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-amber-500" />
            </div>
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 pr-12 py-2 w-full rounded-md bg-amber-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-amber-200 dark:border-gray-600 focus:ring-2 focus:ring-amber-400"
            />
            <Button
              onClick={handleSearch}
              className="absolute right-0 top-0 h-full px-4 bg-amber-400 hover:bg-amber-500 text-emerald-800 hover:text-emerald-900 dark:bg-amber-600 dark:hover:bg-amber-700 dark:text-white"
            >
              Buscar
            </Button>
          </div>
        </div>

        {/* Iconos de usuario y carrito */}
        <div className="hidden md:flex items-center gap-4">
          <ModeToggle />

          {/* Drawer para el carrito */}
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                className="relative flex items-center justify-center h-10 w-10 rounded-full hover:bg-amber-100/50 dark:hover:bg-gray-800 text-amber-300 dark:text-amber-300 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                <CartBadge />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <CartDrawerContent />
            </DrawerContent>
          </Drawer>

          {/* Drawer para el formulario de inicio de sesión */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative flex items-center justify-center h-10 w-10 rounded-full hover:bg-amber-100/50 dark:hover:bg-gray-800 text-amber-300 dark:text-amber-300 transition-colors"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-52 p-1" align="end" forceMount>
                <DropdownMenuLabel className="font-normal px-2 py-2">
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Configuración de notificaciones */}
                <div className="p-1">
                  <NotificationSettings />
                </div>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => setShowProfileDialog(true)}
                  className="px-2 py-2"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span className="text-sm">Mi Perfil</span>
                </DropdownMenuItem>

                <Drawer>
                  <DrawerTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="px-2 py-2"
                    >
                      <Bookmark className="mr-2 h-4 w-4" />
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm">Guardados</span>
                        {favoritesState.items.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({favoritesState.items.length})
                          </span>
                        )}
                      </div>
                    </DropdownMenuItem>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Guardados</DrawerTitle>
                    </DrawerHeader>
                    <FavoritesDrawerContent />
                  </DrawerContent>
                </Drawer>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="px-2 py-2 text-red-600 dark:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="text-sm">Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative flex items-center justify-center h-10 w-10 rounded-full hover:bg-amber-100/50 dark:hover:bg-gray-800 text-amber-300 dark:text-amber-300 transition-colors"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-center text-emerald-800 dark:text-amber-400">
                    {isLoginMode ? "Bienvenido" : "Crear Cuenta"}
                  </DialogTitle>
                  <DialogDescription className="text-center mt-2">
                    {isLoginMode
                      ? "Elige cómo quieres ingresar"
                      : "Regístrate para comenzar"}
                  </DialogDescription>
                </DialogHeader>

                {/* Mensaje de estado */}
                {message && (
                  <div
                    className={`mx-6 p-4 rounded-lg text-sm ${
                      message.type === "success"
                        ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.type === "success" ? (
                        <svg
                          className="w-5 h-5 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      <span>{message.text}</span>
                    </div>
                  </div>
                )}

                <div className="mt-6 space-y-4">
                  {/* Botón de Google - Disponible en ambos modos */}
                  <Button
                    variant="outline"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 py-5 border border-gray-300 dark:border-gray-600 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="text-sm font-medium">
                      {isLoginMode
                        ? "Continuar con Google"
                        : "Registrarse con Google"}
                    </span>
                  </Button>

                  {/* Separador */}
                  <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                    <span className="mx-4 text-sm text-gray-500 dark:text-gray-400">
                      o
                    </span>
                    <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                  </div>

                  {/* Formulario tradicional */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Correo electrónico
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className="py-5 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                        required
                      />

                      <Label htmlFor="password" className="text-sm font-medium">
                        Contraseña
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="py-5 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                        required
                        minLength={6}
                      />

                      {/* Campo de confirmación de contraseña solo para registro */}
                      {!isLoginMode && (
                        <>
                          <Label
                            htmlFor="confirmPassword"
                            className="text-sm font-medium"
                          >
                            Confirmar Contraseña
                          </Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="py-5 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                            required
                            minLength={6}
                          />
                        </>
                      )}
                    </div>

                    <div className="pt-2 space-y-3">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-5 bg-emerald-700 hover:bg-emerald-800 dark:bg-amber-600 dark:hover:bg-amber-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting
                          ? isLoginMode
                            ? "Ingresando..."
                            : "Creando cuenta..."
                          : isLoginMode
                          ? "Ingresar"
                          : "Crear Cuenta"}
                      </Button>

                      {/* Botón para alternar entre login y registro */}
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={toggleMode}
                        className="w-full py-3 text-emerald-700 dark:text-amber-400 hover:bg-emerald-50 dark:hover:bg-amber-900/20"
                      >
                        {isLoginMode
                          ? "¿No tienes cuenta? Regístrate"
                          : "¿Ya tienes cuenta? Inicia sesión"}
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsOpen(false)}
                        className="w-full py-5 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </nav>

      {/* Filtros - Solo visible en móvil */}
      <div className="lg:hidden overflow-x-auto px-6 py-4 bg-amber-50 dark:bg-gray-800 scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              onClick={() => {
                setActiveFilter(filter.id);
                setLocalSearchQuery("");
              }}
              className={`whitespace-nowrap ${
                activeFilter === filter.id
                  ? "bg-amber-400 text-emerald-900 dark:bg-amber-600 dark:text-white"
                  : "bg-white/90 text-emerald-800 dark:bg-gray-700/80 dark:text-amber-200"
              } hover:bg-amber-100 hover:text-emerald-900 
              dark:hover:bg-gray-600 dark:hover:text-amber-100
              border border-amber-100 dark:border-gray-600 shadow-sm hover:shadow-amber-100/30
              transition-all duration-200 ease-in-out`}
            >
              {filter.name}
            </Button>
          ))}

          {/* Botón de filtro de precio */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className={`whitespace-nowrap flex items-center gap-1 relative ${
                  isPriceFilterActive
                    ? "bg-amber-400 text-emerald-900 dark:bg-amber-600 dark:text-white"
                    : "bg-white/90 text-emerald-800 dark:bg-gray-700/80 dark:text-amber-200"
                } hover:bg-amber-100 hover:text-emerald-900 
      dark:hover:bg-gray-600 dark:hover:text-amber-100
      border border-amber-100 dark:border-gray-600 shadow-sm hover:shadow-amber-100/30
      transition-all duration-200 ease-in-out group`}
              >
                <span className="flex items-center">
                  <Filter className="h-4 w-4 mr-1" />
                  Precio
                  <ChevronDown className="h-4 w-4 ml-1 transition-transform group-data-[state=open]:rotate-180" />
                </span>

                {isPriceFilterActive && (
                  <span className="absolute -top-2 -right-2 bg-emerald-600 dark:bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {priceRange.min !== null && priceRange.max !== null
                      ? `$${priceRange.min}-$${priceRange.max}`
                      : priceRange.min !== null
                      ? `>$${priceRange.min}`
                      : `<$${priceRange.max}`}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="end">
              <PriceFilter />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <ProfileDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
      />
    </div>
  );
};

// components/top-navbar.tsx
"use client";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Heart, LogOut } from "lucide-react";
import { NotificationSettings } from "./NotificationSettings";
import { FavoritesBadge } from "./FavoritesBadge";
import { ProfileDialog } from "./ProfileDialog";

export const TopNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    signInWithGoogle,
    signInWithFacebook,
    signInWithEmail,
    user,
    logout,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      setIsOpen(false);
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      await signInWithFacebook();
      setIsOpen(false);
    } catch (error) {
      console.error("Error al iniciar sesión con Facebook:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmail(email, password);
      setIsOpen(false);
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Error al iniciar sesión con email:", error);
    }
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
    { id: "Hongo", name: "Hongos" },
    { id: "Sustrato", name: "Sustratos" },
    { id: "Cultivo", name: "Cultivos" },
    { id: "Grano", name: "Granos" },
    { id: "Kits", name: "Kits" },
    { id: "cubensis", name: "Cubensis" },
    { id: "medicinal", name: "Medicinal" },
    { id: "comestible", name: "Comestible" },
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
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.displayName || "Usuario"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Configuración de notificaciones */}
                <div className="p-2">
                  <NotificationSettings />
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowProfileDialog(true)}>
                  <User className="mr-2 h-4 w-4" />
                  Mi Perfil
                </DropdownMenuItem>
                <Drawer>
                  <DrawerTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Heart className="mr-2 h-4 w-4" />
                      Favoritos
                      <FavoritesBadge />
                    </DropdownMenuItem>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Favoritos</DrawerTitle>
                    </DrawerHeader>
                    <FavoritesDrawerContent />
                  </DrawerContent>
                </Drawer>

                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative flex items-center justify-center h-10 w-10 rounded-full hover:bg-amber-100/50 dark:hover:bg-gray-800 text-amber-300 dark:text-amber-300 transition-colors"
                  aria-label="Abrir menú de login"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-md p-6 rounded-lg">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-center text-emerald-800 dark:text-amber-300">
                    Bienvenido
                  </DialogTitle>
                  <DialogDescription className="text-center mt-2">
                    Elige cómo quieres ingresar
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-4">
                  {/* Botón de Google */}
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
                      Continuar con Google
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleFacebookLogin}
                    className="w-full flex items-center justify-center gap-3 py-5 border border-gray-300 dark:border-gray-600 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="#1877F2"
                        d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"
                      />
                    </svg>
                    <span className="text-sm font-medium">
                      Continuar con Facebook
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
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="py-5 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                        required
                      />
                    </div>

                    <div className="pt-2 space-y-3">
                      <Button
                        type="submit"
                        className="w-full py-5 bg-emerald-700 hover:bg-emerald-800 dark:bg-amber-600 dark:hover:bg-amber-700 text-white"
                      >
                        Ingresar
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

      {/* Filtros */}
      <div className="overflow-x-auto px-6 py-4 bg-amber-50 dark:bg-gray-800 scrollbar-hide">
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

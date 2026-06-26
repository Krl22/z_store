import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bookmark,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CartBadge } from "@/components/CartBadge";
import { CartDrawerContent } from "@/components/CartDrawerContent";
import { FavoritesBadge } from "@/components/FavoritesBadge";
import { FavoritesDrawerContent } from "@/components/FavoritesDrawerContent";
import { ModeToggle } from "@/components/mode-toggle";
import { ProfileDialog } from "@/components/ProfileDialog";
import { useAuth } from "@/contexts/auth-context";
import { useFilter } from "@/contexts/filter-context";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export const TopNavbar = () => {
  const navigate = useNavigate();
  const { setSearchQuery, setActiveFilter } = useFilter();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, user, logout } =
    useAuth();
  const [localSearch, setLocalSearch] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(localSearch.toLowerCase());
    }, 250);
    return () => window.clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user?.email) {
        setIsAdmin(false);
        return;
      }
      const snap = await getDoc(doc(db, "admins", user.email.toLowerCase()));
      setIsAdmin(snap.exists());
    };
    checkAdmin();
  }, [user]);

  const submitSearch = () => {
    setSearchQuery(localSearch.toLowerCase());
    setActiveFilter("all");
    navigate("/tienda");
  };

  const handleAuthSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setAuthMessage("");
    if (!isLoginMode && password !== confirmPassword) {
      setAuthMessage("Las contrasenas no coinciden.");
      return;
    }
    try {
      if (isLoginMode) {
        await signInWithEmail(email, password);
      } else {
        const result = await signUpWithEmail(email, password);
        if (!result.success) {
          setAuthMessage(result.message);
          return;
        }
      }
      setAuthOpen(false);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setAuthMessage(
        error instanceof Error ? error.message : "No pudimos iniciar sesion."
      );
    }
  };

  const handleGoogleAuth = async () => {
    await signInWithGoogle();
    setAuthOpen(false);
  };

  const navLinks = (
    <>
      <Link to="/" className="hover:text-[#d8b56d]">
        Inicio
      </Link>
      <Link to="/tienda" className="hover:text-[#d8b56d]">
        Tienda
      </Link>
      {isAdmin && (
        <Link to="/admin" className="hover:text-[#d8b56d]">
          Admin
        </Link>
      )}
    </>
  );

  return (
    <header className="border-b border-[#d8b56d]/20 bg-[#10241d]/95 text-white shadow-sm backdrop-blur">
      <nav className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="flex min-w-fit items-center gap-3">
            <img
              src="/pwa-512x512.png"
              alt="Zeta Dorada"
              className="h-11 w-11 rounded-full"
            />
            <div>
              <p className="text-lg font-semibold leading-none text-[#f5d58b]">
                Zeta Dorada
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-white/55">
                Store V2
              </p>
            </div>
          </Link>

          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg text-white hover:bg-white/10 lg:hidden"
                aria-label="Abrir menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Zeta Dorada</DrawerTitle>
              </DrawerHeader>
              <div className="grid gap-3 p-4 text-[#153328]">
                {navLinks}
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        <div className="hidden items-center gap-6 text-sm text-white/76 lg:flex">
          {navLinks}
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-2 lg:ml-auto lg:flex-nowrap">
          <div className="relative min-w-0 flex-[1_1_100%] lg:flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a67c28]" />
            <Input
              value={localSearch}
              onChange={(event) => setLocalSearch(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && submitSearch()}
              placeholder="Buscar melena, reishi, kits..."
              className="h-10 rounded-lg border-white/10 bg-white/95 pl-9 text-[#153328] placeholder:text-[#7b887e]"
            />
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="hidden rounded-lg text-white hover:bg-white/10 md:inline-flex"
            onClick={submitSearch}
            aria-label="Buscar"
          >
            <Search className="h-4 w-4" />
          </Button>

          <ModeToggle />

          <Drawer>
            <DrawerTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="relative rounded-lg text-white hover:bg-white/10"
                aria-label="Abrir guardados"
              >
                <Bookmark className="h-5 w-5" />
                <FavoritesBadge />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Guardados</DrawerTitle>
              </DrawerHeader>
              <FavoritesDrawerContent />
            </DrawerContent>
          </Drawer>

          <Drawer>
            <DrawerTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="relative rounded-lg text-white hover:bg-white/10"
                aria-label="Abrir carrito"
              >
                <ShoppingBag className="h-5 w-5" />
                <CartBadge />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <CartDrawerContent />
            </DrawerContent>
          </Drawer>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-lg text-white hover:bg-white/10"
                  aria-label="Abrir menu de usuario"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate text-xs">
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                  Mi perfil
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    Panel admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="h-4 w-4" />
                  Cerrar sesion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              className="rounded-lg text-white hover:bg-white/10"
              onClick={() => setAuthOpen(true)}
              aria-label="Ingresar"
            >
              <User className="h-5 w-5" />
            </Button>
          )}
        </div>
      </nav>

      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="rounded-lg sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl text-[#153328]">
              {isLoginMode ? "Bienvenido" : "Crear cuenta"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Button variant="outline" className="rounded-lg" onClick={handleGoogleAuth}>
              Continuar con Google
            </Button>
            <form onSubmit={handleAuthSubmit} className="grid gap-3">
              <Field label="Correo electronico">
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </Field>
              <Field label="Contrasena">
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={6}
                  required
                />
              </Field>
              {!isLoginMode && (
                <Field label="Confirmar contrasena">
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    minLength={6}
                    required
                  />
                </Field>
              )}
              {authMessage && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {authMessage}
                </p>
              )}
              <Button className="rounded-lg bg-[#153328] text-white hover:bg-[#24503f]">
                {isLoginMode ? "Ingresar" : "Crear cuenta"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="rounded-lg"
                onClick={() => {
                  setIsLoginMode((value) => !value);
                  setAuthMessage("");
                }}
              >
                {isLoginMode ? "No tengo cuenta" : "Ya tengo cuenta"}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </header>
  );
};

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <Label>{label}</Label>
      {children}
    </label>
  );
}

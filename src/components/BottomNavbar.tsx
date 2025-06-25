import { Button } from "@/components/ui/button";
import { Home, User, ShoppingCart, Heart, LogOut } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CartDrawerContent } from "./CartDrawerContent";
import { FavoritesDrawerContent } from "./FavoritesDrawerContent";
import { CartBadge } from "./CartBadge";
import { FavoritesBadge } from "./FavoritesBadge";
import { useAuth } from "../contexts/auth-context";
import { NotificationSettings } from "./NotificationSettings";
import { useState } from "react";
import { ProfileDialog } from "./ProfileDialog";

export const BottomNavbar = () => {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showProfileDialog, setShowProfileDialog] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      setIsLoginOpen(false);
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoginMode) {
      // Validación para registro
      if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden");
        return;
      }
      if (password.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres");
        return;
      }
    }

    try {
      if (isLoginMode) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      setIsLoginOpen(false);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(
        isLoginMode ? "Error al iniciar sesión:" : "Error al registrarse:",
        error
      );
    }
  };

  // Función para resetear el formulario al cambiar de modo
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-amber-50 dark:bg-gray-900 border-t border-amber-100 dark:border-gray-700 lg:hidden shadow-[0_-2px_8px_0_rgba(0,0,0,0.04)]">
      <div className="flex justify-around items-center p-2">
        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1 text-emerald-800 dark:text-gray-300 hover:bg-amber-100 hover:text-emerald-900 dark:hover:bg-gray-700/80 dark:hover:text-amber-100 transition-colors"
        >
          <Home className="h-5 w-5" />
        </Button>

        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              className="relative flex flex-col items-center gap-1 text-emerald-800 dark:text-gray-300 hover:bg-amber-100 hover:text-emerald-900 dark:hover:bg-gray-700/80 dark:hover:text-amber-100 transition-colors"
            >
              <Heart className="h-5 w-5" />
              <FavoritesBadge />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Favoritos</DrawerTitle>
              <DrawerDescription>
                Gestiona tus productos favoritos
              </DrawerDescription>
            </DrawerHeader>
            <FavoritesDrawerContent />
          </DrawerContent>
        </Drawer>

        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              className="relative flex flex-col items-center gap-1 text-emerald-800 dark:text-gray-300 hover:bg-amber-100 hover:text-emerald-900 dark:hover:bg-gray-700/80 dark:hover:text-amber-100 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              <CartBadge />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <CartDrawerContent />
          </DrawerContent>
        </Drawer>

        {user ? (
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                className="flex flex-col items-center gap-1 text-emerald-800 dark:text-gray-300 hover:bg-amber-100 hover:text-emerald-900 dark:hover:bg-gray-700/80 dark:hover:text-amber-100 transition-colors"
              >
                <User className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle className="text-center">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.displayName || "Usuario"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DrawerTitle>
                <DrawerDescription className="text-center text-sm text-muted-foreground">
                  Gestiona tu perfil y configuraciones
                </DrawerDescription>
              </DrawerHeader>
              <div className="p-4 space-y-4">
                {/* Configuración de notificaciones */}
                <div className="border-b pb-4">
                  <h3 className="text-sm font-medium mb-2">Notificaciones</h3>
                  <NotificationSettings />
                </div>
                {/* Botón para abrir el perfil */}
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2 justify-start"
                  onClick={() => setShowProfileDialog(true)}
                >
                  <User className="h-4 w-4" />
                  <span>Mi Perfil</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full flex items-center gap-2 justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar sesión</span>
                </Button>
              </div>
            </DrawerContent>
          </Drawer>
        ) : (
          <Drawer open={isLoginOpen} onOpenChange={setIsLoginOpen}>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                className="flex flex-col items-center gap-1 text-emerald-800 dark:text-gray-300 hover:bg-amber-100 hover:text-emerald-900 dark:hover:bg-gray-700/80 dark:hover:text-amber-100 transition-colors"
              >
                <User className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle className="text-2xl text-center text-emerald-800 dark:text-amber-300">
                  {isLoginMode ? "Bienvenido" : "Crear Cuenta"}
                </DrawerTitle>
                <DrawerDescription className="text-center mt-2">
                  {isLoginMode
                    ? "Elige cómo quieres ingresar"
                    : "Regístrate para comenzar"}
                </DrawerDescription>
              </DrawerHeader>

              <div className="p-6 space-y-4">
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
                    <Label htmlFor="email-bottom" className="text-sm font-medium">
                      Correo electrónico
                    </Label>
                    <Input
                      id="email-bottom"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="py-5 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                      required
                    />
                    
                    <Label htmlFor="password-bottom" className="text-sm font-medium">
                      Contraseña
                    </Label>
                    <Input
                      id="password-bottom"
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
                        <Label htmlFor="confirmPassword-bottom" className="text-sm font-medium">
                          Confirmar Contraseña
                        </Label>
                        <Input
                          id="confirmPassword-bottom"
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
                      className="w-full py-5 bg-emerald-700 hover:bg-emerald-800 dark:bg-amber-600 dark:hover:bg-amber-700 text-white"
                    >
                      {isLoginMode ? "Ingresar" : "Crear Cuenta"}
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
                      onClick={() => setIsLoginOpen(false)}
                      className="w-full py-5 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </div>
      <ProfileDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
      />
    </div>
  );
};

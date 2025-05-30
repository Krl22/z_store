import { Button } from "@/components/ui/button";
import { Home, User, ShoppingCart, Heart, LogOut } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { CartDrawerContent } from "./CartDrawerContent";
import { CartBadge } from "./CartBadge";
import { useAuth } from "../contexts/auth-context";

export const BottomNavbar = () => {
  const { user, signInWithGoogle, logout } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    }
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

        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1 text-emerald-800 dark:text-gray-300 hover:bg-amber-100 hover:text-emerald-900 dark:hover:bg-gray-700/80 dark:hover:text-amber-100 transition-colors"
        >
          <Heart className="h-5 w-5" />
        </Button>

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
                <DrawerTitle className="text-center">{user.email}</DrawerTitle>
              </DrawerHeader>
              <div className="p-4 space-y-4">
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
          <Button
            variant="ghost"
            className="flex flex-col items-center gap-1 text-emerald-800 dark:text-gray-300 hover:bg-amber-100 hover:text-emerald-900 dark:hover:bg-gray-700/80 dark:hover:text-amber-100 transition-colors"
            onClick={handleGoogleLogin}
          >
            <User className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

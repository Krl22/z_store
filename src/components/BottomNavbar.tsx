import { Link, useNavigate } from "react-router-dom";
import { Bookmark, Home, ShoppingBag, Store, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { CartBadge } from "@/components/CartBadge";
import { CartDrawerContent } from "@/components/CartDrawerContent";
import { FavoritesBadge } from "@/components/FavoritesBadge";
import { FavoritesDrawerContent } from "@/components/FavoritesDrawerContent";
import { ProfileDialog } from "@/components/ProfileDialog";
import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";

export const BottomNavbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#d8b56d]/20 bg-[#10241d] text-white shadow-[0_-8px_24px_rgba(0,0,0,0.12)] lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 px-2 py-2">
        <Button asChild variant="ghost" className="rounded-lg text-white hover:bg-white/10" aria-label="Ir al inicio">
          <Link to="/">
            <Home className="h-5 w-5" />
          </Link>
        </Button>
        <Button asChild variant="ghost" className="rounded-lg text-white hover:bg-white/10" aria-label="Ir a tienda">
          <Link to="/tienda">
            <Store className="h-5 w-5" />
          </Link>
        </Button>
        <Drawer>
          <DrawerTrigger asChild>
            <Button
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
        <Button
          variant="ghost"
          className="rounded-lg text-white hover:bg-white/10"
          onClick={() => (user ? setProfileOpen(true) : navigate("/tienda"))}
          aria-label="Abrir perfil"
        >
          <User className="h-5 w-5" />
        </Button>
      </div>
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </nav>
  );
};

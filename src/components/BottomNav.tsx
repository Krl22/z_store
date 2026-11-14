import { NavLink } from "react-router-dom";
import { useStore } from "@/state/StoreContext";
import { Icon, type IconName } from "./Icon";

// BottomNavBar(): Inicio, Perfil, Carrito y Admin (solo admins).

export function BottomNav() {
  const { cartCount, isAdmin } = useStore();
  const items: { to: string; label: string; icon: IconName; badge?: number; end?: boolean }[] = [
    { to: "/", label: "Inicio", icon: "home", end: true },
    { to: "/perfil", label: "Perfil", icon: "user" },
    { to: "/carrito", label: "Carrito", icon: "cart", badge: cartCount },
  ];
  if (isAdmin) items.push({ to: "/admin", label: "Admin", icon: "admin" });

  return (
    <nav className="safe-bottom fixed bottom-0 left-0 z-30 w-full border-t md:hidden border-store-line bg-white px-1 pt-[5px] shadow-[0_-4px_14px_rgba(0,0,0,0.08)]">
      <div className="flex gap-0.5 pb-[5px]">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} aria-label={item.label} className="flex h-[54px] flex-1 items-center justify-center">
            {({ isActive }) => (
              <span className="relative grid size-14 place-items-center">
                <span className={`grid size-[46px] place-items-center rounded-full ${isActive ? "bg-store-mint text-store-link" : "text-bosque-ink"}`}>
                  <Icon name={item.icon} size={28} />
                </span>
                {item.badge ? (
                  <span className="absolute right-px top-px flex h-[19px] items-center rounded-full border border-white/80 bg-store-yellow px-1.5 text-[10px] font-black leading-none text-bosque-ink">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                ) : null}
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

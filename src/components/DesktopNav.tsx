import { Link, NavLink } from "react-router-dom";
import { useStore } from "@/state/StoreContext";
import { Icon, type IconName } from "./Icon";

// En escritorio la barra inferior de la app pasa arriba, con logo y etiquetas.

export function DesktopNav() {
  const { cartCount, isAdmin, session } = useStore();
  const items: { to: string; label: string; icon: IconName; badge?: number; end?: boolean }[] = [
    { to: "/", label: "Inicio", icon: "home", end: true },
    { to: "/perfil", label: session ? "Perfil" : "Ingresar", icon: "user" },
    { to: "/carrito", label: "Carrito", icon: "cart", badge: cartCount },
  ];
  if (isAdmin) items.push({ to: "/admin", label: "Admin", icon: "admin" });

  return (
    <nav className="sticky top-0 z-30 hidden h-16 border-b border-store-line bg-white md:block">
      <div className="mx-auto flex h-full max-w-[1320px] items-center gap-6 px-6">
        <Link to="/" className="shrink-0" aria-label="Zeta Dorada, inicio">
          <img src="/brand/logo-wide.webp" alt="Zeta Dorada" className="h-12 w-auto" />
        </Link>
        <div className="ml-auto flex items-center gap-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `relative flex h-11 items-center gap-2 rounded-full px-4 text-[15px] font-bold ${isActive ? "bg-store-mint text-store-link" : "text-bosque-ink hover:bg-bosque-soft"}`
              }
            >
              <Icon name={item.icon} size={24} />
              {item.label}
              {item.badge ? (
                <span className="flex h-[19px] items-center rounded-full bg-store-yellow px-1.5 text-[11px] font-black leading-none text-bosque-ink">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              ) : null}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

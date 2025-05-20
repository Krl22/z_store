import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { User, ShoppingCart } from "lucide-react";
import { useFilter } from "./filter-context";

export const TopNavbar = () => {
  const { activeFilter, setActiveFilter } = useFilter();

  const filters = [
    { id: "all", name: "Todos" },
    { id: "promociones", name: "Promociones" },
    { id: "Hongo", name: "Hongos" },
    { id: "Sustrato", name: "Sustratos" },
    { id: "Cultivo", name: "Cultivos" },
    { id: "Grano", name: "Granos" },
    { id: "Kits", name: "Kits" },
  ];

  return (
    <div className="bg-emerald-700 dark:bg-gray-900">
      {/* Primera fila: Logo, buscador y botón de toggle */}
      <nav className="flex flex-col md:flex-row items-center justify-between px-6 py-3">
        {/* Logo y Botón Toggle */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="text-2xl font-bold text-amber-300 dark:text-amber-300 font-serif">
            Zeta Dorada
          </div>
          <div className="md:hidden">
            <ModeToggle />
          </div>
        </div>

        {/* Buscador */}
        <div className="w-full md:flex-1 md:mx-2 lg:mx-4 mt-4 md:mt-0">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar productos..."
              className="pl-4 pr-10 py-2 w-full rounded-md bg-amber-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-amber-200 dark:border-gray-600 focus:ring-2 focus:ring-amber-400"
            />
            <Button className="absolute right-0 top-0 h-full px-4 bg-amber-400 hover:bg-amber-500 text-emerald-800 hover:text-emerald-900 dark:bg-amber-600 dark:hover:bg-amber-700 dark:text-white">
              Buscar
            </Button>
          </div>
        </div>

        {/* Iconos de usuario y carrito */}
        <div className="hidden md:flex items-center gap-4">
          <ModeToggle />
          <Button variant="ghost" size="icon" className="hover:bg-amber-400/20">
            <User className="h-5 w-5 text-amber-400 dark:text-amber-300" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-amber-400/20">
            <ShoppingCart className="h-5 w-5 text-amber-400 dark:text-amber-300" />
          </Button>
        </div>
      </nav>

      {/* Segunda fila: Botones de filtro */}
      <div className="overflow-x-auto px-6 py-4 bg-amber-50 dark:bg-gray-800 scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
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
        </div>
      </div>
    </div>
  );
};

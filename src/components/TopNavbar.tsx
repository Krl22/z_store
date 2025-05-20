// components/top-navbar.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { User, ShoppingCart, Search } from "lucide-react";
import { useFilter } from "./filter-context";
import { useState, useEffect } from "react";

export const TopNavbar = () => {
  const { activeFilter, setActiveFilter, setSearchQuery } = useFilter();
  const [localSearchQuery, setLocalSearchQuery] = useState("");

  // Debounce para evitar búsquedas en cada tecla presionada
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearchQuery.toLowerCase());
    }, 300); // 300ms de delay

    return () => clearTimeout(timer);
  }, [localSearchQuery, setSearchQuery]);

  const handleSearch = () => {
    setSearchQuery(localSearchQuery.toLowerCase());
    setActiveFilter(""); // Resetear filtro al buscar
  };

  const filters = [
    { id: "all", name: "Todos" },
    { id: "promociones", name: "Promociones" },
    { id: "Hongos", name: "Hongos" },
    { id: "Sustratos", name: "Sustratos" },
    { id: "Cultivos", name: "Cultivos" },
    { id: "Granos", name: "Granos" },
    { id: "Kits", name: "Kits" },
  ];

  return (
    <div className="bg-emerald-700 dark:bg-gray-900">
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

        {/* Buscador Mejorado */}
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
          <Button variant="ghost" size="icon" className="hover:bg-amber-400/20">
            <User className="h-5 w-5 text-amber-400 dark:text-amber-300" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-amber-400/20">
            <ShoppingCart className="h-5 w-5 text-amber-400 dark:text-amber-300" />
          </Button>
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
                setLocalSearchQuery(""); // Limpiar búsqueda al aplicar filtro
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
        </div>
      </div>
    </div>
  );
};

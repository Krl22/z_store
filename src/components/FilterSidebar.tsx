import { Button } from "@/components/ui/button";
import { useFilter } from "../contexts/filter-context";
import { PriceFilter } from "./price-filter";
import { Filter, X } from "lucide-react";

interface FilterSidebarProps {
  className?: string;
}

export function FilterSidebar({ className = "" }: FilterSidebarProps) {
  const { activeFilter, setActiveFilter, resetFilters, priceRange } = useFilter();

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

  const hasActiveFilters = activeFilter !== "" && activeFilter !== "all" || 
    priceRange.min !== null || priceRange.max !== null;

  return (
    <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-emerald-700 dark:text-amber-400" />
            <h2 className="text-lg font-semibold text-emerald-800 dark:text-amber-300">
              Filtros
            </h2>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>

        {/* Category Filters */}
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Categorías
          </h3>
          <div className="space-y-2">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                variant={activeFilter === filter.id ? "default" : "ghost"}
                className={`w-full justify-start text-left h-auto py-2 px-3 ${
                  activeFilter === filter.id
                    ? "bg-amber-400 text-emerald-900 hover:bg-amber-500 dark:bg-amber-600 dark:text-white dark:hover:bg-amber-700"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {filter.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Price Filter */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            Precio
          </h3>
          <PriceFilter />
        </div>
      </div>
    </div>
  );
}
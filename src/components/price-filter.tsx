// components/price-filter.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useFilter } from "../contexts/filter-context";
import { X } from "lucide-react";
import { useState } from "react";

export function PriceFilter() {
  const { priceRange, setPriceRange, resetFilters } = useFilter();
  const [localRange, setLocalRange] = useState({
    min: priceRange.min?.toString() || "",
    max: priceRange.max?.toString() || "",
  });

  const handleApply = () => {
    setPriceRange({
      min: localRange.min ? parseFloat(localRange.min) : null,
      max: localRange.max ? parseFloat(localRange.max) : null,
    });
  };

  const handleReset = () => {
    setLocalRange({ min: "", max: "" });
    resetFilters();
  };

  return (
    <div className="space-y-2 p-4 bg-amber-50 dark:bg-gray-800 rounded-lg border border-amber-100 dark:border-gray-700">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-emerald-800 dark:text-amber-300">
          Rango de precios
        </h3>
        {(priceRange.min !== null || priceRange.max !== null) && (
          <button
            onClick={handleReset}
            className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label
            htmlFor="minPrice"
            className="text-xs text-gray-600 dark:text-gray-400"
          >
            Mínimo
          </Label>
          <Input
            id="minPrice"
            type="number"
            placeholder="$0"
            value={localRange.min}
            onChange={(e) =>
              setLocalRange({ ...localRange, min: e.target.value })
            }
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label
            htmlFor="maxPrice"
            className="text-xs text-gray-600 dark:text-gray-400"
          >
            Máximo
          </Label>
          <Input
            id="maxPrice"
            type="number"
            placeholder="$9999"
            value={localRange.max}
            onChange={(e) =>
              setLocalRange({ ...localRange, max: e.target.value })
            }
            className="h-8 text-sm"
          />
        </div>
      </div>

      <Button
        onClick={handleApply}
        className="w-full h-8 bg-amber-400 hover:bg-amber-500 text-emerald-800 dark:bg-amber-600 dark:hover:bg-amber-700 dark:text-white text-sm"
      >
        Aplicar rango
      </Button>
    </div>
  );
}

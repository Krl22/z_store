// components/filter-context.tsx
"use client";

import { createContext, useContext, useState } from "react";

type PriceRange = {
  min: number | null;
  max: number | null;
};

type FilterContextType = {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  priceRange: PriceRange;
  setPriceRange: (range: PriceRange) => void;
  resetFilters: () => void;
};

const FilterContext = createContext<FilterContextType>({
  activeFilter: "",
  setActiveFilter: () => {},
  searchQuery: "",
  setSearchQuery: () => {},
  priceRange: { min: null, max: null },
  setPriceRange: () => {},
  resetFilters: () => {},
});

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [activeFilter, setActiveFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<PriceRange>({
    min: null,
    max: null,
  });

  const resetFilters = () => {
    setActiveFilter("");
    setSearchQuery("");
    setPriceRange({ min: null, max: null });
  };

  return (
    <FilterContext.Provider
      value={{
        activeFilter,
        setActiveFilter,
        searchQuery,
        setSearchQuery,
        priceRange,
        setPriceRange,
        resetFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  return useContext(FilterContext);
}

// components/filter-context.tsx
"use client";

import { createContext, useContext, useState } from "react";
import { analytics } from "../lib/firebase";
import { logEvent } from "firebase/analytics";

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
  const [activeFilter, setActiveFilterState] = useState("");
  const [searchQuery, setSearchQueryState] = useState("");
  const [priceRange, setPriceRangeState] = useState<PriceRange>({
    min: null,
    max: null,
  });

  // 📊 Analytics: Wrapper para setActiveFilter
  const setActiveFilter = (filter: string) => {
    setActiveFilterState(filter);
    
    // Log del evento de filtro aplicado
    logEvent(analytics, "filter_applied", {
      filter_type: "category",
      filter_value: filter,
      previous_filter: activeFilter
    });
  };

  // 📊 Analytics: Wrapper para setSearchQuery
  const setSearchQuery = (query: string) => {
    setSearchQueryState(query);
    
    // Log del evento de búsqueda
    if (query.trim()) {
      logEvent(analytics, "search", {
        search_term: query,
        search_type: "product_search"
      });
    }
  };

  // 📊 Analytics: Wrapper para setPriceRange
  const setPriceRange = (range: PriceRange) => {
    setPriceRangeState(range);
    
    // Log del evento de filtro de precio
    logEvent(analytics, "filter_applied", {
      filter_type: "price_range",
      filter_value: `${range.min || 0}-${range.max || 'unlimited'}`,
      min_price: range.min,
      max_price: range.max
    });
  };

  const resetFilters = () => {
    const previousFilter = activeFilter;
    const previousSearch = searchQuery;
    const previousPriceRange = priceRange;
    
    setActiveFilterState("");
    setSearchQueryState("");
    setPriceRangeState({ min: null, max: null });
    
    // 📊 Analytics: Log del reset de filtros
    logEvent(analytics, "filters_reset", {
      previous_filter: previousFilter,
      previous_search: previousSearch,
      previous_price_range: `${previousPriceRange.min || 0}-${previousPriceRange.max || 'unlimited'}`
    });
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

// components/filter-context.tsx
"use client";

import { createContext, useContext, useState } from "react";

type FilterContextType = {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

const FilterContext = createContext<FilterContextType>({
  activeFilter: "",
  setActiveFilter: () => {},
  searchQuery: "",
  setSearchQuery: () => {},
});

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [activeFilter, setActiveFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <FilterContext.Provider
      value={{
        activeFilter,
        setActiveFilter,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  return useContext(FilterContext);
}

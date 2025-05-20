// components/filter-context.tsx
"use client";

import { createContext, useContext, useState } from "react";

type FilterContextType = {
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
};

const FilterContext = createContext<FilterContextType>({
  activeFilter: "",
  setActiveFilter: () => {},
});

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [activeFilter, setActiveFilter] = useState("");

  return (
    <FilterContext.Provider value={{ activeFilter, setActiveFilter }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  return useContext(FilterContext);
}

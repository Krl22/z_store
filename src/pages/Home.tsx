import { useEffect, useState } from "react";
import { useFilter } from "@/components/filter-context";

type Producto = {
  ID: string;
  Tipo: string;
  Categoria: string;
  Subcategoria: string;
  Hongo: string;
  stock: string;
  unidad: string;
  precio: string;
  image: string;
  promocion?: string;
};

function useGoogleSheet(csvUrl: string) {
  const [data, setData] = useState<Producto[]>([]);

  useEffect(() => {
    fetch(csvUrl)
      .then((res) => res.text())
      .then((text) => {
        const rows = text
          .trim()
          .split("\n")
          .map((row) => row.split(","));
        const headers = rows[0].map((header) => header.replace(/\r/g, ""));
        const json = rows.slice(1).map((row) => {
          const cleanedRow = row.map((cell) => cell.replace(/\r/g, ""));
          return Object.fromEntries(
            cleanedRow.map((cell, i) => [headers[i], cell])
          ) as Producto;
        });
        setData(json);
      });
  }, [csvUrl]);

  return data;
}

export default function Home() {
  const { activeFilter, searchQuery } = useFilter();
  const data = useGoogleSheet(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTUIcUqIZi-QQVPcAPnpGr06n5gCj5r2qTOsWd-D3QGRWlu6aCKBkLIJBJOmbOEQMMQHP_6qzl1Mkir/pub?gid=1806455741&single=true&output=csv"
  );

  const filteredProducts = data.filter((producto) => {
    // Primero aplicar filtro de categoría
    let matchesFilter = true;
    if (activeFilter && activeFilter !== "all") {
      if (activeFilter === "promociones") {
        matchesFilter = producto.promocion === "true";
      } else {
        matchesFilter =
          producto.Categoria === activeFilter ||
          producto.Subcategoria === activeFilter ||
          producto.Tipo === activeFilter;
      }
    }

    // Luego aplicar búsqueda si existe
    if (searchQuery && matchesFilter) {
      const query = searchQuery.toLowerCase();
      return (
        producto.Hongo.toLowerCase().includes(query) ||
        producto.Tipo.toLowerCase().includes(query) ||
        producto.Categoria.toLowerCase().includes(query) ||
        producto.Subcategoria.toLowerCase().includes(query) ||
        producto.precio.includes(query)
      );
    }

    return matchesFilter;
  });

  return (
    <div className="px-4 py-6 lg:px-8 mt-40 lg:mt-28">
      <h1 className="text-2xl lg:text-3xl font-bold mb-6 text-emerald-800 dark:text-amber-300 font-serif text-center lg:text-left">
        {activeFilter
          ? `Productos: ${activeFilter}`
          : "Todos nuestros productos"}
      </h1>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        {filteredProducts.map((producto) => (
          <div
            key={producto.ID}
            className="border border-amber-100 dark:border-gray-700 rounded-lg p-3 
                      bg-white dark:bg-gray-800 shadow-sm hover:shadow-md
                      transition-shadow duration-200 flex flex-col"
          >
            {/* Contenedor 1:1 para la imagen */}
            <div className="relative pb-[100%] mb-3 rounded-md overflow-hidden">
              <img
                src={`/${producto.image}`}
                alt={producto.Hongo}
                className="absolute w-full h-full object-cover"
              />
            </div>

            <h2 className="text-base lg:text-lg font-semibold text-emerald-800 dark:text-amber-200 mb-1 line-clamp-2">
              {producto.Hongo}
            </h2>

            <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mb-2 flex-grow">
              <p className="line-clamp-1">
                {producto.Tipo} • {producto.Categoria} {producto.Subcategoria}
              </p>
              <p className="mt-1">
                {producto.stock} {producto.unidad} restantes
              </p>
            </div>

            <div className="flex items-center justify-between mt-auto">
              <p className="font-bold text-emerald-700 dark:text-amber-400 text-base lg:text-lg">
                ${producto.precio}
              </p>

              <button
                className="px-2 lg:px-3 py-1 text-xs lg:text-sm bg-amber-400 hover:bg-amber-500 text-emerald-800 
                             dark:bg-amber-600 dark:hover:bg-amber-700 dark:text-white rounded
                             transition-colors duration-150 font-medium"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

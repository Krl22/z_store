import { useEffect, useState } from "react";
import { useFilter } from "@/contexts/filter-context";
import { useCart } from "../contexts/cart-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  descripcion: string;
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
  const { activeFilter, searchQuery, priceRange } = useFilter();
  const { dispatch } = useCart();
  const [addedItems, setAddedItems] = useState<{ [key: string]: boolean }>({});
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const data = useGoogleSheet(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTUIcUqIZi-QQVPcAPnpGr06n5gCj5r2qTOsWd-D3QGRWlu6aCKBkLIJBJOmbOEQMMQHP_6qzl1Mkir/pub?gid=1806455741&single=true&output=csv"
  );

  const filteredProducts = data.filter((producto) => {
    const precio = parseFloat(producto.precio) || 0;
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

    let matchesPrice = true;
    if (priceRange.min !== null) {
      matchesPrice = precio >= priceRange.min;
    }
    if (priceRange.max !== null) {
      matchesPrice = matchesPrice && precio <= priceRange.max;
    }

    let matchesSearch = true;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matchesSearch =
        producto.Hongo.toLowerCase().includes(query) ||
        producto.Tipo.toLowerCase().includes(query) ||
        producto.Categoria.toLowerCase().includes(query) ||
        producto.Subcategoria.toLowerCase().includes(query) ||
        producto.precio.includes(query);
    }

    return matchesFilter && matchesPrice && matchesSearch;
  });

  const handleAddToCart = (producto: Producto, e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que el click se propague al contenedor padre
    dispatch({
      type: "ADD_ITEM",
      payload: {
        ID: producto.ID,
        Hongo: producto.Hongo,
        precio: producto.precio,
        image: producto.image,
        cantidad: 1,
      },
    });

    setAddedItems((prev) => ({ ...prev, [producto.ID]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [producto.ID]: false }));
    }, 1000);
  };

  const openProductDialog = (producto: Producto) => {
    setSelectedProduct(producto);
    setIsDialogOpen(true);
  };

  return (
    <div className="px-4 py-6 lg:px-8 mt-42 mb-14 lg:mt-28">
      <h1 className="text-2xl lg:text-3xl font-bold mb-6 text-emerald-800 dark:text-amber-300  text-center lg:text-left">
        {activeFilter
          ? `Productos: ${activeFilter}`
          : "Todos nuestros productos"}
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        {filteredProducts.map((producto) => (
          <div
            key={producto.ID}
            onClick={() => openProductDialog(producto)}
            className="group border border-amber-100 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1 hover:scale-[1.02]"
          >
            {/* Contenedor de imagen con efecto de zoom */}
            <div className="relative pb-[100%] mb-3 rounded-md overflow-hidden">
              <img
                src={`/${producto.image}`}
                alt={producto.Hongo}
                className="absolute w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Información mínima */}
            <h2 className="text-base lg:text-lg font-semibold text-emerald-800 dark:text-amber-200 mb-1 line-clamp-1">
              {producto.Hongo}
            </h2>

            <div className="flex items-center justify-between mt-auto">
              <p className="font-bold text-emerald-700 dark:text-amber-400 text-base lg:text-lg">
                S/{producto.precio}
              </p>
              <button
                onClick={(e) => handleAddToCart(producto, e)}
                className={`px-2 lg:px-3 py-1 text-xs lg:text-sm ${
                  addedItems[producto.ID]
                    ? "bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                    : "bg-amber-400 hover:bg-amber-500 dark:bg-amber-600 dark:hover:bg-amber-700"
                } 
                  text-emerald-800 dark:text-white rounded transition-all duration-150 font-medium min-w-[2rem] group-hover:opacity-100 opacity-90`}
              >
                {addedItems[producto.ID] ? "✓" : "+"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Diálogo del producto */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="text-emerald-800 dark:text-amber-300">
              {selectedProduct?.Hongo}
            </DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative pb-[100%] rounded-md overflow-hidden">
                  <img
                    src={`/${selectedProduct.image}`}
                    alt={selectedProduct.Hongo}
                    className="absolute w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-lg text-emerald-700 dark:text-amber-200">
                      Detalles
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedProduct.Tipo} • {selectedProduct.Categoria} •{" "}
                      {selectedProduct.Subcategoria}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-lg text-emerald-700 dark:text-amber-200">
                      Disponibilidad
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedProduct.stock} {selectedProduct.unidad} restantes
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-lg text-emerald-700 dark:text-amber-200">
                      Descripción
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedProduct.descripcion}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <p className="font-bold text-xl text-emerald-700 dark:text-amber-400">
                      S/{selectedProduct.precio}
                    </p>
                    <Button
                      onClick={(e) => {
                        handleAddToCart(selectedProduct, e);
                        setIsDialogOpen(false);
                      }}
                      className="bg-amber-400 hover:bg-amber-500 dark:bg-amber-600 dark:hover:bg-amber-700 text-emerald-800 dark:text-white"
                    >
                      Añadir al carrito
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

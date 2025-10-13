import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFavorites } from "../contexts/favorites-context";
import { useCart } from "../contexts/cart-context";
import { Trash2, ShoppingCart, Bookmark } from "lucide-react";
import { useState } from "react";
import { useProductDialog } from "../contexts/product-dialog-context";

type Producto = {
  ID: string;
  Tipo: string;
  Categoria: string;
  Subcategoria: string;
  Hongo: string;
  Nombre: string;
  stock: string;
  unidad: string;
  precio: string;
  image: string;
  descripcion: string;
  promocion?: string;
};

interface FavoritesDrawerContentProps {
  // Removido onProductClick - ahora usa el contexto directamente
}

export const FavoritesDrawerContent =
  ({}: FavoritesDrawerContentProps = {}) => {
    const { state, dispatch } = useFavorites();
    const { dispatch: cartDispatch } = useCart();
    const { openProductDialog } = useProductDialog();
    const [addedItems, setAddedItems] = useState<{ [key: string]: boolean }>(
      {}
    );

    // Función para convertir FavoriteItem a Producto
    const convertFavoriteToProducto = (item: any): Producto => {
      // Inferir subcategoría basada en el tipo y categoría
      let subcategoria = "";
      if (item.Tipo && item.Categoria) {
        if (item.Categoria.toLowerCase().includes("grano")) {
          subcategoria = "Colonizado";
        } else if (item.Categoria.toLowerCase().includes("kit")) {
          subcategoria = "Completo";
        } else if (item.Categoria.toLowerCase().includes("sustrato")) {
          subcategoria = "Esterilizado";
        }
      }

      // Inferir stock y unidad basado en la categoría
      let stock = "Disponible";
      let unidad = "unidad";
      if (item.Categoria) {
        if (item.Categoria.toLowerCase().includes("grano")) {
          stock = "30";
          unidad = "Bolsas";
        } else if (item.Categoria.toLowerCase().includes("kit")) {
          stock = "15";
          unidad = "Kits";
        } else if (item.Categoria.toLowerCase().includes("sustrato")) {
          stock = "25";
          unidad = "Bolsas";
        }
      }

      return {
        ID: item.ID,
        Tipo: item.Tipo || "",
        Categoria: item.Categoria || "",
        Subcategoria: subcategoria,
        Hongo: item.Nombre || "",
        Nombre: item.Nombre,
        stock: stock,
        unidad: unidad,
        precio: item.precio,
        image: item.image,
        descripcion: item.descripcion || "",
        promocion: undefined,
      };
    };

    const handleRemoveFromFavorites = (productId: string) => {
      dispatch({ type: "REMOVE_FAVORITE", payload: productId });
    };

    const handleAddToCart = (item: any) => {
      cartDispatch({
        type: "ADD_ITEM",
        payload: {
          ID: item.ID,
          Nombre: item.Nombre,
          precio: item.precio,
          image: item.image,
          cantidad: 1,
        },
      });

      setAddedItems((prev) => ({ ...prev, [item.ID]: true }));
      setTimeout(() => {
        setAddedItems((prev) => ({ ...prev, [item.ID]: false }));
      }, 1000);
    };

    const handleClearFavorites = () => {
      dispatch({ type: "CLEAR_FAVORITES" });
    };

    if (state.isLoading) {
      return (
        <div className="flex flex-col h-[80vh]">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Mis Guardados</h2>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Cargando guardados...</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-[80vh]">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold">Mis Guardados</h2>
            <span className="text-sm text-gray-500">
              ({state.items.length})
            </span>
          </div>

          {/* Sync Status */}
          <div className="flex items-center gap-2">
            {state.items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFavorites}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {state.items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Bookmark className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No tienes guardados aún
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Agrega productos a tus guardados para verlos aquí
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Favorites List */}
            <ScrollArea
              className="flex-1 overflow-hidden"
              style={{ maxHeight: "calc(80vh - 140px)" }}
            >
              <div className="p-4 space-y-3">
                {state.items.map((item) => (
                  <div
                    key={item.ID}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                  >
                    {/* Área clickeable del producto */}
                    <div className="flex items-center gap-3 flex-1 min-w-0 relative">
                      <button
                        className="absolute inset-0 w-full h-full cursor-pointer z-10 bg-transparent hover:bg-black/5 transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Favorites item button clicked:", item);
                          console.log(
                            "openProductDialog function:",
                            openProductDialog
                          );
                          openProductDialog(convertFavoriteToProducto(item));
                        }}
                        aria-label={`Ver detalles de ${item.Nombre}`}
                      />
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img
                          src={item.image}
                          alt={item.Nombre}
                          className="w-12 h-12 object-cover rounded-md"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                            {item.Nombre}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {item.Categoria}
                          </p>
                          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                            S/ {item.precio}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Controles de favoritos */}
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(item)}
                        className={`h-8 px-2 transition-all duration-200 ${
                          addedItems[item.ID]
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-amber-600 hover:bg-amber-700"
                        }`}
                      >
                        <ShoppingCart className="h-3 w-3" />
                        {addedItems[item.ID] ? "✓" : "+"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveFromFavorites(item.ID)}
                        className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    );
  };

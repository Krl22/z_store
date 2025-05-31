import { useCart } from "../contexts/cart-context";
import { Button } from "./ui/button";
import {
  DrawerClose,
  DrawerTitle,
  DrawerDescription,
  DrawerHeader,
} from "./ui/drawer";
import { Minus, Plus, Trash2, ChevronDown } from "lucide-react";
import { YapePayment } from "./YapePayment";
import { Dialog, DialogTrigger } from "./ui/dialog";
import { useEffect, useState } from "react";

export const CartDrawerContent = () => {
  const { state, dispatch } = useCart();
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const updateQuantity = (ID: string, newQuantity: number) => {
    if (newQuantity < 1) {
      dispatch({ type: "REMOVE_ITEM", payload: ID });
    } else {
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: { ID, cantidad: newQuantity },
      });
    }
  };

  useEffect(() => {
    const container = document.querySelector(".cart-items-container");
    if (container) {
      const checkScroll = () => {
        setShowScrollHint(container.scrollHeight > container.clientHeight);
        setHasScrolled(container.scrollTop > 0);
      };

      container.addEventListener("scroll", checkScroll);
      checkScroll(); // Check initial state

      return () => container.removeEventListener("scroll", checkScroll);
    }
  }, [state.items]);

  return (
    <div className="flex flex-col h-full max-h-[70vh]">
      <DrawerHeader className="pb-2 flex-shrink-0">
        {" "}
        {/* flex-shrink-0 evita que se comprima */}
        <DrawerTitle>Tu Carrito de Compras</DrawerTitle>
        <DrawerDescription>
          Aquí puedes revisar los productos que has agregado a tu carrito
        </DrawerDescription>
      </DrawerHeader>

      {/* Contenedor principal - la clave está en min-h-0 y flex-1 */}
      <div className="flex-1 flex flex-col relative min-h-0 overflow-hidden">
        <div
          className={`cart-items-container flex-1 overflow-y-auto px-4 py-2 transition-all ${
            hasScrolled ? "pb-4" : "pb-2"
          }`}
          style={{ maxHeight: "calc(100% - 0px)" }}
        >
          {state.items.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              Tu carrito está vacío
            </p>
          ) : (
            <div className="space-y-3">
              {state.items.map((item) => (
                <div
                  key={item.ID}
                  className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm"
                >
                  <img
                    src={`/${item.image}`}
                    alt={item.Hongo}
                    className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-emerald-800 dark:text-amber-300 text-sm truncate">
                      {item.Hongo}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      S/{item.precio}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() =>
                          updateQuantity(item.ID, item.cantidad - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">
                        {item.cantidad}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() =>
                          updateQuantity(item.ID, item.cantidad + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto text-red-500 h-7 w-7 p-0"
                        onClick={() =>
                          dispatch({ type: "REMOVE_ITEM", payload: item.ID })
                        }
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Indicador de scroll */}
        {showScrollHint && !hasScrolled && (
          <div className="absolute bottom-16 left-0 right-0 flex justify-center animate-bounce z-10">
            <div className="bg-amber-400 dark:bg-amber-600 text-emerald-800 dark:text-white p-1.5 rounded-full shadow-lg">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        )}
      </div>

      {/* Sección de pago FIJA - la clave está en flex-shrink-0 */}
      {state.items.length > 0 && (
        <div className="flex-shrink-0 bg-background border-t border-gray-200 dark:border-gray-700 p-3 space-y-3 shadow-lg mt-auto">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span>S/{state.total.toFixed(2)}</span>
          </div>
          <div className="space-y-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full bg-amber-400 hover:bg-amber-500 text-emerald-800 dark:bg-amber-600 dark:hover:bg-amber-700 dark:text-white h-10">
                  Proceder al pago
                </Button>
              </DialogTrigger>
              <YapePayment />
            </Dialog>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full h-9">
                Seguir comprando
              </Button>
            </DrawerClose>
          </div>
        </div>
      )}
    </div>
  );
};

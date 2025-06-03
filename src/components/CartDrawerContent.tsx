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
import { useEffect, useState, useRef } from "react";
import { Cloud } from "lucide-react";

export const CartDrawerContent = () => {
  const { state, dispatch } = useCart();
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Función para detener el auto-scroll
  const stopAutoScroll = () => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
    if (autoScrollTimeoutRef.current) {
      clearTimeout(autoScrollTimeoutRef.current);
      autoScrollTimeoutRef.current = null;
    }
    setIsAutoScrolling(false);
    setUserInteracted(true);
  };

  // Función para iniciar el auto-scroll
  const startAutoScroll = () => {
    if (!containerRef.current || userInteracted || state.items.length <= 2)
      return;

    const container = containerRef.current;
    const maxScroll = container.scrollHeight - container.clientHeight;

    if (maxScroll <= 0) return; // No hay contenido para hacer scroll

    setIsAutoScrolling(true);
    let currentScroll = 0;
    const scrollStep = 0.5; // Píxeles por paso
    const scrollDelay = 50; // Milisegundos entre pasos (más bajo = más rápido)

    autoScrollIntervalRef.current = setInterval(() => {
      if (!containerRef.current || userInteracted) {
        stopAutoScroll();
        return;
      }

      currentScroll += scrollStep;
      containerRef.current.scrollTop = currentScroll;

      // Si llegamos al final, esperamos un poco y volvemos al inicio
      if (currentScroll >= maxScroll) {
        clearInterval(autoScrollIntervalRef.current!);
        autoScrollTimeoutRef.current = setTimeout(() => {
          if (containerRef.current && !userInteracted) {
            containerRef.current.scrollTop = 0;
            currentScroll = 0;
            startAutoScroll(); // Reiniciar el ciclo
          }
        }, 2000); // Pausa de 2 segundos al final
      }
    }, scrollDelay);
  };

  // Detectar interacciones del usuario
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleUserInteraction = () => {
      stopAutoScroll();
    };

    // Eventos de interacción
    const events = ["mousedown", "touchstart", "wheel", "keydown"];

    events.forEach((event) => {
      container.addEventListener(event, handleUserInteraction, {
        passive: true,
      });
      document.addEventListener(event, handleUserInteraction, {
        passive: true,
      });
    });

    return () => {
      events.forEach((event) => {
        container.removeEventListener(event, handleUserInteraction);
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, []);

  // Iniciar auto-scroll cuando se abra el drawer
  useEffect(() => {
    if (state.items.length > 2) {
      // Resetear estado cuando cambian los items
      setUserInteracted(false);

      // Esperar un poco para que el drawer se abra completamente
      const timer = setTimeout(() => {
        startAutoScroll();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [state.items.length]);

  // Limpiar intervalos al desmontar
  useEffect(() => {
    return () => {
      stopAutoScroll();
    };
  }, []);

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
        <div className="flex items-center justify-between">
          <div>
            <DrawerTitle>Tu Carrito de Compras</DrawerTitle>
            <DrawerDescription>
              Aquí puedes revisar los productos que has agregado a tu carrito
            </DrawerDescription>
          </div>
          {/* Indicador de sincronización */}
          <div className="flex items-center gap-2">
            {state.isSyncing ? (
              <div className="flex items-center gap-1 text-blue-500">
                <Cloud className="h-4 w-4 animate-pulse" />
                <span className="text-xs">Sincronizando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-green-500">
                <Cloud className="h-4 w-4" />
                <span className="text-xs">Sincronizado</span>
              </div>
            )}
          </div>
        </div>
      </DrawerHeader>

      {/* Contenedor principal */}
      <div className="flex-1 flex flex-col relative min-h-0 overflow-hidden">
        <div
          ref={containerRef}
          className={`cart-items-container flex-1 overflow-y-auto px-4 py-2 transition-all ${
            hasScrolled ? "pb-4" : "pb-2"
          } ${isAutoScrolling ? "scroll-smooth" : ""}`}
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

        {/* Indicador de scroll mejorado */}
        {showScrollHint && !hasScrolled && !isAutoScrolling && (
          <div className="absolute bottom-16 left-0 right-0 flex justify-center animate-bounce z-10">
            <div className="bg-amber-400 dark:bg-amber-600 text-emerald-800 dark:text-white p-1.5 rounded-full shadow-lg">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        )}
      </div>

      {/* Sección de pago */}
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

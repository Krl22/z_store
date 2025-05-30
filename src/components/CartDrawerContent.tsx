import { useCart } from "../contexts/cart-context";
import { Button } from "./ui/button";
import {
  DrawerClose,
  DrawerTitle,
  DrawerDescription,
  DrawerHeader,
} from "./ui/drawer";
import { Minus, Plus, Trash2 } from "lucide-react";
import { YapePayment } from "./YapePayment";
import { Dialog, DialogTrigger } from "./ui/dialog";

export const CartDrawerContent = () => {
  const { state, dispatch } = useCart();

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

  return (
    <div className="flex flex-col h-full">
      <DrawerHeader>
        <DrawerTitle>Tu Carrito de Compras</DrawerTitle>
        <DrawerDescription>
          Aquí puedes revisar los productos que has agregado a tu carrito
        </DrawerDescription>
      </DrawerHeader>
      <div className="flex-1 overflow-y-auto p-4">
        {state.items.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            Tu carrito está vacío
          </p>
        ) : (
          <div className="space-y-4">
            {state.items.map((item) => (
              <div
                key={item.ID}
                className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg"
              >
                <img
                  src={`/${item.image}`}
                  alt={item.Hongo}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-emerald-800 dark:text-amber-300">
                    {item.Hongo}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    S/{item.precio}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.ID, item.cantidad - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.cantidad}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.ID, item.cantidad + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-auto text-red-500"
                      onClick={() =>
                        dispatch({ type: "REMOVE_ITEM", payload: item.ID })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {state.items.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span>S/{state.total.toFixed(2)}</span>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full bg-amber-400 hover:bg-amber-500 text-emerald-800 dark:bg-amber-600 dark:hover:bg-amber-700 dark:text-white">
                Proceder al pago
              </Button>
            </DialogTrigger>
            <YapePayment />
          </Dialog>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Seguir comprando
            </Button>
          </DrawerClose>
        </div>
      )}
    </div>
  );
};

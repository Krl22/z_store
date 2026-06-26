import { useEffect, useState } from "react";
import { MessageCircle, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DrawerClose,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useCart } from "@/contexts/cart-context";
import { useProductDialog } from "@/contexts/product-dialog-context";
import {
  defaultStoreContent,
  formatCurrency,
  StorefrontContent,
} from "@/lib/storefront-v2";
import { fetchStorefrontContent } from "@/services/storefrontV2Service";

type CartLegacyProduct = {
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
};

export const CartDrawerContent = () => {
  const { state, dispatch } = useCart();
  const { openProductDialog } = useProductDialog();
  const [content, setContent] =
    useState<StorefrontContent>(defaultStoreContent);

  useEffect(() => {
    const load = async () => {
      setContent(await fetchStorefrontContent());
    };
    load();
  }, []);

  const updateQuantity = (ID: string, cantidad: number) => {
    if (cantidad < 1) {
      dispatch({ type: "REMOVE_ITEM", payload: ID });
      return;
    }
    dispatch({ type: "UPDATE_QUANTITY", payload: { ID, cantidad } });
  };

  const openCartProduct = (item: (typeof state.items)[number]) => {
    const product: CartLegacyProduct = {
      ID: item.ID,
      Tipo: "Producto",
      Categoria: "Catalogo",
      Subcategoria: "",
      Hongo: item.Nombre,
      Nombre: item.Nombre,
      stock: "Disponible",
      unidad: "unidad",
      precio: item.precio,
      image: item.image,
      descripcion:
        "Producto agregado al carrito. Abre la tienda para ver mas detalles o envia el pedido por WhatsApp.",
    };
    openProductDialog(product);
  };

  const sendWhatsappOrder = () => {
    if (!state.items.length) return;
    const lines = state.items.map((item) => {
      const subtotal = Number(item.precio) * item.cantidad;
      return `- ${item.Nombre} x${item.cantidad}: ${formatCurrency(subtotal)}`;
    });
    const text = [
      content.whatsappMessage,
      "",
      ...lines,
      "",
      `Total estimado: ${formatCurrency(state.total)}`,
    ].join("\n");
    const number = content.whatsappNumber.replace(/\D/g, "");
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="flex max-h-[82vh] flex-col">
      <DrawerHeader>
        <DrawerTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-[#a67c28]" />
          Tu pedido
        </DrawerTitle>
        <DrawerDescription>
          Revisa productos y envia el pedido por WhatsApp.
        </DrawerDescription>
      </DrawerHeader>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        {state.items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#cdbf9e] p-8 text-center">
            <ShoppingBag className="mx-auto h-8 w-8 text-[#a67c28]" />
            <p className="mt-3 text-sm text-[#5d6f65]">
              Tu carrito esta vacio.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {state.items.map((item) => (
              <div
                key={item.ID}
                className="grid grid-cols-[72px_1fr_auto] gap-3 rounded-lg border border-[#e3dccb] bg-white p-3"
              >
                <button
                  className="overflow-hidden rounded-lg bg-[#10241d]"
                  onClick={() => openCartProduct(item)}
                >
                  <img
                    src={item.image}
                    alt={item.Nombre}
                    className="h-full w-full object-cover"
                  />
                </button>
                <div className="min-w-0">
                  <button
                    className="line-clamp-2 text-left text-sm font-semibold text-[#153328]"
                    onClick={() => openCartProduct(item)}
                  >
                    {item.Nombre}
                  </button>
                  <p className="mt-1 text-sm text-[#5d6f65]">
                    {formatCurrency(Number(item.precio))}
                  </p>
                  <div className="mt-3 flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      onClick={() => updateQuantity(item.ID, item.cantidad - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">
                      {item.cantidad}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      onClick={() => updateQuantity(item.ID, item.cantidad + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-red-600"
                  onClick={() =>
                    dispatch({ type: "REMOVE_ITEM", payload: item.ID })
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {state.items.length > 0 && (
        <div className="border-t border-[#e3dccb] bg-[#fbfaf6] p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-[#5d6f65]">Total estimado</span>
            <span className="text-2xl font-semibold text-[#153328]">
              {formatCurrency(state.total)}
            </span>
          </div>
          <Button
            className="h-11 w-full rounded-lg bg-[#153328] text-white hover:bg-[#24503f]"
            onClick={sendWhatsappOrder}
          >
            <MessageCircle className="h-4 w-4" />
            Enviar por WhatsApp
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" className="mt-2 h-10 w-full rounded-lg">
              Seguir comprando
            </Button>
          </DrawerClose>
        </div>
      )}
    </div>
  );
};

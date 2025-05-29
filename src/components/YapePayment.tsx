import { useCart } from "./cart-context";
import { Button } from "./ui/button";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

export const YapePayment = () => {
  const { state } = useCart();

  // Función para generar el mensaje
  const generateMessage = () => {
    const itemsList = state.items
      .map(
        (item) =>
          `- ${item.Hongo} (${item.cantidad}x) - S/.${
            Number(item.precio) * item.cantidad
          }`
      )
      .join("\n");

    return `¡Hola! Quiero realizar la siguiente compra:\n\n${itemsList}\n\nTotal: S/.${state.total}\n\nAdjunto captura de mi pago por Yape.`;
  };

  // Función para abrir WhatsApp
  const openWhatsApp = () => {
    const message = encodeURIComponent(generateMessage());
    const whatsappNumber = "18573124267"; // Reemplazar con tu número
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  // Función para abrir Facebook Messenger
  const openMessenger = () => {
    const message = encodeURIComponent(generateMessage());
    const pageId = "100090226974534"; // Reemplazar con el ID de tu página de Facebook
    window.open(`https://m.me/${pageId}?text=${message}`, "_blank");
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Pagar con Yape</DialogTitle>
        <DialogDescription>
          Sigue estos pasos para completar tu compra:
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col items-center space-y-4 py-4">
        <img
          src="/ruta-a-tu-qr-yape.png" // Reemplazar con la ruta de tu QR
          alt="Código QR de Yape"
          className="w-48 h-48 object-contain"
        />

        <div className="text-center">
          <p className="font-medium">Número de Yape:</p>
          <p className="text-lg text-amber-600 dark:text-amber-400">
            +51 XXX XXX XXX
          </p>
        </div>

        <div className="space-y-2 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            1. Escanea el QR o usa el número para hacer el pago de S/.
            {state.total}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            2. Toma una captura de la transferencia
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            3. Envíanos la captura por WhatsApp o Facebook Messenger
          </p>
        </div>

        <div className="flex gap-4 w-full">
          <Button
            onClick={openWhatsApp}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
          >
            WhatsApp
          </Button>
          <Button
            onClick={openMessenger}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
          >
            Messenger
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

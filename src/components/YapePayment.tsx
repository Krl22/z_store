import { useCart } from "../contexts/cart-context";
import { useAuth } from "../contexts/auth-context";
import { useState } from "react";
import { Button } from "./ui/button";
import { Copy, Check, UploadCloud } from "lucide-react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { db, storage } from "../lib/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { userProfileService } from "../services/userProfileService";

export const YapePayment = () => {
  const { state, dispatch } = useCart();
  const yapeNumber = "901997567";
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const [captureFile, setCaptureFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCopyNumber = async () => {
    try {
      await navigator.clipboard.writeText(yapeNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Error al copiar el número:", error);
    }
  };

  const handleSubmitOrder = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!user) {
      setErrorMsg("Debes iniciar sesión para enviar tu pedido");
      return;
    }
    if (!captureFile) {
      setErrorMsg("Sube la captura del pago para continuar");
      return;
    }

    try {
      setSubmitting(true);
      // Subir captura a Storage
      const orderId = `${user.uid}-${Date.now()}`;
      const storageRef = ref(storage, `orders/${orderId}.jpg`);
      const uploadRes = await uploadBytes(storageRef, captureFile);
      const captureUrl = await getDownloadURL(uploadRes.ref);

      // Crear documento de orden en Firestore
      const orderRef = doc(collection(db, "orders"));
      const profile = await userProfileService.getUserProfile(user.uid);
      await setDoc(orderRef, {
        orderId,
        userId: user.uid,
        userEmail: user.email ?? null,
        items: state.items,
        total: state.total,
        paymentMethod: "yape",
        captureUrl,
        profile: profile
          ? {
              nombre: profile.nombre,
              apellido: profile.apellido,
              provincia: profile.provincia,
              telefono: profile.telefono,
            }
          : null,
        status: "pending_review",
        createdAt: Date.now(),
      });

      setSuccessMsg("Tu pedido fue enviado. Revisaremos tu pago pronto.");
      // Opcional: limpiar carrito local
      dispatch({ type: "CLEAR_CART" });
    } catch (err) {
      console.error(err);
      setErrorMsg("Ocurrió un error al enviar tu pedido. Intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
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
          src="/pwa-512x512.png"
          alt="Código QR de Yape"
          className="w-48 h-48 object-contain"
        />

        <div className="text-center">
          <p className="font-medium">Número de Yape:</p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-lg text-amber-600 dark:text-amber-400">
              {yapeNumber}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 relative"
              onClick={handleCopyNumber}
              aria-label="Copiar número"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span className="absolute -bottom-6 text-xs bg-gray-800 text-white px-2 py-1 rounded-md whitespace-nowrap">
                    ¡Copiado!
                  </span>
                </>
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
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
            3. Sube la captura aquí y envía tu pedido
          </p>
        </div>

        <div className="w-full space-y-3">
          <div className="space-y-2">
            <Input type="file" accept="image/*" onChange={(e) => setCaptureFile(e.target.files?.[0] || null)} />
            {captureFile && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <UploadCloud className="h-4 w-4" />
                <span>{captureFile.name}</span>
              </div>
            )}
          </div>
          {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
          {successMsg && <p className="text-sm text-green-600">{successMsg}</p>}
          <Button onClick={handleSubmitOrder} disabled={submitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
            {submitting ? "Enviando pedido..." : "Enviar pedido"}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

import { Button } from "./ui/button";
import { Bell, BellOff, TestTube } from "lucide-react";
import { useNotifications } from "../contexts/notification-context";
import { useState } from "react";

export const NotificationSettings = () => {
  const { permission, requestPermission, showLocalNotification } = useNotifications();
  const [isRequesting, setIsRequesting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      await requestPermission();
    } finally {
      setIsRequesting(false);
    }
  };

  const testNotifications = async () => {
    if (permission === 'granted') {
      setIsTesting(true);
      
      try {
        // Test cart notification
        showLocalNotification(
          '🛒 Test: ¡No olvides tu carrito!',
          'Esta es una notificación de prueba para el carrito'
        );
        
        // Test favorites notification after 3 seconds
        setTimeout(() => {
          showLocalNotification(
            '❤️ Test: ¡Tus favoritos te extrañan!',
            'Esta es una notificación de prueba para favoritos'
          );
        }, 3000);
        
        // Reset testing state after 5 seconds
        setTimeout(() => {
          setIsTesting(false);
        }, 5000);
      } catch (error) {
        console.error('Error testing notifications:', error);
        setIsTesting(false);
      }
    }
  };

  if (permission === "granted") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <Bell className="h-4 w-4" />
          <span className="text-sm">Notificaciones activadas</span>
        </div>
        <Button
          onClick={testNotifications}
          disabled={isTesting}
          variant="outline"
          size="sm"
          className="w-full flex items-center gap-2"
        >
          <TestTube className="h-4 w-4" />
          {isTesting ? "Enviando pruebas..." : "🧪 Probar Notificaciones"}
        </Button>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
        <BellOff className="h-4 w-4" />
        <span className="text-sm">Notificaciones bloqueadas</span>
      </div>
    );
  }

  return (
    <Button
      onClick={handleRequestPermission}
      disabled={isRequesting}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <Bell className="h-4 w-4" />
      {isRequesting ? "Solicitando..." : "Activar Notificaciones"}
    </Button>
  );
};

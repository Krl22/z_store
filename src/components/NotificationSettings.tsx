import { Button } from "./ui/button";
import { Bell, BellOff } from "lucide-react";
import { useNotifications } from "../contexts/notification-context";
import { useState } from "react";

export const NotificationSettings = () => {
  const { permission, requestPermission } = useNotifications();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      await requestPermission();
    } finally {
      setIsRequesting(false);
    }
  };

  if (permission === "granted") {
    return (
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
        <Bell className="h-4 w-4" />
        <span className="text-sm">Notificaciones activadas</span>
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

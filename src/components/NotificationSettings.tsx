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
      <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
        <Bell className="h-3 w-3" />
        <span className="text-xs">Notificaciones activadas</span>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
        <BellOff className="h-3 w-3" />
        <span className="text-xs">Notificaciones bloqueadas</span>
      </div>
    );
  }

  return (
    <Button
      onClick={handleRequestPermission}
      disabled={isRequesting}
      variant="ghost"
      size="sm"
      className="flex items-center gap-1.5 h-7 px-2 text-xs hover:bg-accent/50"
    >
      <Bell className="h-3 w-3" />
      {isRequesting ? "Solicitando..." : "Activar Notificaciones"}
    </Button>
  );
};

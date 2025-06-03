import React, { createContext, useContext, useEffect, useState } from 'react';
import { messaging, vapidKey } from '../lib/firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { useAuth } from './auth-context';
import { useCart } from './cart-context';
import { useFavorites } from './favorites-context';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

type NotificationContextType = {
  permission: NotificationPermission;
  token: string | null;
  requestPermission: () => Promise<void>;
  scheduleCartReminder: () => void;
  scheduleFavoritesReminder: () => void;
  showLocalNotification: (title: string, body: string) => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [token, setToken] = useState<string | null>(null);
  const { user } = useAuth();
  const { state: cartState } = useCart();
  const { state: favoritesState } = useFavorites();

  // Show local notification
  const showLocalNotification = (title: string, body: string) => {
    if (permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/favicon-32x32.png',
        tag: 'reminder',
        requireInteraction: true
      });
    }
  };

  // Request notification permission
  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        const currentToken = await getToken(messaging, { vapidKey });
        if (currentToken) {
          setToken(currentToken);
          // Save token to Firestore for the user
          if (user) {
            await setDoc(doc(db, 'userTokens', user.uid), {
              token: currentToken,
              updatedAt: new Date().toISOString()
            });
          }
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  // Schedule cart reminder (24 hours after items are added)
  const scheduleCartReminder = () => {
    if (cartState.items.length > 0 && permission === 'granted') {
      // Clear any existing reminder
      localStorage.removeItem('cartReminderTimeout');
      
      // Set new reminder for 24 hours
      const timeoutId = setTimeout(() => {
        if (cartState.items.length > 0) {
          showLocalNotification(
            '🛒 ¡No olvides tu carrito!',
            `Tienes ${cartState.items.length} productos esperándote. ¡Completa tu compra ahora!`
          );
        }
      }, 24 * 60 * 60 * 1000); // 24 hours
      
      localStorage.setItem('cartReminderTimeout', timeoutId.toString());
    }
  };

  // Schedule favorites reminder (3 days after items are added)
  const scheduleFavoritesReminder = () => {
    if (favoritesState.items.length > 0 && permission === 'granted') {
      // Clear any existing reminder
      localStorage.removeItem('favoritesReminderTimeout');
      
      // Set new reminder for 3 days
      const timeoutId = setTimeout(() => {
        if (favoritesState.items.length > 0) {
          showLocalNotification(
            '❤️ ¡Tus favoritos te extrañan!',
            `Tienes ${favoritesState.items.length} productos en favoritos. ¿Qué tal si los agregas al carrito?`
          );
        }
      }, 3 * 24 * 60 * 60 * 1000); // 3 days
      
      localStorage.setItem('favoritesReminderTimeout', timeoutId.toString());
    }
  };

  // Initialize
  useEffect(() => {
    setPermission(Notification.permission);
    
    // Listen for foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received in foreground: ', payload);
      if (payload.notification) {
        showLocalNotification(
          payload.notification.title || 'Nueva notificación',
          payload.notification.body || ''
        );
      }
    });

    return () => unsubscribe();
  }, []);

  // Schedule reminders when cart or favorites change
  useEffect(() => {
    scheduleCartReminder();
  }, [cartState.items.length]);

  useEffect(() => {
    scheduleFavoritesReminder();
  }, [favoritesState.items.length]);

  return (
    <NotificationContext.Provider value={{
      permission,
      token,
      requestPermission,
      scheduleCartReminder,
      scheduleFavoritesReminder,
      showLocalNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
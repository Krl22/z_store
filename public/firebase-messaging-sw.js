// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase config - usar la misma configuración que en tu firebase.ts
const firebaseConfig = {
  // Tu configuración de Firebase aquí
  apiKey: "tu-api-key",
  authDomain: "tu-auth-domain",
  projectId: "tu-project-id",
  storageBucket: "tu-storage-bucket",
  messagingSenderId: "tu-sender-id",
  appId: "tu-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message: ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/pwa-192x192.png',
    badge: '/favicon-32x32.png',
    tag: 'cart-reminder',
    requireInteraction: true,
    actions: [
      {
        action: 'view-cart',
        title: 'Ver Carrito'
      },
      {
        action: 'view-favorites',
        title: 'Ver Favoritos'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view-cart') {
    event.waitUntil(
      clients.openWindow('/tienda?open=cart')
    );
  } else if (event.action === 'view-favorites') {
    event.waitUntil(
      clients.openWindow('/tienda?open=favorites')
    );
  } else {
    event.waitUntil(
      clients.openWindow('/tienda')
    );
  }
});
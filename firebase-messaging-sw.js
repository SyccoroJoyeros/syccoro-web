```javascript
/* ============================================================
   SYCCORO · firebase-messaging-sw.js · v1.0 (27/07/2026)

   Este archivo tiene que estar en la RAÍZ del repositorio syccoro-web,
   junto a index.html. Es el que recibe los avisos cuando el navegador
   está cerrado o en segundo plano; sin él, la notificación solo llegaría
   con la página abierta.

   No lleva nada secreto: la configuración de Firebase que aparece abajo
   es la misma que ya viaja en todas las páginas públicas.
   ============================================================ */
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDakUsgbwpp-ZCBKy9J8YmUvgo5rQFSWa4",
  authDomain: "syccoro-web.firebaseapp.com",
  projectId: "syccoro-web",
  storageBucket: "syccoro-web.firebasestorage.app",
  messagingSenderId: "548259273508",
  appId: "1:548259273508:web:3076eee1fe220a73dc31b1"
});

const messaging = firebase.messaging();

/* Aviso recibido con la web cerrada o en segundo plano. */
messaging.onBackgroundMessage(function(payload){
  const n = (payload && payload.notification) || {};
  const d = (payload && payload.data) || {};
  self.registration.showNotification(n.title || 'Syccoro', {
    body: n.body || '',
    icon: 'https://syccorojoyeros.github.io/syccoro-img/webp/og-image.webp',
    badge: 'https://syccorojoyeros.github.io/syccoro-img/webp/og-image.webp',
    tag: d.tipo || 'syccoro-aviso',
    renotify: true,
    requireInteraction: true,        /* que espere a que Jorge lo vea */
    data: { url: d.url || 'https://syccorojoyeros.github.io/syccoro-web/admin.html' }
  });
});

/* Al tocar el aviso: abrir el panel (o traer al frente el que ya esté abierto). */
self.addEventListener('notificationclick', function(evento){
  evento.notification.close();
  const destino = (evento.notification.data && evento.notification.data.url)
    || 'https://syccorojoyeros.github.io/syccoro-web/admin.html';
  evento.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(lista){
      for (const c of lista) {
        if (c.url.indexOf('/syccoro-web/') !== -1 && 'focus' in c) return c.focus();
      }
      if (clients.openWindow) return clients.openWindow(destino);
    })
  );
});
```

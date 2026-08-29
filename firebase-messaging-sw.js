/* ============================================================
   SYCCORO · firebase-messaging-sw.js · v1.1 (29/08/2026)

   v1.1: tanda de la auditoría, tres arreglos.
   (1) EL TOQUE LLEVA A SU DESTINO. Antes se enfocaba la primera pestaña
   del sitio que hubiera abierta (aunque fuera la portada) y la URL del
   aviso solo se abría si no había ninguna. Ahora: primero una pestaña
   que YA esté en el destino; si hay otra del sitio, se trae al frente
   Y se navega al destino; si no hay ninguna, se abre nueva.
   (2) Icono correcto: se usaba og-image.webp (una foto apaisada de
   1200×630) como icon y como badge — en Android el badge salía como
   una mancha gris. Ahora icon = iconos/icono-syccoro-192.png del CDN,
   y sin badge.
   (3) SIN AVISO DOBLE: si el mensaje llega con bloque `notification`,
   el SDK de Firebase muestra su notificación automática Y llama a este
   manejador — pintar aquí otra daba dos avisos por pedido. Ahora este
   manejador solo actúa con mensajes de SOLO datos. OJO: para recuperar
   el icono y el destino del toque, la Cloud Function de avisos debe
   enviar solo-data (title, body, url, tipo dentro de data, sin bloque
   notification); mientras tanto, el aviso lo pinta el SDK (uno solo).

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
  /* v1.1 · si el mensaje trae bloque `notification`, el SDK de Firebase ya
     muestra SU notificación automática y además llama aquí: pintar otra era
     el aviso doble. Este manejador solo construye la notificación para
     mensajes de SOLO datos (title/body/url/tipo dentro de data). */
  if (payload && payload.notification) return;
  const d = (payload && payload.data) || {};
  self.registration.showNotification(d.title || 'Syccoro', {
    body: d.body || '',
    icon: 'https://syccorojoyeros.github.io/syccoro-img/iconos/icono-syccoro-192.png',
    tag: d.tipo || 'syccoro-aviso',
    renotify: true,
    requireInteraction: true,        /* que espere a que Jorge lo vea */
    data: { url: d.url || 'https://syccorojoyeros.github.io/syccoro-web/admin.html' }
  });
});

/* Al tocar el aviso: ir al DESTINO del aviso. v1.1 · antes se enfocaba la
   primera pestaña del sitio que hubiera abierta (aunque fuera la portada) y
   la URL del aviso solo se abría si no había ninguna. */
self.addEventListener('notificationclick', function(evento){
  evento.notification.close();
  const destino = (evento.notification.data && evento.notification.data.url)
    || 'https://syccorojoyeros.github.io/syccoro-web/admin.html';
  const sinAncla = function(u){ return String(u).split('#')[0]; };
  evento.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(lista){
      /* 1 · una pestaña que YA está en el destino: traerla al frente */
      for (const c of lista) {
        if (sinAncla(c.url) === sinAncla(destino) && 'focus' in c) return c.focus();
      }
      /* 2 · otra pestaña del sitio: al frente Y navegar al destino */
      for (const c of lista) {
        if (c.url.indexOf('/syccoro-web/') !== -1 && 'focus' in c) {
          return c.focus().then(function(cf){
            const v = cf || c;
            return ('navigate' in v) ? v.navigate(destino).catch(function(){ return v; }) : v;
          });
        }
      }
      /* 3 · ninguna pestaña del sitio: abrir una nueva */
      if (clients.openWindow) return clients.openWindow(destino);
    })
  );
});

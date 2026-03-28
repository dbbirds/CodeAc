// Firebase Messaging Service Worker
// Handles background push notifications when the app is not in the foreground.

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js')

// Config is injected at runtime via the /api/sw-config endpoint to avoid
// hardcoding keys in a public file.
self.addEventListener('fetch', () => {})

self.addEventListener('message', event => {
  if (event.data?.type === 'FIREBASE_CONFIG') {
    if (!firebase.apps.length) {
      firebase.initializeApp(event.data.config)
    }
    const messaging = firebase.messaging()

    messaging.onBackgroundMessage(payload => {
      const { title, body } = payload.notification ?? {}
      self.registration.showNotification(title ?? 'Home HQ', {
        body: body ?? '',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
      })
    })
  }
})

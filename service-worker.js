/**
 * HANAN.UANG — Service Worker (PWA)
 * Catatan penting:
 * - Di Google Apps Script, halaman web berjalan di dalam iframe sandbox
 *   (domain googleusercontent.com) sehingga service worker TIDAK BISA didaftarkan
 *   dari sana. Registrasi di index.html sudah dibungkus try/catch jadi aman.
 * - File ini aktif otomatis jika suatu saat Anda hosting file statis
 *   (GitHub Pages / Netlify / hosting sendiri): letakkan service-worker.js
 *   satu folder dengan index.html.
 */
var CACHE = 'hanan-uang-v2'; // versi dinaikkan: ikon PNG + manifest file asli (perbaikan iOS)
var ASSETS = ['./', './index.html', './manifest.json', './app-bridge.html', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (res) {
        var cp = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, cp); }).catch(function () {});
        return res;
      }).catch(function () { return caches.match('./'); });
    })
  );
});

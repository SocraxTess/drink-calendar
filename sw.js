/* 서비스 워커: 앱 파일을 캐시해 오프라인에서도 열리게 합니다.
   파일을 수정해서 다시 배포할 때는 CACHE_VERSION 숫자를 올려 주세요. (v1 → v2) */
const CACHE_VERSION = 'v1';
const APP_CACHE = `drink-cal-app-${CACHE_VERSION}`;
const FONT_CACHE = 'drink-cal-fonts';

const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(APP_CACHE).then((c) => c.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys
        .filter((k) => k.startsWith('drink-cal-app-') && k !== APP_CACHE)
        .map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 구글 폰트: 캐시 먼저 쓰고, 뒤에서 새로 받아 갱신
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const network = fetch(req).then((res) => {
          if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // 페이지 열기: 네트워크 우선, 오프라인이면 저장해 둔 index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(APP_CACHE).then((c) => c.put('./index.html', copy));
        }
        return res;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // 그 외 앱 파일: 캐시 우선
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(APP_CACHE).then((c) => c.put(req, copy));
      }
      return res;
    }))
  );
});

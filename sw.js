// 仁善堂中医养生馆 — Service Worker
// 缓存核心静态资源，实现离线可用与秒开体验
const CACHE = 'renshantang-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './icon.svg',
  './icon-maskable.svg'
];

// 安装时预缓存
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 请求拦截：缓存优先，回退网络，再回退首页
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // 跨域字体（Google Fonts）走网络优先，失败则用缓存
  if (req.url.includes('fonts.googleapis.com') || req.url.includes('fonts.gstatic.com')) {
    event.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((resp) => {
          // 同源 GET 成功响应顺手缓存，便于下次离线
          if (resp && resp.ok && new URL(req.url).origin === self.location.origin) {
            const copy = resp.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return resp;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});

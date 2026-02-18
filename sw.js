// sw.js - Service Worker（オフライン対応）

const CACHE_NAME = 'medtracker-v1';
const CACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/base.css',
  './css/layout.css',
  './css/calendar.css',
  './css/modal.css',
  './css/graph.css',
  './js/app.js',
  './js/store.js',
  './js/utils.js',
  './js/components/CalendarScreen.js',
  './js/components/DayCell.js',
  './js/components/DayModal.js',
  './js/components/GraphScreen.js',
  './js/components/BpChart.js',
  './js/components/SettingsScreen.js',
  'https://unpkg.com/vue@3/dist/vue.global.prod.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js',
];

// インストール：キャッシュを作成
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_ASSETS).catch((err) => {
        console.warn('キャッシュの作成中にエラーが発生しました:', err);
      });
    })
  );
  self.skipWaiting();
});

// アクティベート：古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// フェッチ：キャッシュファーストで応答
self.addEventListener('fetch', (event) => {
  // localStorageへのアクセスはキャッシュしない
  if (event.request.url.includes('chrome-extension://')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // 正常なレスポンスのみキャッシュ
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // オフライン時はindex.htmlを返す
        return caches.match('./index.html');
      });
    })
  );
});

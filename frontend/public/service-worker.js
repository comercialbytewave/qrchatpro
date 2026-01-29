// Este service worker se auto-desregistra para limpar SWs antigos/corrompidos
// Ele substitui qualquer SW anterior que estava causando problemas de redirect

self.addEventListener('install', function (event) {
    console.log('[SW] Instalando service worker de limpeza...');
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    console.log('[SW] Ativando service worker de limpeza...');

    event.waitUntil(
        Promise.all([
            // Limpar todos os caches
            caches.keys().then(function (cacheNames) {
                return Promise.all(
                    cacheNames.map(function (cacheName) {
                        console.log('[SW] Deletando cache:', cacheName);
                        return caches.delete(cacheName);
                    })
                );
            }),
            // Tomar controle de todos os clientes
            self.clients.claim(),
            // Se desregistrar
            self.registration.unregister().then(function () {
                console.log('[SW] Service worker desregistrado com sucesso!');
            })
        ])
    );
});

// Não interceptar nenhuma requisição - deixar tudo passar normalmente
self.addEventListener('fetch', function (event) {
    // Não fazer nada - deixar o navegador lidar com a requisição normalmente
    return;
});

// Beaver Dam Dev - Core Service Worker Registration & App Logic
console.log("Beaver Dev operational.");

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('ServiceWorker registered successfully:', reg.scope))
            .catch(err => console.log('ServiceWorker registration failed:', err));
    });
}

// BC Outfit Manager (BCOM) - Loader
// Loaded by FUSAM from https://utsumi24.github.io/BCOM/bcom.js
// Bootstraps the modular version served alongside it on GitHub Pages.
(function () {
    'use strict';
    const script = document.createElement('script');
    script.src = 'https://utsumi24.github.io/BCOM/src/main.js?t=' + Date.now();
    script.onerror = function () {
        console.error('BCOM: Failed to load src/main.js from GitHub Pages.');
    };
    document.head.appendChild(script);
})();

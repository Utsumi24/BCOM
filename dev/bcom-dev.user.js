// ==UserScript==
// @name         BC Outfit Manager (Dev)
// @namespace    https://www.bondageprojects.com/
// @version      0.1
// @description  Loader for BCOM
// @author       Utsumi
// @match        https://bondageprojects.elementfx.com/*
// @match        https://www.bondageprojects.elementfx.com/*
// @match        https://bondage-europe.com/*
// @match        https://www.bondage-europe.com/*
// @match        https://bondage-asia.com/*
// @match        https://www.bondage-asia.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const timestamp = Date.now(); // Cache-busting timestamp
    const script = document.createElement('script');
    script.src = `https://raw.githubusercontent.com/Utsumi24/BCOM/dev/src/main.js?t=${timestamp}`;
    document.head.appendChild(script);
})();
// ==UserScript==
// @name         BC Outfit Manager
// @namespace    https://www.bondageprojects.com/
// @version      0.1
// @description  Loader for BCOM
// @author       Utsumi
// @match        https://bondageprojects.elementfx.com/*
// @match        https://www.bondageprojects.elementfx.com/*
// @match        https://bondage-europe.com/*
// @match        https://www.bondage-europe.com/*
// @match        http://localhost:*/*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var script = document.createElement("script");
    script.setAttribute("crossorigin", "anonymous");
    script.src = `https://utsumi24.github.io/BCOM/bcom.js?${Date.now()}`; // Cache-busting with Date.now()
    document.head.appendChild(script);
})();
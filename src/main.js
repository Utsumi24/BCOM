// BCOM Main Module Loader
// This file loads all the modules and initializes the outfit manager

console.info("BCOM: Loading modular version...");

// Derive the base URL from wherever this script was loaded from.
// document.currentScript is only available during synchronous execution,
// so we capture it here at the top level before any async context.
const _BCOM_BASE_URL = (function() {
    const src = document.currentScript?.src || '';
    if (!src) throw new Error('BCOM: Could not determine script base URL.');
    // Strip the filename to get the directory, e.g.:
    //   https://utsumi24.github.io/BCOM/src/main.js -> https://utsumi24.github.io/BCOM/src/
    return src.replace(/[^/]+$/, '');
})();

const _BCOM_CACHE_BUST = '?t=' + Date.now();

// Module loading utility
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src + _BCOM_CACHE_BUST;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Load modules in dependency order
async function loadModules() {
    try {
        const baseUrl = _BCOM_BASE_URL;
        
        // Load core modules first
        await loadScript(baseUrl + 'core/base.js');
        await loadScript(baseUrl + 'core/storage.js');
        await loadScript(baseUrl + 'core/utils.js');
        
        // Load settings modules
        await loadScript(baseUrl + 'settings/versionManager.js');
        
        // Load feature modules
        await loadScript(baseUrl + 'modules/modInitializer.js');
        await loadScript(baseUrl + 'modules/modalSystem.js');
        await loadScript(baseUrl + 'modules/outfitManager.js');
        await loadScript(baseUrl + 'modules/folderSystem.js');
        await loadScript(baseUrl + 'modules/dialogHandlers.js');
        await loadScript(baseUrl + 'modules/uiComponents.js');
        
        // Load Outfit Studio modules
        await loadScript(baseUrl + 'modules/visualCreatorIntegration.js');
        await loadScript(baseUrl + 'Screens/Room/BCOMVisualCreator/BCOMOutfitStudio.js');
        
        console.info("BCOM: All modules loaded successfully");
        
        // Initialize the mod
        initializeOutfitManager();
        
    } catch (error) {
        console.error("BCOM: Failed to load modules:", error);
    }
}

// Initialize the outfit manager after all modules are loaded
function initializeOutfitManager() {
    if (!window.BCOM_Base || !window.BCOM_ModInitializer) {
        console.error("BCOM: Required modules not loaded");
        return;
    }
    
    // Use the utility function to wait for player initialization
    window.BCOM_Utils.waitForPlayerAndInit(() => {
        window.BCOM_ModInitializer.initMod();
    });
}

// Start loading modules from GitHub
loadModules();

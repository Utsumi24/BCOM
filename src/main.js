// BCOM Main Module Loader
// This file loads all the modules and initializes the outfit manager

console.info("BCOM: Loading modular version...");

// Module loading utility
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Load modules in dependency order
async function loadModules() {
    try {
        
        const baseUrl = 'https://utsumi24.github.io/BCOM/dev/src/';
        
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

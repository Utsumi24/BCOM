// Storage and caching management for BC Outfit Manager

// Performance optimization caches
let cachedElements = {};
let cachedStorageData = null;
let lastStorageCheck = 0;
let outfitDataCache = new Map();

// Cache helper functions
function getCachedElement(id, createFn) {
    if (!cachedElements[id]) {
        cachedElements[id] = createFn();
    }
    return cachedElements[id];
}

function getCachedStorageData() {
    const now = Date.now();
    if (!cachedStorageData || now - lastStorageCheck > 1000) { // Cache for 1 second
        const memberNumber = Player.MemberNumber;
        const storageKey = `${window.BCOM_Base.STORAGE_PREFIX}${memberNumber}`;
        const storageData = localStorage.getItem(storageKey);
        cachedStorageData = storageData ? JSON.parse(storageData) : null;
        lastStorageCheck = now;
    }
    return cachedStorageData;
}

function getCachedOutfitData(outfit) {
    if (!outfitDataCache.has(outfit.name)) {
        try {
            const decompressed = LZString.decompressFromBase64(outfit.data);
            if (decompressed) {
                const parsed = JSON.parse(decompressed);
                outfitDataCache.set(outfit.name, parsed);
                return parsed;
            }
        } catch (error) {
            console.error("BCOM: Error caching outfit data:", error);
        }
        return null;
    }
    return outfitDataCache.get(outfit.name);
}

function clearPerformanceCaches() {
    cachedElements = {};
    cachedStorageData = null;
    lastStorageCheck = 0;
    outfitDataCache.clear();
}

// Storage data cleanup function
function cleanupStorageData() {
    try {
        const memberNumber = Player.MemberNumber;
        const storageKey = `${window.BCOM_Base.STORAGE_PREFIX}${memberNumber}`;
        const storageData = localStorage.getItem(storageKey);

        if (storageData) {
            const outfitStorage = JSON.parse(storageData);
            let needsSave = false;

            // Remove any UI-only folder entries
            if (outfitStorage.folders) {
                const originalLength = outfitStorage.folders.length;
                outfitStorage.folders = outfitStorage.folders.filter(folder =>
                    folder !== "⬆️ Return to Main Folder" &&
                    folder !== "Return to Main Folder" &&
                    !folder.startsWith("⬆️") // General case for any back button that got saved
                );

                if (outfitStorage.folders.length !== originalLength) {
                    console.info(`BCOM: Cleaned up ${originalLength - outfitStorage.folders.length} invalid folder entries`);
                    needsSave = true;
                }
            }

            // Ensure we always have a Main folder
            if (!outfitStorage.folders?.includes("Main")) {
                outfitStorage.folders = outfitStorage.folders || [];
                outfitStorage.folders.unshift("Main");
                needsSave = true;
            }

            // Save if changes were made
            if (needsSave) {
                localStorage.setItem(storageKey, JSON.stringify(outfitStorage));
                console.info("BCOM: Storage data cleaned up successfully");
            }
            else{
                console.info("BCOM: Storage data is clean. No changes were made.");
            }
        }
    } catch (error) {
        console.error("BCOM: Error cleaning up storage data", error);
    }
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getCachedElement,
        getCachedStorageData,
        getCachedOutfitData,
        clearPerformanceCaches,
        cleanupStorageData
    };
}

// Global exports for direct script usage
window.BCOM_Storage = {
    getCachedElement,
    getCachedStorageData,
    getCachedOutfitData,
    clearPerformanceCaches,
    cleanupStorageData
};
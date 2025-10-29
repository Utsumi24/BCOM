// Main mod initialization and SDK registration

// Configuration constants
const OUTFIT_PRIORITIES = {
    UI_INIT: 6,          // Higher than most UI mods
    DATA_HANDLING: 5,     // Standard priority
    OBSERVE: 0
};

// UI Constants (scoped to avoid conflicts)
const UI_CONSTANTS = {
    BUTTON_SIZE: 60,
    BUTTON_GAP: 5,
    EXISTING_BUTTON_X: 70,
    MAX_OUTFITS: 100,
    OUTFITS_PER_PAGE: 8
};
UI_CONSTANTS.OUTFIT_BUTTON_X = UI_CONSTANTS.EXISTING_BUTTON_X - UI_CONSTANTS.BUTTON_SIZE - UI_CONSTANTS.BUTTON_GAP;

// State variables
let PreviousDialogMode = "items";
let isSortMode = false;
let applyHairWithOutfit = false;
let hairOnly = false;
let selectedPadlock = window.selectedPadlock || "Keep Original";
let DialogOutfitPage = 0;
let isExportMode = false;

// Folder system variables
let currentFolder = "Main";
let isFolderManagementMode = false;
let selectedOutfits = [];
let allowMultipleSelect = false;

// Outfit Studio integration
let outfitToEdit = null; // Stores the name of the outfit selected for editing in Outfit Studio

// Padlock configurations
let padlockConfigs = {
    CombinationPadlock: { CombinationNumber: "0000" },
    PasswordPadlock: { Password: "password", Hint: "Take a guess..." },
    SafewordPadlock: { Password: "password", Hint: "Take a guess..." },
    MistressTimerPadlock: { RemoveTimer: CurrentTime + (5 * 60 * 1000), TimerDuration: 5 * 60 * 1000, RemoveItem: false, EnableRandomInput: false, ShowTimer: true },
    TimerPasswordPadlock: { Password: "password", Hint: "Take a guess...", RemoveTimer: CurrentTime + (5 * 60 * 1000), TimerDuration: 5 * 60 * 1000, RemoveItem: false, EnableRandomInput: false, ShowTimer: true },
    LoversTimerPadlock: { RemoveTimer: CurrentTime + (5 * 60 * 1000), TimerDuration: 5 * 60 * 1000, RemoveItem: false, EnableRandomInput: false, ShowTimer: true }
};

// Main initialization function
function initMod() {
    if (window.BCOM_Base.getModInitialized()) return;
    window.BCOM_Base.setModInitialized(true);

    console.info("BCOM: Successfully initialized.  Version: " + window.BCOM_Base.VERSION_NUMBER);

    // Clean up any corrupted data in storage
    window.BCOM_Storage.cleanupStorageData();

    // Check for version updates
    window.BCOM_VersionManager.checkVersionUpdate();

    try {
        if (!window.bcModSdk?.registerMod) {
            console.error('BCOM: Mod SDK not available');
            return;
        }

        const modApi = window.bcModSdk.registerMod(
            {
                name: "BC Outfit Manager (BCOM)",
                fullName: "BC Outfit Manager (BCOM)",
                version: window.BCOM_Base.VERSION_NUMBER,
                repository: "https://github.com/Utsumi24/BCOM",
            },
            {
                allowReplace: true
            }
        );

        // Initialize appearance data before any UI hooks
        modApi.hookFunction("CharacterAppearanceBuildCanvas", OUTFIT_PRIORITIES.UI_INIT, (args, next) => {
            const [C] = args;
            if (!C.Appearance) C.Appearance = [];
            return next(args);
        });

        // Register UI hooks
        registerUIHooks(modApi);
        
        return modApi;
    } catch (error) {
        console.error('BCOM: Failed to initialize mod:', error);
    }
}

// UI Hook registration
function registerUIHooks(modApi) {
    // Register UI hooks if the UI module is loaded
    if (window.BCOM_UI && window.BCOM_UI.registerHooks) {
        window.BCOM_UI.registerHooks(modApi);
    } else {
        console.warn("BCOM: UI module not loaded, deferring hook registration");
        // Try again after a short delay
        setTimeout(() => {
            if (window.BCOM_UI && window.BCOM_UI.registerHooks) {
                window.BCOM_UI.registerHooks(modApi);
            }
        }, 100);
    }
}

// Getters for state variables
function getState() {
    return {
        PreviousDialogMode,
        isSortMode,
        applyHairWithOutfit,
        hairOnly,
        selectedPadlock,
        DialogOutfitPage,
        isExportMode,
        currentFolder,
        isFolderManagementMode,
        selectedOutfits,
        allowMultipleSelect,
        padlockConfigs,
        outfitToEdit
    };
}

// Setters for state variables
function setState(newState) {
    // Update the actual module variables
    if ('PreviousDialogMode' in newState) PreviousDialogMode = newState.PreviousDialogMode;
    if ('isSortMode' in newState) isSortMode = newState.isSortMode;
    if ('applyHairWithOutfit' in newState) applyHairWithOutfit = newState.applyHairWithOutfit;
    if ('hairOnly' in newState) hairOnly = newState.hairOnly;
    if ('selectedPadlock' in newState) selectedPadlock = newState.selectedPadlock;
    if ('DialogOutfitPage' in newState) DialogOutfitPage = newState.DialogOutfitPage;
    if ('isExportMode' in newState) isExportMode = newState.isExportMode;
    if ('currentFolder' in newState) currentFolder = newState.currentFolder;
    if ('isFolderManagementMode' in newState) isFolderManagementMode = newState.isFolderManagementMode;
    if ('selectedOutfits' in newState) selectedOutfits = newState.selectedOutfits;
    if ('allowMultipleSelect' in newState) allowMultipleSelect = newState.allowMultipleSelect;
    if ('padlockConfigs' in newState) padlockConfigs = newState.padlockConfigs;
    if ('outfitToEdit' in newState) outfitToEdit = newState.outfitToEdit;
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initMod,
        getState,
        setState,
        OUTFIT_PRIORITIES,
        UI_CONSTANTS
    };
}

// Global exports for direct script usage
window.BCOM_ModInitializer = {
    initMod,
    getState,
    setState,
    OUTFIT_PRIORITIES,
    UI_CONSTANTS
};
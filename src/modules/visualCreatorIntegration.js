/**
 * BCOM Visual Creator Integration Module
 * Provides integration between the Visual Outfit Creator and main BCOM functionality
 * Handles launching the visual creator and integrating with existing BCOM systems
 */

"use strict";

/**
 * Add Visual Creator button to main BCOM interface
 * This should be called when rendering the main BCOM interface
 */
function BCOMAddVisualCreatorButton() {
    // Add Visual Creator launch button to main BCOM interface
    // Position this appropriately in the main BCOM UI layout
    const buttonX = 1200;
    const buttonY = 50;
    const buttonWidth = 200;
    const buttonHeight = 80;
    
    DrawButton(buttonX, buttonY, buttonWidth, buttonHeight, "Visual Creator", "Green");
    
    // Add description text
    DrawText("Click-to-dress interface", buttonX + buttonWidth/2, buttonY + buttonHeight + 20, "#CCCCCC", "Gray");
}

/**
 * Handle Visual Creator button click in main BCOM interface
 * @returns {boolean} True if the click was handled
 */
function BCOMHandleVisualCreatorClick() {
    const buttonX = 1200;
    const buttonY = 50;
    const buttonWidth = 200;
    const buttonHeight = 80;
    
    if (MouseIn(buttonX, buttonY, buttonWidth, buttonHeight)) {
        BCOMOpenVisualCreator();
        return true;
    }
    
    return false;
}

/**
 * Launch the Visual Outfit Creator subscreen
 * Saves current BCOM state and switches to visual creator
 * @param {Object} modApi - BC Mod SDK API reference to pass to visual creator
 */
async function BCOMOpenVisualCreator(modApi = null) {
    console.log("[BCOM Integration] Launching Visual Creator");
    
    // Save current BCOM state for return
    // TODO: Save any necessary state to restore when returning
    
    // Store modApi reference for visual creator to use
    if (modApi) {
        window.BCOM_VisualCreator_ModApi = modApi;
    }
    
    // Launch Visual Creator using BC's proper screen system
    await BCOMLaunchVisualCreatorDirect(modApi);
}

/**
 * Launch Visual Creator directly without BC's screen system
 * This prevents BC from trying to load translation files
 * @param {Object} modApi - ModSDK API instance to use for hooking
 */
function BCOMLaunchVisualCreatorDirect(modApi = null) {
    // Store current state for restoration FIRST before any cleanup
    window.BCOM_PreviousScreen = CurrentScreen;
    window.BCOM_PreviousModule = CurrentModule; // Save the module too!
    window.BCOM_PreviousCharacter = CurrentCharacter;
    window.BCOM_PreviousDialogMenuMode = DialogMenuMode;

    // IMPORTANT: Save BCOM state BEFORE cleaning up dialog mode
    // If we're in Outfit Manager mode, save the BCOM state (especially PreviousDialogMode)
    if (DialogMenuMode === "outfits") {
        if (window.BCOM_ModInitializer) {
            window.BCOM_SavedOutfitManagerState = window.BCOM_ModInitializer.getState();
            console.log("[BCOM Integration] Saved Outfit Manager state:", window.BCOM_SavedOutfitManagerState);
        } else {
            console.warn("[BCOM Integration] BCOM_ModInitializer not available!");
        }
    } else {
        console.log("[BCOM Integration] Not in Outfit Manager - DialogMenuMode:", DialogMenuMode);
    }

    // Save current screen functions (including optional handlers)
    window.BCOM_PreviousScreenFunctions = {
        Load: CurrentScreenFunctions.Load,
        Run: CurrentScreenFunctions.Run,
        Click: CurrentScreenFunctions.Click,
        Exit: CurrentScreenFunctions.Exit,
        MouseMove: CurrentScreenFunctions.MouseMove || null,
        KeyDown: CurrentScreenFunctions.KeyDown || null,
        Resize: CurrentScreenFunctions.Resize || null
    };

    // Store modApi for the Visual Creator to use
    if (modApi) {
        window.BCOM_VisualCreator_ModApi = modApi;
    }

    // If we're currently in dialog mode (like "outfits"), cleanly exit it first
    // NOTE: This happens AFTER we save the state above
    if (window.BCOM_PreviousDialogMenuMode === "outfits" || CurrentCharacter) {
        console.log("[BCOM Integration] Cleaning up dialog mode before Visual Creator launch");

        // Clean up dialog state
        if (CurrentCharacter) {
            CurrentCharacter = null;
        }

        // Clean up any dialog UI elements
        if (typeof ElementRemove === 'function') {
            const dialogElements = ['OutfitManagerImport', 'PadlockReplacementDropdown', 'Text', 'TextStyle', 'ColorPicker'];
            dialogElements.forEach(id => {
                try {
                    ElementRemove(id);
                } catch (e) {
                    // Element doesn't exist
                }
            });
        }

        // Reset dialog mode
        DialogMenuMode = null;
    }

    // Immediately take over the screen to prevent BC from drawing the base screen
    CurrentScreen = "BCOMOutfitStudio";
    CurrentScreenFunctions = {
        Load: BCOMOutfitStudioLoad,
        Run: BCOMOutfitStudioRun,
        Click: BCOMOutfitStudioClick,
        Exit: BCOMOutfitStudioExit
    };

    // Small delay to ensure dialog cleanup completes before initializing
    setTimeout(() => {
        BCOMOutfitStudioLoad();
        console.log("[BCOM Integration] Outfit Studio launched with clean transition");
    }, 50);
}

/**
 * Integration functions for Visual Creator to use existing BCOM functionality
 * These functions bridge the visual creator with BCOM's outfit management
 */

/**
 * Save outfit created in visual creator using BCOM's existing save system
 * @param {Array} appearance - Character appearance array from visual creator
 * @param {string} outfitName - Name for the outfit (optional)
 * @returns {boolean} True if save was successful
 */
function BCOMSaveVisualCreatorOutfit(appearance, outfitName = null) {
    try {
        // Convert visual creator appearance to BCOM outfit format
        const outfitData = {
            name: outfitName || `Visual Creator Outfit ${new Date().toLocaleString()}`,
            items: [],
            created: new Date().toISOString(),
            type: "visual_creator"
        };
        
        // Convert appearance items to BCOM format
        if (appearance && Array.isArray(appearance)) {
            outfitData.items = appearance
                .filter(item => item && item.Asset)
                .map(item => ({
                    group: item.Asset.Group.Name,  // Store group NAME, not the entire Group object
                    name: item.Asset.Name,
                    color: item.Color || null,
                    properties: item.Property || {},
                    craft: item.Craft || null
                }));
        }
        
        // TODO: Use existing BCOM save functionality
        // For now, store in localStorage as placeholder
        const existingOutfits = JSON.parse(localStorage.getItem("BCOMOutfits") || "[]");
        existingOutfits.push(outfitData);
        localStorage.setItem("BCOMOutfits", JSON.stringify(existingOutfits));
        
        console.log("[BCOM Integration] Saved visual creator outfit:", outfitData);
        return true;
        
    } catch (error) {
        console.error("[BCOM Integration] Error saving visual creator outfit:", error);
        return false;
    }
}

/**
 * Export visual creator outfit as BCX code using BCOM's existing export system
 * @param {Array} appearance - Character appearance array from visual creator
 * @returns {string} BCX code string or null if error
 */
function BCOMExportVisualCreatorAsBCX(appearance) {
    try {
        // TODO: Use existing BCOM BCX export functionality
        // For now, generate basic BCX code as placeholder
        
        if (!appearance || !Array.isArray(appearance)) {
            return null;
        }
        
        const bcxItems = appearance
            .filter(item => item && item.Asset)
            .map(item => {
                let bcxItem = `${item.Asset.Group.Name}:${item.Asset.Name}`;  // Use Group.Name, not Group object

                // Add color if present
                if (item.Color && Array.isArray(item.Color) && item.Color.length > 0) {
                    const colorStr = item.Color.join(',');
                    bcxItem += `:${colorStr}`;
                }

                // Add properties if present (simplified)
                if (item.Property && Object.keys(item.Property).length > 0) {
                    // TODO: Implement proper property encoding for BCX
                    bcxItem += `:${JSON.stringify(item.Property)}`;
                }

                return bcxItem;
            });
        
        const bcxCode = bcxItems.join(';');
        console.log("[BCOM Integration] Generated BCX code:", bcxCode);
        
        return bcxCode;
        
    } catch (error) {
        console.error("[BCOM Integration] Error exporting visual creator as BCX:", error);
        return null;
    }
}

/**
 * Load existing BCOM outfit into visual creator
 * @param {Object} outfitData - BCOM outfit data
 * @returns {Array} Appearance array for visual creator or null if error
 */
function BCOMLoadOutfitIntoVisualCreator(outfitData) {
    try {
        if (!outfitData || !outfitData.items || !Array.isArray(outfitData.items)) {
            console.error("[BCOM Integration] Invalid outfit data for visual creator");
            return null;
        }
        
        // Convert BCOM outfit format to appearance array
        const appearance = outfitData.items.map(item => {
            // Find the asset
            const asset = Asset.find(a => a.Name === item.name && a.Group === item.group);
            if (!asset) {
                console.warn(`[BCOM Integration] Asset not found: ${item.name} in ${item.group}`);
                return null;
            }
            
            return {
                Asset: asset,
                Color: item.color || null,
                Property: item.properties || {},
                Craft: item.craft || null
            };
        }).filter(item => item !== null);
        
        console.log("[BCOM Integration] Loaded outfit into visual creator:", appearance);
        return appearance;
        
    } catch (error) {
        console.error("[BCOM Integration] Error loading outfit into visual creator:", error);
        return null;
    }
}

/**
 * Get list of saved BCOM outfits for loading in visual creator
 * @returns {Array} Array of outfit objects
 */
function BCOMGetSavedOutfitsForVisualCreator() {
    try {
        // TODO: Use existing BCOM outfit loading functionality
        // For now, load from localStorage as placeholder
        const outfits = JSON.parse(localStorage.getItem("BCOMOutfits") || "[]");
        console.log(`[BCOM Integration] Found ${outfits.length} saved outfits`);
        return outfits;
        
    } catch (error) {
        console.error("[BCOM Integration] Error getting saved outfits:", error);
        return [];
    }
}

/**
 * Import BCX code into visual creator using BCOM's existing import system
 * @param {string} bcxCode - BCX code string to import
 * @returns {Array} Appearance array for visual creator or null if error
 */
function BCOMImportBCXIntoVisualCreator(bcxCode) {
    try {
        // TODO: Use existing BCOM BCX import functionality
        // For now, implement basic BCX parsing as placeholder
        
        if (!bcxCode || typeof bcxCode !== 'string') {
            console.error("[BCOM Integration] Invalid BCX code");
            return null;
        }
        
        const items = bcxCode.split(';').filter(item => item.trim().length > 0);
        const appearance = [];
        
        for (const itemStr of items) {
            const parts = itemStr.split(':');
            if (parts.length < 2) continue;
            
            const group = parts[0].trim();
            const assetName = parts[1].trim();
            
            // Find the asset
            const asset = Asset.find(a => a.Name === assetName && a.Group === group);
            if (!asset) {
                console.warn(`[BCOM Integration] Asset not found in BCX import: ${assetName} in ${group}`);
                continue;
            }
            
            const appearanceItem = {
                Asset: asset,
                Color: null,
                Property: {},
                Craft: null
            };
            
            // Parse color if present
            if (parts.length > 2 && parts[2].trim().length > 0) {
                try {
                    const colorData = parts[2].split(',').map(c => c.trim());
                    appearanceItem.Color = colorData;
                } catch (colorError) {
                    console.warn("[BCOM Integration] Error parsing color in BCX:", colorError);
                }
            }
            
            // Parse properties if present (simplified)
            if (parts.length > 3 && parts[3].trim().length > 0) {
                try {
                    appearanceItem.Property = JSON.parse(parts[3]);
                } catch (propError) {
                    console.warn("[BCOM Integration] Error parsing properties in BCX:", propError);
                }
            }
            
            appearance.push(appearanceItem);
        }
        
        console.log(`[BCOM Integration] Imported ${appearance.length} items from BCX code`);
        return appearance;
        
    } catch (error) {
        console.error("[BCOM Integration] Error importing BCX into visual creator:", error);
        return null;
    }
}

/**
 * Check if Outfit Studio is available and properly loaded
 * @returns {boolean} True if Outfit Studio is available
 */
function BCOMIsVisualCreatorAvailable() {
    // Check if the Outfit Studio screen functions are available
    return (typeof BCOMOutfitStudioLoad === 'function' &&
            typeof BCOMOutfitStudioRun === 'function' &&
            typeof BCOMOutfitStudioClick === 'function' &&
            typeof BCOMOutfitStudioExit === 'function');
}

/**
 * Initialize the visual creator integration
 * Should be called when BCOM loads
 * @param {Object} modApi - BC Mod SDK API reference
 */
function BCOMInitializeVisualCreatorIntegration(modApi) {
    console.log("[BCOM Integration] Initializing Visual Creator integration");

    // Store modApi reference globally for the visual creator
    if (modApi) {
        window.BCOM_VisualCreator_ModApi = modApi;

        // Register SDK hooks to handle dialog exit restoration
        BCOMRegisterVisualCreatorExitHooks(modApi);
    }

    // Note: No longer using dialog mode registration for subscreen approach

    // Check if visual creator is available
    if (BCOMIsVisualCreatorAvailable()) {
        console.log("[BCOM Integration] Visual Creator is available and ready");
    } else {
        console.warn("[BCOM Integration] Visual Creator is not available");
    }
}

/**
 * Register SDK hooks to ensure proper screen restoration after Outfit Studio exits
 * @param {Object} modApi - BC Mod SDK API reference
 */
function BCOMRegisterVisualCreatorExitHooks(modApi) {
    console.log("[BCOM Integration] Registering Visual Creator exit hooks");

    // Track if we're returning from Outfit Studio
    let returningFromOutfitStudio = false;
    let suppressDialogDraw = false;

    // Hook DialogChangeMode to intercept when BCOM tries to change dialog modes after Outfit Studio exit
    modApi.hookFunction('DialogChangeMode', 1, (args, next) => {
        const [newMode] = args;

        // IMPORTANT: If we're in Outfit Studio's extended item mode, ALWAYS allow DialogChangeMode
        // Extended items need to change modes for things like "Tighten", "Swap", etc.
        if (CurrentScreen === "BCOMOutfitStudio" && window.OutfitStudioInExtendedItem) {
            return next(args);
        }

        // If we're returning from Outfit Studio and mode is "outfits", let it through
        if (returningFromOutfitStudio && newMode === "outfits") {
            returningFromOutfitStudio = false; // Reset flag
            return next(args);
        }

        // BCOM uses "dialog" to mean "return to base dialog" but BC doesn't have that mode
        // However, we should ONLY handle this when we know we're in BCOM's flow
        // Check if BCOM is actually active by seeing if DialogMenuMode is currently "outfits"
        if (newMode === "dialog" && DialogMenuMode === "outfits") {
            // BCOM's Outfit Manager is exiting to base dialog
            // In BC, this is just having CurrentCharacter set with DialogMenuMode = null
            DialogMenuMode = null;
            return; // Don't call next - we handled it
        }

        // For all other cases, let BC handle it normally
        return next(args);
    });

    // Hook DialogLeave to ensure proper screen restoration after dialog exits
    modApi.hookFunction('DialogLeave', 1, (args, next) => {
        console.log("[BCOM Integration Hook] DialogLeave called");
        console.log("[BCOM Integration Hook] BEFORE DialogLeave - CurrentScreen:", CurrentScreen, "CurrentModule:", CurrentModule);
        console.log("[BCOM Integration Hook] BEFORE DialogLeave - CurrentCharacter:", CurrentCharacter?.Name);
        console.log("[BCOM Integration Hook] BEFORE DialogLeave - DialogMenuMode:", DialogMenuMode);
        console.log("[BCOM Integration Hook] BEFORE DialogLeave - returningFromOutfitStudio:", returningFromOutfitStudio);
        console.log("[BCOM Integration Hook] BEFORE DialogLeave - CurrentScreenFunctions valid:", !!CurrentScreenFunctions && typeof CurrentScreenFunctions.Run === 'function');

        // Capture the flag state before calling DialogLeave
        const wasReturningFromOutfitStudio = returningFromOutfitStudio;

        const result = next(args);

        console.log("[BCOM Integration Hook] AFTER DialogLeave - CurrentScreen:", CurrentScreen, "CurrentModule:", CurrentModule);
        console.log("[BCOM Integration Hook] AFTER DialogLeave - CurrentCharacter:", CurrentCharacter?.Name);
        console.log("[BCOM Integration Hook] AFTER DialogLeave - DialogMenuMode:", DialogMenuMode);
        console.log("[BCOM Integration Hook] AFTER DialogLeave - CurrentScreenFunctions valid:", !!CurrentScreenFunctions && typeof CurrentScreenFunctions.Run === 'function');

        // After DialogLeave runs, check if we came from Outfit Studio restoration
        // If dialog fully exited (DialogMenuMode is null and CurrentCharacter is cleared),
        // we need to reload the screen to ensure CurrentScreenFunctions are correct
        // IMPORTANT: We must check if we're on a "real" screen (not a dialog subscreen like DOGS lock screen)
        // to avoid breaking other mods
        if (wasReturningFromOutfitStudio && !DialogMenuMode && !CurrentCharacter) {
            const screenModule = CurrentModule || "Room";
            const screenName = CurrentScreen;

            // Only reload if we're on a main screen (not in a subscreen like InspectDeviousPadlock)
            // Main screens typically have their own Run functions like MainHallRun, ChatRoomRun, etc.
            // Subscreens are loaded via CommonSetScreen and have CurrentCharacter set
            const isMainScreen = CurrentScreen === "ChatRoom" ||
                                 CurrentScreen === "MainHall" ||
                                 CurrentScreen === "PrivateRoom" ||
                                 CurrentScreen === "ClubMistress" ||
                                 (CurrentModule === "Room" && !CurrentCharacter);

            if (isMainScreen) {
                console.log("[BCOM Integration Hook] Reloading main screen after Outfit Studio exit:", screenModule, screenName);
                CommonSetScreen(screenModule, screenName);
                // Only reset the flag after successfully reloading a main screen
                returningFromOutfitStudio = false;
            } else {
                console.log("[BCOM Integration Hook] Skipping reload - not a main screen:", screenName);
                // Don't reset the flag yet - we'll need it when we eventually return to a main screen
            }
        }

        // Show chat room elements if we're in a chat room
        if (CurrentScreen === "ChatRoom" && !DialogMenuMode && !CurrentCharacter) {
            if (typeof ChatRoomShowElements === 'function') {
                console.log("[BCOM Integration Hook] Dialog exited in ChatRoom, showing elements");
                ChatRoomShowElements();
            }
        }

        return result;
    });

    // Hook CommonSetScreen to detect when BC is trying to restore a screen after dialog exit
    modApi.hookFunction('CommonSetScreen', 1, (args, next) => {
        const result = next(args);
        return result;
    });

    // Store the flag setter globally so Outfit Studio exit can use it
    window.BCOM_SetReturningFromOutfitStudio = (value) => {
        returningFromOutfitStudio = value;
        console.log("[BCOM Integration] Set returningFromOutfitStudio to:", value);
    };

    console.log("[BCOM Integration] Visual Creator exit hooks registered");
}

/**
 * Placeholder function - no longer needed for subscreen approach
 */
function BCOMRegisterVisualCreatorDialogMode() {
    console.log("[BCOM Integration] Dialog mode registration skipped - using subscreen approach");
    return true;
}

// Export functions for use by other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BCOMAddVisualCreatorButton,
        BCOMHandleVisualCreatorClick,
        BCOMOpenVisualCreator,
        BCOMLaunchVisualCreatorDirect,
        BCOMSaveVisualCreatorOutfit,
        BCOMExportVisualCreatorAsBCX,
        BCOMLoadOutfitIntoVisualCreator,
        BCOMGetSavedOutfitsForVisualCreator,
        BCOMImportBCXIntoVisualCreator,
        BCOMIsVisualCreatorAvailable,
        BCOMInitializeVisualCreatorIntegration,
        BCOMRegisterVisualCreatorDialogMode
    };
}

// Global exports for direct script usage
window.BCOM_VisualCreator = {
    BCOMAddVisualCreatorButton,
    BCOMHandleVisualCreatorClick,
    BCOMOpenVisualCreator,
    BCOMLaunchVisualCreatorDirect,
    BCOMSaveVisualCreatorOutfit,
    BCOMExportVisualCreatorAsBCX,
    BCOMLoadOutfitIntoVisualCreator,
    BCOMGetSavedOutfitsForVisualCreator,
    BCOMImportBCXIntoVisualCreator,
    BCOMIsVisualCreatorAvailable,
    BCOMInitializeVisualCreatorIntegration,
    BCOMRegisterVisualCreatorDialogMode
};

console.log("[BCOM Integration] Visual Creator integration module loaded");
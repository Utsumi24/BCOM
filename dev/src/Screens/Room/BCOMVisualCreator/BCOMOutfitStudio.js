// ==================================================
// BCOM Outfit Studio - DOM-Based Like Base Game
// ==================================================

// ===== GLOBAL STATE =====
var OutfitStudioChar = null;
var OutfitStudioSelectedGroup = null;
var OutfitStudioDOMGrid = null;
var OutfitStudioDOMActionButtons = null; // DOM container for vertical action buttons
var OutfitStudioMenuButtons = []; // Array of menu button objects
var OutfitStudioInColorPicker = false; // Track if we're in the color picker
var OutfitStudioInLockMenu = false; // Track if we're in the lock menu
var OutfitStudioInExtendedItem = false; // Track if we're in extended item mode
var OutfitStudioExtendedItem = null; // The item being extended
var OutfitStudioEditingLock = false; // Track if we're editing lock properties (not item properties)
var OutfitStudioHooksRegistered = false; // Track if we've registered modApi hooks
var OutfitStudioReturnToOutfitManager = false; // Flag to indicate if we should return to outfit manager
var OutfitStudioInHelp = false; // Track if we're showing the help screen
var OutfitStudioHelpOverlay = null; // DOM element for help overlay
var OutfitStudioNeedsRefresh = 0; // Counter for how many frames we should refresh after applying an item
var OutfitStudioInAppearance = false; // Track if we're in the appearance screen

// ===== UTILITY FUNCTIONS =====
// Clear all BC tooltips to prevent them from persisting after alerts
function OutfitStudioClearTooltips() {
    // Simply trigger mouseleave events to force tooltips to hide naturally
    // Don't manually set display:none as that breaks BC's tooltip system
    const buttons = document.querySelectorAll('.button');
    buttons.forEach(button => {
        const event = new MouseEvent('mouseleave', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        button.dispatchEvent(event);
    });
}

// ===== MODAPI HOOKS =====
function OutfitStudioRegisterHooks() {
    if (OutfitStudioHooksRegistered) return;
    if (!window.bcModSdk) {
        console.warn('[Outfit Studio] ModSDK not available, using fallback method');
        return;
    }

    try {
        const modApi = window.bcModSdk.registerMod({
            name: "BCOM Outfit Studio",
            fullName: "BCOM Outfit Studio - Extended Item Support",
            version: "1.0.0"
        });

        // Register a custom CharacterGetCurrent handler for our screen
        // This is BC's official way to provide a character for custom screens
        // It's cleaner than hooking CharacterGetCurrent and works for ALL functions that call it
        if (typeof CharacterGetCurrentHandlers !== 'undefined') {
            CharacterGetCurrentHandlers['BCOMOutfitStudio'] = () => OutfitStudioChar;
        } else {
            // Fallback: Hook CharacterGetCurrent to return our character when in extended mode
            modApi.hookFunction('CharacterGetCurrent', 0, (args, next) => {
                if (OutfitStudioInExtendedItem && OutfitStudioChar) {
                    return OutfitStudioChar;
                }
                return next(args);
            });
        }

        // Hook InventoryIsPermissionBlocked to handle null/missing PermissionItems
        modApi.hookFunction('InventoryIsPermissionBlocked', 0, (args, next) => {
            if (OutfitStudioInExtendedItem) {
                let [C, AssetName, AssetGroup, AssetType] = args;
                if (!C || !C.PermissionItems) {
                    args[0] = Player;
                }
            }
            return next(args);
        });

        // Hook InventoryCheckLimitedPermission to handle null/missing LimitedItems
        modApi.hookFunction('InventoryCheckLimitedPermission', 0, (args, next) => {
            if (OutfitStudioInExtendedItem) {
                let [C, Item, ItemType] = args;
                if (!C || !C.LimitedItems) {
                    args[0] = Player;
                }
            }
            return next(args);
        });

        // Hook DrawItemPreview to suppress character preview drawing in extended mode
        modApi.hookFunction('DrawItemPreview', 0, (args, next) => {
            if (OutfitStudioInExtendedItem) {
                return; // Don't draw item preview - we already drew the character
            }
            return next(args);
        });

        // Track zone drawing to detect and prevent duplicates
        let isDrawingOurZones = false;

        // Hook DrawAssetGroupZone to suppress in extended mode and prevent duplicate drawing
        modApi.hookFunction('DrawAssetGroupZone', 0, (args, next) => {
            const [character, zone, zoom, x, y, ratio, color, thickness] = args;

            if (OutfitStudioInExtendedItem) {
                return; // Don't draw zones in extended mode
            }

            // Only allow zone drawing for our character when WE are explicitly drawing them
            if (character === OutfitStudioChar) {
                if (!isDrawingOurZones) {
                    // Someone else is trying to draw zones for our character - suppress it
                    return;
                }
            }

            return next(args);
        });

        // Store the flag setter so OutfitStudioDrawZones can use it
        window.OutfitStudio_SetDrawingZones = (value) => {
            isDrawingOurZones = value;
        };

        // Hook CharacterAppearanceBuildCanvas (no logging to reduce spam)
        modApi.hookFunction('CharacterAppearanceBuildCanvas', 0, (args, next) => {
            return next(args);
        });

        // Hook DialogKeyDown to prevent errors when in Outfit Studio
        // Use priority 10 to run before other mods that might also hook this function
        modApi.hookFunction('DialogKeyDown', 10, (args, next) => {
            // If we're in Outfit Studio (CurrentScreen is BCOMOutfitStudio), handle keyboard ourselves
            if (CurrentScreen === "BCOMOutfitStudio") {
                const [event] = args;
                // Call our own KeyDown handler
                BCOMOutfitStudioKeyDown(event);
                // Don't call next() - completely suppress BC's DialogKeyDown
                return;
            }

            // IMPORTANT: Also check if DialogMenuMode is set to a mode without KeyDown
            // This can happen when returning from Outfit Studio to Outfit Manager
            // The "outfits" mode doesn't have a KeyDown function, which causes errors
            if (DialogMenuMode) {
                // Check if the mode exists in the mapping and has a KeyDown function
                const modeConfig = DialogMenuMapping[DialogMenuMode];
                if (!modeConfig || typeof modeConfig.KeyDown !== 'function') {
                    // Don't call BC's DialogKeyDown - it will error
                    return;
                }
            }

            return next(args);
        });

        // We don't need hooks for ExtendedItemDraw/Click/TypedItemDraw
        // We manually set CurrentCharacter around the draw function calls in BCOMOutfitStudioRun

        // Hook DrawCharacter to prevent BC from drawing Player when we're in Outfit Studio
        modApi.hookFunction('DrawCharacter', 0, (args, next) => {
            const [character] = args;

            // IMPORTANT: Only intercept when we're actually IN the Outfit Studio screen itself
            // Do NOT intercept when we're in the Appearance or Wardrobe screens
            // AND OutfitStudioChar exists (not null/undefined)
            if (CurrentScreen === "BCOMOutfitStudio" && !OutfitStudioInAppearance && OutfitStudioChar) {
                // Only allow drawing our OutfitStudioChar
                // Suppress drawing of Player or any other character
                if (character !== OutfitStudioChar) {
                    return; // Don't draw this character
                }
            }
            return next(args);
        });

        // Hook CommonSetScreen to prevent extended items from changing screens
        modApi.hookFunction('CommonSetScreen', 0, (args, next) => {
            if (CurrentScreen === "BCOMOutfitStudio") {
                // Allow screen changes when we're intentionally opening the appearance screen
                if (OutfitStudioInAppearance) {
                    return next(args);
                }
                return; // Don't change screens
            }
            return next(args);
        });

        // Hook DialogLeave to prevent BC from leaving the dialog when saving lock properties
        modApi.hookFunction('DialogLeave', 0, (args, next) => {
            if (CurrentScreen === "BCOMOutfitStudio") {
                // Instead of leaving dialog, exit our extended item mode
                if (OutfitStudioInExtendedItem) {
                    OutfitStudioExitExtendedItem();
                }
                return; // Don't leave dialog
            }
            return next(args);
        });

        // Hook DialogLeaveFocusItem to handle exiting extended item mode
        modApi.hookFunction('DialogLeaveFocusItem', 0, (args, next) => {
            if (CurrentScreen === "BCOMOutfitStudio") {
                // If we're in extended item mode, exit it properly
                if (OutfitStudioInExtendedItem) {
                    OutfitStudioExitExtendedItem();
                }
                return; // Don't call BC's DialogLeaveFocusItem
            }
            return next(args);
        });

        OutfitStudioHooksRegistered = true;
    } catch (error) {
        console.error('[Outfit Studio] Failed to register hooks:', error);
    }
}

// ===== LOAD/EXIT =====
function BCOMOutfitStudioLoad() {

    // Register hooks if not already done
    OutfitStudioRegisterHooks();

    // Hide chat room elements if we're in a chat room
    if (CurrentScreen === "ChatRoom" && typeof ChatRoomHideElements === 'function') {
        ChatRoomHideElements();
    }

    // Create a display character using BC's CharacterLoadSimple (proper API)
    // This creates a temporary "simple" type character that won't interfere with online state
    OutfitStudioChar = CharacterLoadSimple("OutfitStudioPreview");
    if (!OutfitStudioChar) {
        console.error('[Outfit Studio] Failed to create character with CharacterLoadSimple');
        return;
    }

    // Copy necessary properties from Player for appearance and item checks
    OutfitStudioChar.HeightRatio = Player.HeightRatio;
    OutfitStudioChar.HeightModifier = 3; // Default standing pose uses 3, not 0!
    OutfitStudioChar.HeightRatioProportion = 1; // Default value - needed because CharacterAppearanceForceUpCharacter skips setting this
    OutfitStudioChar.MustDraw = true;
    OutfitStudioChar.AllowItem = true;

    // Copy wardrobe properties so the appearance screen's wardrobe feature works
    // We need to copy these by reference so changes to wardrobe are reflected
    OutfitStudioChar.Wardrobe = Player.Wardrobe;
    OutfitStudioChar.WardrobeCharacterNames = Player.WardrobeCharacterNames;

    // Use CharacterAppearanceForceUpCharacter to prevent pose changes from moving character
    // BC's check requires HeightModifier < -90 or > 30, but we can always set it for consistency
    // Since our HeightModifier is 3 (within normal range), we need to set it unconditionally
    CharacterAppearanceForceUpCharacter = OutfitStudioChar.MemberNumber; // Will be undefined, matching NPC behavior
    OutfitStudioChar.Inventory = Player.Inventory; // Share inventory for availability checks
    OutfitStudioChar.Crafting = Player.Crafting; // Share crafting for crafted items
    OutfitStudioChar.ActivePose = Player.ActivePose || [];
    OutfitStudioChar.PermissionItems = Player.PermissionItems || {};
    OutfitStudioChar.LimitedItems = Player.LimitedItems || {};
    OutfitStudioChar.BlockItems = Player.BlockItems || [];
    OutfitStudioChar.LabelColor = Player.LabelColor;
    OutfitStudioChar.Ownership = Player.Ownership;
    OutfitStudioChar.Lovership = Player.Lovership || [];
    OutfitStudioChar.Difficulty = Player.Difficulty || {}; // Required for extended item system
    OutfitStudioChar.Game = Player.Game || {}; // Some extended items check this

    // Check if we're in edit mode (editing an existing outfit)
    const editMode = window.BCOM_OutfitStudio_EditMode;

    if (editMode && editMode.outfitData) {
        // Start with fresh character (clothing only, no items)
        OutfitStudioChar.Appearance = Player.Appearance.filter(item =>
            !item.Asset.Group.IsItem()
        );

        // Load the outfit data using BCOM's LoadOutfitFromData function
        try {
            const decompressed = LZString.decompressFromBase64(editMode.outfitData);
            if (decompressed) {
                const outfitData = JSON.parse(decompressed);
                if (outfitData && Array.isArray(outfitData)) {
                    if (window.BCOM_OutfitManager && typeof window.BCOM_OutfitManager.LoadOutfitFromData === 'function') {
                        window.BCOM_OutfitManager.LoadOutfitFromData(OutfitStudioChar, outfitData);
                    }
                }
            }
        } catch (error) {
            console.error('[Outfit Studio] Failed to load outfit for editing:', error);
            alert('Failed to load outfit for editing. Starting with empty outfit.');
        }
    } else {
        // Check if we have a saved work-in-progress outfit in BCOM state
        const savedOutfit = window.BCOM_OutfitStudio_WorkInProgress;

        if (savedOutfit && Array.isArray(savedOutfit)) {
            // Restore the saved appearance
            OutfitStudioChar.Appearance = savedOutfit;
        } else {
            // Copy appearance but remove all items
            OutfitStudioChar.Appearance = Player.Appearance.filter(item =>
                !item.Asset.Group.IsItem()
            );
        }
    }

    // Use CharacterLoadCanvas to properly build the character appearance
    CharacterLoadCanvas(OutfitStudioChar);

    // Set background - BC looks for window[CurrentScreen + "Background"]
    // CurrentScreen is "BCOMOutfitStudio" (set in visualCreatorIntegration.js)
    window.BCOMOutfitStudioBackground = "Dressing";

    // Create DOM container for item grid
    const container = document.createElement('div');
    container.id = 'outfit-studio-container';
    container.className = 'dialog-root';
    container.style.display = 'block'; // Override dialog-root's grid display
    container.style.zIndex = '60';

    // Create scrollable grid
    OutfitStudioDOMGrid = document.createElement('div');
    OutfitStudioDOMGrid.id = 'outfit-studio-grid';
    OutfitStudioDOMGrid.className = 'dialog-grid scroll-box';
    OutfitStudioDOMGrid.style.width = '100%';
    OutfitStudioDOMGrid.style.height = '100%';

    container.appendChild(OutfitStudioDOMGrid);
    document.body.appendChild(container);

    // Shifted left from original x=1025 to x=900 to make room for vertical buttons on right
    // Width stays at 950px (plenty of space between character and grid)
    // Height = 3 rows * 244px + 2 gaps * 20px = 772px
    // Y = 185 to leave room for menu buttons at top
    ElementPositionFixed(container, 900, 185, 825, 780);

    // Create DOM container for vertical action buttons
    OutfitStudioCreateActionButtons();

    // Add custom CSS for worn items
    if (!document.getElementById('outfit-studio-custom-styles')) {
        const style = document.createElement('style');
        style.id = 'outfit-studio-custom-styles';
        style.textContent = `
            /* Worn items have a different background color */
            .outfit-studio-worn-item {
                background-color: #3a5a7a !important;
            }
            .outfit-studio-worn-item:hover {
                background-color: #4a6a8a !important;
            }
            /* Remove button styling at top of screen */
            #outfit-studio-remove-button {
                position: fixed;
                z-index: 61;
            }
        `;
        document.head.appendChild(style);
    }
}

function BCOMOutfitStudioExit() {
    // Save current work-in-progress outfit to memory (persists for browser session)
    if (OutfitStudioChar && OutfitStudioChar.Appearance) {
        window.BCOM_OutfitStudio_WorkInProgress = [...OutfitStudioChar.Appearance];
    }

    // Remove DOM elements
    const container = document.getElementById('outfit-studio-container');
    if (container) {
        container.remove();
    }

    // Remove individual action buttons
    if (OutfitStudioDOMActionButtons && Array.isArray(OutfitStudioDOMActionButtons)) {
        OutfitStudioDOMActionButtons.forEach(({ element }) => {
            if (element && element.parentNode) {
                element.remove();
            }
        });
    }

    // Remove help overlay if present
    if (OutfitStudioHelpOverlay && OutfitStudioHelpOverlay.parentNode) {
        OutfitStudioHelpOverlay.remove();
    }

    // Reset CharacterAppearanceForceUpCharacter
    CharacterAppearanceForceUpCharacter = -1;

    // Reset state
    OutfitStudioChar = null;
    OutfitStudioSelectedGroup = null;
    OutfitStudioDOMGrid = null;
    OutfitStudioDOMActionButtons = null;
    OutfitStudioInColorPicker = false;
    OutfitStudioInLockMenu = false;
    OutfitStudioInExtendedItem = false;
    OutfitStudioExtendedItem = null;
    OutfitStudioInHelp = false;
    OutfitStudioHelpOverlay = null;
    OutfitStudioInAppearance = false;

    // Check if we should return to Outfit Manager
    const previousDialogMode = window.BCOM_PreviousDialogMenuMode;
    const previousScreen = window.BCOM_PreviousScreen;
    const previousModule = window.BCOM_PreviousModule || "Room";
    const previousCharacter = window.BCOM_PreviousCharacter;
    const previousScreenFunctions = window.BCOM_PreviousScreenFunctions; // Save reference before clearing

    // If we were in Outfit Manager, restore manually without calling CommonSetScreen
    if (previousDialogMode === "outfits") {

        // Set flag to let hooks know we're returning from Outfit Studio
        if (typeof window.BCOM_SetReturningFromOutfitStudio === 'function') {
            window.BCOM_SetReturningFromOutfitStudio(true);
        }

        // Restore BCOM state first (includes PreviousDialogMode)
        if (window.BCOM_SavedOutfitManagerState && window.BCOM_ModInitializer) {
            window.BCOM_ModInitializer.setState(window.BCOM_SavedOutfitManagerState);
            window.BCOM_SavedOutfitManagerState = null;
        }

        // Restore all BC state variables WITHOUT calling CommonSetScreen
        CurrentScreen = previousScreen;
        CurrentModule = previousModule;
        CurrentCharacter = previousCharacter;

        // Restore screen functions
        if (previousScreenFunctions) {
            CurrentScreenFunctions = {
                Load: previousScreenFunctions.Load,
                Run: previousScreenFunctions.Run,
                Click: previousScreenFunctions.Click,
                Exit: previousScreenFunctions.Exit,
                MouseMove: previousScreenFunctions.MouseMove || null,
                KeyDown: previousScreenFunctions.KeyDown || null,
                Resize: previousScreenFunctions.Resize || null
            };
        } else {
            console.error('[Outfit Studio] ERROR: No previousScreenFunctions to restore!');
        }

        // Restore dialog mode to "outfits" so BCOM's Outfit Manager displays properly
        // Our DialogKeyDown hook will prevent errors from the missing KeyDown function
        DialogMenuMode = previousDialogMode;

        // DON'T show chat room elements yet - wait until dialog is fully exited
        // The hooks will handle showing them when appropriate
    } else {
        // Not returning to a dialog mode - use CommonSetScreen
        CommonSetScreen(previousModule, previousScreen);

        // Show chat room elements if we're returning to a chat room
        if (previousScreen === "ChatRoom" && typeof ChatRoomShowElements === 'function') {
            ChatRoomShowElements();
        }
    }

    // Clear the saved state AFTER restoring
    window.BCOM_PreviousScreen = null;
    window.BCOM_PreviousModule = null;
    window.BCOM_PreviousScreenFunctions = null;
    window.BCOM_PreviousCharacter = null;
    window.BCOM_PreviousDialogMenuMode = null;

    // Don't clear edit mode - let it persist so the checkbox stays checked
    // It will be cleared when the user either saves the outfit or clicks the checkbox again
}

// ===== ACTION BUTTONS (DOM) =====
function OutfitStudioCreateActionButtons() {
    // Button definitions
    const buttons = [
        { id: 'save', label: 'Save Outfit', icon: 'Icons/Accept.png', action: OutfitStudioSaveOutfit, y: 200 },
        { id: 'appearance', label: 'Change Appearance', icon: 'Icons/Character.png', action: OutfitStudioOpenAppearance, y: 310 },
        { id: 'copy-bcx', label: 'Copy BCX Code', icon: 'Icons/Export.png', action: OutfitStudioCopyBCXCode, y: 420 },
        { id: 'import-bcx', label: 'Import BCX Code', icon: 'Icons/Import.png', action: OutfitStudioImportBCXCode, y: 530 },
        { id: 'clear-all', label: 'Clear All', icon: 'Icons/Trash.png', action: OutfitStudioClearAll, y: 640 },
        { id: 'help', label: 'Help', icon: 'Icons/Question.png', action: OutfitStudioShowHelp, y: 750 }
    ];

    // Create an array to store button references
    const buttonElements = [];

    // Create each button individually using BC's button structure
    buttons.forEach(buttonDef => {
        const button = document.createElement('button');
        button.id = `outfit-studio-action-${buttonDef.id}`;
        button.className = 'button button-styling'; // BC's button classes

        // Set z-index higher than item grid (which is 60) so tooltips appear on top
        button.style.zIndex = '70';

        // Create icon image using BC's structure
        const icon = document.createElement('img');
        icon.className = 'button-image';
        icon.src = buttonDef.icon;

        // Create tooltip using BC's structure
        const tooltip = document.createElement('span');
        tooltip.className = 'button-tooltip button-tooltip-left'; // Tooltip appears to the left
        tooltip.textContent = buttonDef.label;

        button.appendChild(icon);
        button.appendChild(tooltip);

        // Add click handler
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            buttonDef.action();
        });

        document.body.appendChild(button);
        buttonElements.push({ element: button, y: buttonDef.y });
    });

    // Store buttons for positioning
    OutfitStudioDOMActionButtons = buttonElements;

    // Position all buttons
    OutfitStudioPositionActionButtons();
}

function OutfitStudioPositionActionButtons() {
    if (!OutfitStudioDOMActionButtons) return;

    // Position each button individually using ElementPositionFixed
    // X=1885 to align with the Exit button in the menu bar
    // Buttons are 90x90, spaced 110px apart vertically
    OutfitStudioDOMActionButtons.forEach(({ element, y }) => {
        ElementPositionFixed(element, 1885, y, 90, 90);
    });
}

function OutfitStudioShowActionButtons(show) {
    if (!OutfitStudioDOMActionButtons) return;

    // OutfitStudioDOMActionButtons is now an array of { element, y } objects
    OutfitStudioDOMActionButtons.forEach(({ element }) => {
        element.style.display = show ? '' : 'none';
    });
}

function OutfitStudioHideActionButtons() {
    OutfitStudioShowActionButtons(false);
}

// ===== RUN/DRAW/RESIZE =====
function BCOMOutfitStudioRun() {
    // Resize DOM containers to be responsive
    const container = document.getElementById('outfit-studio-container');
    if (container) {
        ElementPositionFixed(container, 900, 185, 825, 780);
    }

    // Reposition action buttons
    OutfitStudioPositionActionButtons();

    // Don't draw our normal UI when in extended item mode
    if (!OutfitStudioInExtendedItem) {
        // Title - positioned above the item grid to avoid interfering with buttons
        // Check if we're in edit mode to show the appropriate title
        const editMode = window.BCOM_OutfitStudio_EditMode;
        let titleText = "Outfit Studio - Creating New Outfit";
        if (editMode && editMode.outfitName) {
            titleText = `Outfit Studio - Editing ${editMode.outfitName}`;
        }
        DrawText(titleText, 1150, 150, "White", "Gray");

        // Draw character
        if (OutfitStudioChar) {
            // Set MustDraw to false to prevent BC's automatic drawing (which includes zones)
            OutfitStudioChar.MustDraw = false;

            // Refresh for a few frames after applying an item
            // This mimics the old behavior where CharacterRefresh was called every frame
            // but only when needed, avoiding performance issues
            if (OutfitStudioNeedsRefresh > 0) {
                CharacterRefresh(OutfitStudioChar);
                OutfitStudioNeedsRefresh--;
            }

            // Call CharacterAppearanceSetHeightModifiers to set HeightRatio
            // Even though CharacterAppearanceForceUpCharacter skips the height calculation,
            // this function still sets HeightRatio which is needed for rendering
            if (typeof CharacterAppearanceSetHeightModifiers === 'function') {
                CharacterAppearanceSetHeightModifiers(OutfitStudioChar);
            }

            // IMPORTANT: Pass true for IsHeightResizeAllowed so BC respects the character's HeightRatio
            DrawCharacter(OutfitStudioChar, 250, 0, 1, true);

            // Draw zones manually - we control when zones are drawn
            OutfitStudioDrawZones();
        }

        // Show selected group name
        if (OutfitStudioSelectedGroup) {
            // Strip "Item" prefix from group name for clearer display
            const displayName = OutfitStudioSelectedGroup.Name.replace(/^Item/, '');
            DrawText(`Selected: ${displayName}`, 500, 950, "Yellow", "Black");
        }

        // Draw menu bar
        OutfitStudioDrawMenuBar();
    }

    // Show/hide action buttons based on current mode
    OutfitStudioShowActionButtons(!OutfitStudioInExtendedItem && !OutfitStudioInColorPicker && !OutfitStudioInHelp);

    // Hide/show help overlay based on mode
    if (OutfitStudioHelpOverlay) {
        OutfitStudioHelpOverlay.style.display = OutfitStudioInHelp ? 'flex' : 'none';
    }

    // Draw ItemColor UI if active
    if (OutfitStudioInColorPicker && OutfitStudioSelectedGroup) {
        const equippedItem = InventoryGet(OutfitStudioChar, OutfitStudioSelectedGroup.Name);
        if (equippedItem && typeof ItemColorDraw === 'function') {
            ItemColorDraw(OutfitStudioChar, OutfitStudioSelectedGroup.Name, 1025, 125, 950, 850, false);
        }
    }

    // Draw extended item UI if active
    if (OutfitStudioInExtendedItem && OutfitStudioExtendedItem) {
        // Hide the entire DOM container (not just the grid) to prevent blocking clicks
        const container = document.getElementById('outfit-studio-container');
        if (container) {
            container.style.display = 'none';
        }

        // Continuously clean up BC's dialog elements that might appear
        OutfitStudioCleanupDialogElements();

        // IMPORTANT: Set CurrentCharacter for the ENTIRE extended item rendering cycle
        // BC's extended item system uses CurrentCharacter in many nested function calls
        // We need to set it at the top level and restore it at the end of Run()
        const savedCurrentCharacter = CurrentCharacter;
        CurrentCharacter = OutfitStudioChar;

        // Draw our character at the same position as normal
        if (OutfitStudioChar) {
            OutfitStudioChar.MustDraw = true;

            // Call CharacterAppearanceSetHeightModifiers to set HeightRatio
            // This is needed for proper rendering in extended item mode too
            if (typeof CharacterAppearanceSetHeightModifiers === 'function') {
                CharacterAppearanceSetHeightModifiers(OutfitStudioChar);
            }

            // IMPORTANT: Pass true for IsHeightResizeAllowed so BC respects the character's HeightRatio
            DrawCharacter(OutfitStudioChar, 250, 0, 1, true);
        }

        // IMPORTANT: Check DialogMenuMode first to route to the correct Draw function
        // When in a submenu like "tighten", we need to call the submenu's Draw function, not the item's
        if (DialogMenuMode === "tighten" && typeof TightenLoosenItemDraw === 'function') {
            // In tighten/loosen submenu
            TightenLoosenItemDraw();
        } else {
            // Call the appropriate Draw function for the main extended item menu
            // Use our own flag to determine if we're editing lock or item properties
            // BC's DialogFocusItem/DialogFocusSourceItem can be cleared by other code between frames
            let drawFuncName;
            if (OutfitStudioEditingLock) {
                // Editing lock properties - get lock name from DialogFocusItem if available, otherwise from item
                let lockName;
                if (DialogFocusItem && DialogFocusItem.Asset) {
                    lockName = DialogFocusItem.Asset.Name;
                } else if (OutfitStudioExtendedItem && OutfitStudioExtendedItem.Property && OutfitStudioExtendedItem.Property.LockedBy) {
                    lockName = OutfitStudioExtendedItem.Property.LockedBy;
                } else {
                    console.error('[Outfit Studio] Cannot determine lock name for draw function!');
                    return;
                }
                drawFuncName = `InventoryItemMisc${lockName}Draw`;
            } else {
                // Editing item properties
                drawFuncName = `Inventory${OutfitStudioExtendedItem.Asset.Group.Name}${OutfitStudioExtendedItem.Asset.Name}Draw`;
            }

            if (typeof window[drawFuncName] === 'function') {
                window[drawFuncName]();
            } else {
                console.error('[Outfit Studio] Draw function not found:', drawFuncName);
            }
        }

        // Draw an exit button in the top right
        DrawButton(1885, 25, 90, 90, "", "White", "Icons/Exit.png", "Exit");

        // Restore CurrentCharacter at the end of the extended item rendering
        CurrentCharacter = savedCurrentCharacter;
    } else {
        // Show the container when not in extended mode
        const container = document.getElementById('outfit-studio-container');
        if (container && !OutfitStudioInColorPicker) {
            container.style.display = 'block';
        }
    }
}

function OutfitStudioDrawMenuBar() {
    // Build menu buttons based on current state
    OutfitStudioMenuButtons = [];

    // Always show Exit button
    OutfitStudioMenuButtons.push({
        name: "Exit",
        icon: "Icons/Exit.png",
        tooltip: "Exit",
        color: "White"
    });

    // Show item manipulation buttons if an item is equipped
    if (OutfitStudioSelectedGroup) {
        const equippedItem = InventoryGet(OutfitStudioChar, OutfitStudioSelectedGroup.Name);

        if (equippedItem) {
            // Remove button (like base game)
            OutfitStudioMenuButtons.push({
                name: "Remove",
                icon: "Icons/Remove.png",
                tooltip: "Remove Item",
                color: "White"
            });

            // Check if item has a lock
            const hasLock = InventoryItemHasEffect(equippedItem, "Lock", true);

            if (hasLock) {
                // Remove Lock button (only shown if item is locked)
                OutfitStudioMenuButtons.push({
                    name: "RemoveLock",
                    icon: "Icons/Unlock.png",
                    tooltip: "Remove Lock",
                    color: "White"
                });

                // Edit Lock Properties button (only shown if item is locked AND lock has configurable properties)
                // Check if the lock has an Archetype (meaning it has extended properties)
                const lockAsset = AssetGet(OutfitStudioChar.AssetFamily, "ItemMisc", equippedItem.Property.LockedBy);

                // Check if this is a DOGS lock (which uses custom screens)
                // DOGS locks have Property.Name === "DeviousPadlock"
                const isDOGSLock = equippedItem.Property && equippedItem.Property.Name === "DeviousPadlock";

                // Only show button for locks with archetype that are NOT DOGS locks
                const hasConfigurableProperties = lockAsset && lockAsset.Archetype && !isDOGSLock;

                if (hasConfigurableProperties) {
                    OutfitStudioMenuButtons.push({
                        name: "EditLock",
                        icon: "Icons/InspectLock.png",
                        tooltip: "Lock Properties",
                        color: "White"
                    });
                }
            } else {
                // Add Lock button (only shown if item can be locked and isn't locked)
                if (typeof InventoryDoesItemAllowLock === 'function' && InventoryDoesItemAllowLock(equippedItem)) {
                    OutfitStudioMenuButtons.push({
                        name: "Lock",
                        icon: "Icons/Lock.png",
                        tooltip: "Add Lock",
                        color: "White"
                    });
                }
            }

            // Properties button (if item has extended options)
            if (equippedItem.Asset && equippedItem.Asset.Archetype) {
                OutfitStudioMenuButtons.push({
                    name: "Use",
                    icon: "Icons/Use.png",
                    tooltip: "Item Properties",
                    color: "White"
                });
            }
            
            // Color picker button
            OutfitStudioMenuButtons.push({
                name: "ColorChange",
                icon: "Icons/ColorChange.png",
                tooltip: "Change Color",
                color: "White"
            });
        }
    }

    // Draw buttons from right to left (matching BC's layout)
    for (let i = 0; i < OutfitStudioMenuButtons.length; i++) {
        const button = OutfitStudioMenuButtons[i];
        const x = 1885 - i * 110; // BC's button positioning
        const y = 15;
        const size = 90;

        DrawButton(x, y, size, size, "", button.color, button.icon, button.tooltip);
    }
}


function OutfitStudioDrawZones() {
    const X = 250;
    const Y = 0;
    const Zoom = 1;

    // Set flag to allow zone drawing for our character
    if (window.OutfitStudio_SetDrawingZones) {
        window.OutfitStudio_SetDrawingZones(true);
    }

    for (const group of AssetGroup) {
        if (!group.IsItem() || !group.Zone) continue;

        const isSelected = OutfitStudioSelectedGroup && OutfitStudioSelectedGroup.Name === group.Name;
        const item = InventoryGet(OutfitStudioChar, group.Name);
        const hasItem = item != null;

        // Choose color
        let color = "#80808040"; // Gray for empty
        if (isSelected) color = "cyan";
        else if (hasItem) color = "#FFA50080"; // Orange for occupied

        // Draw using BC's function
        DrawAssetGroupZone(
            OutfitStudioChar,
            group.Zone,
            Zoom,
            X,
            Y,
            OutfitStudioChar.HeightRatio || 1,
            color,
            3
        );

        // Draw lock overlay if item is locked
        if (item && item.Property && item.Property.LockedBy) {
            const lockAsset = AssetGet(OutfitStudioChar.AssetFamily, "ItemMisc", item.Property.LockedBy);
            if (lockAsset && group.Zone) {
                // Calculate the center position of the zone
                // BC's zones use character-relative coordinates
                const zoneX = X + (group.Zone[0] * Zoom * OutfitStudioChar.HeightRatio);
                const zoneY = Y + (group.Zone[1] * Zoom * OutfitStudioChar.HeightRatio);
                const zoneWidth = group.Zone[2] * Zoom * OutfitStudioChar.HeightRatio;
                const zoneHeight = group.Zone[3] * Zoom * OutfitStudioChar.HeightRatio;

                // Draw lock icon in the center of the zone
                // DrawImageResize is BC's function for drawing scaled images
                const lockSize = Math.min(50, zoneWidth * 0.3, zoneHeight * 0.3);
                const lockX = zoneX + (zoneWidth - lockSize) / 2;
                const lockY = zoneY + (zoneHeight - lockSize) / 2;

                DrawImageResize(
                    `Assets/${OutfitStudioChar.AssetFamily}/ItemMisc/Preview/${item.Property.LockedBy}.png`,
                    lockX,
                    lockY,
                    lockSize,
                    lockSize
                );
            }
        }
    }

    // Clear flag after drawing
    if (window.OutfitStudio_SetDrawingZones) {
        window.OutfitStudio_SetDrawingZones(false);
    }
}

// ===== CLICK HANDLING =====
function BCOMOutfitStudioClick() {
    // Extended item clicks (highest priority)
    if (OutfitStudioInExtendedItem && OutfitStudioExtendedItem) {
        // Set CurrentCharacter for the entire click handling cycle
        // BC's extended item system uses CurrentCharacter in many nested function calls
        const savedCurrentCharacter = CurrentCharacter;
        CurrentCharacter = OutfitStudioChar;

        try {
            // Check for exit button click
            if (MouseIn(1885, 25, 90, 90)) {
                OutfitStudioExitExtendedItem();
                return;
            }

            // IMPORTANT: Check DialogMenuMode first to route to the correct Click function
            // When in a submenu like "tighten", we need to call the submenu's Click function, not the item's
            if (DialogMenuMode === "tighten" && typeof TightenLoosenItemClick === 'function') {
                // In tighten/loosen submenu
                TightenLoosenItemClick();
                return;
            }

            // Call the appropriate Click function for the main extended item menu
            // Use our own flag to determine if we're editing lock or item properties
            let clickFuncName;
            if (OutfitStudioEditingLock) {
                // Editing lock properties - get lock name
                let lockName;
                if (DialogFocusItem && DialogFocusItem.Asset) {
                    lockName = DialogFocusItem.Asset.Name;
                } else if (OutfitStudioExtendedItem && OutfitStudioExtendedItem.Property && OutfitStudioExtendedItem.Property.LockedBy) {
                    lockName = OutfitStudioExtendedItem.Property.LockedBy;
                } else {
                    console.error('[Outfit Studio] Cannot determine lock name for click function!');
                    return;
                }
                clickFuncName = `InventoryItemMisc${lockName}Click`;
            } else {
                // Editing item properties
                clickFuncName = `Inventory${OutfitStudioExtendedItem.Asset.Group.Name}${OutfitStudioExtendedItem.Asset.Name}Click`;
            }

            if (typeof window[clickFuncName] === 'function') {
                window[clickFuncName]();
            } else {
                console.error('[Outfit Studio] Click function not found:', clickFuncName);
            }
        } finally {
            // Always restore CurrentCharacter
            CurrentCharacter = savedCurrentCharacter;
        }

        return;
    }

    // ItemColor clicks
    if (OutfitStudioInColorPicker && OutfitStudioSelectedGroup) {
        const equippedItem = InventoryGet(OutfitStudioChar, OutfitStudioSelectedGroup.Name);
        if (equippedItem && typeof ItemColorClick === 'function') {
            ItemColorClick(OutfitStudioChar, OutfitStudioSelectedGroup.Name, 1025, 125, 950, 850, false);
            return;
        }
    }

    // Menu bar clicks (check first to match BC's priority)
    if (OutfitStudioHandleMenuClick()) {
        return;
    }

    // Note: Action button clicks are now handled by DOM event listeners

    // Zone clicks
    if (MouseIn(0, 0, 750, 1000)) {
        OutfitStudioHandleZoneClick();
        return;
    }
}

function OutfitStudioHandleMenuClick() {
    // Check clicks on menu buttons (matching BC's click detection)
    for (let i = 0; i < OutfitStudioMenuButtons.length; i++) {
        const x = 1885 - i * 110;
        const y = 15;
        const size = 90;

        if (MouseIn(x, y, size, size)) {
            const button = OutfitStudioMenuButtons[i];

            switch (button.name) {
                case "Exit":
                    BCOMOutfitStudioExit();
                    return true;

                case "Remove":
                    OutfitStudioApplyItem({ IsRemove: true });
                    return true;

                case "ColorChange":
                    OutfitStudioOpenColorPicker();
                    return true;

                case "Lock":
                    OutfitStudioOpenLockMenu();
                    return true;

                case "RemoveLock":
                    OutfitStudioRemoveLock();
                    return true;

                case "EditLock":
                    OutfitStudioEditLockProperties();
                    return true;

                case "Use":
                    OutfitStudioOpenProperties();
                    return true;
            }
        }
    }
    return false;
}

function OutfitStudioOpenColorPicker() {
    if (!OutfitStudioChar || !OutfitStudioSelectedGroup) {
        return;
    }

    const equippedItem = InventoryGet(OutfitStudioChar, OutfitStudioSelectedGroup.Name);
    if (!equippedItem) {
        return;
    }

    // Set flag to indicate we're in color picker mode
    OutfitStudioInColorPicker = true;

    // Hide the entire DOM container (not just the grid) to prevent blocking clicks
    const container = document.getElementById('outfit-studio-container');
    if (container) {
        container.style.display = 'none';
    }

    // Load the ItemColor UI
    if (typeof ItemColorLoad === 'function') {
        ItemColorLoad(OutfitStudioChar, equippedItem, 1025, 125, 950, 850, false);
    }

    // Register exit callback to know when user is done
    if (typeof ItemColorOnExit === 'function') {
        ItemColorOnExit((character, item, save) => {
            // Exit color picker mode
            OutfitStudioInColorPicker = false;

            // Show the container again
            const container = document.getElementById('outfit-studio-container');
            if (container) {
                container.style.display = 'block';
            }

            // If changes were saved, refresh the character and grid
            if (save) {
                CharacterRefresh(OutfitStudioChar);
                OutfitStudioSelectGroup(OutfitStudioSelectedGroup);
            }
        });
    }
}

function OutfitStudioOpenLockMenu() {
    if (!OutfitStudioChar || !OutfitStudioSelectedGroup) {
        return;
    }

    const equippedItem = InventoryGet(OutfitStudioChar, OutfitStudioSelectedGroup.Name);
    if (!equippedItem) {
        return;
    }

    if (!InventoryDoesItemAllowLock(equippedItem)) {
        return;
    }

    // Set flag to indicate we're in lock menu mode
    OutfitStudioInLockMenu = true;

    // Build lock list
    const locks = [];

    // Add "Remove Lock" option if item is already locked
    if (InventoryItemHasEffect(equippedItem, "Lock", true)) {
        locks.push({ IsRemove: true });
    }

    // Add all available locks from Player's inventory
    const availableLocks = Asset.filter(a =>
        a.Group.Name === "ItemMisc" &&
        a.IsLock &&
        InventoryAvailable(Player, a.Name, a.Group.Name)
    );

    for (const lockAsset of availableLocks) {
        locks.push({ Asset: lockAsset });
    }

    // Populate grid with locks
    OutfitStudioPopulateLockGrid(locks);
}

function OutfitStudioPopulateLockGrid(locks) {
    if (!OutfitStudioDOMGrid) return;

    // Clear grid
    OutfitStudioDOMGrid.innerHTML = '';

    // Check if current item has a lock with configurable properties (for Edit Properties button)
    const equippedItem = InventoryGet(OutfitStudioChar, OutfitStudioSelectedGroup.Name);
    const hasLockWithProperties = equippedItem && equippedItem.Property && equippedItem.Property.LockedBy;

    // If item has a lock, add "Edit Lock Properties" button at the top
    if (hasLockWithProperties) {
        const lockAsset = AssetGet(OutfitStudioChar.AssetFamily, "ItemMisc", equippedItem.Property.LockedBy);
        // Check if this lock has an Archetype (meaning it has configurable properties)
        // Only locks with Archetypes have extended properties (password, combo, timer, etc.)
        const hasConfigurableProperties = lockAsset && lockAsset.Archetype;

        if (hasConfigurableProperties) {
            ElementButton.Create(
                `outfit-studio-lock-properties`,
                (e) => OutfitStudioEditLockProperties(),
                { label: "Edit Lock Properties", labelPosition: "center" },
                {
                    button: {
                        parent: OutfitStudioDOMGrid,
                        classList: ['dialog-grid-button']
                    }
                }
            );
        }
    }

    // Create buttons using BC's ElementButton system
    locks.forEach((lock, index) => {
        if (lock.IsRemove) {
            // Create remove lock button
            ElementButton.Create(
                `outfit-studio-lock-${index}`,
                (e) => OutfitStudioApplyLock(lock),
                { label: "Remove Lock", labelPosition: "center" },
                {
                    button: {
                        parent: OutfitStudioDOMGrid,
                        classList: ['dialog-grid-button']
                    }
                }
            );
        } else if (lock.Asset) {
            // Check if this lock is currently worn
            const equippedItem = InventoryGet(OutfitStudioChar, OutfitStudioSelectedGroup.Name);
            const worn = equippedItem?.Property?.LockedBy === lock.Asset.Name;

            // Create lock button
            const buttonData = {
                Asset: lock.Asset,
                Worn: worn,
                Craft: null
            };

            ElementButton.CreateForAsset(
                `outfit-studio-lock-${index}`,
                buttonData,
                OutfitStudioChar,
                (e) => OutfitStudioApplyLock(lock),
                { clickDisabled: null },
                {
                    button: {
                        parent: OutfitStudioDOMGrid,
                        classList: ['dialog-grid-button'],
                        attributes: {
                            'aria-checked': worn.toString()
                        }
                    }
                }
            );
        }
    });
}

function OutfitStudioApplyLock(lock) {
    if (!OutfitStudioChar || !OutfitStudioSelectedGroup) return;

    const equippedItem = InventoryGet(OutfitStudioChar, OutfitStudioSelectedGroup.Name);
    if (!equippedItem) return;

    if (lock.IsRemove) {
        // Remove the lock
        if (typeof InventoryUnlock === 'function') {
            InventoryUnlock(OutfitStudioChar, equippedItem, false);
        }
    } else if (lock.Asset) {
        // Apply the lock
        if (typeof InventoryLock === 'function') {
            InventoryLock(OutfitStudioChar, equippedItem, lock.Asset.Name, Player.MemberNumber, false);
        }
    }

    // Refresh character
    CharacterRefresh(OutfitStudioChar);

    // Exit lock menu and return to item list
    OutfitStudioExitLockMenu();
}

function OutfitStudioExitLockMenu() {
    OutfitStudioInLockMenu = false;

    // Clean up BC's dialog focus variables (in case we came from lock properties editing)
    DialogFocusSourceItem = null;
    DialogFocusItem = null;

    // Rebuild the item list for the selected group
    if (OutfitStudioSelectedGroup) {
        OutfitStudioSelectGroup(OutfitStudioSelectedGroup);
    }
}

function OutfitStudioRemoveLock() {
    if (!OutfitStudioChar || !OutfitStudioSelectedGroup) return;

    const equippedItem = InventoryGet(OutfitStudioChar, OutfitStudioSelectedGroup.Name);
    if (!equippedItem) return;

    // Remove the lock
    if (typeof InventoryUnlock === 'function') {
        InventoryUnlock(OutfitStudioChar, equippedItem, false);
    }

    // Refresh character
    CharacterRefresh(OutfitStudioChar);

    // Rebuild the item list for the selected group
    if (OutfitStudioSelectedGroup) {
        OutfitStudioSelectGroup(OutfitStudioSelectedGroup);
    }
}

function OutfitStudioEditLockProperties() {
    if (!OutfitStudioChar || !OutfitStudioSelectedGroup) {
        return;
    }

    const equippedItem = InventoryGet(OutfitStudioChar, OutfitStudioSelectedGroup.Name);
    if (!equippedItem || !equippedItem.Property || !equippedItem.Property.LockedBy) {
        return;
    }

    const lockName = equippedItem.Property.LockedBy;
    const lockAsset = AssetGet(OutfitStudioChar.AssetFamily, "ItemMisc", lockName);
    if (!lockAsset || !lockAsset.Archetype) {
        return;
    }

    // Check if this lock has standard BC functions (not a custom mod lock)
    const loadFuncName = `InventoryItemMisc${lockName}Load`;
    if (typeof window[loadFuncName] !== 'function') {
        console.error('[Outfit Studio] Lock does not have standard BC Load function:', loadFuncName);
        alert('This lock uses a custom interface that is not supported in the Outfit Studio. Please use the base game wardrobe to edit its properties.');
        return;
    }

    // Enter extended item mode (reuse the same system as item properties)
    OutfitStudioInExtendedItem = true;
    OutfitStudioExtendedItem = equippedItem;
    OutfitStudioEditingLock = true; // Flag that we're editing LOCK properties, not item properties

    // Set up BC's extended item context for locks
    // For locks, we need to create a temporary lock item that points back to the source item
    // DialogFocusItem = the lock itself (as an item on ItemMisc)
    // DialogFocusSourceItem = the item being locked
    DialogFocusSourceItem = equippedItem;

    // Create a temporary lock item - BC's lock system expects this
    DialogFocusItem = {
        Asset: lockAsset,
        Property: equippedItem.Property, // Share the same property object so changes are reflected
        Color: "Default"
    };

    OutfitStudioChar.FocusGroup = AssetGroupGet(OutfitStudioChar.AssetFamily, "ItemMisc");

    // DON'T set CurrentCharacter here - our ExtendedItemDraw hook will set it temporarily when needed
    // This prevents BC's dialog interface from auto-drawing

    // Call ExtendedItemInit for the lock
    if (typeof ExtendedItemInit === 'function') {
        ExtendedItemInit(OutfitStudioChar, DialogFocusItem, false, false);
    }

    // Call the lock's Load function (reuse the variable we already declared)
    if (typeof window[loadFuncName] === 'function') {
        window[loadFuncName]();
    }

    // Note: We don't restore CurrentCharacter here because we need it during Draw/Click
    // It will be restored in OutfitStudioExitExtendedItem()
}

function OutfitStudioOpenProperties() {
    if (!OutfitStudioChar || !OutfitStudioSelectedGroup) {
        return;
    }

    const equippedItem = InventoryGet(OutfitStudioChar, OutfitStudioSelectedGroup.Name);
    if (!equippedItem) {
        return;
    }

    if (!equippedItem.Asset || !equippedItem.Asset.Archetype) {
        return;
    }

    // Enter extended item mode
    OutfitStudioInExtendedItem = true;
    OutfitStudioExtendedItem = equippedItem;

    // IMPORTANT: Don't set CurrentCharacter - this triggers BC's Dialog system
    // Instead, we use the CharacterGetCurrent hook to return OutfitStudioChar when needed
    DialogFocusItem = equippedItem;
    OutfitStudioChar.FocusGroup = OutfitStudioSelectedGroup; // Some functions check this

    // Call ExtendedItemInit to properly initialize the extended item
    if (typeof ExtendedItemInit === 'function') {
        ExtendedItemInit(OutfitStudioChar, equippedItem, false, false);
    }

    // Call the item's Load function
    const loadFuncName = `Inventory${equippedItem.Asset.Group.Name}${equippedItem.Asset.Name}Load`;
    if (typeof window[loadFuncName] === 'function') {
        window[loadFuncName]();
    }
}

function OutfitStudioCleanupDialogElements() {
    // Hide specific unwanted dialog elements while keeping extended item UI functional

    if (!OutfitStudioInExtendedItem) return;

    // IMPORTANT: When DialogMenuMode is set (like "tighten", "swap", etc.),
    // we're in an extended item submenu and should NOT remove any dialog elements
    // The extended item system creates its own UI that we need to preserve
    if (DialogMenuMode && DialogMenuMode !== null) {
        return;
    }

    // Hide facial expression menu buttons (these start with dialog-expression-)
    const expressionButtons = document.querySelectorAll('button[id^="dialog-expression-"]');
    expressionButtons.forEach(button => {
        if (button.style.display !== 'none') {
            button.style.display = 'none';
        }
    });

    // Hide the dialog exit button (we have our own)
    const dialogExit = document.getElementById('dialog-dialog-menubar-Exit');
    if (dialogExit && dialogExit.style.display !== 'none') {
        dialogExit.style.display = 'none';
    }
}

function OutfitStudioExitExtendedItem() {
    // Keep the extended mode flag ON during cleanup to suppress zone drawing
    // We'll turn it off at the very end
    const wasInExtendedMode = OutfitStudioInExtendedItem;

    // Call the Exit function if it exists
    if (wasInExtendedMode) {
        const item = InventoryGet(OutfitStudioChar, OutfitStudioSelectedGroup.Name);
        if (item) {
            let exitFuncName;
            // Check if we were editing lock properties
            if (DialogFocusSourceItem && DialogFocusItem && DialogFocusItem.Asset.Group.Name === "ItemMisc") {
                // Editing lock properties
                const lockName = DialogFocusItem.Asset.Name;
                exitFuncName = `InventoryItemMisc${lockName}Exit`;
            } else {
                // Editing item properties
                exitFuncName = `Inventory${item.Asset.Group.Name}${item.Asset.Name}Exit`;
            }

            if (typeof window[exitFuncName] === 'function') {
                window[exitFuncName]();
            }
        }
    }

    // Clean up BC's extended item context
    DialogFocusItem = null;
    DialogFocusSourceItem = null;

    // IMPORTANT: Clean up DOM elements BEFORE refreshing/rebuilding
    // This prevents BC from re-rendering the zone overlays

    // Clean up any BC-created DOM elements that might be interfering
    // BC's extended item system may create .dialog-root elements
    const bcDialogRoots = document.querySelectorAll('.dialog-root:not(#outfit-studio-container)');
    bcDialogRoots.forEach(el => el.remove());

    // Also clean up any stray dialog elements (including HideOnScreen elements)
    const bcDialogs = document.querySelectorAll('[id^="dialog-"], [class*="dialog-"]:not(#outfit-studio-container):not(#outfit-studio-grid):not(.dialog-grid-button)');
    bcDialogs.forEach(el => {
        // Only remove if it's not part of our outfit studio
        if (!el.closest('#outfit-studio-container')) {
            el.remove();
        }
    });

    // Clean up HideOnScreen elements specifically
    const hideOnScreen = document.querySelectorAll('.HideOnScreen, [class*="HideOnScreen"]');
    hideOnScreen.forEach(el => el.remove());

    // Clean up any canvas-based character zones that BC might have created
    // These are SVG overlays that BC creates for clickable zones
    const svgOverlays = document.querySelectorAll('svg[style*="position"][style*="absolute"]');
    svgOverlays.forEach(el => el.remove());

    // Also check for BC's character appearance canvas zones
    const canvasZones = document.querySelectorAll('canvas[style*="position"][style*="absolute"]');
    canvasZones.forEach(el => {
        // Don't remove the main canvas
        if (el.id !== 'MainCanvas') {
            el.remove();
        }
    });

    // Clear DialogMenuMode if it was set by extended items
    DialogMenuMode = null;

    // Turn off extended item mode NOW
    OutfitStudioInExtendedItem = false;
    OutfitStudioExtendedItem = null;
    OutfitStudioEditingLock = false;

    // CurrentCharacter should already be null (we don't set it anymore, only temporarily in hooks)

    // DON'T call CharacterRefresh here - it causes duplicate zone drawing

    // Rebuild item grid immediately
    // The next Run() cycle will handle character refresh and zone drawing
    if (OutfitStudioSelectedGroup) {
        OutfitStudioSelectGroup(OutfitStudioSelectedGroup);
    }
}

function OutfitStudioHandleZoneClick() {
    const X = 250;
    const Y = 0;
    const Zoom = 1;

    for (const group of AssetGroup) {
        if (!group.IsItem() || !group.Zone) continue;

        // Check if clicked in this zone
        for (const zone of group.Zone) {
            if (DialogClickedInZone(OutfitStudioChar, zone, Zoom, X, Y, OutfitStudioChar.HeightRatio || 1)) {
                // Only rebuild grid if selecting a different group (prevents lag from repeated clicks)
                if (OutfitStudioSelectedGroup?.Name === group.Name) {
                    return;
                }
                OutfitStudioSelectGroup(group);
                return;
            }
        }
    }
}

function OutfitStudioSelectGroup(group) {
    OutfitStudioSelectedGroup = group;

    // Build item list
    const items = [];

    // Add "Remove" if something is equipped
    if (InventoryGet(OutfitStudioChar, group.Name)) {
        items.push({ IsRemove: true });
    }

    // Add crafted items first
    if (Player.Crafting && typeof CraftingAssets !== 'undefined') {
        for (const crafted of Player.Crafting) {
            if (!crafted || crafted.Disabled) continue;

            const craftingAssets = CraftingAssets[crafted.Item];
            if (craftingAssets && Array.isArray(craftingAssets)) {
                for (const asset of craftingAssets) {
                    if (asset.Group.Name === group.Name) {
                        const canUse = typeof DialogCanUseCraftedItem === 'function'
                            ? DialogCanUseCraftedItem(OutfitStudioChar, crafted, asset)
                            : true;

                        if (canUse) {
                            // Check prerequisites for crafted items too
                            const canWear = typeof InventoryAllow === 'function'
                                ? InventoryAllow(OutfitStudioChar, asset, asset.Prerequisite, false)
                                : true;

                            items.push({ Asset: asset, Craft: crafted, Blocked: !canWear });
                        }
                    }
                }
            }
        }
    }

    // Add regular items - check if each can be worn
    const groupAssets = Asset.filter(a =>
        a.Group.Name === group.Name &&
        InventoryAvailable(Player, a.Name, a.Group.Name)
    );

    for (const asset of groupAssets) {
        // Check prerequisites using BC's InventoryAllow function
        const canWear = typeof InventoryAllow === 'function'
            ? InventoryAllow(OutfitStudioChar, asset, asset.Prerequisite, false)
            : true;

        // Check if item is permission-blocked (different from prerequisite blocking)
        const isPermissionBlocked = typeof InventoryIsPermissionBlocked === 'function'
            ? InventoryIsPermissionBlocked(OutfitStudioChar, asset.Name, asset.Group.Name, null)
            : false;

        items.push({
            Asset: asset,
            Blocked: !canWear,
            PermissionBlocked: isPermissionBlocked
        });
    }

    // Populate DOM grid
    OutfitStudioPopulateGrid(items);
}

// Helper function to check if an item is currently worn (including Craft data comparison)
function OutfitStudioIsItemWorn(item) {
    if (!item.Asset || !OutfitStudioChar) return false;

    const equippedItem = InventoryGet(OutfitStudioChar, item.Asset.Group.Name);
    if (!equippedItem || equippedItem.Asset.Name !== item.Asset.Name) {
        return false;
    }

    // Also check if Craft data matches (if present)
    if (item.Craft || equippedItem.Craft) {
        // If one has Craft and the other doesn't, they're different
        if (!item.Craft || !equippedItem.Craft) return false;

        // Compare Craft data (simplified - just check if they're the same object or have matching properties)
        // BC's Craft data includes Name, Item, Property, etc.
        return JSON.stringify(item.Craft) === JSON.stringify(equippedItem.Craft);
    }

    return true;
}

function OutfitStudioPopulateGrid(items) {
    if (!OutfitStudioDOMGrid) return;

    // Hide grid briefly to prevent visual flash during button creation
    OutfitStudioDOMGrid.style.opacity = '0';

    // Clear grid
    OutfitStudioDOMGrid.innerHTML = '';

    // Sort items: Remove button removed from list (will be drawn at top), worn items first, then usable, then blocked
    const sortedItems = [...items].sort((a, b) => {
        // Remove button will be drawn separately at the top of the screen, not in the grid
        if (a.IsRemove) return 1; // Move to end so we can filter it out
        if (b.IsRemove) return -1;

        // Check if items are worn (must match both Asset name AND Craft data)
        const aWorn = a.Asset ? OutfitStudioIsItemWorn(a) : false;
        const bWorn = b.Asset ? OutfitStudioIsItemWorn(b) : false;

        // Worn items go to the top
        if (aWorn && !bWorn) return -1;
        if (!aWorn && bWorn) return 1;

        // Permission-blocked items go to the very bottom
        if (a.PermissionBlocked && !b.PermissionBlocked) return 1;
        if (!a.PermissionBlocked && b.PermissionBlocked) return -1;

        // Then prerequisite-blocked items (but above permission-blocked)
        if (a.Blocked && !b.Blocked) return 1;
        if (!a.Blocked && b.Blocked) return -1;

        return 0;
    });

    // Filter out the Remove button - it will be drawn separately at the top
    const removeButton = items.find(item => item.IsRemove);
    const gridItems = sortedItems.filter(item => !item.IsRemove);

    // Create buttons using BC's ElementButton system
    gridItems.forEach((item, index) => {
        if (item.Asset) {
            // Check if worn (including Craft data)
            const worn = OutfitStudioIsItemWorn(item);

            // For worn items, pass the actual equipped item to BC's button system
            // This ensures BC can render all status icons (lock, effects, etc.) automatically
            let buttonData;
            if (worn) {
                const equippedItem = InventoryGet(OutfitStudioChar, OutfitStudioSelectedGroup.Name);
                // Pass the full equipped item so BC's CreateForAsset can access Property, Color, Craft, etc.
                buttonData = equippedItem;
            } else {
                // For non-worn items, create a simple button data object
                buttonData = {
                    Asset: item.Asset,
                    Craft: item.Craft || null
                };
            }

            // For blocked items, provide a clickDisabled callback that returns the error message
            const clickDisabledCallback = (item.Blocked || item.PermissionBlocked) ? () => {
                // Permission-blocked items have a different message
                if (item.PermissionBlocked) {
                    return "Item is blocked by your item permissions";
                }
                // Get the prerequisite error message using BC's InventoryDisallow function
                if (typeof InventoryDisallow === 'function') {
                    const errorMsg = InventoryDisallow(OutfitStudioChar, item.Asset, item.Asset.Prerequisite);
                    return errorMsg || "Item cannot be worn due to compatibility issues";
                }
                return "Item cannot be worn due to compatibility issues";
            } : null;

            const classList = ['dialog-grid-button'];
            if (worn) {
                classList.push('outfit-studio-worn-item');
            }

            const button = ElementButton.CreateForAsset(
                `outfit-studio-item-${index}`,
                buttonData,
                OutfitStudioChar,
                (e) => OutfitStudioApplyItem(item),
                { clickDisabled: clickDisabledCallback },
                {
                    button: {
                        parent: OutfitStudioDOMGrid,
                        classList: classList,
                        attributes: {
                            'aria-checked': worn.toString()
                        },
                        dataAttributes: {
                            craft: item.Craft ? 'true' : undefined
                        }
                    }
                }
            );

            // Set aria-disabled attribute for blocked items (BC's system does this automatically)
            if ((item.Blocked || item.PermissionBlocked) && button) {
                button.setAttribute('aria-disabled', 'true');
            }
        }
    });

    // Show grid after a brief delay to allow button images to load and prevent visual flash
    setTimeout(() => {
        if (OutfitStudioDOMGrid) {
            OutfitStudioDOMGrid.style.opacity = '1';
        }
    }, 50);
}

function OutfitStudioApplyItem(item) {
    if (!OutfitStudioChar || !OutfitStudioSelectedGroup) return;

    if (item.IsRemove) {
        InventoryRemove(OutfitStudioChar, OutfitStudioSelectedGroup.Name);
    } else if (item.Asset) {

        if (item.Craft) {
            InventoryWear(
                OutfitStudioChar,
                item.Asset.Name,
                OutfitStudioSelectedGroup.Name,
                null,          // ItemColor
                null,          // Difficulty
                null,          // MemberNumber
                item.Craft,    // Craft
                true           // Refresh - let BC handle it properly
            );
        } else {
            InventoryWear(
                OutfitStudioChar,
                item.Asset.Name,
                OutfitStudioSelectedGroup.Name,
                null,          // ItemColor
                null,          // Difficulty
                null,          // MemberNumber
                null,          // Craft
                true           // Refresh - let BC handle it properly
            );
        }
    }

    // Calculate refresh frames based on item complexity
    // Items with multiple layers need more refresh cycles for proper canvas rendering
    let refreshFrames = 5; // Default for simple items

    if (item.Asset) {
        // Get the newly equipped item to check its layer count
        const equippedItem = InventoryGet(OutfitStudioChar, OutfitStudioSelectedGroup.Name);
        if (equippedItem && equippedItem.Asset) {
            // Check if asset has Layer property (array of layers)
            if (equippedItem.Asset.Layer && Array.isArray(equippedItem.Asset.Layer)) {
                const layerCount = equippedItem.Asset.Layer.length;
                // More layers = more refresh cycles needed
                // Use formula: 5 + (layerCount - 1) * 2 to scale with complexity
                refreshFrames = Math.max(5, 5 + (layerCount - 1) * 2);
            }
        }
    }

    // Set counter to refresh for calculated number of frames
    // This gives the multi-frame refresh cycle needed for proper canvas rendering
    // without continuous performance overhead or HeightModifier flicker
    OutfitStudioNeedsRefresh = refreshFrames;

    // Rebuild the grid to show the updated item list
    OutfitStudioSelectGroup(OutfitStudioSelectedGroup);
}

// ===== KEYBOARD =====
function BCOMOutfitStudioKeyDown(event) {
    if (event.key === "Escape") {
        BCOMOutfitStudioExit();
        return true;
    }
    return false;
}

// ===== ACTION BUTTON FUNCTIONS =====
function OutfitStudioSaveOutfit() {
    if (!OutfitStudioChar) {
        return;
    }

    // Clear tooltips before showing any dialogs
    OutfitStudioClearTooltips();

    // Check if we're in edit mode (editing an existing outfit)
    const editMode = window.BCOM_OutfitStudio_EditMode;

    if (editMode && editMode.outfitName) {
        // In edit mode - show dialog with both options
        const choice = confirm(
            `You are editing '${editMode.outfitName}'\n\n` +
            `Click OK to OVERWRITE the existing outfit\n` +
            `Click Cancel to SAVE AS NEW outfit`
        );

        if (choice) {
            // User chose to overwrite
            if (window.BCOM_OutfitManager && typeof window.BCOM_OutfitManager.SaveOutfit === 'function') {
                // SaveOutfit with a name parameter will handle the overwrite logic
                // It will automatically detect the existing outfit and overwrite it
                window.BCOM_OutfitManager.SaveOutfit(OutfitStudioChar, editMode.outfitName);

                // Clear edit mode after save
                window.BCOM_OutfitStudio_EditMode = null;
                // Also clear the checkbox state
                if (window.BCOM_ModInitializer) {
                    window.BCOM_ModInitializer.setState({ outfitToEdit: null });
                }
            } else {
                console.error('[Outfit Studio] BCOM_OutfitManager.SaveOutfit not available!');
                OutfitStudioClearTooltips();
                alert('Save functionality not available. Make sure BCOM Outfit Manager is loaded.');
            }
        } else {
            // User chose to save as new - use normal save flow
            if (window.BCOM_OutfitManager && typeof window.BCOM_OutfitManager.SaveOutfit === 'function') {
                // SaveOutfit will handle prompting for name, validation, folder management, etc.
                window.BCOM_OutfitManager.SaveOutfit(OutfitStudioChar);
                // Clear edit mode after saving as new
                window.BCOM_OutfitStudio_EditMode = null;
                // Also clear the checkbox state
                if (window.BCOM_ModInitializer) {
                    window.BCOM_ModInitializer.setState({ outfitToEdit: null });
                }
            } else {
                console.error('[Outfit Studio] BCOM_OutfitManager.SaveOutfit not available!');
                OutfitStudioClearTooltips();
                alert('Save functionality not available. Make sure BCOM Outfit Manager is loaded.');
            }
        }
    } else {
        // Not in edit mode - use normal save flow (prompts for name)
        if (window.BCOM_OutfitManager && typeof window.BCOM_OutfitManager.SaveOutfit === 'function') {
            // SaveOutfit will handle prompting for name, validation, folder management, etc.
            window.BCOM_OutfitManager.SaveOutfit(OutfitStudioChar);
        } else {
            console.error('[Outfit Studio] BCOM_OutfitManager.SaveOutfit not available!');
            OutfitStudioClearTooltips();
            alert('Save functionality not available. Make sure BCOM Outfit Manager is loaded.');
        }
    }
}

function OutfitStudioCopyBCXCode() {
    if (!OutfitStudioChar) {
        return;
    }

    // Clear tooltips before showing any dialogs
    OutfitStudioClearTooltips();

    // Use BCOM's actual BCX export function from the Outfit Manager
    if (window.BCOM_OutfitManager && typeof window.BCOM_OutfitManager.getCurrentOutfitBCXCode === 'function') {
        // Get BCX code - this returns a compressed base64 string
        const bcxCode = window.BCOM_OutfitManager.getCurrentOutfitBCXCode(OutfitStudioChar, true, false, null);

        if (bcxCode) {
            // Copy to clipboard
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(bcxCode).then(() => {
                    OutfitStudioClearTooltips();
                    alert('BCX code copied to clipboard!');
                }).catch(err => {
                    console.error('[Outfit Studio] Failed to copy to clipboard:', err);
                    // Fallback: show the code in a prompt
                    OutfitStudioClearTooltips();
                    prompt('Copy this BCX code:', bcxCode);
                });
            } else {
                // Fallback for older browsers
                OutfitStudioClearTooltips();
                prompt('Copy this BCX code:', bcxCode);
            }
        } else {
            console.error('[Outfit Studio] Failed to generate BCX code');
            OutfitStudioClearTooltips();
            alert('Failed to generate BCX code. Check console for details.');
        }
    } else {
        console.error('[Outfit Studio] BCOM_OutfitManager.getCurrentOutfitBCXCode not available!');
        OutfitStudioClearTooltips();
        alert('BCX export functionality not available. Make sure BCOM Outfit Manager is loaded.');
    }
}

function OutfitStudioImportBCXCode() {
    if (!OutfitStudioChar) {
        return;
    }

    // Clear tooltips before showing any dialogs
    OutfitStudioClearTooltips();

    // Prompt for BCX code
    const bcxCode = prompt("Paste BCX code to import:");
    if (!bcxCode || bcxCode.trim() === "") {
        return;
    }

    try {
        // Decompress the BCX code (it's LZString compressed base64)
        if (typeof LZString === 'undefined' || typeof LZString.decompressFromBase64 !== 'function') {
            console.error('[Outfit Studio] LZString not available!');
            OutfitStudioClearTooltips();
            alert('LZString library not loaded. Cannot import BCX code.');
            return;
        }

        const decompressed = LZString.decompressFromBase64(bcxCode.trim());
        if (!decompressed) {
            OutfitStudioClearTooltips();
            alert('Invalid BCX code format. Please check the code and try again.');
            return;
        }

        const outfitData = JSON.parse(decompressed);
        if (!outfitData || !Array.isArray(outfitData)) {
            OutfitStudioClearTooltips();
            alert('Invalid outfit data in BCX code.');
            return;
        }

        // Use BCOM's LoadOutfitFromData function to apply the outfit
        if (window.BCOM_OutfitManager && typeof window.BCOM_OutfitManager.LoadOutfitFromData === 'function') {
            const success = window.BCOM_OutfitManager.LoadOutfitFromData(OutfitStudioChar, outfitData);

            if (success) {
                OutfitStudioClearTooltips();
                alert(`Imported ${outfitData.length} items from BCX code!`);

                // Rebuild grid if a group is selected
                if (OutfitStudioSelectedGroup) {
                    OutfitStudioSelectGroup(OutfitStudioSelectedGroup);
                }
            } else {
                OutfitStudioClearTooltips();
                alert('Failed to import BCX code. Check console for details.');
            }
        } else {
            console.error('[Outfit Studio] BCOM_OutfitManager.LoadOutfitFromData not available!');
            OutfitStudioClearTooltips();
            alert('BCX import functionality not available. Make sure BCOM Outfit Manager is loaded.');
        }
    } catch (error) {
        console.error('[Outfit Studio] Failed to import BCX code:', error);
        OutfitStudioClearTooltips();
        alert('Failed to import BCX code. Please check the format and try again.');
    }
}

function OutfitStudioClearAll() {
    if (!OutfitStudioChar) {
        return;
    }

    // Clear tooltips before showing any dialogs
    OutfitStudioClearTooltips();

    // Confirm with user
    const confirmed = confirm('Remove all items from the outfit?\n\nThis will also clear your saved work-in-progress.');
    if (!confirmed) {
        return;
    }

    // Remove all items (keep clothing and body parts)
    const itemsToRemove = [];
    for (const item of OutfitStudioChar.Appearance) {
        if (item.Asset.Group.IsItem()) {
            itemsToRemove.push(item.Asset.Group.Name);
        }
    }

    // Remove each item
    for (const groupName of itemsToRemove) {
        InventoryRemove(OutfitStudioChar, groupName);
    }

    // Clear the work-in-progress save
    window.BCOM_OutfitStudio_WorkInProgress = null;

    // Refresh character
    CharacterRefresh(OutfitStudioChar);

    // Rebuild grid if a group is selected
    if (OutfitStudioSelectedGroup) {
        OutfitStudioSelectGroup(OutfitStudioSelectedGroup);
    }
}

function OutfitStudioShowHelp() {
    // Set flag
    OutfitStudioInHelp = true;

    // Hide action buttons
    OutfitStudioShowActionButtons(false);

    // Create full-screen overlay
    const overlay = document.createElement('div');
    overlay.id = 'outfit-studio-help-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    overlay.style.zIndex = '1000';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';

    // Create help content container
    const helpBox = document.createElement('div');
    helpBox.id = 'outfit-studio-help-box';
    helpBox.style.backgroundColor = 'white';
    helpBox.style.color = 'black';
    helpBox.style.padding = '30px';
    helpBox.style.borderRadius = '10px';
    helpBox.style.maxWidth = '800px';
    helpBox.style.maxHeight = '80vh';
    helpBox.style.overflow = 'auto';
    helpBox.style.position = 'relative';
    helpBox.style.fontFamily = 'Arial, sans-serif';
    helpBox.style.fontSize = '16px';
    helpBox.style.lineHeight = '1.6';

    // Add help content
    helpBox.innerHTML = `
        <h2 style="margin-top: 0; color: #333;">Outfit Studio Help</h2>

        <h3 style="color: #666;">Basic Usage</h3>
        <ul>
            <li>Applying items in the Outfit Studio works the same as in the base game. Click the item you want to apply and it will be applied to the selected area. Any items blocked by clothing or other items cannot be applied until the requirement is met and will be grayed out and appear at the end of the item list. This can be due to clothing or other items being worn or a pose that cannot be forced onto the character or is incompatible with another item.</li>
            <ul>
                <li>If you cannot go into a kneeling spread pose, items that force it (ie: wooden horse, sybian, etc) will not be compatible and will be grayed out.</li>
            </ul>
            <li>Base Game padlocks can be applied and edited as necessary. A worn item will show which padlock is currently applied in the item's thumbnail at the top of the item zone list. 
            <li>*Important Note*: DOGS padlocks cannot be inspected/edited in the Outfit Studio. Use them carefully. Make sure you are satisfied with how an item looks before applying these padlocks specifically.
            
        </ul>

        <h3 style="color: #666;">Vertical Buttons</h3>
        <ul>
            <li><strong>Save Outfit:</strong> Save to Outfit Manager. This will save a new outfit to the 'Main' folder at the end of the list. Use the Folder Management button in the Outfit Manager to move the outfit to a desired folder.  If you are editing an existing outfit, you will be prompted to either overwrite the saved outfit or to save it as a new one. The Toast notification will tell you which folder it was saved to.</li>
            <li><strong>Copy BCX Code:</strong> Export outfit as a BCX Code for sharing. This will copy the outfit's BCX code to your clipboard.</li>
            <li><strong>Import BCX Code:</strong> Import a BCX code to the character in the Outfit Studio. You can then edit it to your liking and either save it or copy the new BCX code to your clipboard.</li>
            <li><strong>Clear All:</strong> Remove all restraint items. Will show a prompt to confirm.</li>
        </ul>
    `;

    // Create exit button
    const exitButton = document.createElement('button');
    exitButton.className = 'button button-styling';
    exitButton.style.position = 'absolute';
    exitButton.style.top = '10px';
    exitButton.style.right = '10px';
    exitButton.style.width = '40px';
    exitButton.style.height = '40px';
    exitButton.style.padding = '0';
    exitButton.style.cursor = 'pointer';
    exitButton.style.display = 'flex';
    exitButton.style.alignItems = 'center';
    exitButton.style.justifyContent = 'center';

    const exitIcon = document.createElement('img');
    exitIcon.src = 'Icons/Exit.png';
    exitIcon.style.width = '30px';
    exitIcon.style.height = '30px';
    exitIcon.style.pointerEvents = 'none';

    exitButton.appendChild(exitIcon);
    exitButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        OutfitStudioHideHelp();
    });

    helpBox.appendChild(exitButton);

    // Add click-outside-to-close
    overlay.addEventListener('click', (e) => {
        // Only close if clicking the overlay itself, not the help box
        if (e.target === overlay) {
            OutfitStudioHideHelp();
        }
    });

    // Prevent clicks inside help box from closing
    helpBox.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    overlay.appendChild(helpBox);
    document.body.appendChild(overlay);

    // Store reference
    OutfitStudioHelpOverlay = overlay;
}

function OutfitStudioHideHelp() {

    // Remove overlay
    if (OutfitStudioHelpOverlay && OutfitStudioHelpOverlay.parentNode) {
        OutfitStudioHelpOverlay.remove();
    }

    // Reset state
    OutfitStudioInHelp = false;
    OutfitStudioHelpOverlay = null;

    // Show action buttons again (unless in extended mode or color picker)
    OutfitStudioShowActionButtons(!OutfitStudioInExtendedItem && !OutfitStudioInColorPicker);
}

function OutfitStudioOpenAppearance() {
    if (!OutfitStudioChar) {
        return;
    }

    // Hide DOM elements before switching screens
    const container = document.getElementById('outfit-studio-container');
    if (container) {
        container.style.display = 'none';
    }
    OutfitStudioHideActionButtons();

    // Set flag to allow CommonSetScreen to work
    OutfitStudioInAppearance = true;

    // Temporarily reset CharacterAppearanceForceUpCharacter to allow wardrobe characters to build properly
    // We'll restore it when we return to the Outfit Studio
    const savedForceUpCharacter = CharacterAppearanceForceUpCharacter;
    CharacterAppearanceForceUpCharacter = -1;

    // Use BC's CharacterAppearanceLoadCharacter function to open the appearance screen
    // This is BC's official way to edit a character's appearance (body features, clothing, etc.)
    if (typeof CharacterAppearanceLoadCharacter === 'function') {
        CharacterAppearanceLoadCharacter(OutfitStudioChar, (accept) => {
            // Callback is called when user clicks Accept or Cancel in the appearance screen
            // accept = true if they clicked Accept, false if they clicked Cancel

            // If they accepted changes, refresh the character to show the new appearance
            if (accept) {
                CharacterRefresh(OutfitStudioChar);
            }

            // Reset flag
            OutfitStudioInAppearance = false;

            // Restore CharacterAppearanceForceUpCharacter
            CharacterAppearanceForceUpCharacter = savedForceUpCharacter;

            // Show DOM elements again
            if (container) {
                container.style.display = 'block';
            }
            OutfitStudioShowActionButtons(true);

            // Return to Outfit Studio - use the same approach as the integration code
            // Set screen variables and functions directly without using CommonSetScreen
            CurrentScreen = "BCOMOutfitStudio";
            CurrentModule = "Room";
            CurrentScreenFunctions = {
                Load: BCOMOutfitStudioLoad,
                Run: BCOMOutfitStudioRun,
                Click: BCOMOutfitStudioClick,
                Exit: BCOMOutfitStudioExit
            };
        });
    } else {
        console.error('[Outfit Studio] CharacterAppearanceLoadCharacter function not available!');
        alert('Appearance editing is not available. Please make sure the game is fully loaded.');
        OutfitStudioInAppearance = false;

        // Restore CharacterAppearanceForceUpCharacter even on error
        CharacterAppearanceForceUpCharacter = savedForceUpCharacter;

        // Show DOM elements again
        if (container) {
            container.style.display = 'block';
        }
        OutfitStudioShowActionButtons(true);
    }
}
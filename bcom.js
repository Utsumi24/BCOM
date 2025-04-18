// ==UserScript==
// @name         BC Outfit Manager
// @namespace https://www.bondageprojects.com/
// @version      0.7.5.1
// @description  Outfit management system for Bondage Club
// @author       Utsumi
// @match https://bondageprojects.elementfx.com/*
// @match https://www.bondageprojects.elementfx.com/*
// @match https://bondage-europe.com/*
// @match https://www.bondage-europe.com/*
// @match http://localhost:*/*
// @grant        none
// @run-at document-end
// ==/UserScript==

var bcModSdk=function(){"use strict";const o="1.2.0";function e(o){alert("Mod ERROR:\n"+o);const e=new Error(o);throw console.error(e),e}const t=new TextEncoder;function n(o){return!!o&&"object"==typeof o&&!Array.isArray(o)}function r(o){const e=new Set;return o.filter((o=>!e.has(o)&&e.add(o)))}const i=new Map,a=new Set;function c(o){a.has(o)||(a.add(o),console.warn(o))}function s(o){const e=[],t=new Map,n=new Set;for(const r of f.values()){const i=r.patching.get(o.name);if(i){e.push(...i.hooks);for(const[e,a]of i.patches.entries())t.has(e)&&t.get(e)!==a&&c(`ModSDK: Mod '${r.name}' is patching function ${o.name} with same pattern that is already applied by different mod, but with different pattern:\nPattern:\n${e}\nPatch1:\n${t.get(e)||""}\nPatch2:\n${a}`),t.set(e,a),n.add(r.name)}}e.sort(((o,e)=>e.priority-o.priority));const r=function(o,e){if(0===e.size)return o;let t=o.toString().replaceAll("\r\n","\n");for(const[n,r]of e.entries())t.includes(n)||c(`ModSDK: Patching ${o.name}: Patch ${n} not applied`),t=t.replaceAll(n,r);return(0,eval)(`(${t})`)}(o.original,t);let i=function(e){var t,i;const a=null===(i=(t=m.errorReporterHooks).hookChainExit)||void 0===i?void 0:i.call(t,o.name,n),c=r.apply(this,e);return null==a||a(),c};for(let t=e.length-1;t>=0;t--){const n=e[t],r=i;i=function(e){var t,i;const a=null===(i=(t=m.errorReporterHooks).hookEnter)||void 0===i?void 0:i.call(t,o.name,n.mod),c=n.hook.apply(this,[e,o=>{if(1!==arguments.length||!Array.isArray(e))throw new Error(`Mod ${n.mod} failed to call next hook: Expected args to be array, got ${typeof o}`);return r.call(this,o)}]);return null==a||a(),c}}return{hooks:e,patches:t,patchesSources:n,enter:i,final:r}}function l(o,e=!1){let r=i.get(o);if(r)e&&(r.precomputed=s(r));else{let e=window;const a=o.split(".");for(let t=0;t<a.length-1;t++)if(e=e[a[t]],!n(e))throw new Error(`ModSDK: Function ${o} to be patched not found; ${a.slice(0,t+1).join(".")} is not object`);const c=e[a[a.length-1]];if("function"!=typeof c)throw new Error(`ModSDK: Function ${o} to be patched not found`);const l=function(o){let e=-1;for(const n of t.encode(o)){let o=255&(e^n);for(let e=0;e<8;e++)o=1&o?-306674912^o>>>1:o>>>1;e=e>>>8^o}return((-1^e)>>>0).toString(16).padStart(8,"0").toUpperCase()}(c.toString().replaceAll("\r\n","\n")),d={name:o,original:c,originalHash:l};r=Object.assign(Object.assign({},d),{precomputed:s(d),router:()=>{},context:e,contextProperty:a[a.length-1]}),r.router=function(o){return function(...e){return o.precomputed.enter.apply(this,[e])}}(r),i.set(o,r),e[r.contextProperty]=r.router}return r}function d(){for(const o of i.values())o.precomputed=s(o)}function p(){const o=new Map;for(const[e,t]of i)o.set(e,{name:e,original:t.original,originalHash:t.originalHash,sdkEntrypoint:t.router,currentEntrypoint:t.context[t.contextProperty],hookedByMods:r(t.precomputed.hooks.map((o=>o.mod))),patchedByMods:Array.from(t.precomputed.patchesSources)});return o}const f=new Map;function u(o){f.get(o.name)!==o&&e(`Failed to unload mod '${o.name}': Not registered`),f.delete(o.name),o.loaded=!1,d()}function g(o,t){o&&"object"==typeof o||e("Failed to register mod: Expected info object, got "+typeof o),"string"==typeof o.name&&o.name||e("Failed to register mod: Expected name to be non-empty string, got "+typeof o.name);let r=`'${o.name}'`;"string"==typeof o.fullName&&o.fullName||e(`Failed to register mod ${r}: Expected fullName to be non-empty string, got ${typeof o.fullName}`),r=`'${o.fullName} (${o.name})'`,"string"!=typeof o.version&&e(`Failed to register mod ${r}: Expected version to be string, got ${typeof o.version}`),o.repository||(o.repository=void 0),void 0!==o.repository&&"string"!=typeof o.repository&&e(`Failed to register mod ${r}: Expected repository to be undefined or string, got ${typeof o.version}`),null==t&&(t={}),t&&"object"==typeof t||e(`Failed to register mod ${r}: Expected options to be undefined or object, got ${typeof t}`);const i=!0===t.allowReplace,a=f.get(o.name);a&&(a.allowReplace&&i||e(`Refusing to load mod ${r}: it is already loaded and doesn't allow being replaced.\nWas the mod loaded multiple times?`),u(a));const c=o=>{let e=g.patching.get(o.name);return e||(e={hooks:[],patches:new Map},g.patching.set(o.name,e)),e},s=(o,t)=>(...n)=>{var i,a;const c=null===(a=(i=m.errorReporterHooks).apiEndpointEnter)||void 0===a?void 0:a.call(i,o,g.name);g.loaded||e(`Mod ${r} attempted to call SDK function after being unloaded`);const s=t(...n);return null==c||c(),s},p={unload:s("unload",(()=>u(g))),hookFunction:s("hookFunction",((o,t,n)=>{"string"==typeof o&&o||e(`Mod ${r} failed to patch a function: Expected function name string, got ${typeof o}`);const i=l(o),a=c(i);"number"!=typeof t&&e(`Mod ${r} failed to hook function '${o}': Expected priority number, got ${typeof t}`),"function"!=typeof n&&e(`Mod ${r} failed to hook function '${o}': Expected hook function, got ${typeof n}`);const s={mod:g.name,priority:t,hook:n};return a.hooks.push(s),d(),()=>{const o=a.hooks.indexOf(s);o>=0&&(a.hooks.splice(o,1),d())}})),patchFunction:s("patchFunction",((o,t)=>{"string"==typeof o&&o||e(`Mod ${r} failed to patch a function: Expected function name string, got ${typeof o}`);const i=l(o),a=c(i);n(t)||e(`Mod ${r} failed to patch function '${o}': Expected patches object, got ${typeof t}`);for(const[n,i]of Object.entries(t))"string"==typeof i?a.patches.set(n,i):null===i?a.patches.delete(n):e(`Mod ${r} failed to patch function '${o}': Invalid format of patch '${n}'`);d()})),removePatches:s("removePatches",(o=>{"string"==typeof o&&o||e(`Mod ${r} failed to patch a function: Expected function name string, got ${typeof o}`);const t=l(o);c(t).patches.clear(),d()})),callOriginal:s("callOriginal",((o,t,n)=>{"string"==typeof o&&o||e(`Mod ${r} failed to call a function: Expected function name string, got ${typeof o}`);const i=l(o);return Array.isArray(t)||e(`Mod ${r} failed to call a function: Expected args array, got ${typeof t}`),i.original.apply(null!=n?n:globalThis,t)})),getOriginalHash:s("getOriginalHash",(o=>{"string"==typeof o&&o||e(`Mod ${r} failed to get hash: Expected function name string, got ${typeof o}`);return l(o).originalHash}))},g={name:o.name,fullName:o.fullName,version:o.version,repository:o.repository,allowReplace:i,api:p,loaded:!0,patching:new Map};return f.set(o.name,g),Object.freeze(p)}function h(){const o=[];for(const e of f.values())o.push({name:e.name,fullName:e.fullName,version:e.version,repository:e.repository});return o}let m;const y=void 0===window.bcModSdk?window.bcModSdk=function(){const e={version:o,apiVersion:1,registerMod:g,getModsInfo:h,getPatchingInfo:p,errorReporterHooks:Object.seal({apiEndpointEnter:null,hookEnter:null,hookChainExit:null})};return m=e,Object.freeze(e)}():(n(window.bcModSdk)||e("Failed to init Mod SDK: Name already in use"),1!==window.bcModSdk.apiVersion&&e(`Failed to init Mod SDK: Different version already loaded ('1.2.0' vs '${window.bcModSdk.version}')`),window.bcModSdk.version!==o&&alert(`Mod SDK warning: Loading different but compatible versions ('1.2.0' vs '${window.bcModSdk.version}')\nOne of mods you are using is using an old version of SDK. It will work for now but please inform author to update`),window.bcModSdk);return"undefined"!=typeof exports&&(Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=y),y}();

const VERSION_NUMBER = "0.7.5.1";

/*
# BC Outfit Manager Changelog

## v0.7.5.1
- Recreated the Outfit Manager button to use DOM elements so it can be clicked on over other DOM elements
- Properly hide and restore the Pose and Expressions Menu when the Outfit Manager is opened or closed
- Fixed dialog restoration when exiting the Outfit Manager due to DOM element integration

## v0.7.5
- Added a checkbox to apply hairstyles when wearing an outfit
- Saving outfits now saves the hairstyle as well
- Added help text regarding the apply hair checkbox
- Made the Outfit Manager's title to only use the player's nickname instead of the CurrentCharacter's name to avoid confusion
- Fixed outfit position preservation when overwriting outfits
- Enhanced export mode to update BCX codes in real-time when hair preference changes

## v0.7.4.1
- Fixed issue with sorting outfits.  Outfit sorting works as intended again.

## v0.7.4
- Added a better check for the /bcom command when a name is specified, it exclusively checks for the character's nickname
- Added a check for the /bcom command if more than one character has the same first name, it will notify the user to use the member number instead
- Fixed exit button not working if there is no previous dialog mode to return to, it now defaults to the 'dialog'
- Added permission check to prevent the outfit manager from being opened if the player doesn't have permission to interact with the character that was clicked on
- Added permission check for the /bcom command

## v0.7.3
- Cosplay items are not removed when previewing or applying an outfit

## v0.7.2
- Fixed issue with duplicate outfit names across different folders
- Added check to prevent moving outfits when name conflicts exist in the destination folder
- Added check to prevent saving an outfit when the name already exists in another folder
- Fixed notification when importing outfits to show the actual number of outfits imported instead of the total number of outfits
- Added chat command "bcom" to open the outfit manager for a specific character, if a name is provided, or for yourself if no name is provided

## v0.7.1
- Ensured that all modes are reset when exiting Outfit Manager

## v0.7.0
- Added folder system for organizing outfits
-- Allows the user to create, rename, and delete folders
-- Allows the user to move outfits between folders
-- Added a breadcrumb-style back button to navigate through folders

## v0.6.1
- Added backup and restore buttons to outfit manager
- Removed debug coordinates

## v0.6.0
- Added support for exporting outfits
- Added separate help text for sort mode and export mode
- Checked if body cosplay is blocked before applying cosplay items from outfits

## v0.5.3
- Added outfit limit of 80 outfits
- Prevented exiting the outfit manager when the display character is clicked on

## v0.5.2
- Added notification when you try to apply an outfit while in sort mode
- Amended help text to let player know they can't apply an outfit when in sort mode

## v0.5.1
- Changed how display character's name is displayed to display the CurrentCharacter's nickname so it will show (Preview) more reliably
- Made display character visible when blind while in outfit manager
- Made room background visible when blind while in outfit manager

## v0.5.0
- Removed legacy UTF16 compression support
- Standardized outfit storage to exclusively use BCX format
- Changed how outfits are saved to use a single storage key per member number
- Added outfit sorting functionality with up/down controls
- Cleaned up and optimized codebase
- Improved error handling for BCX outfit validation

## v0.4.1
- Fixed console warning by properly implementing "outfits" dialog mode
- Improved dialog mode transitions to/from outfit manager
- Added proper cleanup when switching dialog modes

## v0.4.0
- Added support for importing BCX outfits
- Improved data storage format using Base64 compression
- Added backwards compatibility for legacy outfit formats
- Fixed preview display issues with imported outfits
- Added robust error handling and validation for BCX outfit imports
- Added error codes (E1-E4) for better debugging of import issues
- Improved outfit rename functionality with better error handling
- Added validation to prevent empty outfit names
- Added confirmation dialog for overwriting existing outfits
- Added support for both Base64 and UTF16 decompression when loading outfits
- Added user feedback notifications for outfit actions
- Added version text to bottom right corner of game window

## v0.3.1
- Fixed issue where character poses weren't updating correctly in outfit preview
- Removed unnecessary Y-position offset adjustments that were causing display issues for poses
- Added "(Preview)" suffix to display character's name
- Improved display of locked items that cannot be replaced by outfit changes by using the
  help text instead of the button's hover text

## v0.3.0
- Added outfit preview functionality when hovering over outfits
- Added help text section showing outfit information and locked items
- Improved outfit menu layout and organization
- Added pagination for outfits (8 outfits per page)

## v0.2.1
- Fixed issue where outfit menu would not properly return to previous dialog mode
- Added support for both 'items' and 'dialog' mode when accessing outfit manager
- Improved button positioning consistency across different dialog modes
- Fixed back button location to match game's standard positioning depending on dialog mode

## v0.2.0
- Added rename functionality for outfits
- Added delete functionality for outfits
- Added confirmation dialogs for overwriting and deleting outfits
- Added notification system for outfit actions
- Improved error handling and user feedback

## v0.1.0
- Initial release
- Basic outfit saving and loading functionality
- Added outfit manager button to character dialog
- Basic outfit menu interface
*/


let modInitialized = false;

function initMod() {
    if (modInitialized) return;

    try {
        if (!window.bcModSdk?.registerMod) {
            console.error('OutfitManager: Mod SDK not available');
            return;
        }

        const modApi = bcModSdk.registerMod(
            {
                name: "BC Outfit Manager (BCOM)",
                fullName: "BC Outfit Manager (BCOM)",
                version: VERSION_NUMBER,
                repository: "https://github.com/Utsumi24/BCOM",
            },
            {
                allowReplace: true
            }
        );

        // Hook the LoginResponse function
        modApi.hookFunction("LoginResponse", 0, (args, next) => {
            const [response] = args;

            if (response?.Name && !modInitialized) {
                modInitialized = true;
                console.info("OutfitManager: Initializing after successful login");
                
                // Clean up any corrupted data in storage
                cleanupStorageData();
            }
            return next(args);
        });

        // Add this function to clean up any corrupted data in storage
        function cleanupStorageData() {
            try {
                const memberNumber = Player.MemberNumber;
                const storageKey = `${STORAGE_PREFIX}${memberNumber}`;
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
                            console.info(`OutfitManager: Cleaned up ${originalLength - outfitStorage.folders.length} invalid folder entries`);
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
                        console.info("OutfitManager: Storage data cleaned up successfully");
                    }
                }
            } catch (error) {
                console.error("OutfitManager: Error cleaning up storage data", error);
            }
        }

        const OUTFIT_PRIORITIES = {
            UI_INIT: 6,          // Higher than most UI mods
            DATA_HANDLING: 5,     // Standard priority
            OBSERVE: 0
        };

        // Initialize appearance data before any UI hooks
        modApi.hookFunction("CharacterAppearanceBuildCanvas", OUTFIT_PRIORITIES.UI_INIT, (args, next) => {
            const [C] = args;
            if (!C.Appearance) C.Appearance = {};
            if (!C.Appearance.Item) C.Appearance.Item = [];
            if (!C.Appearance.Outfits) C.Appearance.Outfits = [];
            return next(args);
        });

        // Define button dimensions and spacing
        const BUTTON_SIZE = 60;
        const BUTTON_GAP = 5;
        const EXISTING_BUTTON_X = 70;
        const OUTFIT_BUTTON_X = EXISTING_BUTTON_X - BUTTON_SIZE - BUTTON_GAP;

        // Maximum number of outfits allowed
        const MAX_OUTFITS = 80;

        // Tracks which dialog mode to return to when exiting outfit manager
        let PreviousDialogMode = "items";

        // Controls whether outfit sorting mode is active (disables outfit application while true)
        let isSortMode = false;

        // Controls whether to apply hair when wearing outfits
        let applyHairWithOutfit = false;

        const STORAGE_PREFIX = "OutfitManager_"; // Prefix for storing outfits
        const OUTFITS_PER_PAGE = 8;  // Number of outfits to display per page
        let DialogOutfitPage = 0; // Current page of outfits being displayed

        // Add this with other state variables
        let isExportMode = false;
        
        // Folder system variables
        let currentFolder = "Default"; // Current active folder
        let isFolderManagementMode = false; // Whether folder management mode is active
        let selectedOutfits = []; // Array to track selected outfits in folder management mode
        let allowMultipleSelect = false; // Toggle for multi-select mode

        // Update drawing code
        modApi.hookFunction("DialogDraw", 0, (args, next) => {
            if ((DialogMenuMode === "items" || DialogMenuMode === "dialog") && !document.getElementById("OutfitManagerButton")) {
                // Check if we have permission to modify the character's outfit
                const hasPermission = CurrentCharacter.MemberNumber === Player.MemberNumber || CurrentCharacter.AllowItem;
                
                // Find dialog panel or create one if it doesn't exist yet
                let dialogElement = document.getElementById("dialog-button-container");
                if (!dialogElement) {
                    // Find main dialog element 
                    dialogElement = document.getElementById("dialog") || document.body;
                }
                
                // Create a proper DOM button for the outfit manager using the game's own button system
                const buttonX = 5; // Position to the left of speech bubble
                const buttonY = 905; // Standard position at bottom
                
                // Use the game's native button creation function
                const buttonContainer = ElementButton.Create(
                    "OutfitManagerButton", 
                    function() {
                        if (hasPermission) {
                            // Store current mode before switching
                            PreviousDialogMode = DialogMenuMode; 
                            
                            // Switch to outfits mode
                            DialogChangeMode("outfits");
                            DialogMenuButton = [];
                            
                            // Clean up button when entering outfit mode
                            const button = document.getElementById("OutfitManagerButton");
                            if (button) {
                                window.removeEventListener("resize", updatePositionFunction);
                                button.remove();
                            }
                        } else {
                            ShowOutfitNotification("You don't have permission to interact with this player");
                        }
                    },
                    {
                        image: "Icons/Dress.png",
                        labelPosition: "bottom",
                        tooltipPosition: "right",
                        tooltip: hasPermission ? "Outfit Manager" : "You don't have permission to interact with this player",
                    }
                );
                
                // Add hover effects to match the game's standard button behavior
                buttonContainer.addEventListener("mouseenter", () => {
                    buttonContainer.style.backgroundColor = hasPermission ? "cyan" : "pink";
                });
                
                buttonContainer.addEventListener("mouseleave", () => {
                    buttonContainer.style.backgroundColor = hasPermission ? "white" : "pink";
                });
                
                // Set initial background color based on permission
                buttonContainer.style.backgroundColor = hasPermission ? "white" : "pink";
                
                // Position the button using ElementPositionFixed
                ElementPositionFixed(buttonContainer, buttonX, buttonY, BUTTON_SIZE, BUTTON_SIZE);
                
                // Set a high z-index to ensure button is always on top of other dialog elements
                buttonContainer.style.zIndex = "2000";
                buttonContainer.style.position = "absolute";
                
                // Create a single function reference for position updates
                const updatePositionFunction = () => {
                    ElementPositionFixed(buttonContainer, buttonX, buttonY, BUTTON_SIZE, BUTTON_SIZE);
                    // Ensure z-index is maintained after repositioning
                    buttonContainer.style.zIndex = "2000";
                };
                
                // Add resize listener
                window.addEventListener("resize", updatePositionFunction);
                
                // Save the original remove method to ensure we clean up event listeners
                const originalRemove = buttonContainer.remove;
                buttonContainer.remove = function() {
                    window.removeEventListener("resize", updatePositionFunction);
                    originalRemove.apply(this);
                };
                
                // Add to DOM
                dialogElement.appendChild(buttonContainer);
                
                // Use ElementPositionFixed after adding to DOM
                ElementPositionFixed(buttonContainer, buttonX, buttonY, BUTTON_SIZE, BUTTON_SIZE);
             }

             if (DialogMenuMode === "outfits") {
                 // Create a style element to handle DOM dialog elements only
                 let hideDialogStyle = document.getElementById("outfit-manager-style");
                 if (!hideDialogStyle) {
                     hideDialogStyle = document.createElement("style");
                     hideDialogStyle.id = "outfit-manager-style";
                     document.head.appendChild(hideDialogStyle);
                 }
                 
                 // Add CSS rules to hide DOM-based dialogs only
                 hideDialogStyle.textContent = `
                     /* Hide dialog DOM elements except our own */
                     #dialog-expression, 
                     #dialog-inventory, 
                     .dialog-character-container, 
                     .dialog-character, 
                     .dialog-character-zone,
                     .character-label,
                     #dialog-crafting-container,
                     #dialog-permission,
                     #dialog-locking,
                     #dialog-activities,
                     #dialog-saved-expressions,
                     #dialog-pose,
                     #dialog-pose-status,
                     #dialog-pose-menubar,
                     #dialog-pose-button-grid,
                     #dialog-expression-preset,
                     #dialog-expression-preset-status,
                     #dialog-expression-preset-menubar,
                     #dialog-expression-preset-button-grid {
                         display: none !important;
                         visibility: hidden !important;
                         opacity: 0 !important;
                         pointer-events: none !important;
                     }
                     
                     /* Ensure the outfit button isn't blocked by expression menus */
                     #dialog-expression-preset-button-grid,
                     .dialog-expression-preset-slot,
                     #dialog-expression-preset {
                         pointer-events: none !important;
                         z-index: 1 !important;
                     }
                     
                     /* Ensure our outfit menu is on top */
                     #dialog-outfit-manager {
                         z-index: 1000 !important;
                     }
                     
                     /* Ensure our Outfit Manager button is always clickable */
                     #OutfitManagerButton {
                         z-index: 2000 !important;
                         pointer-events: auto !important;
                     }
                 `;
                 
                 // Also hide specific elements by ID
                 const hiddenElementIds = [
                     "dialog-expression", "dialog-expression-status", "dialog-expression-menubar", 
                     "dialog-expression-menu-left", "dialog-expression-button-grid",
                     "dialog-inventory", "dialog-inventory-status", "dialog-inventory-grid", 
                     "dialog-inventory-icon", "dialog-inventory-paginate",
                     "dialog-pose", "dialog-pose-status", "dialog-pose-menubar", "dialog-pose-button-grid",
                     "dialog-expression-preset", "dialog-expression-preset-status", 
                     "dialog-expression-preset-menubar", "dialog-expression-preset-button-grid"
                 ];
                 
                 hiddenElementIds.forEach(id => {
                     const element = document.getElementById(id);
                     if (element) element.style.display = "none";
                 });
                 
                 DrawOutfitMenu();
                 return;
             } else {
                 // Remove the style element if not in outfit mode
                 const hideDialogStyle = document.getElementById("outfit-manager-style");
                 if (hideDialogStyle) {
                     hideDialogStyle.remove();
                 }
             }

             return next(args);
          });

        // Update click handling
        modApi.hookFunction("DialogClick", 0, (args, next) => {
            if (DialogMenuMode === "outfits") {
                if (MouseIn(0, 0, 1000, 1000)) {
                    return;
                }
                
                const outfits = getSortedOutfits();
                const totalPages = Math.ceil(outfits.length / OUTFITS_PER_PAGE);
                const currentPage = DialogOutfitPage || 0;
                const startIndex = currentPage * OUTFITS_PER_PAGE;
                const endIndex = Math.min(startIndex + OUTFITS_PER_PAGE, outfits.length);
        
                // Pagination buttons
                if (totalPages > 1) {
                    const paginationY = 930;
        
                    // Previous page button
                    if (currentPage > 0 && MouseIn(1200, paginationY, 100, 60)) {
                        DialogOutfitPage = currentPage - 1;
                        return;
                    }
                    // Next page button
                    if (currentPage < totalPages - 1 && MouseIn(1600, paginationY, 100, 60)) {
                        DialogOutfitPage = currentPage + 1;
                        return;
                    }
                }
        
                // Sort button click
                if (outfits.length >= 2 && MouseIn(1130, 110, 90, 60)) {
                    isSortMode = !isSortMode;
                    if (isSortMode) {
                        isExportMode = false;  // Turn off export mode when entering sort mode
                        isFolderManagementMode = false; // Turn off folder management mode when entering sort mode
                        selectedOutfits = []; // Clear selected outfits
                        const importElement = document.getElementById("OutfitManagerImport");
                        if (importElement) importElement.value = "";  // Clear import field when exiting export mode
                    }
                    return;
                }
        
                // Export mode toggle button
                if (MouseIn(1680, 110, 90, 60)) {
                    isExportMode = !isExportMode;
                    if (isExportMode) {
                        isSortMode = false;  // Turn off sort mode when entering export mode
                        isFolderManagementMode = false; // Turn off folder management mode when entering export mode
                        selectedOutfits = []; // Clear selected outfits
                    }
                    if (!isExportMode) {
                        const importElement = document.getElementById("OutfitManagerImport");
                        if (importElement) importElement.value = "";
                    }
                    return;
                }
        
                // Import/Export button
                if (MouseIn(1720, 13, 80, 36)) {
                    if (isExportMode) {
                        const importElement = document.getElementById("OutfitManagerImport");
                        if (importElement && importElement.value) {
                            navigator.clipboard.writeText(importElement.value)
                                .then(() => ShowOutfitNotification("Current outfit code copied to clipboard"))
                                .catch(() => ShowOutfitNotification("Failed to copy outfit code"));
                        }
                    } else {
                        ImportBCXOutfit();
                    }
                    return;
                }
        
                // Backup button
                if (MouseIn(1885, 115, 90, 90)) {
                    backupOutfits();
                    return;
                }
        
                // Restore button
                if (MouseIn(1885, 215, 90, 90)) {
                    restoreOutfits();
                    return;
                }
        
                // Hair checkbox
                if (MouseIn(1810, 367, 30, 30)) {
                    applyHairWithOutfit = !applyHairWithOutfit;
                    
                    // If in export mode, update the export code to reflect the hair preference
                    if (isExportMode) {
                        const importElement = document.getElementById("OutfitManagerImport");
                        if (importElement) {
                            // Regenerate the outfit code with the current hair preference
                            importElement.value = getCurrentOutfitBCXCode(CurrentCharacter, applyHairWithOutfit);
                        }
                    }
                    return;
                }
        
                // Exit button with matching coordinates
                if (MouseIn(1885, 15, 90, 90)) {
                    console.log("Exit button clicked in Outfit Manager");
                    
                    // Reset all outfit manager modes before calling DialogMenuBack
                    isSortMode = false;
                    isExportMode = false;
                    isFolderManagementMode = false;
                    selectedOutfits = [];
                    
                    // Remove the style element that hides dialog elements
                    const styleElement = document.getElementById("outfit-manager-style");
                    if (styleElement) {
                        styleElement.remove();
                        //console.log("Exit button: Removed style element that was hiding dialog elements");
                    }
                    
                    // Make sure all other outfit manager DOM elements are also removed
                    const outfitManager = document.getElementById("dialog-outfit-manager");
                    if (outfitManager) {
                        outfitManager.remove();
                        //console.log("Exit button: Removed outfit manager dialog container");
                    }
                    
                    // Restore visibility to all specifically hidden elements
                    const hiddenElementIds = [
                        "dialog-expression", "dialog-expression-status", "dialog-expression-menubar", 
                        "dialog-expression-menu-left", "dialog-expression-button-grid",
                        "dialog-inventory", "dialog-inventory-status", "dialog-inventory-grid", 
                        "dialog-inventory-icon", "dialog-inventory-paginate",
                        "dialog-pose", "dialog-pose-status", "dialog-pose-menubar", "dialog-pose-button-grid",
                        "dialog-expression-preset", "dialog-expression-preset-status", 
                        "dialog-expression-preset-menubar", "dialog-expression-preset-button-grid"
                    ];
                    
                    hiddenElementIds.forEach(id => {
                        const element = document.getElementById(id);
                        if (element) {
                            element.style.display = "";
                            element.style.visibility = "";
                            element.style.opacity = "";
                            element.style.pointerEvents = "";
                        }
                    });
                    
                    // Make sure PreviousDialogMode isn't blank
                    if (!PreviousDialogMode || PreviousDialogMode === "") {
                        PreviousDialogMode = "dialog";
                    }
                    
                    // Set target mode to the previous dialog mode
                    DialogMenuMode = PreviousDialogMode;
                    
                    // Force clean change to previous dialog mode
                    if (typeof DialogChangeMode === "function") {
                        DialogChangeMode(PreviousDialogMode, true);
                        //console.log(`Exit button: Forced DialogChangeMode to ${PreviousDialogMode}`);
                    }
                    
                    // Remove the import field last to ensure a clean exit
                    const importElement = document.getElementById("OutfitManagerImport");
                    if (importElement) {
                        importElement.remove();
                        //console.log("Exit button: Removed import field");
                    }
                    
                    // Check for any additional containers that might exist
                    ["OutfitManagerImportContainer", "OutfitExportField", "ImportExportContainer"].forEach(id => {
                        const element = document.getElementById(id);
                        if (element) {
                            element.remove();
                           //console.log(`Exit button: Removed additional container ${id}`);
                        }
                    });
                    
                    return;
                }
        
                // Save button
                if (MouseIn(1250, 110, 400, 60)) {
                    SaveOutfit(CurrentCharacter);
                    return;
                }
                
                // Folder management button
                if (MouseIn(1250, 180, 400, 60)) {
                    isFolderManagementMode = !isFolderManagementMode;
                    if (isFolderManagementMode) {
                        // Turn off other modes when entering folder management
                        isSortMode = false;
                        isExportMode = false;
                        selectedOutfits = []; // Clear selected outfits
                        allowMultipleSelect = false; // Reset multi-select mode
                        const importElement = document.getElementById("OutfitManagerImport");
                        if (importElement) importElement.value = "";
                    } else {
                        // Clear selections when exiting folder management
                        selectedOutfits = [];
                    }
                    return;
                }
                
                // Add Folder button (only in folder management mode)
                if (isFolderManagementMode && MouseIn(1130, 180, 90, 60)) {
                    // Only allow creating folders when in the Main folder
                    if (currentFolder !== "Main") {
                        ShowOutfitNotification("Folders can only be created in the Main folder");
                        return;
                    }
                    
                    // Add new folder functionality
                    let folderName = prompt("Enter new folder name:");
                    if (folderName && folderName.trim()) {
                        folderName = folderName.trim();
                        
                        // Get storage
                        const memberNumber = Player.MemberNumber;
                        const storageKey = `${STORAGE_PREFIX}${memberNumber}`;
                        const storageData = localStorage.getItem(storageKey);
                        const outfitStorage = storageData ? 
                            JSON.parse(storageData) : 
                            { outfits: [], folders: ["Main"] };
                        
                        // Check if folder already exists
                        if (!outfitStorage.folders.includes(folderName)) {
                            // Add new folder to the beginning (after Main)
                            const mainIndex = outfitStorage.folders.indexOf("Main");
                            if (mainIndex === 0) {
                                outfitStorage.folders.splice(1, 0, folderName);
                            } else {
                                outfitStorage.folders.unshift(folderName);
                            }
                            
                            // Save back to storage
                            localStorage.setItem(storageKey, JSON.stringify(outfitStorage));
                            
                            // Switch to the new folder
                            currentFolder = folderName;
                            DialogOutfitPage = 0;
                            
                            ShowOutfitNotification(`Folder "${folderName}" created`);
                        } else {
                            ShowOutfitNotification(`Folder "${folderName}" already exists`);
                        }
                    }
                    return;
                }
                
                // Edit Folder button (only in folder management mode)
                if (isFolderManagementMode && MouseIn(1680, 180, 90, 60) && selectedOutfits.length > 0) {
                    // Move selected outfits to the current folder
                    const memberNumber = Player.MemberNumber;
                    const storageKey = `${STORAGE_PREFIX}${memberNumber}`;
                    const storageData = localStorage.getItem(storageKey);
                    if (!storageData) return;
                    
                    const outfitStorage = JSON.parse(storageData);
                    
                    // Check for outfits that would cause naming conflicts
                    const outfitsToMove = [];
                    const outfitsAlreadyInFolder = [];
                    const conflictingOutfits = [];
                    
                    // Get all outfit names in the destination folder (excluding selected outfits)
                    const existingNamesInFolder = new Set();
                    outfitStorage.outfits.forEach(o => {
                        if (o.folder === currentFolder && !selectedOutfits.includes(o.name)) {
                            existingNamesInFolder.add(o.name);
                        }
                    });
                    
                    for (const outfitName of selectedOutfits) {
                        const outfitIndex = outfitStorage.outfits.findIndex(o => o.name === outfitName);
                        if (outfitIndex >= 0) {
                            const outfit = outfitStorage.outfits[outfitIndex];
                            const outfitFolder = outfit.folder || "Main";
                            
                            if (outfitFolder === currentFolder) {
                                outfitsAlreadyInFolder.push(outfitName);
                            } else if (existingNamesInFolder.has(outfitName)) {
                                // Name conflict with existing outfit in destination folder
                                conflictingOutfits.push(outfitName);
                            } else {
                                outfitsToMove.push({name: outfitName, index: outfitIndex});
                            }
                        }
                    }
                    
                    // Handle conflicts first - most important message
                    if (conflictingOutfits.length > 0) {
                        ShowOutfitNotification(`Cannot move: ${conflictingOutfits.length} outfit(s) have name conflicts in "${currentFolder}"`);
                        return;
                    }
                    
                    // If some outfits are already in this folder, show a warning
                    if (outfitsAlreadyInFolder.length > 0) {
                        ShowOutfitNotification(`${outfitsAlreadyInFolder.length} outfit(s) already in this folder`);
                    }
                    
                    // If there are outfits to move, move them
                    if (outfitsToMove.length > 0) {
                        // Move outfits to the current folder
                        for (const {name, index} of outfitsToMove) {
                            outfitStorage.outfits[index].folder = currentFolder;
                        }
                        
                        // Save back to storage
                        localStorage.setItem(storageKey, JSON.stringify(outfitStorage));
                        
                        // Clear selection
                        selectedOutfits = [];
                        
                        ShowOutfitNotification(`Moved ${outfitsToMove.length} outfit(s) to "${currentFolder}"`);
                    } else if (outfitsAlreadyInFolder.length === 0 && conflictingOutfits.length === 0) {
                        ShowOutfitNotification("No outfits selected to move");
                    }
                    return;
                }
        
                // Check outfit clicks for current page
                for (let i = startIndex; i < endIndex; i++) {
                    const outfit = outfits[i];
                    const yPos = 290 + ((i - startIndex) * 80);
        
                    // Special handling for folder entries
                    if (outfit.isFolder) {
                        if (isFolderManagementMode && !outfit.isBackButton) {
                            // Rename folder button
                            if (MouseIn(1150, yPos + 5, 50, 50)) {
                                if (outfit.name === "Main") {
                                    ShowOutfitNotification("Main folder cannot be renamed");
                                    return;
                                }
                                
                                // Get storage
                                const memberNumber = Player.MemberNumber;
                                const storageKey = `${STORAGE_PREFIX}${memberNumber}`;
                                const storageData = localStorage.getItem(storageKey);
                                if (!storageData) return;
                                
                                const outfitStorage = JSON.parse(storageData);
                                const folders = outfitStorage.folders || ["Main"];
                                
                                // Prompt for new folder name
                                let newName = prompt(`Enter new name for folder "${outfit.name}":`);
                                if (newName && newName.trim()) {
                                    newName = newName.trim();
                                    
                                    // Check if folder name already exists
                                    if (folders.includes(newName)) {
                                        ShowOutfitNotification(`Folder "${newName}" already exists`);
                                        return;
                                    }
                                    
                                    // Update folder name
                                    const folderIndex = folders.indexOf(outfit.name);
                                    if (folderIndex >= 0) {
                                        folders[folderIndex] = newName;
                                        
                                        // Update folder reference in all outfits
                                        outfitStorage.outfits.forEach(o => {
                                            if (o.folder === outfit.name) {
                                                o.folder = newName;
                                            }
                                        });
                                        
                                        // Save back to storage
                                        outfitStorage.folders = folders;
                                        localStorage.setItem(storageKey, JSON.stringify(outfitStorage));
                                        
                                        // Update current folder if we're renaming the current folder
                                        if (currentFolder === outfit.name) {
                                            currentFolder = newName;
                                        }
                                        
                                        ShowOutfitNotification(`Folder "${outfit.name}" renamed to "${newName}"`);
                                    }
                                }
                                return;
                            }
                            
                            // Delete folder button
                            if (outfit.name !== "Main" && MouseIn(1710, yPos + 5, 50, 50)) {
                                // Get storage
                                const memberNumber = Player.MemberNumber;
                                const storageKey = `${STORAGE_PREFIX}${memberNumber}`;
                                const storageData = localStorage.getItem(storageKey);
                                if (!storageData) return;
                                
                                const outfitStorage = JSON.parse(storageData);
                                
                                // Check if folder has outfits
                                const outfitsInFolder = outfitStorage.outfits.filter(o => o.folder === outfit.name);
                                
                                if (outfitsInFolder.length > 0) {
                                    ShowOutfitNotification(`Cannot delete folder "${outfit.name}" - it contains ${outfitsInFolder.length} outfit(s)`);
                                    return;
                                }
                                
                                // Confirm deletion
                                if (confirm(`Are you sure you want to delete the empty folder "${outfit.name}"?`)) {
                                    // Remove folder from storage
                                    outfitStorage.folders = outfitStorage.folders.filter(f => f !== outfit.name);
                                    localStorage.setItem(storageKey, JSON.stringify(outfitStorage));
                                    
                                    ShowOutfitNotification(`Folder "${outfit.name}" has been deleted`);
                                }
                                return;
                            }
                            
                            // Navigate when clicking on a folder, not select it
                            if (MouseIn(1210, yPos, 490, 60)) {
                                // Navigate into the selected folder
                                currentFolder = outfit.name;
                                DialogOutfitPage = 0; // Reset to first page when changing folders
                                return;
                            }
                        } else {
                            // Handle clicking on a folder - navigate into the folder
                            if (MouseIn(1210, yPos, 490, 60)) {
                                if (outfit.isBackButton) {
                                    // Back to Main button - return to the main folder
                                    currentFolder = "Main";
                                } else {
                                    // Navigate into the selected folder
                                    currentFolder = outfit.name;
                                }
                                DialogOutfitPage = 0; // Reset to first page when changing folders
                                return;
                            }
                        }
                        continue;
                    }
                    
                    if (isFolderManagementMode) {
                        // Checkbox click
                        if (MouseIn(1150, yPos + 5, 50, 50)) {
                            const outfitName = outfit.name;
                            const outfitIndex = selectedOutfits.indexOf(outfitName);
                            
                            if (outfitIndex >= 0) {
                                // Remove from selection
                                selectedOutfits.splice(outfitIndex, 1);
                            } else {
                                // Add to selection
                                selectedOutfits.push(outfitName);
                            }
                            return;
                        }
                        
                        // Outfit button - select/deselect in folder management mode
                        if (MouseIn(1210, yPos, 490, 60)) {
                            const outfitName = outfit.name;
                            const outfitIndex = selectedOutfits.indexOf(outfitName);
                            
                            if (outfitIndex >= 0) {
                                // Remove from selection
                                selectedOutfits.splice(outfitIndex, 1);
                            } else {
                                // Add to selection
                                selectedOutfits.push(outfitName);
                            }
                            return;
                        }
                    } else if (isSortMode) {
                        // Up arrow click
                        if (i > 0 && !outfits[i-1].isFolder && MouseIn(1150, yPos + 5, 50, 50)) {
                            [outfits[i], outfits[i-1]] = [outfits[i-1], outfits[i]];
                            saveOutfits(outfits);
                            return;
                        }
                        
                        // Down arrow click
                        if (i < outfits.length - 1 && !outfits[i+1].isFolder && MouseIn(1710, yPos + 5, 50, 50)) {
                            [outfits[i], outfits[i+1]] = [outfits[i+1], outfits[i]];
                            saveOutfits(outfits);
                            return;
                        }
        
                        // Disable outfit clicking in sort mode
                        if (MouseIn(1210, yPos, 490, 60)) {
                            ShowOutfitNotification(`You cannot apply outfits in sort mode`);
                            return;
                        }
                    } else if (isExportMode) {
                        // Outfit button - prevent wearing in export mode
                        if (MouseIn(1210, yPos, 490, 60)) {
                            ShowOutfitNotification("You cannot apply outfits in export mode");
                            return;
                        }
        
                        // Export button (replaces delete button)
                        if (MouseIn(1710, yPos + 5, 50, 50)) {
                            const outfitData = outfit.data;
                            if (outfitData) {
                                navigator.clipboard.writeText(outfitData)
                                    .then(() => ShowOutfitNotification(`Outfit "${outfit.name}" code copied to clipboard`))
                                    .catch(() => ShowOutfitNotification("Failed to copy outfit code"));
                            }
                            return;
                        }
                    } else {
                        // Rename button
                        if (MouseIn(1150, yPos + 5, 50, 50)) {
                            let newName;
                            do {
                                newName = prompt(`Enter new name for outfit "${outfit.name}":`);
                                if (newName === null) return; // User clicked Cancel
                            } while (!newName?.trim()); // Keep prompting if empty or only whitespace
        
                            try {
                                // Get storage
                                const memberNumber = Player.MemberNumber;
                                const storageKey = `${STORAGE_PREFIX}${memberNumber}`;
                                const storageData = localStorage.getItem(storageKey);
                                if (!storageData) {
                                    console.error('Rename failed: No storage found');
                                    return;
                                }
        
                                const outfitStorage = JSON.parse(storageData);
                                const outfitIndex = outfitStorage.outfits.findIndex(o => o.name === outfit.name);
                                if (outfitIndex === -1) {
                                    console.error('Rename failed: Could not find outfit');
                                    return;
                                }
        
                                // Check if new name already exists
                                if (outfitStorage.outfits.some(o => o.name === newName)) {
                                    if (!confirm(`Outfit "${newName}" already exists. Do you want to overwrite it?`)) {
                                        return;
                                    }
                                    // Remove existing outfit with same name
                                    const existingIndex = outfitStorage.outfits.findIndex(o => o.name === newName);
                                    outfitStorage.outfits.splice(existingIndex, 1);
                                }
        
                                // Update the name
                                outfitStorage.outfits[outfitIndex].name = newName;
        
                                // Save back to storage
                                localStorage.setItem(storageKey, JSON.stringify(outfitStorage));
                                ShowOutfitNotification(`Outfit renamed to "${newName}"`);
        
                            } catch (error) {
                                console.error('Rename failed:', error);
                            }
                            return;
                        }
        
                        // Outfit button
                        if (MouseIn(1210, yPos, 490, 60)) {
                            if (LoadOutfit(CurrentCharacter, outfit.name)) {
                                ShowOutfitNotification(`Outfit "${outfit.name}" has been applied`);
                                DialogLeave();
                            }
                            return;
                        }
        
                        // Delete button
                        if (MouseIn(1710, yPos + 5, 50, 50)) {
                            if (confirm(`Are you sure you want to delete outfit "${outfit.name}"?`)) {
                                // Get storage
                                const memberNumber = Player.MemberNumber;
                                const storageKey = `${STORAGE_PREFIX}${memberNumber}`;
                                const storageData = localStorage.getItem(storageKey);
                                if (storageData) {
                                    const outfitStorage = JSON.parse(storageData);
                                    // Remove the outfit by name AND folder
                                    outfitStorage.outfits = outfitStorage.outfits.filter(o => 
                                        !(o.name === outfit.name && (o.folder || "Main") === currentFolder)
                                    );
                                    // Save back to storage
                                    localStorage.setItem(storageKey, JSON.stringify(outfitStorage));
                                }
                                
                                ShowOutfitNotification(`Outfit "${outfit.name}" has been deleted`);
        
                                // Check if we need to move back a page
                                const remainingOutfits = outfits.length - 1;
                                const newTotalPages = Math.ceil(remainingOutfits / OUTFITS_PER_PAGE);
                                if (DialogOutfitPage > 0 && DialogOutfitPage >= newTotalPages) {
                                    DialogOutfitPage = DialogOutfitPage - 1;
                                }
                                return;
                            }
                        }
                    }
                }
            }
        
            if (DialogMenuMode === "items" || DialogMenuMode === "dialog") {
                if (MouseIn(OUTFIT_BUTTON_X, 905, BUTTON_SIZE, BUTTON_SIZE)) {
                    // Check if this is the player's character or if we have permission
                    if (CurrentCharacter.MemberNumber === Player.MemberNumber || CurrentCharacter.AllowItem) {
                        PreviousDialogMode = DialogMenuMode;
                        DialogChangeMode("outfits");
                        DialogMenuButton = [];
                    } else {
                        ShowOutfitNotification("You don't have permission to interact with this player");
                    }
                    return true;
                }
            }
        
            return next(args);
        });

        modApi.hookFunction("DialogChangeMode", 4, (args, next) => {
            const [mode, reset] = args;
            
            if (mode === "outfits") {
                // Store the mode we're coming from
                PreviousDialogMode = DialogMenuMode;
                console.log("Storing previous mode:", DialogMenuMode);
                
                // Handle the mode change ourselves
                DialogMenuMapping[DialogMenuMode]?.Unload();
                DialogMenuMode = mode;
                
                // Clear existing menus/inventories
                DialogInventory = [];
                DialogMenuButton = [];
                
                // Call DialogResize as the original function would
                DialogResize(true);
                
                return;
            } else if (DialogMenuMode === "outfits") {
                // Clean up the import field when leaving outfit manager
                const importElement = document.getElementById("OutfitManagerImport");
                if (importElement) {
                    importElement.remove();
                }
                
                // Make sure DOM elements are visible again
                setTimeout(() => {
                    // Restore any DOM elements that might have been hidden
                    const selectors = [
                        "#dialog-expression", "#dialog-inventory", 
                        ".dialog-character-container", ".dialog-character", 
                        ".dialog-character-zone", ".character-label"
                    ];
                    
                    selectors.forEach(selector => {
                        const elements = document.querySelectorAll(selector);
                        elements.forEach(element => {
                            if (element) {
                                element.style.display = "";
                                element.style.visibility = "";
                                element.style.opacity = "";
                            }
                        });
                    });
                }, 100);
            }
            
            return next(args);
        });

        // Add this function to handle BCX imports
        function ImportBCXOutfit() {
            try {
                const importElement = document.getElementById("OutfitManagerImport");
                if (!importElement || !importElement.value) {
                    alert("Please enter a BCX outfit code");
                    if (importElement) importElement.value = "";
                    return;
                }

                // Initial validation of the input string
                const importString = importElement.value.trim();
                if (!importString) {
                    alert("Bad Import Data (E1)");
                    console.error("Import error E1: Empty input");
                    importElement.value = "";
                    return;
                }

                // Decompress and parse BCX data
                const decompressedData = LZString.decompressFromBase64(importString);
                if (!decompressedData) {
                    alert("Bad Import Data (E2)");
                    console.error("Import error E2: Failed to decompress");
                    importElement.value = "";
                    return;
                }

                // Initial validation of BCX format
                if (!decompressedData.startsWith('[')) {
                    alert("Bad Import Data (E3)");
                    console.error("Import error E3: Not a BCX outfit code");
                    importElement.value = "";
                    return;
                }

                // Parse and validate the data structure
                const outfitData = JSON.parse(decompressedData);
                if (!Array.isArray(outfitData) || !outfitData.every(item => item.Name && item.Group)) {
                    alert("Bad Import Data (E4)");
                    console.error("Import error E4: Invalid BCX format");
                    importElement.value = "";
                    return;
                }

                // Get outfit name
                let outfitName;
                do {
                    outfitName = prompt("Enter name for imported outfit:");
                    if (outfitName === null) { // User clicked Cancel
                        importElement.value = "";
                        return;
                    }
                } while (!outfitName.trim()); // Keep prompting if empty or only whitespace

                const memberNumber = Player.MemberNumber;
                const storageKey = `${STORAGE_PREFIX}${memberNumber}`;

                // Get or initialize storage
                const storageData = localStorage.getItem(storageKey);
                const outfitStorage = storageData ? 
                    JSON.parse(storageData) : 
                    { outfits: [] };

                    // Check outfit limit
                if (outfitStorage.outfits.length >= MAX_OUTFITS) {
                    alert("Maximum outfit limit reached. Please delete some outfits first.");
                    return;
                }

                outfitStorage.outfits.push({
                    name: outfitName,
                    data: importString  // Store the original BCX compressed data directly
                });

                // Save back to storage
                localStorage.setItem(storageKey, JSON.stringify(outfitStorage));
                
                importElement.value = "";
                ShowOutfitNotification(`Outfit "${outfitName}" has been imported`);

            } catch (error) {
                console.error("Import error:", error);
                alert("Bad Import Data");
                importElement.value = "";
            }
        }

        // Define these outside the DrawOutfitMenu function
        const DEFAULT_HELP_TEXT = [
            "Outfit Manager Help:",
            "",
            "• Up to 80 outfits can be saved",
            "• Left click an outfit to wear it",
            "• Use the rename button (✎) to rename an outfit",
            "• Use the delete button (🗑️) to remove an outfit",
            "• The save button stores current appearance as",
            "  a new outfit",
            "• Saving with an existing name will prompt",
            "  you to overwrite the outfit",
            "• Use the import button to import an outfit",
            "  from BCX codes",
            "• Toggle the 'Apply Hair' checkbox to include",
            "  hairstyles when applying an outfit"
        ];

        const SORT_MODE_HELP_TEXT = [
            "Sort Mode Help:",
            "",
            "• Use the up (↑) and down (↓) arrows to",
            "  rearrange your outfits",
            "• Outfits cannot be worn while in sort mode",
            "• Click 'Done' to exit sort mode",
            "",
            "Note: Outfit order is saved automatically",
            "when using the arrow buttons"
        ];

        const EXPORT_MODE_HELP_TEXT = [
            "Export Mode Help:",
            "",
            "• Click the clipboard (📋) button to copy",
            "  an outfit's BCX code to your clipboard",
            "• The text field above shows the code for",
            "  your current outfit",
            "• Click 'Export' to copy your current",
            "  outfit's code to your clipboard",
            "• Outfits cannot be worn while in export mode",
            "• The outfit code will change when the",
            "  'Apply Hair' checkbox is checked/unchecked",
            "• Click 'Done' to exit export mode"
        ];

        const FOLDER_MANAGEMENT_HELP_TEXT = [
            "Folder Management Help:",
            "",
            "• Click 'Add' to create a new folder",
            "• Click folders to navigate; use ✎ to rename",
            "  and 🗑️ to delete empty folders",
            "• Select outfits with checkboxes or by clicking",
            "  on them",
            "• Selections persist across folders; use 'Move'",
            "  to transfer to current folder",
            "• 'Move' button appears only when outfits",
            "  are selected",
            "",
            "Click 'Exit Folder Management' when finished"
        ];

        // Modify DrawOutfitMenu to include import functionality
        function DrawOutfitMenu() {
            // Create/update import text field
            const importId = "OutfitManagerImport";
            let importElement = document.getElementById(importId);
            
            if (!importElement) {
                importElement = document.createElement("input");
                importElement.id = importId;
                importElement.type = "text";
                importElement.placeholder = "BCX Outfit Code";
                importElement.style.cssText = "font-size: 12px !important; line-height: 12px;";
                document.body.appendChild(importElement);
            }

            // If in export mode, fill with current outfit and disable editing
            if (isExportMode) {
                const currentOutfitCode = getCurrentOutfitBCXCode(CurrentCharacter, applyHairWithOutfit);
                importElement.value = currentOutfitCode;
                importElement.readOnly = true;
            } else {
                importElement.readOnly = false;
            }

            // Background and title - extend to top of page
            DrawRect(1100, 0, 700, 1000, "#ffffffdd");
            DrawText(`${CharacterNickname(Player)}'s Outfit Manager`, 1450, 80, "Black", "White");

            // Position the import/export field and button AFTER drawing background
            ElementPosition(importId, 1407, 30, 615, 36);

            // Draw Import/Export button based on mode
            DrawButton(1720, 13, 80, 36, isExportMode ? "Export" : "Import", "White");

            // Back button matching dialog.js coordinates
            DrawButton(1885, 15, 90, 90, "", "White", "Icons/Exit.png", "");
            //DrawImageResize("Icons/Exit.png", 1900, 30, 45, 45);  // Smaller size to match standard dialogs. Keep for reference.
            
            // Draw sort button if 2+ outfits exist
            const outfits = getSortedOutfits();
            if (outfits.length >= 2) {
                DrawButton(1130, 110, 90, 60, isSortMode ? "Done" : "Sort", "Blue");
                // Add Export button opposite of Sort
                DrawButton(1680, 110, 90, 60, isExportMode ? "Done" : "Export", "Purple");
            }

            // Save button - centered in the box
            DrawButton(1250, 110, 400, 60, "Save New Outfit", "Green");

            // Draw backup and restore buttons using existing game icons
            DrawButton(1885, 115, 90, 90, "", "White", "Icons/Save.png", "Backup all outfits to a file");
            DrawButton(1885, 215, 90, 90, "", "White", "Icons/Upload.png", "Import outfits from backup file");

            // Hair checkbox - positioned outside the main window
            DrawText("Apply Hair?", 1900, 345, "White", "Black");
            DrawButton(1810, 367, 30, 30, "", "White");
            if (applyHairWithOutfit) {
                DrawImageResize("Icons/Checked.png", 1815, 372, 20, 20);
            }
            
            // Add folder management row with side buttons
            const memberNumber = Player.MemberNumber;
            const storageKey = `${STORAGE_PREFIX}${memberNumber}`;
            const storageData = localStorage.getItem(storageKey);
            let canPrev = false;
            let canNext = false;
            
            if (storageData && !isFolderManagementMode) {
                const outfitStorage = JSON.parse(storageData);
                const folders = outfitStorage.folders || ["Main"];
                const currentIndex = folders.indexOf(currentFolder);
                canPrev = currentIndex > 0;
                canNext = currentIndex < folders.length - 1;
            }
            
            // Draw the buttons in the folder management row
            if (isFolderManagementMode) {
                // In folder management mode, show Add button and Move button (when outfits are selected)
                // Only show Add button when in the Main folder
                if (currentFolder === "Main") {
                    DrawButton(1130, 180, 90, 60, "Add", "Yellow");
                }
                
                // Only show the Move button when outfits are selected
                if (selectedOutfits.length > 0) {
                    DrawButton(1680, 180, 90, 60, "Move", "Yellow");
                }
            }
            
            // Draw the center button with different text based on mode
            const centerButtonText = isFolderManagementMode ? 
                "Exit Folder Management" : 
                "Manage Folders";
            // Keep button color consistent - Orange for folder management mode, Plum for normal mode
            DrawButton(1250, 180, 400, 60, centerButtonText, "Orange");
            
            // Define constants
            const OUTFITS_PER_PAGE = 8;
            let isHoveringAnyOutfit = false;
            let yOffset = 0;  // Reset the offset

            // Initialize help text early to prevent reference errors
            let helpText = DEFAULT_HELP_TEXT;
            if (isSortMode) {
                helpText = SORT_MODE_HELP_TEXT;
            } else if (isExportMode) {
                helpText = EXPORT_MODE_HELP_TEXT;
            } else if (isFolderManagementMode) {
                helpText = FOLDER_MANAGEMENT_HELP_TEXT;
            }

            // Add folder selection display at the top of the outfit list - but only if not in folder management mode
            if (!isFolderManagementMode) {
                const memberNumber = Player.MemberNumber;
                const storageKey = `${STORAGE_PREFIX}${memberNumber}`;
                const storageData = localStorage.getItem(storageKey);
                
                if (storageData) {
                    // Draw the folder selection header - increase height from 30 to 35 pixels
                    DrawRect(1175, 250, 550, 35, "#333333");
                    // Make truncation more aggressive to prevent overflow
                    const displayFolderName = truncateFolderName(currentFolder, 15);
                    // Adjust text position for the taller box
                    DrawText("Current Folder: " + displayFolderName, 1450, 270, "White", "center");
                }
            } else {
                // In folder management mode, draw a different header - increase height from 30 to 35 pixels
                DrawRect(1175, 250, 550, 35, "#333333");
                // Make truncation more aggressive to prevent overflow
                const displayFolderName = truncateFolderName(currentFolder, 15);
                // Adjust text position for the taller box
                DrawText(`Managing Folder: ${displayFolderName}`, 1450, 270, "White", "center");
            }

            // Draw folder management interface when in folder management mode
            // -- Code has been moved to the end of the function to ensure proper z-index --

            // Create a display-only copy of the character
            const displayChar = {
                ...CurrentCharacter,
                IsPlayer: () => false,
                ID: -1,
                MustDraw: true,
                HasPose: () => false,
                IsPosed: () => false,
                GetPose: () => [],
                AllowedPose: [],
                RegisterHook: () => {},
                UnregisterHook: () => {},
                Appearance: CurrentCharacter.Appearance.map(item => ({...item})),
                Pose: CurrentCharacter.Pose ? [...CurrentCharacter.Pose] : [],
                Name: ""  // Clear the name
            };

            // Clear interactive properties
            displayChar.FocusGroup = null;
            displayChar.Dialog = null;
            displayChar.InteractionTarget = null;

            const totalPages = Math.ceil(outfits.length / OUTFITS_PER_PAGE);
            const currentPage = DialogOutfitPage || 0;
            const startIndex = currentPage * OUTFITS_PER_PAGE;
            const endIndex = Math.min(startIndex + OUTFITS_PER_PAGE, outfits.length);

            // Draw outfits for current page
            for (let i = startIndex; i < endIndex; i++) {
                const outfit = outfits[i];
                // Add defensive checks
                if (!outfit) {
                    console.error("Missing outfit at index", i);
                    continue;
                }

                const yPos = 290 + ((i - startIndex) * 80);
                
                // Get the number of folder entries in the list for correct numbering
                const folderEntries = outfits.filter(o => o.isFolder);
                
                // Special handling for folder entries
                if (outfit.isFolder) {
                    // In folder management mode, folders need rename and delete buttons
                    if (isFolderManagementMode && !outfit.isBackButton) {
                        // Draw folder button
                        DrawButton(1210, yPos, 490, 60, outfit.displayName, "White");
                        
                        // Rename button for folders
                        DrawButton(1150, yPos + 5, 50, 50, "✎", "White", "", "Rename folder");
                        
                        // Delete button for folders (only if folder name isn't "Main")
                        if (outfit.name !== "Main") {
                            DrawButton(1710, yPos + 5, 50, 50, "🗑️", "White", "", "Delete folder if empty");
                        }
                    } else {
                        // For normal mode or back button in folder management mode
                        DrawButton(1210, yPos, 490, 60, outfit.displayName, "White");
                    }
                    continue;
                }

                // Check if hovering over this outfit button
                if (MouseIn(1210, yPos, 490, 60)) {
                    isHoveringAnyOutfit = true;

                    try {
                        // Only check for locked items in default mode
                        if (!isSortMode && !isExportMode && !isFolderManagementMode) {
                            const decompressed = LZString.decompressFromBase64(outfit.data);
                            if (!decompressed) {
                                throw new Error("Failed to decompress outfit data");
                            }

                            const outfitData = JSON.parse(decompressed);
                            if (!outfitData) {
                                throw new Error("No valid outfit data found");
                            }

                            // Show locked items in help text
                            const lockedGroups = CurrentCharacter.Appearance
                                .filter(item => InventoryItemHasEffect(item, "Lock"))
                                .filter(item => outfitData.some(outfitItem => outfitItem.Group === item.Asset.Group.Name))
                                .map(item => item.Asset.Group.Description || item.Asset.Group.Name.replace("Item", ""));

                            if (lockedGroups.length > 0) {
                                const hoverHelpText = [
                                    "Items that won't be changed:",
                                    ""
                                ];
                                lockedGroups.forEach(group => {
                                    hoverHelpText.push(`• ${group} (Locked)`);
                                });
                                helpText = hoverHelpText;
                            }
                        }

                        // Use LoadOutfit to apply the outfit to our display character
                        LoadOutfit(displayChar, outfit.name);
                        CharacterLoadCanvas(displayChar);

                    } catch (error) {
                        console.error("Failed to load outfit data:", error);
                    }
                }

                if (isFolderManagementMode) {
                    // In folder management mode, show checkboxes for outfit selection
                    const isSelected = selectedOutfits.includes(outfit.name);
                    DrawButton(1150, yPos + 5, 50, 50, "", "White");
                    // Only draw the checkmark if the outfit is selected
                    if (isSelected) {
                        DrawImageResize("Icons/Checked.png", 1155, yPos + 10, 40, 40);
                    }
                    
                    // Calculate outfit number (exclude folders from numbering)
                    const outfitNumber = i + 1 - folderEntries.length;
                    DrawButton(1210, yPos, 490, 60, `${outfitNumber}. ${outfit.name}`, "White");
                } else if (isSortMode) {
                    // In sort mode, show up/down arrows instead of rename/delete
                    if (i > 0 && !outfits[i-1].isFolder) { // Not first outfit and previous item is not a folder
                        DrawButton(1150, yPos + 5, 50, 50, "↑", "White", "");
                    }
                    if (i < outfits.length - 1 && !outfits[i+1].isFolder) { // Not last outfit and next item is not a folder
                        DrawButton(1710, yPos + 5, 50, 50, "↓", "White", "");
                    }
                    
                    // Calculate outfit number (exclude folders from numbering)
                    const outfitNumber = i + 1 - folderEntries.length;
                    DrawButton(1210, yPos, 490, 60, `${outfitNumber}. ${outfit.name}`, "White");
                } else {
                    if (isExportMode) {
                        // Calculate outfit number (exclude folders from numbering)
                        const outfitNumber = i + 1 - folderEntries.length;
                        DrawButton(1210, yPos, 490, 60, `${outfitNumber}. ${outfit.name}`, "White");
                        // Export button instead of delete
                        DrawButton(1710, yPos + 5, 50, 50, "📋", "White", "", "Copy outfit code");
                    } else {
                        // Normal mode - rename/delete buttons
                        DrawButton(1150, yPos + 5, 50, 50, "✎", "White", "", "Rename outfit");
                        
                        // Calculate outfit number (exclude folders from numbering)
                        const outfitNumber = i + 1 - folderEntries.length;
                        DrawButton(1210, yPos, 490, 60, `${outfitNumber}. ${outfit.name}`, "White");
                        DrawButton(1710, yPos + 5, 50, 50, "🗑️", "White", "", "Delete outfit");
                    }
                }
            }

            // If not hovering any outfit, restore help text and original appearance
            if (!isHoveringAnyOutfit) {
                displayChar.Appearance = CurrentCharacter.Appearance.map(item => ({...item}));  // Deep copy
                displayChar.Pose = CurrentCharacter.Pose ? [...CurrentCharacter.Pose] : [];  // Copy current poses
                CharacterLoadCanvas(displayChar);
            }

            // Draw the character
            DrawCharacter(displayChar, 500, yOffset, 1);

            // Draw the name manually below the character
            MainCanvas.font = CommonGetFont(30);
            DrawText(`${CharacterNickname(CurrentCharacter)} (Preview)`, 500 + 255, yOffset + 980, 
                (CommonIsColor(CurrentCharacter.LabelColor)) ? CurrentCharacter.LabelColor : "White", 
                "Black"
            );
            MainCanvas.font = CommonGetFont(36);

            // Draw help text
            const originalFont = MainCanvas.font;
            MainCanvas.textAlign = "left";
            MainCanvas.font = "24px " + originalFont.split("px ")[1];
            helpText.forEach((text, i) => {
                DrawText(text, 25, 200 + (i * 25), "White", "Black");
            });
            MainCanvas.textAlign = "center";
            MainCanvas.font = originalFont;

            // Pagination buttons - centered in the box
            if (totalPages > 1) {
                const paginationY = 930;
                
                // Previous page button
                if (currentPage > 0) {
                    DrawButton(1200, paginationY, 100, 60, "<", "White");
                }
                
                // Clear the area for page indicator to prevent text overlap
                DrawRect(1310, paginationY, 280, 60, "#ffffffdd");
                // Page indicator
                DrawText(`Page ${currentPage + 1}/${totalPages}`, 1450, paginationY + 30, "Black", "center");
                
                // Next page button
                if (currentPage < totalPages - 1) {
                    DrawButton(1600, paginationY, 100, 60, ">", "White");
                }
            }

            // Draw version text
            MainCanvas.font = "12px Arial";
            MainCanvas.textAlign = "right";
            DrawText(`v${VERSION_NUMBER}`, 1957, 980, "White", "Black");
            MainCanvas.font = originalFont;
            MainCanvas.textAlign = "center";
        }

        function getSortedOutfits() {
            const memberNumber = Player.MemberNumber;
            const storageKey = `${STORAGE_PREFIX}${memberNumber}`;
            
            try {
                // Get or initialize member's outfit storage
                const storageData = localStorage.getItem(storageKey);
                const outfitStorage = storageData ? 
                    JSON.parse(storageData) :  
                    { outfits: [], folders: ["Main"] };
                
                // Initialize folders array if it doesn't exist
                if (!outfitStorage.folders) {
                    outfitStorage.folders = ["Main"];
                    localStorage.setItem(storageKey, JSON.stringify(outfitStorage));
                }
                
                // Update "Default" folder to "Main" if needed
                if (outfitStorage.folders.includes("Default")) {
                    const defaultIndex = outfitStorage.folders.indexOf("Default");
                    outfitStorage.folders[defaultIndex] = "Main";
                    
                    // Update outfits in the Default folder
                    outfitStorage.outfits.forEach(outfit => {
                        if (outfit.folder === "Default" || !outfit.folder) {
                            outfit.folder = "Main";
                        }
                    });
                    
                    localStorage.setItem(storageKey, JSON.stringify(outfitStorage));
                }
                
                // Update currentFolder if it's "Default"
                if (currentFolder === "Default") {
                    currentFolder = "Main";
                }
                
                // In folder management mode, show folders and outfits differently based on context
                if (isFolderManagementMode) {
                    // If we're in the Main folder, show all other folders for management
                    if (currentFolder === "Main") {
                        // Get all folders (excluding Main)
                        const folderEntries = outfitStorage.folders
                            .filter(folder => folder !== "Main")
                            .map(folder => ({
                                isFolder: true,
                                name: folder,
                                displayName: `📁 ${folder}`
                            }))
                            .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
                        
                        // Get outfits in the Main folder
                        const outfits = outfitStorage.outfits.filter(outfit => 
                            outfit.folder === "Main" || !outfit.folder
                        );
                        
                        // Return folders first, then outfits
                        return [...folderEntries, ...outfits];
                    } else {
                        // When in a subfolder in management mode, only show outfits in that folder
                        // and add a special back button
                        const backToMainEntry = {
                            isFolder: true,
                            isBackButton: true,
                            name: "Main",
                            displayName: `⬆️ Return to Main Folder`
                        };
                        
                        // Get outfits in the current folder
                        const outfits = outfitStorage.outfits.filter(outfit => 
                            outfit.folder === currentFolder
                        );
                        
                        // Return back button first, then outfits
                        return [backToMainEntry, ...outfits];
                    }
                }
                
                // In normal mode, return appropriate items based on current folder
                if (currentFolder !== "Main") {
                    // When in a subfolder, add a special "Back to Main" entry
                    const backToMainEntry = {
                        isFolder: true,
                        isBackButton: true,
                        name: "Main",
                        displayName: `⬆️ Return to Main Folder`
                    };
                    
                    // Get outfits in the current folder
                    const outfits = outfitStorage.outfits.filter(outfit => 
                        outfit.folder === currentFolder
                    );
                    
                    // Return back button first, then outfits
                    return [backToMainEntry, ...outfits];
                } else {
                    // In main folder, show all subfolders
                    const folderEntries = outfitStorage.folders
                        .filter(folder => folder !== "Main")
                        .map(folder => ({
                            isFolder: true,
                            name: folder,
                            displayName: `📁 ${folder}`
                        }))
                        .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
                    
                    // Get outfits in the main folder
                    const outfits = outfitStorage.outfits.filter(outfit => 
                        outfit.folder === "Main" || !outfit.folder
                    );
                    
                    // Return folders first, then outfits
                    return [...folderEntries, ...outfits];
                }
            } catch (error) {
                console.error('Failed to get outfits:', error);
                return [];
            }
        }

        function SaveOutfit(C, name = null) {
            const outfitName = name || prompt("Enter outfit name:");
            if (!outfitName?.trim()) return;

            try {
                const memberNumber = Player.MemberNumber;
                const storageKey = `${STORAGE_PREFIX}${memberNumber}`;
                
                // Get or initialize storage
                const storageData = localStorage.getItem(storageKey);
                const outfitStorage = storageData ? 
                    JSON.parse(storageData) : 
                    { outfits: [], folders: ["Main"] };

                // Initialize folders array if it doesn't exist
                if (!outfitStorage.folders) {
                    outfitStorage.folders = ["Main"];
                }

                // Check outfit limit (80 outfits maximum)
                if (outfitStorage.outfits.length >= MAX_OUTFITS && !outfitStorage.outfits.some(o => o.name === outfitName)) {
                    ShowOutfitNotification("Maximum outfit limit (80) reached. Please delete some outfits first.");
                    return;
                }

                // First check for outfit with same name in ANY folder
                const sameNameOutfits = outfitStorage.outfits.filter(o => o.name === outfitName);
                
                if (sameNameOutfits.length > 0) {
                    // Check if it exists in current folder
                    const existingInCurrentFolder = sameNameOutfits.find(o => 
                        (o.folder === currentFolder) || (!o.folder && currentFolder === "Main"));
                    
                    if (existingInCurrentFolder) {
                        // Outfit exists in current folder - ask to overwrite
                        if (!confirm(`Outfit "${outfitName}" already exists in folder "${currentFolder}". Do you want to overwrite it?`)) {
                            return;
                        }
                        
                        // Find the existing outfit index (we'll use it later)
                        const existingIndex = outfitStorage.outfits.findIndex(o => 
                            o.name === outfitName && 
                            ((o.folder === currentFolder) || (!o.folder && currentFolder === "Main")));
                            
                        // We'll use this index to overwrite the outfit in place
                        var overwriteIndex = existingIndex;
                    } else {
                        // Outfit exists in different folder(s) - prevent saving with same name
                        const otherFolders = sameNameOutfits.map(o => o.folder || "Main").join(", ");
                        alert(`An outfit named "${outfitName}" already exists in folder(s): ${otherFolders}.\nPlease choose a different name.`);
                        return;
                    }
                } else {
                    ShowOutfitNotification(`Outfit "${outfitName}" has been saved to folder "${currentFolder}"`);
                    // New outfit will be pushed to the array (no overwriteIndex)
                    var overwriteIndex = -1;
                }

                // Convert appearance to BCX format outfit data
                const outfitData = C.Appearance
                    .filter(item => {
                        const group = item?.Asset?.Group;
                        return group && (
                            group.Clothing || 
                            group.Name.includes("Item") || 
                            group.Name.includes("BodyMarkings") ||
                            group.Name === "HairFront" || 
                            group.Name === "HairBack"
                        );
                    })
                    .map(item => ({
                        Name: item.Asset.Name,
                        Group: item.Asset.Group.Name,
                        Color: Array.isArray(item.Color) ? [...item.Color] : 
                               (typeof item.Color === "string" && item.Color !== "" && 
                                item.Color.toLowerCase() !== "default") ? item.Color : undefined,
                        Property: item.Property ? {...item.Property} : undefined,
                        Craft: item.Craft ? {...item.Craft} : undefined
                    }));

                if (outfitData.length === 0) {
                    alert("No valid items to save");
                    return;
                }

                // Create the outfit object
                const newOutfit = {
                    name: outfitName,
                    folder: currentFolder,
                    data: LZString.compressToBase64(JSON.stringify(outfitData))
                };
                
                // If overwriting, replace at same index; otherwise add to end
                if (overwriteIndex >= 0) {
                    outfitStorage.outfits[overwriteIndex] = newOutfit;                    
                    ShowOutfitNotification(`Outfit "${outfitName}" has been overwritten`);
                } else {
                    // Add the outfit with the current folder
                    outfitStorage.outfits.push(newOutfit);
                    ShowOutfitNotification(`Outfit "${outfitName}" has been saved to folder "${currentFolder}"`);
                }

                // Save the outfitStorage object uncompressed
                localStorage.setItem(storageKey, JSON.stringify(outfitStorage));
                
            } catch (error) {
                console.error('Save failed:', error);
                alert("Failed to save outfit. See console for details.");
            }
        }

        function LoadOutfit(C, outfitName) {
            try {
                if (!outfitName) {
                    console.error("LoadOutfit called with invalid outfit name:", outfitName);
                    return false;
                }

                const memberNumber = Player.MemberNumber;
                const storageKey = `${STORAGE_PREFIX}${memberNumber}`;
                
                // Get storage
                const storageData = localStorage.getItem(storageKey);
                if (!storageData) return false;

                const outfitStorage = JSON.parse(storageData);
                
                const outfit = outfitStorage.outfits.find(o => o.name === outfitName);
                
                if (!outfit) {
                    console.error("No outfit found with name:", outfitName);
                    return false;
                }

                // Decompress the outfit data
                const decompressed = LZString.decompressFromBase64(outfit.data);
                if (!decompressed) {
                    console.error("Failed to decompress outfit data");
                    return false;
                }

                const outfitData = JSON.parse(decompressed);
                if (!outfitData) {
                    console.error("No valid outfit data found");
                    return false;
                }

                // Clear existing items, but keep cosplay items
                for (let A = C.Appearance.length - 1; A >= 0; A--) {
                    const item = C.Appearance[A];
                    // Keep cosplay items and items that can't be removed
                    if (!item.Asset.Group.AllowNone || 
                        item.Asset.Group.Category !== "Appearance" || 
                        item.Asset.Group.BodyCosplay) {
                        continue;
                    }
                    C.Appearance.splice(A, 1);
                }

                // Remove existing items except locked and blocked body cosplay
                const groupsToReplace = new Set(outfitData.map(item => item.Group));
                C.Appearance = C.Appearance.filter(item =>
                    !groupsToReplace.has(item.Asset.Group.Name) ||
                    InventoryItemHasEffect(InventoryGet(C, item.Asset.Group.Name), "Lock") ||
                    (item.Asset.Group.BodyCosplay && CurrentCharacter.OnlineSharedSettings?.BlockBodyCosplay) ||
                    (!applyHairWithOutfit && (item.Asset.Group.Name === "HairFront" || item.Asset.Group.Name === "HairBack")) ||
                    !(item.Asset.Group.Clothing ||
                      item.Asset.Group.Name.includes("Item") ||
                      item.Asset.Group.Name.includes("BodyMarkings") ||
                      item.Asset.Group.Name === "HairFront" ||
                      item.Asset.Group.Name === "HairBack")
                );

                // Add new items
                for (const item of outfitData) {
                    const asset = AssetGet(C.AssetFamily, item.Group, item.Name);
                    if (!asset) continue;

                    // Skip if the group is locked or if body cosplay is blocked
                    if (InventoryItemHasEffect(InventoryGet(C, item.Group), "Lock")) continue;
                    if (asset.Group.BodyCosplay && CurrentCharacter.OnlineSharedSettings?.BlockBodyCosplay) continue;
                    
                    // Skip hair items if applyHairWithOutfit is false
                    if (!applyHairWithOutfit && (item.Group === "HairFront" || item.Group === "HairBack")) continue;

                    const bondageSkill = Player.Skill.find(skill => skill.Type === "Bondage");
                    const newItem = {
                        Asset: asset,
                        Color: item.Color || "Default",
                        Property: item.Property ? {...item.Property} : undefined,
                        Difficulty: asset.Difficulty !== undefined ? asset.Difficulty + (bondageSkill ? bondageSkill.Level : 0) : 0
                    };
                    if (item.Craft) newItem.Craft = item.Craft;
                    C.Appearance.push(newItem);
                }

                CharacterRefresh(C);
                if (C === CurrentCharacter) {
                    ChatRoomCharacterUpdate(C);
                }
                return true;

            } catch (error) {
                console.error('Load failed:', error);
                return false;
            }
        }

        // Add this helper function to get BCX code for a character's current outfit
        function getCurrentOutfitBCXCode(C, includeHair = null) {
            try {
                // Use the passed parameter if provided, otherwise use the global setting
                const shouldIncludeHair = includeHair !== null ? includeHair : applyHairWithOutfit;
                
                const outfitData = C.Appearance
                    .filter(item => {
                        const group = item?.Asset?.Group;
                        
                        // Skip hair items if not including hair
                        if (!shouldIncludeHair && (group?.Name === "HairFront" || group?.Name === "HairBack")) {
                            return false;
                        }
                        
                        return group && (
                            group.Clothing || 
                            group.Name.includes("Item") || 
                            group.Name.includes("BodyMarkings") ||
                            group.Name === "HairFront" || 
                            group.Name === "HairBack"
                        );
                    })
                    .map(item => ({
                        Name: item.Asset.Name,
                        Group: item.Asset.Group.Name,
                        Color: Array.isArray(item.Color) ? [...item.Color] : 
                            (typeof item.Color === "string" && item.Color !== "" && 
                                item.Color.toLowerCase() !== "default") ? item.Color : undefined,
                        Property: item.Property ? {...item.Property} : undefined,
                        Craft: item.Craft ? {...item.Craft} : undefined
                    }));

                return LZString.compressToBase64(JSON.stringify(outfitData));
            } catch (error) {
                console.error('Failed to generate BCX code:', error);
                return "";
            }
        }

        function ShowOutfitNotification(message, duration = 3) {
            ServerBeep = {
                Message: message,
                Timer: CommonTime() + (duration * 1000),  // Convert milliseconds to seconds
                ChatRoomName: null
            };
        }
        
        // Inside initMod function, after other function definitions
        function saveOutfits(outfits) {
            const memberNumber = Player.MemberNumber;
            const storageKey = `${STORAGE_PREFIX}${memberNumber}`;
            
            // Get existing data
            const storageData = localStorage.getItem(storageKey);
            if (!storageData) return;
            
            const outfitStorage = JSON.parse(storageData);
            
            // Filter out folder entries and back buttons from the outfits array
            const realOutfits = outfits.filter(o => !o.isFolder);
            
            // Get all outfits not in the current folder to preserve them
            const otherFolderOutfits = outfitStorage.outfits.filter(o => 
                (o.folder || "Main") !== currentFolder
            );
            
            // Replace only outfits in the current folder with the newly sorted ones
            outfitStorage.outfits = [
                ...otherFolderOutfits,
                ...realOutfits
            ];
            
            // Ensure we don't have any UI-only folders in the folders array
            if (outfitStorage.folders) {
                // Remove any "Return to Main Folder" entries that might have been accidentally saved
                outfitStorage.folders = outfitStorage.folders.filter(
                    f => f !== "⬆️ Return to Main Folder" && f !== "Return to Main Folder"
                );
            }
            
            // Save back to storage
            localStorage.setItem(storageKey, JSON.stringify(outfitStorage));
        }

        // Hook DrawCharacter to handle visibility
        modApi.hookFunction("DrawCharacter", 4, (args, next) => {
            const [C] = args;
            
            // If we're in outfit manager and this is our displayChar, make it act like a player character
            if (DialogMenuMode === "outfits" && C.ID === -1) {  // We set ID to -1 for our displayChar
                const originalIsPlayer = C.IsPlayer;
                C.IsPlayer = () => true;  // Temporarily make it act like a player character
                const result = next(args);
                C.IsPlayer = originalIsPlayer;  // Restore original IsPlayer
                return result;
            }

            return next(args);
        });

        // Hook CharacterGetDarkFactor to ensure full visibility in outfit manager
        modApi.hookFunction("CharacterGetDarkFactor", 0, (args, next) => {
            // If we're in the outfit manager dialog mode, always return full visibility
            if (DialogMenuMode === "outfits") {
                return 1.0;
            }
            // Otherwise use normal darkness calculation
            return next(args);
        });
        
        // Add these functions to your code
        function backupOutfits() {
            try {
                const memberNumber = Player.MemberNumber;
                const storageKey = `${STORAGE_PREFIX}${memberNumber}`;
                const storageData = localStorage.getItem(storageKey);
                
                if (!storageData) {
                    ShowOutfitNotification("No outfits to backup");
                    return;
                }
                
                // Prepare the JSON data
                const outfitData = JSON.parse(storageData);
                
                // Simplified backup data
                const backupData = {
                    memberNumber: memberNumber,  // Still useful to identify whose outfits these are
                    data: outfitData             // The actual outfit data including folders
                };
                
                // Convert to JSON string
                const jsonString = JSON.stringify(backupData);
                
                // Create download link
                const element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonString));
                element.setAttribute('download', `BCOM_Outfits_Backup_${memberNumber}_${new Date().toISOString().split('T')[0]}.json`);
                element.style.display = 'none';
                
                // Add to body, click and remove
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
                
                ShowOutfitNotification("Outfits backup created successfully");
            } catch (error) {
                console.error("Backup failed:", error);
                ShowOutfitNotification("Failed to create backup");
            }
        }

        function restoreOutfits() {
            try {
                // Create input element
                const inputElement = document.createElement('input');
                inputElement.type = 'file';
                inputElement.accept = '.json,text/plain';
                inputElement.style.display = 'none';
                
                // Add to body
                document.body.appendChild(inputElement);
                
                // Handle file selection
                inputElement.addEventListener('change', function() {
                    if (this.files && this.files[0]) {
                        const file = this.files[0];
                        const reader = new FileReader();
                        
                        reader.onload = function(e) {
                            try {
                                const backupData = JSON.parse(e.target.result);
                                
                                // Validate backup data
                                if (!backupData.data || !backupData.data.outfits || !Array.isArray(backupData.data.outfits)) {
                                    throw new Error("Invalid backup format");
                                }
                                
                                // Deduplicate and normalize folders in the backup
                                if (!backupData.data.folders || !Array.isArray(backupData.data.folders)) {
                                    backupData.data.folders = ["Main"];
                                } else {
                                    // Remove duplicates and UI-only folder entries
                                    const folderSet = new Set(backupData.data.folders.filter(f => 
                                        f !== "⬆️ Return to Main Folder" && 
                                        f !== "Return to Main Folder" && 
                                        !f.startsWith("⬆️")
                                    ));
                                    backupData.data.folders = Array.from(folderSet);
                                }
                                
                                // Confirm with user
                                const outfitCount = backupData.data.outfits.length;
                                const folderCount = backupData.data.folders.length;
                                if (!confirm(`Found ${outfitCount} outfits in ${folderCount} folders. Import them?`)) {
                                    return;
                                }
                                
                                // Check if existing outfits should be kept
                                const memberNumber = Player.MemberNumber;
                                const storageKey = `${STORAGE_PREFIX}${memberNumber}`;
                                const existingData = localStorage.getItem(storageKey);
                                
                                let finalOutfits = backupData.data;
                                let actualImportCount = backupData.data.outfits.length; // Track actual imports
                                
                                if (existingData) {
                                    try {
                                        const existingOutfits = JSON.parse(existingData);
                                        
                                        // Only ask about keeping existing outfits if there are actually outfits to keep
                                        if (existingOutfits.outfits && existingOutfits.outfits.length > 0) {
                                            const keepExisting = confirm(
                                                "You already have outfits saved.\n\n" +
                                                "• Click OK to merge with your existing outfits\n" +
                                                "• Click Cancel to replace all your existing outfits"
                                            );
                                            
                                            if (keepExisting) {
                                                // Merge outfits
                                                // Create a proper Set of folders to handle deduplication
                                                const existingFolders = existingOutfits.folders || ["Main"];
                                                const importedFolders = backupData.data.folders || ["Main"];
                                                
                                                // Combine folders without duplicates
                                                const combinedFolders = Array.from(new Set([...existingFolders, ...importedFolders]));
                                                
                                                // Get existing outfit names for comparison
                                                const existingNamesMap = new Map();
                                                existingOutfits.outfits.forEach(o => {
                                                    const key = `${o.name}_${o.folder || "Main"}`;
                                                    existingNamesMap.set(key, o);
                                                });
                                                
                                                // Add new outfits that don't conflict
                                                const newOutfits = [];
                                                const conflictOutfits = [];
                                                
                                                backupData.data.outfits.forEach(o => {
                                                    const key = `${o.name}_${o.folder || "Main"}`;
                                                    if (!existingNamesMap.has(key)) {
                                                        newOutfits.push(o);
                                                    } else {
                                                        conflictOutfits.push(o);
                                                    }
                                                });
                                                
                                                if (conflictOutfits.length > 0) {
                                                    const replaceConflicts = confirm(
                                                        `${conflictOutfits.length} outfit names conflict with existing outfits in the same folders.\n\n` +
                                                        `• Click OK to replace existing outfits with imported versions\n` +
                                                        `• Click Cancel to keep your existing outfits and skip conflicts`
                                                    );
                                                    
                                                    if (replaceConflicts) {
                                                        // Remove conflicting outfits
                                                        const conflictKeys = new Set(conflictOutfits.map(o => 
                                                            `${o.name}_${o.folder || "Main"}`
                                                        ));
                                                        
                                                        const filteredOutfits = existingOutfits.outfits.filter(o => {
                                                            const key = `${o.name}_${o.folder || "Main"}`;
                                                            return !conflictKeys.has(key);
                                                        });
                                                        
                                                        // Add all outfits
                                                        finalOutfits = {
                                                            outfits: [...filteredOutfits, ...backupData.data.outfits],
                                                            folders: combinedFolders
                                                        };
                                                        actualImportCount = backupData.data.outfits.length;
                                                    } else {
                                                        // Keep existing outfits, only add non-conflicting ones
                                                        finalOutfits = {
                                                            outfits: [...existingOutfits.outfits, ...newOutfits],
                                                            folders: combinedFolders
                                                        };
                                                        actualImportCount = newOutfits.length;
                                                    }
                                                } else {
                                                    // No conflicts, just add all
                                                    finalOutfits = {
                                                        outfits: [...existingOutfits.outfits, ...newOutfits],
                                                        folders: combinedFolders
                                                    };
                                                    actualImportCount = newOutfits.length;
                                                }
                                            } else {
                                                // User chose to replace all existing outfits
                                                actualImportCount = backupData.data.outfits.length;
                                            }
                                        }
                                    } catch (error) {
                                        console.error("Error parsing existing outfits:", error);
                                        // If we can't parse the existing data, just use the imported outfits
                                        finalOutfits = backupData.data;
                                        actualImportCount = backupData.data.outfits.length;
                                    }
                                }
                                
                                // Check outfit limit
                                if (finalOutfits.outfits.length > MAX_OUTFITS) {
                                    if (!confirm(`This would exceed the maximum of ${MAX_OUTFITS} outfits. Import only the first ${MAX_OUTFITS} outfits?`)) {
                                        return;
                                    }
                                    // Adjust the actual import count if we're limiting outfits
                                    const beforeLimit = finalOutfits.outfits.length;
                                    finalOutfits.outfits = finalOutfits.outfits.slice(0, MAX_OUTFITS);
                                    const afterLimit = finalOutfits.outfits.length;
                                    actualImportCount = Math.max(0, actualImportCount - (beforeLimit - afterLimit));
                                }
                                
                                // Ensure we have a Main folder (without adding duplicates)
                                if (!finalOutfits.folders.includes("Main")) {
                                    finalOutfits.folders.unshift("Main");
                                }
                                
                                // Final step: deduplicate the folders array to be absolutely sure
                                finalOutfits.folders = Array.from(new Set(finalOutfits.folders));
                                
                                // Save to storage
                                localStorage.setItem(storageKey, JSON.stringify(finalOutfits));
                                
                                // Ensure current folder is valid
                                if (!finalOutfits.folders.includes(currentFolder)) {
                                    currentFolder = "Main";
                                }
                                
                                // Use the actual import count in the notification
                                ShowOutfitNotification(`Successfully imported ${actualImportCount} outfits in ${finalOutfits.folders.length} folders`);
                            } catch (error) {
                                console.error("Import failed:", error);
                                ShowOutfitNotification("Failed to import: Invalid backup file");
                            }
                        };
                        
                        reader.readAsText(file);
                    }
                    
                    // Remove the input element
                    document.body.removeChild(inputElement);
                });
                
                // Trigger file selection dialog
                inputElement.click();
            } catch (error) {
                console.error("Restore failed:", error);
                ShowOutfitNotification("Failed to start restore process");
            }
        }

        function truncateFolderName(folderName, maxLength) {
            if (folderName.length <= maxLength) return folderName;
            return folderName.substring(0, maxLength - 3) + "...";
        }

        function targetfinder(input) {
            if (!input || !ChatRoomCharacter || ChatRoomCharacter.length === 0) return null;
            
            // Check if input is a pure number (member number)
            if (/^\d+$/.test(input)) {
                const memberNumber = parseInt(input);
                const target = ChatRoomCharacter.find(c => c.MemberNumber === memberNumber);
                if (target) return target;
            }
            
            // Convert to lowercase for all string comparisons
            const searchText = input.toLowerCase();
            
            // Check for duplicate nicknames in the room before searching
            const nicknameCounts = {};
            for (const c of ChatRoomCharacter) {
                const nickname = CharacterNickname(c).toLowerCase();
                nicknameCounts[nickname] = (nicknameCounts[nickname] || 0) + 1;
            }
            
            // First try exact full name matches
            const exactMatches = [];
            for (const c of ChatRoomCharacter) {
                if (CharacterNickname(c).toLowerCase() === searchText) {
                    exactMatches.push(c);
                }
            }
            
            // If multiple exact matches found, notify user to use member number
            if (exactMatches.length > 1) {
                ChatRoomSendLocal(`Multiple characters with the nickname "${input}" found. Please use their member number instead.`, 10000);
                return null;
            } else if (exactMatches.length === 1) {
                return exactMatches[0];
            }
            
            // Try first name matches
            const firstNameMatches = [];
            for (const c of ChatRoomCharacter) {
                const nickFirstName = CharacterNickname(c).split(" ")[0]?.toLowerCase();
                if (nickFirstName === searchText) {
                    firstNameMatches.push(c);
                }
            }
            
            // If multiple first name matches found, notify user to use member number or full name
            if (firstNameMatches.length > 1) {
                ChatRoomSendLocal(`Multiple characters with the first name "${input}" found. Please use their full name or member number.`, 10000);
                return null;
            } else if (firstNameMatches.length === 1) {
                return firstNameMatches[0];
            }
            
            // Try partial name matches
            const partialMatches = [];
            for (const c of ChatRoomCharacter) {
                if (CharacterNickname(c).toLowerCase().includes(searchText)) {
                    partialMatches.push(c);
                }
            }
            
            // If multiple partial matches found, notify user to be more specific
            if (partialMatches.length > 1) {
                ChatRoomSendLocal(`Multiple characters with names containing "${input}" found. Please be more specific or use their member number.`, 10000);
                return null;
            } else if (partialMatches.length === 1) {
                return partialMatches[0];
            }
            
            // No match found
            return null;
        }

        // Clean up DOM button when leaving dialog
        modApi.hookFunction("DialogLeave", 0, (args, next) => {
            // Remove our button from DOM if it exists
            const outfitButton = document.getElementById("OutfitManagerButton");
            if (outfitButton) outfitButton.remove();
            
            // Make sure PreviousDialogMode isn't blank
            if (!PreviousDialogMode || PreviousDialogMode === "") {
                PreviousDialogMode = "dialog";
            }

            const importElement = document.getElementById("OutfitManagerImport");
            if (importElement) {
                importElement.remove();
            }
            
            // Call original function
            return next(args);
        });

        // Add a hook for DialogMenuBack to properly handle exiting from outfits mode
        modApi.hookFunction("DialogMenuBack", 5, (args, next) => {
            // Check if we're in outfits mode before the original function runs
            if (DialogMenuMode === "outfits") {
                console.log("DialogMenuBack: Exiting Outfit Manager via BackMenu");
                
                // Reset all outfit manager modes
                isSortMode = false;
                isExportMode = false;
                isFolderManagementMode = false;
                selectedOutfits = [];
                
                // Remove our style element that hides dialog elements
                const styleElement = document.getElementById("outfit-manager-style");
                if (styleElement) {
                    styleElement.remove();
                    console.log("DialogMenuBack: Removed style element that was hiding dialog elements");
                }
                
                // Make sure all other outfit manager DOM elements are also removed
                const outfitManager = document.getElementById("dialog-outfit-manager");
                if (outfitManager) {
                    outfitManager.remove();
                    console.log("DialogMenuBack: Removed outfit manager dialog container");
                }
                
                // Restore visibility to all specifically hidden elements
                const hiddenElementIds = [
                    "dialog-expression", "dialog-expression-status", "dialog-expression-menubar", 
                    "dialog-expression-menu-left", "dialog-expression-button-grid",
                    "dialog-inventory", "dialog-inventory-status", "dialog-inventory-grid", 
                    "dialog-inventory-icon", "dialog-inventory-paginate",
                    "dialog-pose", "dialog-pose-status", "dialog-pose-menubar", "dialog-pose-button-grid",
                    "dialog-expression-preset", "dialog-expression-preset-status", 
                    "dialog-expression-preset-menubar", "dialog-expression-preset-button-grid"
                ];
                
                hiddenElementIds.forEach(id => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.style.display = "";
                        element.style.visibility = "";
                        element.style.opacity = "";
                        element.style.pointerEvents = "";
                    }
                });
                
                // Add failsafe for PreviousDialogMode
                if (!PreviousDialogMode) {
                    PreviousDialogMode = "dialog";
                }
                
                // Set DialogMenuMode to previous mode for the original function to handle
                DialogMenuMode = PreviousDialogMode;
                console.log(`DialogMenuBack: Set DialogMenuMode to ${PreviousDialogMode}`);
                
                // Properly remove the import field if it exists
                const importElement = document.getElementById("OutfitManagerImport");
                if (importElement) {
                    importElement.remove();
                    console.log("DialogMenuBack: Removed import field");
                }
            }
            
            // Run the original function
            return next(args);
        });

        // Add a hook to prevent duplicate character drawing in outfit mode
        modApi.hookFunction("DrawCharacter", 5, (args, next) => {
            const [C, X, Y, Zoom, IsHeightResizeAllowed, IsInScreen, IsHeightRatio, drawCanvas, drawCanvasBlink, AlphaMasks, drawCanvasInverted] = args;
            
            // When in outfit mode, control what characters get drawn 
            if (DialogMenuMode === "outfits") {
                // The coordinates that indicate a character in the dialog position (left side)
                const isDialogCharacter = (X >= 50 && X <= 700 && Y >= 0 && Y <= 1000);
                
                // If in outfit mode and this is a character in the dialog position
                if (isDialogCharacter) {
                    // Our displayChar in DrawOutfitMenu is drawn at X=500, so we can allow that exact position
                    // while preventing other characters from being drawn in the dialog area
                    if (X === 500 && Y === 0) {
                        // This is our displayChar in the outfit menu, allow it to draw
                        return next(args);
                    } else {
                        // Skip drawing any other characters in the dialog position
                        return; // Important: return without calling next() prevents drawing
                    }
                }
            }
            
            // For all other cases, proceed with normal drawing
            return next(args);
        });
    
        CommandCombine([
            {
                Tag: "bcom",
                Description: "Opens the outfit manager. Enter a character name or member number to open the outfit manager for that character or nothing to open it on yourself.",
                Action: (args) => {
                    let targetCharacter = null;
                    
                    // If no arguments, target self
                    if (!args || args.trim() === "") {
                        targetCharacter = Player;
                    } else {
                        // Use targetfinder function to find character by name or member number
                        targetCharacter = targetfinder(args);
                        
                        // If character not found, display error and return
                        if (!targetCharacter) {
                            ChatRoomSendLocal("Player not found. Please check the name or member number and try again.");
                            return; // Exit the command without opening the outfit manager
                        }
                        
                        // Check permissions - only allow if it's the player or they have AllowItem permission
                        if (targetCharacter.MemberNumber !== Player.MemberNumber && !targetCharacter.AllowItem) {
                            ChatRoomSendLocal("You don't have permission to interact with this player.");
                            return; // Exit without opening outfit manager
                        }
                    }
                    
                    // Open dialog with target character
                    ChatRoomCharacterViewClickCharacter(targetCharacter);
                    
                    // After dialog is open, switch to outfit mode
                    setTimeout(() => {
                        PreviousDialogMode = DialogMenuMode;
                        DialogChangeMode("outfits");
                    }, 10);
                }
            }
        ]);

    } catch (error) {
        console.error('OutfitManager failed:', error);
    }

    
}

if (window.bcModSdk?.registerMod) {
    initMod();
} else {
    window.addEventListener('bcModSdkLoaded', initMod);
    setTimeout(initMod, 5000);
}
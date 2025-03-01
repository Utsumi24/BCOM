// ==UserScript==
// @name         BC Outfit Manager
// @namespace https://www.bondageprojects.com/
// @version      0.6.1
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

const VERSION_NUMBER = "0.6.1";

/*
# BC Outfit Manager Changelog

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
                
                // No need for additional initialization here
                // The mod is now considered initialized
            }
            return next(args);
        });

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

        const STORAGE_PREFIX = "OutfitManager_"; // Prefix for storing outfits
        const OUTFITS_PER_PAGE = 8;  // Number of outfits to display per page
        let DialogOutfitPage = 0; // Current page of outfits being displayed

        // Add this with other state variables
        let isExportMode = false;

        // Update drawing code
        modApi.hookFunction("DialogDraw", 0, (args, next) => {
            if (DialogMenuMode === "items" || DialogMenuMode === "dialog") {
                DrawButton(
                    OUTFIT_BUTTON_X,  // X: 70 - 60 - 5 = 5
                    905,
                    BUTTON_SIZE,
                    BUTTON_SIZE,
                    "",
                    DialogMenuMode === "outfits" ? "Cyan" : "White",
                    "",  // Remove the icon here
                    "Outfit Manager"
                );
                DrawImageResize("Icons/Dress.png",
                    OUTFIT_BUTTON_X + 5,
                    910,
                    50,
                    50
                );
            }

            if (DialogMenuMode === "outfits") {
                DrawOutfitMenu();
                return;
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
                if (outfits.length >= 2 && MouseIn(1130, 180, 90, 60)) {
                    isSortMode = !isSortMode;
                    if (isSortMode) {
                        isExportMode = false;  // Turn off export mode when entering sort mode
                        const importElement = document.getElementById("OutfitManagerImport");
                        if (importElement) importElement.value = "";  // Clear import field when exiting export mode
                    }
                    return;
                }
        
                // Export mode toggle button
                if (MouseIn(1680, 180, 90, 60)) {
                    isExportMode = !isExportMode;
                    if (isExportMode) {
                        isSortMode = false;  // Turn off sort mode when entering export mode
                    }
                    if (!isExportMode) {
                        const importElement = document.getElementById("OutfitManagerImport");
                        if (importElement) importElement.value = "";
                    }
                    return;
                }
        
                // Import/Export button
                if (MouseIn(1720, 42, 80, 36)) {
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
        
                // Back button with matching coordinates
                if (MouseIn(1885, 15, 90, 90)) {
                    // Reset sort mode only if it's active
                    if (isSortMode) {
                        isSortMode = false;
                    }
                    // Reset export mode if active and clear import field
                    if (isExportMode) {
                        isExportMode = false;
                        const importElement = document.getElementById("OutfitManagerImport");
                        if (importElement) importElement.value = "";
                    }
                    DialogChangeMode(PreviousDialogMode);
                    return;
                }                
        
                // Save button
                if (MouseIn(1250, 180, 400, 60)) {
                    SaveOutfit(CurrentCharacter);
                    return;
                }
        
                // Check outfit clicks for current page
                for (let i = startIndex; i < endIndex; i++) {
                    const outfit = outfits[i];
                    const yPos = 280 + ((i - startIndex) * 80);
        
                    if (isSortMode) {
                        // Up arrow click
                        if (i > 0 && MouseIn(1150, yPos + 5, 50, 50)) {
                            [outfits[i], outfits[i-1]] = [outfits[i-1], outfits[i]];
                            saveOutfits(outfits);
                            return;
                        }
                        
                        // Down arrow click
                        if (i < outfits.length - 1 && MouseIn(1710, yPos + 5, 50, 50)) {
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
                                    // Remove the outfit by name
                                    outfitStorage.outfits = outfitStorage.outfits.filter(o => o.name !== outfit.name);
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
                    PreviousDialogMode = DialogMenuMode;
                    DialogChangeMode("outfits");
                    DialogMenuButton = [];
                    return true;
                }
            }
        
            return next(args);
        });

        modApi.hookFunction("DialogClickPoseMenu", 0, (args, next) => {
            if (DialogMenuMode === "outfits") return;
            return next(args);
        });

        modApi.hookFunction("DialogClickExpressionMenu", 0, (args, next) => {
            if (DialogMenuMode === "outfits") return;
            return next(args);
        });

        modApi.hookFunction("DialogChangeMode", 4, (args, next) => {
            const [mode, reset] = args;
            
            if (mode === "outfits") {
                // Store the mode we're coming from
                PreviousDialogMode = DialogMenuMode;
                
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
            "• Use the import button to import outfits",
            "  from BCX codes"
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
            "• Click 'Done' to exit export mode"
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
                const currentOutfitCode = getCurrentOutfitBCXCode(CurrentCharacter);
                importElement.value = currentOutfitCode;
                importElement.readOnly = true;
            } else {
                importElement.readOnly = false;
            }

            // Position the import/export field and button
            ElementPosition(importId, 1407, 59, 615, 36);

            // Draw Import/Export button based on mode
            DrawButton(1720, 42, 80, 36, isExportMode ? "Export" : "Import", "White");

            // Background and title
            DrawRect(1100, 100, 700, 900, "#ffffffdd");
            DrawText(`${CharacterNickname(CurrentCharacter)}'s Outfit Manager`, 1450, 150, "Black", "center");

            // Back button matching dialog.js coordinates
            DrawButton(1885, 15, 90, 90, "", "White", "Icons/Exit.png", "");
            //DrawImageResize("Icons/Exit.png", 1900, 30, 45, 45);  // Smaller size to match standard dialogs. Keep for reference.
            
            // Draw sort button if 2+ outfits exist
            const outfits = getSortedOutfits();
            if (outfits.length >= 2) {
                DrawButton(1130, 180, 90, 60, isSortMode ? "Done" : "Sort", "Blue");
                // Add Export button opposite of Sort
                DrawButton(1680, 180, 90, 60, isExportMode ? "Done" : "Export", "Purple");
            }

            // Save button - centered in the box
            DrawButton(1250, 180, 400, 60, "Save New Outfit", "Green");

            // Draw backup and restore buttons using existing game icons
            DrawButton(1885, 115, 90, 90, "", "White", "Icons/Save.png", "Backup all outfits to a file");
            DrawButton(1885, 215, 90, 90, "", "White", "Icons/Upload.png", "Import outfits from backup file");

            // Define constants
            const OUTFITS_PER_PAGE = 8;
            let isHoveringAnyOutfit = false;
            let yOffset = 0;  // Reset the offset

            // In DrawOutfitMenu, select the appropriate help text
            let helpText = DEFAULT_HELP_TEXT;
            if (isSortMode) {
                helpText = SORT_MODE_HELP_TEXT;
            } else if (isExportMode) {
                helpText = EXPORT_MODE_HELP_TEXT;
            }

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

                const yPos = 280 + ((i - startIndex) * 80);

                // Check if hovering over this outfit button
                if (MouseIn(1210, yPos, 490, 60)) {
                    isHoveringAnyOutfit = true;

                    try {
                        // Only check for locked items in default mode
                        if (!isSortMode && !isExportMode) {
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

                if (isSortMode) {
                    // In sort mode, show up/down arrows instead of rename/delete
                    if (i > 0) { // Not first outfit
                        DrawButton(1150, yPos + 5, 50, 50, "↑", "White", "");
                    }
                    if (i < outfits.length - 1) { // Not last outfit
                        DrawButton(1710, yPos + 5, 50, 50, "↓", "White", "");
                    }
                    
                    // Show outfit number and name
                    DrawButton(1210, yPos, 490, 60, `${i + 1}. ${outfit.name}`, "White");
                } else {
                    if (isExportMode) {
                        // Show outfit number and name
                        DrawButton(1210, yPos, 490, 60, `${i + 1}. ${outfit.name}`, "White");
                        // Export button instead of delete
                        DrawButton(1710, yPos + 5, 50, 50, "📋", "White", "", "Copy outfit code");
                    } else {
                        // Normal mode - rename/delete buttons
                        DrawButton(1150, yPos + 5, 50, 50, "✎", "White", "", "Rename outfit");
                        DrawButton(1210, yPos, 490, 60, `${i + 1}. ${outfit.name}`, "White");
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
            DrawText(`v${VERSION_NUMBER}`, 1957, 980, "Gray", "Black");
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
                    { outfits: [] };
                
                return outfitStorage.outfits;
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
                    { outfits: [] };

                // Check outfit limit (80 outfits maximum)
                if (outfitStorage.outfits.length >= MAX_OUTFITS && !outfitStorage.outfits.some(o => o.name === outfitName)) {
                    ShowOutfitNotification("Maximum outfit limit (80) reached. Please delete some outfits first.");
                    return;
                }

                // Check for existing outfit with same name
                const existingIndex = outfitStorage.outfits.findIndex(o => o.name === outfitName);
                if (existingIndex >= 0) {
                    if (!confirm(`Outfit "${outfitName}" already exists. Do you want to overwrite it?`)) {
                        return;
                    }
                    outfitStorage.outfits.splice(existingIndex, 1);
                    ShowOutfitNotification(`Outfit "${outfitName}" has been overwritten`);
                } else {
                    ShowOutfitNotification(`Outfit "${outfitName}" has been saved`);
                }

                // Convert appearance to BCX format outfit data
                const outfitData = C.Appearance
                    .filter(item => {
                        const group = item?.Asset?.Group;
                        return group && (group.Clothing || group.Name.includes("Item") || group.Name.includes("BodyMarkings"));
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

                // Add new outfit with next available order number
                const nextOrder = outfitStorage.outfits.length > 0 ? 
                    Math.max(...outfitStorage.outfits.map(o => o.order)) + 1 : 0;

                outfitStorage.outfits.push({
                    name: outfitName,
                    data: LZString.compressToBase64(JSON.stringify(outfitData))  // Compress the outfit data
                });

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

                // Clear existing items
                CharacterNaked(C);

                // Remove existing items except locked and blocked body cosplay
                const groupsToReplace = new Set(outfitData.map(item => item.Group));
                C.Appearance = C.Appearance.filter(item =>
                    !groupsToReplace.has(item.Asset.Group.Name) ||
                    InventoryItemHasEffect(InventoryGet(C, item.Asset.Group.Name), "Lock") ||
                    (item.Asset.Group.BodyCosplay && CurrentCharacter.OnlineSharedSettings?.BlockBodyCosplay) ||
                    !(item.Asset.Group.Clothing ||
                      item.Asset.Group.Name.includes("Item") ||
                      item.Asset.Group.Name.includes("BodyMarkings"))
                );

                // Add new items
                for (const item of outfitData) {
                    const asset = AssetGet(C.AssetFamily, item.Group, item.Name);
                    if (!asset) continue;

                    // Skip if the group is locked or if body cosplay is blocked
                    if (InventoryItemHasEffect(InventoryGet(C, item.Group), "Lock")) continue;
                    if (asset.Group.BodyCosplay && CurrentCharacter.OnlineSharedSettings?.BlockBodyCosplay) continue;

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
        function getCurrentOutfitBCXCode(C) {
            try {
                const outfitData = C.Appearance
                    .filter(item => {
                        const group = item?.Asset?.Group;
                        return group && (group.Clothing || group.Name.includes("Item") || group.Name.includes("BodyMarkings"));
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

        function ShowOutfitNotification(message) {
            ServerBeep = {
                Message: message,
                Timer: CommonTime() + 2000,  // Show for 2 seconds
                ChatRoomName: null
            };
        }

        // Add cleanup for import box when dialog closes
        modApi.hookFunction("DialogLeave", 0, (args, next) => {
            // Clean up import box if it exists
            const importElement = document.getElementById("OutfitManagerImport");
            if (importElement) {
                importElement.remove();
            }
            
            return next(args);
        });
        
        // Inside initMod function, after other function definitions
        function saveOutfits(outfits) {
            const memberNumber = Player.MemberNumber;
            const storageKey = `${STORAGE_PREFIX}${memberNumber}`;
            const outfitStorage = { outfits };
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
                    data: outfitData             // The actual outfit data
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
                                
                                // Confirm with user
                                const outfitCount = backupData.data.outfits.length;
                                if (!confirm(`Found ${outfitCount} outfits in backup. Import them?`)) {
                                    return;
                                }
                                
                                // Check if existing outfits should be kept
                                const memberNumber = Player.MemberNumber;
                                const storageKey = `${STORAGE_PREFIX}${memberNumber}`;
                                const existingData = localStorage.getItem(storageKey);
                                
                                let finalOutfits = backupData.data;
                                
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
                                                const existingOutfits = JSON.parse(existingData);
                                                
                                                // Get existing outfit names for comparison
                                                const existingNames = new Set(existingOutfits.outfits.map(o => o.name));
                                                
                                                // Add new outfits that don't conflict
                                                const newOutfits = backupData.data.outfits.filter(o => !existingNames.has(o.name));
                                                
                                                // Handle conflicts
                                                const conflictOutfits = backupData.data.outfits.filter(o => existingNames.has(o.name));
                                                
                                                if (conflictOutfits.length > 0) {
                                                    const replaceConflicts = confirm(
                                                        `${conflictOutfits.length} outfit names conflict with existing outfits.\n\n` +
                                                        `• Click OK to replace existing outfits with imported versions\n` +
                                                        `• Click Cancel to keep your existing outfits and skip conflicts`
                                                    );
                                                    
                                                    if (replaceConflicts) {
                                                        // Remove conflicting outfits
                                                        const conflictNames = new Set(conflictOutfits.map(o => o.name));
                                                        existingOutfits.outfits = existingOutfits.outfits.filter(o => !conflictNames.has(o.name));
                                                        
                                                        // Add all new outfits
                                                        finalOutfits = {
                                                            outfits: [...existingOutfits.outfits, ...backupData.data.outfits]
                                                        };
                                                    } else {
                                                        // Keep existing outfits, only add non-conflicting ones
                                                        finalOutfits = {
                                                            outfits: [...existingOutfits.outfits, ...newOutfits]
                                                        };
                                                    }
                                                } else {
                                                    // No conflicts, just add all
                                                    finalOutfits = {
                                                        outfits: [...existingOutfits.outfits, ...backupData.data.outfits]
                                                    };
                                                }
                                            }
                                        } else {
                                            // No existing outfits to worry about, just use the imported ones
                                            finalOutfits = backupData.data;
                                        }
                                    } catch (error) {
                                        console.error("Error parsing existing outfits:", error);
                                        // If we can't parse the existing data, just use the imported outfits
                                        finalOutfits = backupData.data;
                                    }
                                }
                                
                                // Check outfit limit
                                if (finalOutfits.outfits.length > MAX_OUTFITS) {
                                    if (!confirm(`This would exceed the maximum of ${MAX_OUTFITS} outfits. Import only the first ${MAX_OUTFITS} outfits?`)) {
                                        return;
                                    }
                                    finalOutfits.outfits = finalOutfits.outfits.slice(0, MAX_OUTFITS);
                                }
                                
                                // Save to storage
                                localStorage.setItem(storageKey, JSON.stringify(finalOutfits));
                                
                                ShowOutfitNotification(`Successfully imported ${finalOutfits.outfits.length} outfits`);
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
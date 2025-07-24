// ==UserScript==
// @name         BC Outfit Manager
// @namespace https://www.bondageprojects.com/
// @version      0.7.8
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

//Don't judge me for using AI to make this. T_T

var bcModSdk=function(){"use strict";const o="1.2.0";function e(o){alert("Mod ERROR:\n"+o);const e=new Error(o);throw console.error(e),e}const t=new TextEncoder;function n(o){return!!o&&"object"==typeof o&&!Array.isArray(o)}function r(o){const e=new Set;return o.filter((o=>!e.has(o)&&e.add(o)))}const i=new Map,a=new Set;function c(o){a.has(o)||(a.add(o),console.warn(o))}function s(o){const e=[],t=new Map,n=new Set;for(const r of f.values()){const i=r.patching.get(o.name);if(i){e.push(...i.hooks);for(const[e,a]of i.patches.entries())t.has(e)&&t.get(e)!==a&&c(`ModSDK: Mod '${r.name}' is patching function ${o.name} with same pattern that is already applied by different mod, but with different pattern:\nPattern:\n${e}\nPatch1:\n${t.get(e)||""}\nPatch2:\n${a}`),t.set(e,a),n.add(r.name)}}e.sort(((o,e)=>e.priority-o.priority));const r=function(o,e){if(0===e.size)return o;let t=o.toString().replaceAll("\r\n","\n");for(const[n,r]of e.entries())t.includes(n)||c(`ModSDK: Patching ${o.name}: Patch ${n} not applied`),t=t.replaceAll(n,r);return(0,eval)(`(${t})`)}(o.original,t);let i=function(e){var t,i;const a=null===(i=(t=m.errorReporterHooks).hookChainExit)||void 0===i?void 0:i.call(t,o.name,n),c=r.apply(this,e);return null==a||a(),c};for(let t=e.length-1;t>=0;t--){const n=e[t],r=i;i=function(e){var t,i;const a=null===(i=(t=m.errorReporterHooks).hookEnter)||void 0===i?void 0:i.call(t,o.name,n.mod),c=n.hook.apply(this,[e,o=>{if(1!==arguments.length||!Array.isArray(e))throw new Error(`Mod ${n.mod} failed to call next hook: Expected args to be array, got ${typeof o}`);return r.call(this,o)}]);return null==a||a(),c}}return{hooks:e,patches:t,patchesSources:n,enter:i,final:r}}function l(o,e=!1){let r=i.get(o);if(r)e&&(r.precomputed=s(r));else{let e=window;const a=o.split(".");for(let t=0;t<a.length-1;t++)if(e=e[a[t]],!n(e))throw new Error(`ModSDK: Function ${o} to be patched not found; ${a.slice(0,t+1).join(".")} is not object`);const c=e[a[a.length-1]];if("function"!=typeof c)throw new Error(`ModSDK: Function ${o} to be patched not found`);const l=function(o){let e=-1;for(const n of t.encode(o)){let o=255&(e^n);for(let e=0;e<8;e++)o=1&o?-306674912^o>>>1:o>>>1;e=e>>>8^o}return((-1^e)>>>0).toString(16).padStart(8,"0").toUpperCase()}(c.toString().replaceAll("\r\n","\n")),d={name:o,original:c,originalHash:l};r=Object.assign(Object.assign({},d),{precomputed:s(d),router:()=>{},context:e,contextProperty:a[a.length-1]}),r.router=function(o){return function(...e){return o.precomputed.enter.apply(this,[e])}}(r),i.set(o,r),e[r.contextProperty]=r.router}return r}function d(){for(const o of i.values())o.precomputed=s(o)}function p(){const o=new Map;for(const[e,t]of i)o.set(e,{name:e,original:t.original,originalHash:t.originalHash,sdkEntrypoint:t.router,currentEntrypoint:t.context[t.contextProperty],hookedByMods:r(t.precomputed.hooks.map((o=>o.mod))),patchedByMods:Array.from(t.precomputed.patchesSources)});return o}const f=new Map;function u(o){f.get(o.name)!==o&&e(`Failed to unload mod '${o.name}': Not registered`),f.delete(o.name),o.loaded=!1,d()}function g(o,t){o&&"object"==typeof o||e("Failed to register mod: Expected info object, got "+typeof o),"string"==typeof o.name&&o.name||e("Failed to register mod: Expected name to be non-empty string, got "+typeof o.name);let r=`'${o.name}'`;"string"==typeof o.fullName&&o.fullName||e(`Failed to register mod ${r}: Expected fullName to be non-empty string, got ${typeof o.fullName}`),r=`'${o.fullName} (${o.name})'`,"string"!=typeof o.version&&e(`Failed to register mod ${r}: Expected version to be string, got ${typeof o.version}`),o.repository||(o.repository=void 0),void 0!==o.repository&&"string"!=typeof o.repository&&e(`Failed to register mod ${r}: Expected repository to be undefined or string, got ${typeof o.version}`),null==t&&(t={}),t&&"object"==typeof t||e(`Failed to register mod ${r}: Expected options to be undefined or object, got ${typeof t}`);const i=!0===t.allowReplace,a=f.get(o.name);a&&(a.allowReplace&&i||e(`Refusing to load mod ${r}: it is already loaded and doesn't allow being replaced.\nWas the mod loaded multiple times?`),u(a));const c=o=>{let e=g.patching.get(o.name);return e||(e={hooks:[],patches:new Map},g.patching.set(o.name,e)),e},s=(o,t)=>(...n)=>{var i,a;const c=null===(a=(i=m.errorReporterHooks).apiEndpointEnter)||void 0===a?void 0:a.call(i,o,g.name);g.loaded||e(`Mod ${r} attempted to call SDK function after being unloaded`);const s=t(...n);return null==c||c(),s},p={unload:s("unload",(()=>u(g))),hookFunction:s("hookFunction",((o,t,n)=>{"string"==typeof o&&o||e(`Mod ${r} failed to patch a function: Expected function name string, got ${typeof o}`);const i=l(o),a=c(i);"number"!=typeof t&&e(`Mod ${r} failed to hook function '${o}': Expected priority number, got ${typeof t}`),"function"!=typeof n&&e(`Mod ${r} failed to hook function '${o}': Expected hook function, got ${typeof n}`);const s={mod:g.name,priority:t,hook:n};return a.hooks.push(s),d(),()=>{const o=a.hooks.indexOf(s);o>=0&&(a.hooks.splice(o,1),d())}})),patchFunction:s("patchFunction",((o,t)=>{"string"==typeof o&&o||e(`Mod ${r} failed to patch a function: Expected function name string, got ${typeof o}`);const i=l(o),a=c(i);n(t)||e(`Mod ${r} failed to patch function '${o}': Expected patches object, got ${typeof t}`);for(const[n,i]of Object.entries(t))"string"==typeof i?a.patches.set(n,i):null===i?a.patches.delete(n):e(`Mod ${r} failed to patch function '${o}': Invalid format of patch '${n}'`);d()})),removePatches:s("removePatches",(o=>{"string"==typeof o&&o||e(`Mod ${r} failed to patch a function: Expected function name string, got ${typeof o}`);const t=l(o);c(t).patches.clear(),d()})),callOriginal:s("callOriginal",((o,t,n)=>{"string"==typeof o&&o||e(`Mod ${r} failed to call a function: Expected function name string, got ${typeof o}`);const i=l(o);return Array.isArray(t)||e(`Mod ${r} failed to call a function: Expected args array, got ${typeof t}`),i.original.apply(null!=n?n:globalThis,t)})),getOriginalHash:s("getOriginalHash",(o=>{"string"==typeof o&&o||e(`Mod ${r} failed to get hash: Expected function name string, got ${typeof o}`);return l(o).originalHash}))},g={name:o.name,fullName:o.fullName,version:o.version,repository:o.repository,allowReplace:i,api:p,loaded:!0,patching:new Map};return f.set(o.name,g),Object.freeze(p)}function h(){const o=[];for(const e of f.values())o.push({name:e.name,fullName:e.fullName,version:e.version,repository:e.repository});return o}let m;const y=void 0===window.bcModSdk?window.bcModSdk=function(){const e={version:o,apiVersion:1,registerMod:g,getModsInfo:h,getPatchingInfo:p,errorReporterHooks:Object.seal({apiEndpointEnter:null,hookEnter:null,hookChainExit:null})};return m=e,Object.freeze(e)}():(n(window.bcModSdk)||e("Failed to init Mod SDK: Name already in use"),1!==window.bcModSdk.apiVersion&&e(`Failed to init Mod SDK: Different version already loaded ('1.2.0' vs '${window.bcModSdk.version}')`),window.bcModSdk.version!==o&&alert(`Mod SDK warning: Loading different but compatible versions ('1.2.0' vs '${window.bcModSdk.version}')\nOne of mods you are using is using an old version of SDK. It will work for now but please inform author to update`),window.bcModSdk);return"undefined"!=typeof exports&&(Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=y),y}();

const VERSION_NUMBER = "0.7.8";

let modInitialized = false;

const STORAGE_PREFIX = "OutfitManager_"; // Prefix for storing outfits

// Version update notification system
function checkVersionUpdate() {
    try {
        const memberNumber = Player.MemberNumber;
        const storageKey = `${STORAGE_PREFIX}${memberNumber}`;
        const storageData = localStorage.getItem(storageKey);

        let outfitStorage;
        let isFirstTime = false;

        if (storageData) {
            outfitStorage = JSON.parse(storageData);
            if (!outfitStorage.settings) outfitStorage.settings = {};
        } else {
            outfitStorage = { outfits: [], folders: ["Main"], settings: {} };
            isFirstTime = true;
        }

        const storedVersion = outfitStorage.settings.lastVersion;
        const currentVersion = VERSION_NUMBER;

        // Check if this is a version update
        if (!isFirstTime && (!storedVersion || storedVersion !== currentVersion)) {
            // Send private message notification about update
            setTimeout(() => {
                const updateMessage = `BC Outfit Manager has been updated to v${currentVersion}!\n\n` +
                    `New changes have been added. ` +
                    `You can view the full changelog at:\n` +
                    `https://github.com/Utsumi24/BCOM/blob/main/CHANGELOG.md\n\n`;
                    `If you have any crashes or issues, please @Utsumi on either the BC Scripting Community or main BC Discord servers.`;

                // Create a beep entry that appears like a private message
                const beepIdx = FriendListBeepLog.length;
                FriendListBeepLog.push({
                    MemberNumber: Player.MemberNumber || -1, // System message
                    MemberName: "BCOM",
                    ChatRoomName: "Update",
                    ChatRoomSpace: "",
                    Private: true,
                    Sent: false,
                    Time: new Date(),
                    Message: updateMessage
                });

                // Show beep notification with click handler to open the message
                ServerShowBeep(`Update notification from BC Outfit Manager v${currentVersion}`, 15000, {
                    onClick: () => {
                        FriendListShowBeep(beepIdx);
                    }
                });

                console.log(`BCOM: Updated from v${storedVersion} to v${currentVersion}`);
            }, 2000); // Delay to ensure game is fully loaded
        } else if (isFirstTime) {
            console.log(`BCOM: First time installation - v${currentVersion}`);
        }

        // Update stored version
        outfitStorage.settings.lastVersion = currentVersion;
        localStorage.setItem(storageKey, JSON.stringify(outfitStorage));

    } catch (error) {
        console.error("BCOM: Error checking version update", error);
    }
}

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

function initMod() {
    if (modInitialized) return;
    modInitialized = true;

    console.info("BCOM: Successfully initialized.  Version: " + VERSION_NUMBER);

            // Clean up any corrupted data in storage
        cleanupStorageData();

        // Check for version updates
        checkVersionUpdate();

    try {
        if (!window.bcModSdk?.registerMod) {
            console.error('BCOM: Mod SDK not available');
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

        const OUTFIT_PRIORITIES = {
            UI_INIT: 6,          // Higher than most UI mods
            DATA_HANDLING: 5,     // Standard priority
            OBSERVE: 0
        };

        // Initialize appearance data before any UI hooks
        modApi.hookFunction("CharacterAppearanceBuildCanvas", OUTFIT_PRIORITIES.UI_INIT, (args, next) => {
            const [C] = args;
            if (!C.Appearance) C.Appearance = [];
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

        // Controls whether to only apply hair, ignoring other items
        let hairOnly = false;

        // Controls padlock replacement - can be "None" to remove padlocks, or a specific padlock type to replace with
        let selectedPadlock = window.selectedPadlock || "Keep Original"; // "Keep Original" (preserve original), "None", or specific padlock type
        
        // Store padlock configurations for the current session
        let padlockConfigs = {
            CombinationPadlock: { CombinationNumber: "0000" },
            PasswordPadlock: { Password: "password", Hint: "Take a guess..." },
            SafewordPadlock: { Password: "password", Hint: "Take a guess..." },
            MistressTimerPadlock: { RemoveTimer: CurrentTime + (5 * 60 * 1000), TimerDuration: 5 * 60 * 1000, RemoveItem: false, EnableRandomInput: false, ShowTimer: true },
            TimerPasswordPadlock: { Password: "password", Hint: "Take a guess...", RemoveTimer: CurrentTime + (5 * 60 * 1000), TimerDuration: 5 * 60 * 1000, RemoveItem: false, EnableRandomInput: false, ShowTimer: true },
            LoversTimerPadlock: { RemoveTimer: CurrentTime + (5 * 60 * 1000), TimerDuration: 5 * 60 * 1000, RemoveItem: false, EnableRandomInput: false, ShowTimer: true }
        };

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

                const memberNumber = Player.MemberNumber;
                const storageKey = `${STORAGE_PREFIX}${memberNumber}`;
                const storageData = localStorage.getItem(storageKey);
                const outfitStorage = storageData ? JSON.parse(storageData) : { outfits: [], folders: ["Main"], settings: {} };
                if (!outfitStorage.settings) outfitStorage.settings = {};
                const isFirstTimeUse = !outfitStorage.settings.hasUsedOutfitManager;
                const pulseIntensity = isFirstTimeUse ? Math.sin(Date.now() / 500) * 0.5 + 0.5 : 0;
                const glowColor = `rgba(255, 255, 255, ${pulseIntensity * 0.5})`;

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
                let buttonContainer;
                try {
                    if (typeof ElementButton?.Create !== 'function') {
                        console.error("BCOM: ElementButton.Create not available, cannot create outfit button");
                        return next(args);
                    }

                    buttonContainer = ElementButton.Create(
                        "OutfitManagerButton",
                        function() {
                            // Always allow opening the outfit manager
                            // Store current mode before switching
                            PreviousDialogMode = DialogMenuMode;

                            // Switch to outfits mode
                            if (typeof DialogChangeMode === 'function') {
                                DialogChangeMode("outfits");
                                DialogMenuButton = [];
                            }

                            // Clean up button when entering outfit mode
                            const button = document.getElementById("OutfitManagerButton");
                            if (button) {
                                window.removeEventListener("resize", updatePositionFunction);
                                button.remove();
                            }
                        },
                        {
                            image: "Icons/Dress.png",
                            labelPosition: "bottom",
                            tooltipPosition: "right",
                            tooltip: "Outfit Manager (BCOM)",
                        }
                    );
                } catch (error) {
                    console.error("BCOM: Failed to create outfit button:", error);
                    return next(args);
                }

                // Hover effects are now handled in the remove function setup above

                // Set initial background color - always white since access is always allowed
                buttonContainer.style.backgroundColor = "white";

                // Set a high z-index to ensure button is always on top of other dialog elements
                buttonContainer.style.zIndex = "2000";
                buttonContainer.style.position = "absolute";

                // Create a single function reference for position updates
                const updatePositionFunction = () => {
                    if (typeof ElementPositionFixed === 'function' && buttonContainer) {
                        ElementPositionFixed(buttonContainer, buttonX, buttonY, BUTTON_SIZE, BUTTON_SIZE);
                        // Ensure z-index is maintained after repositioning
                        buttonContainer.style.zIndex = "2000";
                    }
                };

                // Add resize listener using our manager
                const removeResizeListener = eventListenerManager.add(window, "resize", updatePositionFunction);

                // Add hover listeners using our manager
                const removeMouseEnter = eventListenerManager.add(buttonContainer, "mouseenter", () => {
                    buttonContainer.style.backgroundColor = "cyan";
                });

                const removeMouseLeave = eventListenerManager.add(buttonContainer, "mouseleave", () => {
                    buttonContainer.style.backgroundColor = "white";
                });

                // Save the original remove method to ensure we clean up event listeners
                const originalRemove = buttonContainer.remove;
                buttonContainer.remove = function() {
                    removeResizeListener();
                    removeMouseEnter();
                    removeMouseLeave();
                    animationManager.stop("buttonGlow");
                    originalRemove.apply(this);
                };

                // Add to DOM
                dialogElement.appendChild(buttonContainer);

                // Use ElementPositionFixed after adding to DOM
                ElementPositionFixed(buttonContainer, buttonX, buttonY, BUTTON_SIZE, BUTTON_SIZE);

                // Add to button style
                if (isFirstTimeUse) {
                    const stopGlowAnimation = animationManager.start(() => {
                        if (!document.body.contains(buttonContainer)) {
                            animationManager.stop("buttonGlow");
                            return;
                        }
                        const t = Date.now() / 500;
                        const pulse = Math.sin(t) * 0.5 + 0.5; // 0 to 1
                        // Gold and white layered glow
                        const goldGlow = `0 0 32px 8px rgba(255, 215, 0, ${0.4 + 0.4 * pulse})`;
                        const whiteGlow = `0 0 48px 16px rgba(255,255,255,${0.2 + 0.3 * pulse})`;
                        buttonContainer.style.boxShadow = `${goldGlow}, ${whiteGlow}`;
                        // Optional: pulse background color
                        buttonContainer.style.backgroundColor = `rgba(255,255,255,${0.85 + 0.15 * pulse})`;
                    }, "buttonGlow");
                }

                // Add "New!" label
                if (isFirstTimeUse) {
                    const newLabel = document.createElement("div");
                    newLabel.style.position = "absolute";
                    newLabel.style.left = "50%";
                    newLabel.style.bottom = "100%";
                    newLabel.style.transform = "translateX(-50%) translateY(-8px)"; // 8px above the button
                    newLabel.style.color = "#FFD700";
                    newLabel.style.fontSize = "1.2vw"; // Responsive font size that scales with viewport width
                    newLabel.style.fontWeight = "bold";
                    newLabel.style.zIndex = "2001";
                    newLabel.textContent = "New!";
                    buttonContainer.appendChild(newLabel);
                }

                const removeClickListener = eventListenerManager.add(buttonContainer, "click", () => {
                    outfitStorage.settings.hasUsedOutfitManager = true;
                    localStorage.setItem(storageKey, JSON.stringify(outfitStorage));
                    // Remove the glow and "New!" label immediately if you want
                    buttonContainer.style.boxShadow = "";
                    buttonContainer.style.backgroundColor = "";
                    const newLabel = buttonContainer.querySelector("div");
                    if (newLabel) newLabel.remove();
                    animationManager.stop("buttonGlow");
                });
             }

             if (DialogMenuMode === "outfits") {
                 toggleDialogElements(true);
                 DrawOutfitMenu();
                 return;
             } else {
                 toggleDialogElements(false);
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

                // Handle pagination clicks
                if (totalPages > 1) {
                    const paginationY = 930;

                    // First page button click
                    if (currentPage >= 2 && MouseIn(1100, paginationY, 100, 60)) {
                        DialogOutfitPage = 0;
                        return;
                    }

                    // Previous page button click
                    if (currentPage > 0 && MouseIn(1200, paginationY, 100, 60)) {
                        DialogOutfitPage = currentPage - 1;
                        return;
                    }

                    // Next page button click
                    if (currentPage < totalPages - 1 && MouseIn(1600, paginationY, 100, 60)) {
                        DialogOutfitPage = currentPage + 1;
                        return;
                    }

                    // Last page button click
                    if (currentPage < totalPages - 2 && MouseIn(1700, paginationY, 100, 60)) {
                        DialogOutfitPage = totalPages - 1;
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
                    // Toggle apply hair
                    applyHairWithOutfit = !applyHairWithOutfit;

                    // If turning off Apply Hair, also turn off Hair Only
                    if (applyHairWithOutfit) {
                        hairOnly = false;
                    }

                    // If in export mode, update the export code to reflect the hair preference
                    if (isExportMode) {
                        const importElement = document.getElementById("OutfitManagerImport");
                        if (importElement) {
                            // Regenerate the outfit code with the current hair preference
                            // When hairOnly is true, we should include hair but also indicate we only want hair items
                            importElement.value = getCurrentOutfitBCXCode(CurrentCharacter, true, hairOnly, selectedPadlock);
                        }
                    }
                    return;
                }

                 // Hair-only button
                 if (MouseIn(1810, 439, 30, 30)) {
                     // Toggle hair only mode
                     hairOnly = !hairOnly;

                     // If turning on Hair Only, ensure Apply Hair is also on
                     if (hairOnly) {
                         applyHairWithOutfit = false;
                     }

                     // If in export mode, update the export code to reflect the hair preference
                     if (isExportMode) {
                         const importElement = document.getElementById("OutfitManagerImport");
                         if (importElement) {
                             // Regenerate the outfit code with the current hair preference
                             // When hairOnly is true, we should include hair but also indicate we only want hair items
                             importElement.value = getCurrentOutfitBCXCode(CurrentCharacter, true, hairOnly, selectedPadlock);
                         }
                     }
                     return;
                 }

                // Changelog link click (bottom right corner)
                const changelogText = "Changelog";
                const changelogY = 980;
                const changelogX = 1957;
                MainCanvas.font = "12px Arial";
                const textWidth = MainCanvas.measureText(changelogText).width;
                MainCanvas.font = "36px Arial";

                if (MouseIn(changelogX - textWidth, changelogY - 6, textWidth, 12)) {
                    window.open("https://github.com/Utsumi24/BCOM/blob/main/CHANGELOG.md", "_blank");
                    return;
                }

                // Exit button with matching coordinates
                if (MouseIn(1885, 15, 90, 90)) {
                    // Reset all outfit manager modes before exiting
                    isSortMode = false;
                    isExportMode = false;
                    isFolderManagementMode = false;
                    hairOnly = false;
                    applyHairWithOutfit = false;
                    selectedPadlock = window.selectedPadlock || "Keep Original";
                    selectedOutfits = [];

                    toggleDialogElements(false);

                    // If PreviousDialogMode is empty (like with /bcom command), just use DialogLeave()
                    // This will trigger the proper game flow and our DialogLeave hook
                    if (!PreviousDialogMode || PreviousDialogMode === "") {
                        DialogLeave();
                        return;
                    }

                    // If we're in the chatroom with a valid previous dialog mode
                    if (CurrentScreen === "ChatRoom") {
                        // Try to go back to the dialog screen
                        if (PreviousDialogMode === "dialog" || PreviousDialogMode === "items") {
                            DialogMenuMode = PreviousDialogMode;
                            if (typeof DialogChangeMode === "function") {
                                DialogChangeMode(PreviousDialogMode, true);
                            }
                            return;
                        } else {
                            // Otherwise, exit back to chatroom
                            DialogMenuBack();
                            return;
                        }
                    }

                    // Set target mode to the previous dialog mode
                    DialogMenuMode = PreviousDialogMode;

                    // Force clean change to previous dialog mode
                    if (typeof DialogChangeMode === "function") {
                        DialogChangeMode(PreviousDialogMode, true);
                    }

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

                    // Get storage first
                    const memberNumber = Player.MemberNumber;
                    const storageKey = `${STORAGE_PREFIX}${memberNumber}`;
                    const storageData = localStorage.getItem(storageKey);
                    const outfitStorage = storageData ?
                        JSON.parse(storageData) :
                        { outfits: [], folders: ["Main"], settings: {} };

                    // Add new folder functionality with validation
                    const existingFolders = outfitStorage.folders || ["Main"];
                    const folderName = InputValidator.promptForName("Enter new folder name:", 'folder', existingFolders);
                    if (folderName) {

                        if (!outfitStorage.settings) outfitStorage.settings = {};

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

                                // Prompt for new folder name with validation
                                const otherFolders = folders.filter(f => f !== outfit.name);
                                const newName = InputValidator.promptForName(
                                    `Enter new name for folder "${outfit.name}":`,
                                    'folder',
                                    otherFolders
                                );
                                if (newName) {

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
                            try {
                                // Get the raw outfit data
                                const outfitData = outfit?.data;
                                if (!outfitData) {
                                    ShowOutfitNotification("No outfit data found");
                                    return;
                                }

                                // Decompress the outfit data
                                const decompressed = LZString.decompressFromBase64(outfitData);
                                if (!decompressed) {
                                    ShowOutfitNotification("Failed to decompress outfit data");
                                    return;
                                }

                                let parsedOutfitData;
                                try {
                                    parsedOutfitData = JSON.parse(decompressed);
                                } catch (parseError) {
                                    ShowOutfitNotification("Failed to parse outfit data");
                                    return;
                                }

                                if (!parsedOutfitData || !Array.isArray(parsedOutfitData)) {
                                    ShowOutfitNotification("Invalid outfit data format");
                                    return;
                                }

                                // Apply checkbox filtering to the outfit data
                                let filteredOutfitData = [...parsedOutfitData];

                                // Apply Hair filtering
                                if (!applyHairWithOutfit) {
                                    filteredOutfitData = filteredOutfitData.filter(item => 
                                        item.Group !== "HairFront" && item.Group !== "HairBack"
                                    );
                                }

                                // Apply Hair Only filtering
                                if (hairOnly) {
                                    filteredOutfitData = filteredOutfitData.filter(item => 
                                        item.Group === "HairFront" || item.Group === "HairBack"
                                    );
                                }

                                // Apply padlock filtering/replacement
                                                                        if (selectedPadlock && selectedPadlock !== "Keep Original") {
                                    filteredOutfitData = filteredOutfitData.map(item => {
                                        // Skip items without properties only if we're removing padlocks
                                        if (!item.Property && selectedPadlock === "None") return item;

                                        const filteredItem = { ...item };
                                        let itemProperty = item.Property ? { ...item.Property } : {};

                                        if (selectedPadlock === "None") {
                                            // Remove padlock-related properties
                                            delete itemProperty.LockedBy;
                                            delete itemProperty.LockMemberNumber;
                                            delete itemProperty.RemoveTimer;
                                            delete itemProperty.MaxTimer;
                                            delete itemProperty.MemberNumberList;
                                            delete itemProperty.CombinationNumber;
                                            delete itemProperty.Password;
                                            delete itemProperty.LockPickSeed;
                                            delete itemProperty.RemoveItem;
                                            delete itemProperty.Name; // DOGS mod DeviousPadlock

                                            // If no properties remain, remove the Property field
                                            if (Object.keys(itemProperty).length === 0) {
                                                delete filteredItem.Property;
                                            } else {
                                                filteredItem.Property = itemProperty;
                                            }
                                        } else {
                                                                        // Add or replace with selected padlock type
                                            itemProperty.LockedBy = selectedPadlock;
                                            itemProperty.LockMemberNumber = Player.MemberNumber; // Set to current player
                                            
                                            // Ensure Effect array includes "Lock"
                                            if (!itemProperty.Effect) itemProperty.Effect = [];
                                            if (!itemProperty.Effect.includes("Lock")) {
                                                itemProperty.Effect.push("Lock");
                                            }
                                
                                // Clear properties that don't apply to the new lock type
                                delete itemProperty.LockPickSeed;
                                delete itemProperty.Name; // DOGS mod DeviousPadlock
                                
                                // Handle special properties based on new padlock type
                                if (selectedPadlock === "CombinationPadlock") {
                                    itemProperty.CombinationNumber = padlockConfigs.CombinationPadlock.CombinationNumber;
                                    delete itemProperty.Password;
                                } else if (selectedPadlock === "PasswordPadlock" || selectedPadlock === "SafewordPadlock") {
                                    itemProperty.Password = padlockConfigs[selectedPadlock].Password;
                                    if (padlockConfigs[selectedPadlock].Hint) {
                                        itemProperty.Hint = padlockConfigs[selectedPadlock].Hint;
                                    }
                                    delete itemProperty.CombinationNumber;
                                } else if (selectedPadlock === "MistressTimerPadlock" || selectedPadlock === "LoversTimerPadlock") {
                                    const timerConfig = padlockConfigs[selectedPadlock];
                                    if (timerConfig.TimerDuration > 0) {
                                        itemProperty.RemoveTimer = CurrentTime + timerConfig.TimerDuration;
                                    }
                                    // Handle random RemoveItem setting
                                    if (timerConfig.RemoveItem === "random") {
                                        itemProperty.RemoveItem = Math.random() < 0.4; // 40% chance
                                    } else {
                                        itemProperty.RemoveItem = timerConfig.RemoveItem;
                                    }
                                    itemProperty.EnableRandomInput = timerConfig.EnableRandomInput;
                                    itemProperty.ShowTimer = timerConfig.ShowTimer;
                                    delete itemProperty.Password;
                                    delete itemProperty.CombinationNumber;
                                } else if (selectedPadlock === "TimerPasswordPadlock") {
                                    itemProperty.Password = padlockConfigs.TimerPasswordPadlock.Password;
                                    if (padlockConfigs.TimerPasswordPadlock.Hint) {
                                        itemProperty.Hint = padlockConfigs.TimerPasswordPadlock.Hint;
                                    }
                                    if (padlockConfigs.TimerPasswordPadlock.TimerDuration > 0) {
                                        itemProperty.RemoveTimer = CurrentTime + padlockConfigs.TimerPasswordPadlock.TimerDuration;
                                    }
                                    // Handle random RemoveItem setting
                                    if (padlockConfigs.TimerPasswordPadlock.RemoveItem === "random") {
                                        itemProperty.RemoveItem = Math.random() < 0.4; // 40% chance
                                    } else {
                                        itemProperty.RemoveItem = padlockConfigs.TimerPasswordPadlock.RemoveItem;
                                    }
                                    itemProperty.EnableRandomInput = padlockConfigs.TimerPasswordPadlock.EnableRandomInput;
                                    itemProperty.ShowTimer = padlockConfigs.TimerPasswordPadlock.ShowTimer;
                                    delete itemProperty.CombinationNumber;
                                } else {
                                    delete itemProperty.CombinationNumber;
                                    delete itemProperty.Password;
                                }
                                            
                                            filteredItem.Property = itemProperty;
                                        }

                                        return filteredItem;
                                    });
                                }

                                // Generate the export code
                                const exportCode = LZString.compressToBase64(JSON.stringify(filteredOutfitData));
                                
                                if (exportCode && typeof navigator?.clipboard?.writeText === 'function') {
                                    navigator.clipboard.writeText(exportCode)
                                        .then(() => ShowOutfitNotification(`"${outfit.name}" copied`))
                                        .catch(() => ShowOutfitNotification("Copy failed"));
                                } else {
                                    ShowOutfitNotification("Export not available");
                                }
                            } catch (error) {
                                console.error("Export failed:", error);
                                ShowOutfitNotification("Export failed");
                            }
                            return;
                        }
                    } else {
                        // Rename button
                        if (MouseIn(1150, yPos + 5, 50, 50)) {
                            try {
                                // Get storage
                                const memberNumber = Player.MemberNumber;
                                const storageKey = `${STORAGE_PREFIX}${memberNumber}`;
                                const storageData = localStorage.getItem(storageKey);
                                if (!storageData) {
                                    ErrorHandler.showError('No outfit data found for renaming.');
                                    return;
                                }

                                const outfitStorage = JSON.parse(storageData);
                                let outfitIndex = outfitStorage.outfits.findIndex(o => o.name === outfit.name);
                                if (outfitIndex === -1) {
                                    ErrorHandler.showError('Could not find outfit to rename.');
                                    return;
                                }

                                // Get existing outfit names for validation (excluding the current outfit)
                                const existingNames = outfitStorage.outfits
                                    .filter(o => o.name !== outfit.name)
                                    .map(o => o.name);

                                // Prompt with validation
                                const newName = InputValidator.promptForName(
                                    `Enter new name for outfit "${outfit.name}":`,
                                    'outfit',
                                    existingNames
                                );
                                if (!newName) return; // User cancelled or validation failed

                                // Check if new name already exists (secondary check)
                                const existingOutfit = outfitStorage.outfits.find(o => o.name === newName);
                                if (existingOutfit) {
                                    if (!confirm(`Outfit "${newName}" already exists. Do you want to overwrite it?`)) {
                                        return;
                                    }
                                    // Remove existing outfit with same name
                                    const existingIndex = outfitStorage.outfits.findIndex(o => o.name === newName);
                                    if (existingIndex >= 0) {
                                        outfitStorage.outfits.splice(existingIndex, 1);
                                        // Update outfitIndex if necessary
                                        if (existingIndex < outfitIndex) {
                                            outfitIndex--;
                                        }
                                    }
                                }

                                // Validate outfitIndex is still valid after potential deletion
                                if (outfitIndex >= 0 && outfitIndex < outfitStorage.outfits.length) {
                                    // Update the name
                                    outfitStorage.outfits[outfitIndex].name = newName;
                                } else {
                                    ErrorHandler.showError('Outfit index became invalid during rename operation.');
                                    return;
                                }

                                // Save back to storage
                                localStorage.setItem(storageKey, JSON.stringify(outfitStorage));
                                ShowOutfitNotification(`Outfit renamed to "${newName}"`);

                            } catch (error) {
                                ErrorHandler.showError(
                                    'Failed to rename outfit. The outfit data may be corrupted.',
                                    error
                                );
                            }
                            return;
                        }

                        // Outfit button
                        if (MouseIn(1210, yPos, 490, 60)) {
                            // Check permission before applying outfit
                            const hasPermission = CurrentCharacter.MemberNumber === Player.MemberNumber || CurrentCharacter.AllowItem;
                            if (!hasPermission) {
                                ShowOutfitNotification("You don't have permission to apply outfits to this character");
                                return;
                            }

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
                    // Always allow opening the outfit manager
                    PreviousDialogMode = DialogMenuMode;
                    DialogChangeMode("outfits");
                    DialogMenuButton = [];
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
                // We're exiting outfit mode - clean up and let the original function handle the transition
                const importElement = document.getElementById("OutfitManagerImport");
                if (importElement) {
                    importElement.remove();
                }
            }

            // Always call the original function for proper dialog flow
            return next(args);
        });

        // Input validation and sanitization
        const InputValidator = {
            // Validation rules
            rules: {
                maxNameLength: 50,
                maxFolderLength: 30,
                reservedNames: ['main', 'default', 'temp', 'backup', 'export', 'import'],
                forbiddenChars: /[<>:"/\\|?*\x00-\x1f]/g // Windows forbidden chars + control chars
            },

            sanitizeName(name) {
                if (!name || typeof name !== 'string') return '';

                // Remove forbidden characters and trim
                return name.replace(this.rules.forbiddenChars, '').trim();
            },

            validateName(name, type = 'outfit') {
                const maxLength = type === 'folder' ? this.rules.maxFolderLength : this.rules.maxNameLength;
                const sanitized = this.sanitizeName(name);

                if (!sanitized) {
                    return { valid: false, error: `Please enter a valid ${type} name.` };
                }

                if (sanitized.length > maxLength) {
                    return {
                        valid: false,
                        error: `${type === 'folder' ? 'Folder' : 'Outfit'} name must be ${maxLength} characters or less.`
                    };
                }

                if (this.rules.reservedNames.includes(sanitized.toLowerCase())) {
                    return {
                        valid: false,
                        error: `"${sanitized}" is a reserved name. Please choose a different name.`
                    };
                }

                return { valid: true, sanitized };
            },



            promptForName(message, type = 'outfit', existingNames = []) {
                let attempts = 0;
                const maxAttempts = 3;

                while (attempts < maxAttempts) {
                    const input = prompt(message);
                    if (input === null) return null; // User cancelled

                    const validation = this.validateName(input, type);
                    if (!validation.valid) {
                        alert(validation.error);
                        attempts++;
                        continue;
                    }

                    // Check for duplicates
                    if (existingNames.includes(validation.sanitized)) {
                        if (type === 'folder') {
                            alert(`Folder "${validation.sanitized}" already exists. Please choose a different name.`);
                        } else {
                            // For outfits, we allow overwriting, so we don't block here
                            return validation.sanitized;
                        }
                        attempts++;
                        continue;
                    }

                    return validation.sanitized;
                }

                ErrorHandler.showError(`Failed to get valid ${type} name after ${maxAttempts} attempts.`);
                return null;
            }
        };

        // Function to create a custom input modal with character counter
        function createInputModal(title, description, currentValue = "", maxLength = 140, placeholder = "", inputType = "textarea") {
            return new Promise((resolve) => {
                // Create modal overlay
                const overlay = document.createElement('div');
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                `;
                
                // Create modal content
                const modal = document.createElement('div');
                modal.style.cssText = `
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    max-width: 400px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                `;
                
                // Create content
                const inputElement = inputType === "textarea" ? 
                    `<textarea id="modalInput" style="
                        width: 100%;
                        height: 80px;
                        padding: 8px;
                        border: 2px solid #ddd;
                        border-radius: 4px;
                        font-family: Arial, sans-serif;
                        font-size: 14px;
                        resize: vertical;
                        box-sizing: border-box;
                    " placeholder="${placeholder}">${currentValue}</textarea>` :
                    `<input type="text" id="modalInput" style="
                        width: 100%;
                        padding: 8px;
                        border: 2px solid #ddd;
                        border-radius: 4px;
                        font-family: Arial, sans-serif;
                        font-size: 14px;
                        box-sizing: border-box;
                    " placeholder="${placeholder}" value="${currentValue}">`;
                
                modal.innerHTML = `
                    <h3 style="margin-top: 0; color: #333; font-family: Arial, sans-serif;">${title}</h3>
                    <p style="color: #666; margin: 10px 0; font-family: Arial, sans-serif; font-size: 14px;">${description}</p>
                    ${inputElement}
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; flex-wrap: wrap;">
                        <span id="charCounter" style="color: #666; font-size: 12px; font-family: Arial, sans-serif;">0 / ${maxLength} characters</span>
                        <div style="margin-top: 5px;">
                            <button id="hintCancel" style="
                                padding: 10px 16px;
                                margin-right: 8px;
                                background: #f0f0f0;
                                border: 1px solid #ccc;
                                border-radius: 4px;
                                cursor: pointer;
                                font-family: Arial, sans-serif;
                                font-size: 14px;
                                min-width: 70px;
                            ">Cancel</button>
                            <button id="hintOk" style="
                                padding: 10px 16px;
                                background: #007bff;
                                color: white;
                                border: 1px solid #007bff;
                                border-radius: 4px;
                                cursor: pointer;
                                font-family: Arial, sans-serif;
                                font-size: 14px;
                                min-width: 70px;
                            ">OK</button>
                        </div>
                    </div>
                `;
                
                overlay.appendChild(modal);
                document.body.appendChild(overlay);
                
                const inputField = modal.querySelector('#modalInput');
                const charCounter = modal.querySelector('#charCounter');
                const okButton = modal.querySelector('#hintOk');
                const cancelButton = modal.querySelector('#hintCancel');
                
                // Update character counter
                function updateCounter() {
                    const length = inputField.value.length;
                    charCounter.textContent = `${length} / ${maxLength} characters`;
                    
                    if (length > maxLength) {
                        charCounter.style.color = '#dc3545';
                        inputField.style.borderColor = '#dc3545';
                        okButton.disabled = true;
                        okButton.style.opacity = '0.5';
                        okButton.style.cursor = 'not-allowed';
                    } else {
                        charCounter.style.color = '#666';
                        inputField.style.borderColor = '#ddd';
                        okButton.disabled = false;
                        okButton.style.opacity = '1';
                        okButton.style.cursor = 'pointer';
                    }
                }
                
                // Event listeners
                inputField.addEventListener('input', updateCounter);
                
                okButton.addEventListener('click', () => {
                    if (inputField.value.length <= maxLength) {
                        resolve(inputField.value);
                        document.body.removeChild(overlay);
                    }
                });
                
                cancelButton.addEventListener('click', () => {
                    resolve(null);
                    document.body.removeChild(overlay);
                });
                
                // Close on overlay click
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        resolve(null);
                        document.body.removeChild(overlay);
                    }
                });
                
                // Focus input field and update counter
                inputField.focus();
                inputField.setSelectionRange(inputField.value.length, inputField.value.length);
                updateCounter();
            });
        }

        // Function to create a timer configuration modal
        function createTimerModal(padlockType, currentConfig = {}) {
            return new Promise((resolve) => {
                // Determine max time based on padlock type
                const maxHours = padlockType === "LoversTimerPadlock" ? 168 : 4; // 7 days vs 4 hours
                const lockTypeName = padlockType.replace("TimerPadlock", "").replace("Padlock", "");
                
                // Create hour options based on lock type
                const hourOptions = [];
                for (let i = 0; i <= maxHours; i++) {
                    hourOptions.push(i);
                }
                
                // Minute options (include 5 for BC default, then 15-minute increments)
                const minuteOptions = [0, 5, 15, 30, 45];
                
                // Parse current config or use defaults
                let currentHours = 0; // Default to 0 hours
                let currentMinutes = 5; // Default to 5 minutes (BC default)
                
                if (currentConfig.RemoveTimer && currentConfig.RemoveTimer > CurrentTime) {
                    const remainingMs = currentConfig.RemoveTimer - CurrentTime;
                    currentHours = Math.floor(remainingMs / (60 * 60 * 1000));
                    currentMinutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
                    
                    // Round minutes to nearest available option (5, 15, 30, 45)
                    const availableMinutes = [0, 5, 15, 30, 45];
                    currentMinutes = availableMinutes.reduce((prev, curr) => 
                        Math.abs(curr - currentMinutes) < Math.abs(prev - currentMinutes) ? curr : prev
                    );
                    if (currentMinutes >= 60) {
                        currentHours += Math.floor(currentMinutes / 60);
                        currentMinutes = currentMinutes % 60;
                    }
                    
                    // Ensure we don't exceed max hours
                    if (currentHours > maxHours) {
                        currentHours = maxHours;
                        currentMinutes = 0;
                    }
                }
                
                // Create modal overlay
                const overlay = document.createElement('div');
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                `;
                
                // Create modal content
                const modal = document.createElement('div');
                modal.style.cssText = `
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    max-width: 450px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                `;
                
                // Create hour dropdown options
                const hourOptionsHTML = hourOptions.map(h => 
                    `<option value="${h}" ${h === currentHours ? 'selected' : ''}>${h}</option>`
                ).join('');
                
                // Create minute dropdown options
                const minuteOptionsHTML = minuteOptions.map(m => 
                    `<option value="${m}" ${m === currentMinutes ? 'selected' : ''}>${m}</option>`
                ).join('');
                
                modal.innerHTML = `
                    <h3 style="margin-top: 0; color: #333; font-family: Arial, sans-serif;">${lockTypeName} Timer Configuration</h3>
                    <p style="color: #666; margin: 10px 0; font-family: Arial, sans-serif; font-size: 14px;">
                        Configure the timer settings for this lock (max ${maxHours === 168 ? '7 days' : '4 hours'})
                    </p>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Timer Duration:</label>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <select id="timerHours" style="
                                padding: 8px;
                                border: 2px solid #ddd;
                                border-radius: 4px;
                                font-family: Arial, sans-serif;
                                font-size: 14px;
                                background: white;
                            ">
                                ${hourOptionsHTML}
                            </select>
                            <span style="color: #666;">hours</span>
                            <select id="timerMinutes" style="
                                padding: 8px;
                                border: 2px solid #ddd;
                                border-radius: 4px;
                                font-family: Arial, sans-serif;
                                font-size: 14px;
                                background: white;
                            ">
                                ${minuteOptionsHTML}
                            </select>
                            <span style="color: #666;">minutes</span>
                        </div>
                        ${maxHours === 4 ? '' : `<div id="totalTime" style="
                            margin-top: 8px;
                            padding: 8px;
                            background: #f8f9fa;
                            border-radius: 4px;
                            font-weight: bold;
                            color: #007bff;
                            font-size: 14px;
                        ">Total: 0 hours 5 minutes</div>`}
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" id="removeItem" ${currentConfig.RemoveItem === true || (currentConfig.RemoveItem === undefined && (padlockType === "MistressTimerPadlock" || padlockType === "LoversTimerPadlock")) ? 'checked' : ''} style="margin-right: 8px;">
                            <span style="color: #333; font-size: 14px;">Remove item when timer expires</span>
                        </label>
                    </div>
                    
                    <div style="margin-bottom: 15px; margin-left: 16px;">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" id="randomizeRemoval" ${currentConfig.RemoveItem === "random" ? 'checked' : ''} style="margin-right: 8px;">
                            <span style="color: #666; font-size: 13px;">Randomize item removal</span>
                        </label>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" id="enableRandomInput" ${currentConfig.EnableRandomInput !== false ? 'checked' : ''} style="margin-right: 8px;">
                            <span style="color: #333; font-size: 14px;">Enable random input from others</span>
                        </label>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" id="showTimer" ${currentConfig.ShowTimer !== false ? 'checked' : ''} style="margin-right: 8px;">
                            <span style="color: #333; font-size: 14px;">Show timer to wearer</span>
                        </label>
                    </div>
                    
                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button id="timerCancel" style="
                            padding: 10px 16px;
                            background: #f0f0f0;
                            border: 1px solid #ccc;
                            border-radius: 4px;
                            cursor: pointer;
                            font-family: Arial, sans-serif;
                            font-size: 14px;
                            min-width: 70px;
                        ">Cancel</button>
                        <button id="timerOk" style="
                            padding: 10px 16px;
                            background: #007bff;
                            color: white;
                            border: 1px solid #007bff;
                            border-radius: 4px;
                            cursor: pointer;
                            font-family: Arial, sans-serif;
                            font-size: 14px;
                            min-width: 70px;
                        ">OK</button>
                    </div>
                `;
                
                overlay.appendChild(modal);
                document.body.appendChild(overlay);
                
                const hoursSelect = modal.querySelector('#timerHours');
                const minutesSelect = modal.querySelector('#timerMinutes');
                const totalTimeDiv = modal.querySelector('#totalTime');
                const removeItemCheckbox = modal.querySelector('#removeItem');
                const randomizeRemovalCheckbox = modal.querySelector('#randomizeRemoval');
                const enableRandomInputCheckbox = modal.querySelector('#enableRandomInput');
                const showTimerCheckbox = modal.querySelector('#showTimer');
                const okButton = modal.querySelector('#timerOk');
                const cancelButton = modal.querySelector('#timerCancel');
                
                // Function to update total time display and enforce limits
                function updateTotalTime() {
                    let hours = parseInt(hoursSelect.value);
                    let minutes = parseInt(minutesSelect.value);
                    
                    // Enforce max time limits for non-Lovers locks
                    if (maxHours === 4) { // MistressTimerPadlock or TimerPasswordPadlock
                        const totalMinutes = hours * 60 + minutes;
                        if (totalMinutes > 240) { // 4 hours = 240 minutes
                            // Reset to 4 hours exactly
                            hours = 4;
                            minutes = 0;
                            hoursSelect.value = hours;
                            minutesSelect.value = minutes;
                        }
                        // No time display for 4-hour locks - just return after enforcement
                        return;
                    }
                    
                    // Enforce max time limits for LoversTimer padlock (7 days = 168 hours)
                    if (maxHours === 168) { // LoversTimerPadlock
                        const totalMinutes = hours * 60 + minutes;
                        if (totalMinutes > 10080) { // 7 days = 10080 minutes
                            // Reset to 7 days exactly
                            hours = 168;
                            minutes = 0;
                            hoursSelect.value = hours;
                            minutesSelect.value = minutes;
                        }
                    }
                    
                    // Only update display for LoversTimer padlock
                    if (!totalTimeDiv) return;
                    
                    let timeText = "";
                    if (hours === 0 && minutes === 0) {
                        timeText = "No timer set";
                        totalTimeDiv.style.color = "#dc3545";
                    } else {
                        const parts = [];
                        
                        // For LoversTimer padlock, show days when >= 24 hours
                        if (padlockType === "LoversTimerPadlock" && hours >= 24) {
                            const days = Math.floor(hours / 24);
                            const remainingHours = hours % 24;
                            
                            if (days > 0) {
                                parts.push(`${days} day${days !== 1 ? 's' : ''}`);
                            }
                            if (remainingHours > 0) {
                                parts.push(`${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`);
                            }
                            if (minutes > 0) {
                                parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
                            }
                        } else {
                            // Standard hours/minutes display
                            if (hours > 0) {
                                parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
                            }
                            if (minutes > 0) {
                                parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
                            }
                        }
                        
                        timeText = `Total: ${parts.join(' ')}`;
                        totalTimeDiv.style.color = "#007bff";
                    }
                    
                    totalTimeDiv.textContent = timeText;
                }
                
                // Event listeners for real-time updates
                hoursSelect.addEventListener('change', updateTotalTime);
                minutesSelect.addEventListener('change', updateTotalTime);
                
                // Initialize total time display
                updateTotalTime();
                
                // Handle checkbox interactions - ensure mutual exclusion
                removeItemCheckbox.addEventListener('click', () => {
                    if (removeItemCheckbox.checked) {
                        randomizeRemovalCheckbox.checked = false;
                    }
                });
                
                randomizeRemovalCheckbox.addEventListener('click', () => {
                    if (randomizeRemovalCheckbox.checked) {
                        removeItemCheckbox.checked = false;
                    }
                });
                
                okButton.addEventListener('click', () => {
                    const hours = parseInt(hoursSelect.value);
                    const minutes = parseInt(minutesSelect.value);
                    const totalMinutes = hours * 60 + minutes;
                    
                    if (totalMinutes < 5) {
                        alert("Timer must be at least 5 minutes.");
                        return;
                    }
                    
                    const totalMs = (hours * 60 + minutes) * 60 * 1000;
                    
                    let removeItemValue;
                    if (randomizeRemovalCheckbox.checked) {
                        removeItemValue = "random";
                    } else {
                        removeItemValue = removeItemCheckbox.checked;
                    }
                    
                    const result = {
                        RemoveTimer: CurrentTime + totalMs,
                        TimerDuration: totalMs, // Store duration for reuse when applying outfits
                        RemoveItem: removeItemValue,
                        EnableRandomInput: enableRandomInputCheckbox.checked,
                        ShowTimer: showTimerCheckbox.checked
                    };
                    
                    resolve(result);
                    document.body.removeChild(overlay);
                });
                
                cancelButton.addEventListener('click', () => {
                    resolve(currentConfig);
                    document.body.removeChild(overlay);
                });
                
                // Close on overlay click
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        resolve(currentConfig);
                        document.body.removeChild(overlay);
                    }
                });
                
                // Focus OK button
                okButton.focus();
            });
        }

        // Function to create a password configuration modal
        function createPasswordModal(padlockType, currentConfig = {}) {
            return new Promise((resolve) => {
                const lockTypeName = padlockType.replace("Padlock", "");
                
                // Create modal overlay
                const overlay = document.createElement('div');
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                `;
                
                // Create modal content
                const modal = document.createElement('div');
                modal.style.cssText = `
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    max-width: 450px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                `;
                
                modal.innerHTML = `
                    <h3 style="margin-top: 0; color: #333; font-family: Arial, sans-serif;">${lockTypeName} Configuration</h3>
                    <p style="color: #666; margin: 10px 0; font-family: Arial, sans-serif; font-size: 14px;">
                        Configure the password and hint for this lock
                    </p>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Password (4-8 characters):</label>
                        <input type="text" id="passwordInput" style="
                            width: 100%;
                            padding: 8px;
                            border: 2px solid #ddd;
                            border-radius: 4px;
                            font-family: Arial, sans-serif;
                            font-size: 14px;
                            box-sizing: border-box;
                        " placeholder="password" value="">
                        <div id="passwordCounter" style="
                            margin-top: 5px;
                            color: #666;
                            font-size: 12px;
                            font-family: Arial, sans-serif;
                        ">0 / 8 characters</div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Hint (optional, max 140 characters):</label>
                        <textarea id="hintInput" style="
                            width: 100%;
                            height: 80px;
                            padding: 8px;
                            border: 2px solid #ddd;
                            border-radius: 4px;
                            font-family: Arial, sans-serif;
                            font-size: 14px;
                            resize: vertical;
                            box-sizing: border-box;
                        " placeholder="Take a guess..."></textarea>
                        <div id="hintCounter" style="
                            margin-top: 5px;
                            color: #666;
                            font-size: 12px;
                            font-family: Arial, sans-serif;
                        ">0 / 140 characters</div>
                    </div>
                    
                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button id="passwordCancel" style="
                            padding: 10px 16px;
                            background: #f0f0f0;
                            border: 1px solid #ccc;
                            border-radius: 4px;
                            cursor: pointer;
                            font-family: Arial, sans-serif;
                            font-size: 14px;
                            min-width: 70px;
                        ">Cancel</button>
                        <button id="passwordOk" style="
                            padding: 10px 16px;
                            background: #007bff;
                            color: white;
                            border: 1px solid #007bff;
                            border-radius: 4px;
                            cursor: pointer;
                            font-family: Arial, sans-serif;
                            font-size: 14px;
                            min-width: 70px;
                        ">OK</button>
                    </div>
                `;
                
                overlay.appendChild(modal);
                document.body.appendChild(overlay);
                
                const passwordInput = modal.querySelector('#passwordInput');
                const hintInput = modal.querySelector('#hintInput');
                const passwordCounter = modal.querySelector('#passwordCounter');
                const hintCounter = modal.querySelector('#hintCounter');
                const okButton = modal.querySelector('#passwordOk');
                const cancelButton = modal.querySelector('#passwordCancel');
                
                // Update password counter and validation
                function updatePasswordCounter() {
                    const length = passwordInput.value.length;
                    passwordCounter.textContent = `${length} / 8 characters`;
                    
                    if (length < 4) {
                        passwordCounter.style.color = '#dc3545';
                        passwordInput.style.borderColor = '#dc3545';
                        okButton.disabled = true;
                        okButton.style.opacity = '0.5';
                        okButton.style.cursor = 'not-allowed';
                    } else if (length > 8) {
                        passwordCounter.style.color = '#dc3545';
                        passwordInput.style.borderColor = '#dc3545';
                        okButton.disabled = true;
                        okButton.style.opacity = '0.5';
                        okButton.style.cursor = 'not-allowed';
                    } else {
                        passwordCounter.style.color = '#28a745';
                        passwordInput.style.borderColor = '#28a745';
                        okButton.disabled = false;
                        okButton.style.opacity = '1';
                        okButton.style.cursor = 'pointer';
                    }
                }
                
                // Update hint counter
                function updateHintCounter() {
                    const length = hintInput.value.length;
                    hintCounter.textContent = `${length} / 140 characters`;
                    
                    if (length > 140) {
                        hintCounter.style.color = '#dc3545';
                        hintInput.style.borderColor = '#dc3545';
                        okButton.disabled = true;
                        okButton.style.opacity = '0.5';
                        okButton.style.cursor = 'not-allowed';
                    } else {
                        hintCounter.style.color = '#666';
                        hintInput.style.borderColor = '#ddd';
                        // Only enable if password is also valid
                        updatePasswordCounter();
                    }
                }
                
                // Event listeners
                passwordInput.addEventListener('input', updatePasswordCounter);
                hintInput.addEventListener('input', updateHintCounter);
                
                okButton.addEventListener('click', () => {
                    const password = passwordInput.value.trim();
                    const hint = hintInput.value.trim();
                    
                    if (password.length >= 4 && password.length <= 8 && hint.length <= 140) {
                        const result = {
                            Password: password || "password",
                            Hint: hint || "Take a guess..."
                        };
                        resolve(result);
                        document.body.removeChild(overlay);
                    }
                });
                
                cancelButton.addEventListener('click', () => {
                    resolve(null);
                    document.body.removeChild(overlay);
                });
                
                // Close on overlay click
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        resolve(null);
                        document.body.removeChild(overlay);
                    }
                });
                
                // Initialize counters and focus password field
                updatePasswordCounter();
                updateHintCounter();
                passwordInput.focus();
                passwordInput.setSelectionRange(passwordInput.value.length, passwordInput.value.length);
            });
        }

        // Function to create a timer password configuration modal
        function createTimerPasswordModal(padlockType, currentConfig = {}) {
            return new Promise((resolve) => {
                // Determine max time based on padlock type (should be 4 hours for TimerPasswordPadlock)
                const maxHours = 4;
                const lockTypeName = padlockType.replace("Padlock", "");
                
                // Create hour options
                const hourOptions = [];
                for (let i = 0; i <= maxHours; i++) {
                    hourOptions.push(i);
                }
                
                // Minute options (include 5 for BC default, then 15-minute increments)
                const minuteOptions = [0, 5, 15, 30, 45];
                
                // Parse current config or use defaults
                let currentHours = 0;
                let currentMinutes = 5;
                
                if (currentConfig.RemoveTimer && currentConfig.RemoveTimer > CurrentTime) {
                    const remainingMs = currentConfig.RemoveTimer - CurrentTime;
                    currentHours = Math.floor(remainingMs / (60 * 60 * 1000));
                    currentMinutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
                    
                    // Round minutes to nearest available option
                    const availableMinutes = [0, 5, 15, 30, 45];
                    currentMinutes = availableMinutes.reduce((prev, curr) => 
                        Math.abs(curr - currentMinutes) < Math.abs(prev - currentMinutes) ? curr : prev
                    );
                    if (currentMinutes >= 60) {
                        currentHours += Math.floor(currentMinutes / 60);
                        currentMinutes = currentMinutes % 60;
                    }
                    
                    // Ensure we don't exceed max hours
                    if (currentHours > maxHours) {
                        currentHours = maxHours;
                        currentMinutes = 0;
                    }
                }
                
                // Create modal overlay
                const overlay = document.createElement('div');
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                `;
                
                // Create modal content
                const modal = document.createElement('div');
                modal.style.cssText = `
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    max-width: 500px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                `;
                
                // Create hour dropdown options
                const hourOptionsHTML = hourOptions.map(h => 
                    `<option value="${h}" ${h === currentHours ? 'selected' : ''}>${h}</option>`
                ).join('');
                
                // Create minute dropdown options
                const minuteOptionsHTML = minuteOptions.map(m => 
                    `<option value="${m}" ${m === currentMinutes ? 'selected' : ''}>${m}</option>`
                ).join('');
                
                modal.innerHTML = `
                    <h3 style="margin-top: 0; color: #333; font-family: Arial, sans-serif;">${lockTypeName} Configuration</h3>
                    <p style="color: #666; margin: 10px 0; font-family: Arial, sans-serif; font-size: 14px;">
                        Configure password, hint, and timer settings for this lock (max 4 hours)
                    </p>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Password (4-8 characters):</label>
                        <input type="text" id="passwordInput" style="
                            width: 100%;
                            padding: 8px;
                            border: 2px solid #ddd;
                            border-radius: 4px;
                            font-family: Arial, sans-serif;
                            font-size: 14px;
                            box-sizing: border-box;
                        " placeholder="password" value="">
                        <div id="passwordCounter" style="
                            margin-top: 5px;
                            color: #666;
                            font-size: 12px;
                            font-family: Arial, sans-serif;
                        ">0 / 8 characters</div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Hint (optional, max 140 characters):</label>
                        <textarea id="hintInput" style="
                            width: 100%;
                            height: 60px;
                            padding: 8px;
                            border: 2px solid #ddd;
                            border-radius: 4px;
                            font-family: Arial, sans-serif;
                            font-size: 14px;
                            resize: vertical;
                            box-sizing: border-box;
                        " placeholder="Take a guess..."></textarea>
                        <div id="hintCounter" style="
                            margin-top: 5px;
                            color: #666;
                            font-size: 12px;
                            font-family: Arial, sans-serif;
                        ">0 / 140 characters</div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #333;">Timer Duration:</label>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <select id="timerHours" style="
                                padding: 8px;
                                border: 2px solid #ddd;
                                border-radius: 4px;
                                font-family: Arial, sans-serif;
                                font-size: 14px;
                                background: white;
                            ">
                                ${hourOptionsHTML}
                            </select>
                            <span style="color: #666;">hours</span>
                            <select id="timerMinutes" style="
                                padding: 8px;
                                border: 2px solid #ddd;
                                border-radius: 4px;
                                font-family: Arial, sans-serif;
                                font-size: 14px;
                                background: white;
                            ">
                                ${minuteOptionsHTML}
                            </select>
                            <span style="color: #666;">minutes</span>
                        </div>

                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" id="removeItem" ${currentConfig.RemoveItem === true || currentConfig.RemoveItem === undefined ? 'checked' : ''} style="margin-right: 8px;">
                            <span style="color: #333; font-size: 14px;">Remove item when timer expires</span>
                        </label>
                    </div>
                    
                    <div style="margin-bottom: 15px; margin-left: 16px;">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" id="randomizeRemoval" ${currentConfig.RemoveItem === "random" ? 'checked' : ''} style="margin-right: 8px;">
                            <span style="color: #666; font-size: 13px;">Randomize item removal</span>
                        </label>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" id="enableRandomInput" ${currentConfig.EnableRandomInput !== false ? 'checked' : ''} style="margin-right: 8px;">
                            <span style="color: #333; font-size: 14px;">Enable random input from others</span>
                        </label>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" id="showTimer" ${currentConfig.ShowTimer !== false ? 'checked' : ''} style="margin-right: 8px;">
                            <span style="color: #333; font-size: 14px;">Show timer to wearer</span>
                        </label>
                    </div>
                    
                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button id="timerPasswordCancel" style="
                            padding: 10px 16px;
                            background: #f0f0f0;
                            border: 1px solid #ccc;
                            border-radius: 4px;
                            cursor: pointer;
                            font-family: Arial, sans-serif;
                            font-size: 14px;
                            min-width: 70px;
                        ">Cancel</button>
                        <button id="timerPasswordOk" style="
                            padding: 10px 16px;
                            background: #007bff;
                            color: white;
                            border: 1px solid #007bff;
                            border-radius: 4px;
                            cursor: pointer;
                            font-family: Arial, sans-serif;
                            font-size: 14px;
                            min-width: 70px;
                        ">OK</button>
                    </div>
                `;
                
                overlay.appendChild(modal);
                document.body.appendChild(overlay);
                
                const passwordInput = modal.querySelector('#passwordInput');
                const hintInput = modal.querySelector('#hintInput');
                const hoursSelect = modal.querySelector('#timerHours');
                const minutesSelect = modal.querySelector('#timerMinutes');
                const passwordCounter = modal.querySelector('#passwordCounter');
                const hintCounter = modal.querySelector('#hintCounter');
                const removeItemCheckbox = modal.querySelector('#removeItem');
                const randomizeRemovalCheckbox = modal.querySelector('#randomizeRemoval');
                const enableRandomInputCheckbox = modal.querySelector('#enableRandomInput');
                const showTimerCheckbox = modal.querySelector('#showTimer');
                const okButton = modal.querySelector('#timerPasswordOk');
                const cancelButton = modal.querySelector('#timerPasswordCancel');
                
                // Update password counter and validation
                function updatePasswordCounter() {
                    const length = passwordInput.value.length;
                    passwordCounter.textContent = `${length} / 8 characters`;
                    
                    if (length < 4) {
                        passwordCounter.style.color = '#dc3545';
                        passwordInput.style.borderColor = '#dc3545';
                        updateOkButton();
                    } else if (length > 8) {
                        passwordCounter.style.color = '#dc3545';
                        passwordInput.style.borderColor = '#dc3545';
                        updateOkButton();
                    } else {
                        passwordCounter.style.color = '#28a745';
                        passwordInput.style.borderColor = '#28a745';
                        updateOkButton();
                    }
                }
                
                // Update hint counter
                function updateHintCounter() {
                    const length = hintInput.value.length;
                    hintCounter.textContent = `${length} / 140 characters`;
                    
                    if (length > 140) {
                        hintCounter.style.color = '#dc3545';
                        hintInput.style.borderColor = '#dc3545';
                        updateOkButton();
                    } else {
                        hintCounter.style.color = '#666';
                        hintInput.style.borderColor = '#ddd';
                        updateOkButton();
                    }
                }
                
                // Update total time and enforce limits
                function updateTotalTime() {
                    let hours = parseInt(hoursSelect.value);
                    let minutes = parseInt(minutesSelect.value);
                    
                    // Enforce 4-hour limit
                    const totalMinutes = hours * 60 + minutes;
                    if (totalMinutes > 240) { // 4 hours = 240 minutes
                        // Reset to 4 hours exactly
                        hours = 4;
                        minutes = 0;
                        hoursSelect.value = hours;
                        minutesSelect.value = minutes;
                    }
                    
                    updateOkButton();
                }
                
                // Update OK button state based on all validations
                function updateOkButton() {
                    const passwordLength = passwordInput.value.length;
                    const hintLength = hintInput.value.length;
                    const hours = parseInt(hoursSelect.value);
                    const minutes = parseInt(minutesSelect.value);
                    
                    const totalMinutes = hours * 60 + minutes;
                    const isValid = passwordLength >= 4 && passwordLength <= 8 && 
                                   hintLength <= 140 && 
                                   totalMinutes >= 5;
                    
                    if (isValid) {
                        okButton.disabled = false;
                        okButton.style.opacity = '1';
                        okButton.style.cursor = 'pointer';
                    } else {
                        okButton.disabled = true;
                        okButton.style.opacity = '0.5';
                        okButton.style.cursor = 'not-allowed';
                    }
                }
                
                // Event listeners
                passwordInput.addEventListener('input', updatePasswordCounter);
                hintInput.addEventListener('input', updateHintCounter);
                hoursSelect.addEventListener('change', updateTotalTime);
                minutesSelect.addEventListener('change', updateTotalTime);
                
                // Initialize displays
                updatePasswordCounter();
                updateHintCounter();
                updateTotalTime();
                
                // Handle checkbox interactions - ensure mutual exclusion
                removeItemCheckbox.addEventListener('click', () => {
                    if (removeItemCheckbox.checked) {
                        randomizeRemovalCheckbox.checked = false;
                    }
                });
                
                randomizeRemovalCheckbox.addEventListener('click', () => {
                    if (randomizeRemovalCheckbox.checked) {
                        removeItemCheckbox.checked = false;
                    }
                });
                
                okButton.addEventListener('click', () => {
                    const password = passwordInput.value.trim();
                    const hint = hintInput.value.trim();
                    const hours = parseInt(hoursSelect.value);
                    const minutes = parseInt(minutesSelect.value);
                    
                    const totalMinutes = hours * 60 + minutes;
                    if (password.length >= 4 && password.length <= 8 && 
                        hint.length <= 140 && 
                        totalMinutes >= 5) {
                        
                        const totalMs = (hours * 60 + minutes) * 60 * 1000;
                        
                        let removeItemValue;
                        if (randomizeRemovalCheckbox.checked) {
                            removeItemValue = "random";
                        } else {
                            removeItemValue = removeItemCheckbox.checked;
                        }
                        
                        const result = {
                            Password: password || "password",
                            Hint: hint || "Take a guess...",
                            RemoveTimer: CurrentTime + totalMs,
                            TimerDuration: totalMs, // Store duration for reuse when applying outfits
                            RemoveItem: removeItemValue,
                            EnableRandomInput: enableRandomInputCheckbox.checked,
                            ShowTimer: showTimerCheckbox.checked
                        };
                        
                        resolve(result);
                        document.body.removeChild(overlay);
                    }
                });
                
                cancelButton.addEventListener('click', () => {
                    resolve(currentConfig);
                    document.body.removeChild(overlay);
                });
                
                // Close on overlay click
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        resolve(currentConfig);
                        document.body.removeChild(overlay);
                    }
                });
                
                // Focus password field
                passwordInput.focus();
                passwordInput.setSelectionRange(passwordInput.value.length, passwordInput.value.length);
            });
        }

        // Function to configure special padlock properties
        async function configurePadlockProperties(padlockType) {
            if (!padlockConfigs[padlockType]) return;
            
            const config = {...padlockConfigs[padlockType]};
            let configChanged = false;
            
            switch(padlockType) {
                case "CombinationPadlock":
                    const combo = await createInputModal(
                        "Combination Padlock", 
                        "Enter a 4-digit combination (numbers only)",
                        "", // Empty current value so it shows as placeholder
                        4,
                        "0000",
                        "input"
                    );
                    if (combo !== null) {
                        // Ensure it's exactly 4 digits, pad with zeros if needed
                        const validCombo = combo.replace(/\D/g, '').padStart(4, '0').slice(0, 4);
                        config.CombinationNumber = validCombo;
                        configChanged = true;
                    } else {
                        // User cancelled - ensure we have defaults
                        config.CombinationNumber = "0000";
                        configChanged = true;
                    }
                    break;
                    
                case "PasswordPadlock":
                case "SafewordPadlock":
                    const passwordResult = await createPasswordModal(padlockType, config);
                    if (passwordResult !== null) {
                        Object.assign(config, passwordResult);
                        configChanged = true;
                    } else {
                        // User cancelled - set defaults
                        config.Password = "password";
                        config.Hint = "Take a guess...";
                        configChanged = true;
                    }
                    break;
                    
                case "TimerPasswordPadlock":
                    const timerPasswordResult = await createTimerPasswordModal(padlockType, config);
                    if (timerPasswordResult !== null) {
                        Object.assign(config, timerPasswordResult);
                        configChanged = true;
                    } else {
                        // User cancelled - set all defaults
                        config.Password = "password";
                        config.Hint = "Take a guess...";
                        config.RemoveTimer = CurrentTime + (5 * 60 * 1000);
                        config.TimerDuration = 5 * 60 * 1000;
                        config.RemoveItem = true; // Default to true for timer padlocks
                        config.EnableRandomInput = false;
                        config.ShowTimer = true;
                        configChanged = true;
                    }
                    break;
                    
                case "MistressTimerPadlock":
                case "LoversTimerPadlock":
                    const timerModalResult = await createTimerModal(padlockType, config);
                    if (timerModalResult !== null) {
                        Object.assign(config, timerModalResult);
                        configChanged = true;
                    } else {
                        // User cancelled - use defaults
                        config.RemoveTimer = CurrentTime + (5 * 60 * 1000);
                        config.TimerDuration = 5 * 60 * 1000;
                        config.RemoveItem = true; // Default to true for timer padlocks
                        config.EnableRandomInput = false;
                        config.ShowTimer = true;
                        configChanged = true;
                    }
                    break;
            }
            
            // Save the configuration if it was changed
            if (configChanged) {
                padlockConfigs[padlockType] = config;
                ShowOutfitNotification(`${padlockType} configured`);
            }
        }

        // Enhanced error handling with user-friendly messages
        const ErrorHandler = {
            showError(message, details = null, isRecoverable = true) {
                // Always log technical details for debugging
                if (details) {
                    console.error("BCOM Error:", details);
                }

                // Show user-friendly message
                if (isRecoverable) {
                    ShowOutfitNotification(message, 5); // Longer duration for errors
                } else {
                    // For critical errors, still use alert but with helpful message
                    alert(`Outfit Manager Error: ${message}\n\nCheck the browser console for technical details.`);
                }
            },

            validateBCXCode(code) {
                if (!code || !code.trim()) {
                    return { valid: false, error: "Please enter a BCX outfit code before importing." };
                }

                try {
                    const decompressed = LZString.decompressFromBase64(code.trim());
                    if (!decompressed) {
                        return {
                            valid: false,
                            error: "Invalid code format. Check you copied the complete code."
                        };
                    }

                    if (!decompressed.startsWith('[')) {
                        return {
                            valid: false,
                            error: "Not a valid BCX outfit code. Use compatible BCX codes only."
                        };
                    }

                    const outfitData = JSON.parse(decompressed);
                    if (!Array.isArray(outfitData)) {
                        return {
                            valid: false,
                            error: "Code is corrupted or incomplete. Try copying it again."
                        };
                    }

                    if (!outfitData.every(item => item.Name && item.Group)) {
                        return {
                            valid: false,
                            error: "Code contains invalid items. May be incompatible or corrupted."
                        };
                    }

                    return { valid: true, data: outfitData };

                } catch (error) {
                    return {
                        valid: false,
                        error: "Failed to process. Code may be corrupted or incompatible.",
                        details: error
                    };
                }
            }
        };

        // Add this function to handle BCX imports
        function ImportBCXOutfit() {
            const importElement = document.getElementById("OutfitManagerImport");
            try {
                if (!importElement || !importElement.value) {
                    ErrorHandler.showError("Please enter a BCX outfit code before importing.");
                    if (importElement) importElement.value = "";
                    return;
                }

                // Validate the BCX code
                const validation = ErrorHandler.validateBCXCode(importElement.value);
                if (!validation.valid) {
                    ErrorHandler.showError(validation.error, validation.details);
                    importElement.value = "";
                    return;
                }

                const outfitData = validation.data;

                // Detect if it's a hair-only outfit
                const isHairOnlyOutfit = outfitData.length > 0 && outfitData.every(item =>
                    item.Group === "HairFront" || item.Group === "HairBack"
                );

                // Get outfit name
                let outfitName;
                do {
                    // Include [Hair] indicator in prompt if it's hair-only
                    const promptText = isHairOnlyOutfit
                        ? "Enter name for imported hair outfit (will be saved as Hair Only):"
                        : "Enter name for imported outfit:";

                    outfitName = prompt(promptText);
                    if (outfitName === null) { // User clicked Cancel
                        importElement.value = "";
                        return;
                    }
                } while (!outfitName.trim()); // Keep prompting if empty or only whitespace

                // Apply the BCX outfit data to a temporary character for saving
                const tempChar = CharacterLoadSimple("ImportTempChar");
                if (!tempChar) return;

                // Set the BCX data directly to the character
                tempChar.Appearance = [];
                for (const item of outfitData) {
                    // Validate item data
                    if (!item || !item.Group || !item.Name) {
                        console.warn("BCOM: Skipping invalid item:", item);
                        continue;
                    }

                    const asset = AssetGet(tempChar.AssetFamily, item.Group, item.Name);
                    if (!asset) {
                        console.warn(`BCOM: Asset not found: ${item.Group}/${item.Name}`);
                        continue;
                    }

                    // Double-check asset validity
                    if (!asset.Name || !asset.Group) {
                        console.warn("BCOM: Invalid asset structure:", asset);
                        continue;
                    }

                    // Create appearance item
                    const appearanceItem = {
                        Asset: asset,
                        Color: item.Color || "Default",
                        Property: item.Property || {},
                    };

                    tempChar.Appearance.push(appearanceItem);
                }

                // Update the character canvas to ensure the appearance is processed
                try {
                    CharacterLoadCanvas(tempChar);
                } catch (canvasError) {
                    console.warn("BCOM: Error loading character canvas:", canvasError);
                    // Continue with import even if canvas loading fails
                }

                // Temporarily set hairOnly flag if this is a hair-only outfit
                const originalHairOnly = hairOnly;
                if (isHairOnlyOutfit) {
                    hairOnly = true;
                }

                // Save the outfit using the existing SaveOutfit function
                SaveOutfit(tempChar, outfitName);

                // Restore original hairOnly value
                hairOnly = originalHairOnly;

                // Clear the import field
                importElement.value = "";

            } catch (error) {
                ErrorHandler.showError(
                    "Failed to import. Check the code is complete and try again.",
                    error
                );
                if (importElement) importElement.value = "";
            }
        }

        // Define these outside the DrawOutfitMenu function
        const DEFAULT_HELP_TEXT = [
            "Outfit Manager Help:",
            "",
            `• Up to ${MAX_OUTFITS} outfits can be saved`,
            "• Left click an outfit to wear it",
            "• Use the 'Rename' button (✎) to rename an outfit",
            "• Use the 'Delete' button (🗑️) to remove an outfit",
            "• The 'Save' button stores current appearance as",
            "  a new outfit",
            "• Saving with an existing name will prompt",
            "  you to overwrite the outfit",
            "• Use the 'Import' button to import an outfit",
            "  from BCX codes",
            "• Toggle the 'Apply Hair' checkbox to include",
            "  hairstyles when applying an outfit",
            "• The ✂️ icon denotes a hair-only outfit",
            "• Check the 'Hair Only' box to only save",
            "  hairstyles as an outfit. Checking this box",
            "  will only apply hairstyles if an outfit",
            "  contains other clothing or restraints",
            "• Use the 'Padlocks' dropdown to change",
            "  the padlock for the chosen outfit"
        ];

        // Add this function to calculate remaining outfit slots
        function getRemainingOutfitSlots() {
            try {
                const memberNumber = Player.MemberNumber;
                const storageKey = `${STORAGE_PREFIX}${memberNumber}`;
                const storageData = localStorage.getItem(storageKey);

                if (!storageData) return MAX_OUTFITS;

                const outfitStorage = JSON.parse(storageData);
                const currentOutfits = outfitStorage.outfits?.length || 0;
                return Math.max(0, MAX_OUTFITS - currentOutfits);
            } catch (error) {
                console.error('Failed to calculate remaining slots:', error);
                return MAX_OUTFITS;
            }
        }

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
            "• Checking the 'Hair Only' checkbox will",
            "  only export hair styles",
            "• The 'Padlocks' dropdown affects exported codes",
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

        // Function to determine color based on remaining slots
        function getRemainingSlotsColor(remaining) {
            if (remaining > 20) return "LimeGreen"; // plenty left
            if (remaining > 5) return "Yellow";       // getting low
            return "Red";                           // almost full
        }

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
                const currentOutfitCode = getCurrentOutfitBCXCode(CurrentCharacter, applyHairWithOutfit, hairOnly, selectedPadlock);
                if (importElement) {
                    importElement.value = currentOutfitCode;
                    importElement.readOnly = true;
                }
            } else {
                if (importElement) {
                    importElement.readOnly = false;
                }
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
            DrawButton(1885, 215, 90, 90, "", "White", "Icons/Download.png", "Import outfits from backup file");

            // Hair checkbox - positioned outside the main window
            DrawTextFit("Apply Hair?", 1868, 345, 120, "White", "Black");
            DrawButton(1810, 367, 30, 30, "", "White");
            if (applyHairWithOutfit) {
                DrawImageResize("Icons/Checked.png", 1815, 372, 20, 20);
            }

            // Hair-only button
            DrawTextFit("Hair Only", 1868, 425, 120, "White", "Black");
            DrawButton(1810, 439, 30, 30, "", "White");
            if (hairOnly) {
                DrawImageResize("Icons/Checked.png", 1815, 442, 20, 20);
            }

            // Padlock Replacement dropdown
            DrawTextFit("Padlocks:", 1868, 497, 120, "White", "Black");
            
            // Create or update the padlock dropdown
            const padlockDropdownId = "PadlockReplacementDropdown";
            let padlockDropdown = document.getElementById(padlockDropdownId);
            
            // Dynamic padlock options based on relationships and permissions
            function getAvailablePadlockOptions() {
                const baseOptions = [
                    "Keep Original",
                    "None",
                    "MetalPadlock",
                    "ExclusivePadlock",                     
                    "TimerPadlock",
                    "MistressPadlock",
                    "MistressTimerPadlock",          
                    "IntricatePadlock",
                    "HighSecurityPadlock",
                    "CombinationPadlock",
                    "SafewordPadlock",
                    "PasswordPadlock",
                    "TimerPasswordPadlock"
                ];
                
                // Helper function to check if a padlock is blocked by permissions
                function isPadlockAllowed(padlockType) {
                    try {
                        // Check if character has item permissions
                        const itemPermissions = CurrentCharacter?.PermissionItems;
                        if (!itemPermissions) {
                            return true; // No restrictions set
                        }
                        
                        // Create the permission key for this padlock
                        const permissionKey = `ItemMisc/${padlockType}`;
                        
                        // Check if this specific padlock has permissions set
                        const padlockPermission = itemPermissions[permissionKey];
                        if (padlockPermission) {
                            // Check if the padlock is blocked
                            if (padlockPermission.Permission === "Block") {
                                return false;
                            }
                            
                            // Check if the padlock is limited (also restrict it for safety)
                            if (padlockPermission.Permission === "Limited") {
                                return false;
                            }
                        }
                        
                        return true;
                    } catch (error) {
                        console.log("BCOM: Error checking padlock permissions:", error);
                        return true; // Default to allowed if we can't check
                    }
                }
                
                // Filter base options by permissions
                const allowedBaseOptions = baseOptions.filter(option => {
                    if (option === "Keep Original" || option === "None") return true;
                    return isPadlockAllowed(option);
                });
                
                // Add relationship-specific padlocks using BC's built-in functions
                // For lovers: use BC's built-in function
                if (typeof DialogCanUseLoverLockOn === 'function' && 
                    DialogCanUseLoverLockOn(CurrentCharacter)) {
                    if (isPadlockAllowed("LoversPadlock")) {
                        allowedBaseOptions.push("LoversPadlock");
                    }
                    if (isPadlockAllowed("LoversTimerPadlock")) {
                        allowedBaseOptions.push("LoversTimerPadlock");
                    }
                }
                
                // For owner: use BC's built-in function
                if (typeof DialogCanUseOwnerLockOn === 'function' && 
                    DialogCanUseOwnerLockOn(CurrentCharacter) && 
                    isPadlockAllowed("OwnerPadlock")) {
                    allowedBaseOptions.push("OwnerPadlock");
                }
                
                return allowedBaseOptions;
            }
            
            const padlockOptions = getAvailablePadlockOptions();
            
            // Validate that selectedPadlock is still available for the current character
            if (!padlockOptions.includes(selectedPadlock)) {
                selectedPadlock = "Keep Original"; // Reset to default if current selection is not available
                window.selectedPadlock = selectedPadlock; // Persist for session
            }
            
            if (!padlockDropdown) {
                try {
                    padlockDropdown = ElementCreateDropdown(
                        padlockDropdownId,
                        padlockOptions,
                        function(event) {
                            selectedPadlock = event.target.value;
                            window.selectedPadlock = selectedPadlock; // Persist for session
                            
                            // Configure special padlocks when selected
                            const specialPadlocks = ["CombinationPadlock", "PasswordPadlock", "SafewordPadlock", "MistressTimerPadlock", "TimerPasswordPadlock", "LoversTimerPadlock"];
                            if (specialPadlocks.includes(selectedPadlock)) {
                                // Use setTimeout to allow the dropdown to update first
                                setTimeout(() => {
                                    configurePadlockProperties(selectedPadlock);
                                }, 100);
                            }
                            
                            // If in export mode, update the export code to reflect the padlock preference
                            if (isExportMode) {
                                const importElement = document.getElementById("OutfitManagerImport");
                                if (importElement) {
                                    importElement.value = getCurrentOutfitBCXCode(CurrentCharacter, applyHairWithOutfit, hairOnly, selectedPadlock);
                                }
                            }
                        }
                    );
                    padlockDropdown.value = selectedPadlock;
                    
                    // Enhanced styling for better visibility and usability
                    padlockDropdown.style.fontSize = "14px";
                    padlockDropdown.style.backgroundColor = "white";
                    padlockDropdown.style.border = "1px solid #666";
                    padlockDropdown.style.borderRadius = "2px";
                    padlockDropdown.style.color = "black";
                    padlockDropdown.style.fontFamily = "Arial, sans-serif";
                    padlockDropdown.style.padding = "2px";
                    padlockDropdown.style.zIndex = "1000";
                    
                    // Add hover effects
                    padlockDropdown.addEventListener("mouseenter", function() {
                        this.style.backgroundColor = "#f0f0f0";
                        this.style.borderColor = "#666";
                    });
                    
                    padlockDropdown.addEventListener("mouseleave", function() {
                        this.style.backgroundColor = "white";
                        this.style.borderColor = "#333";
                    });
                } catch (error) {
                    console.error("Failed to create padlock dropdown:", error);
                    // Fallback to text display
                    DrawTextFit(selectedPadlock, 1868, 517, 120, "LightGray", "Black");
                }
            }
            
            // Position the dropdown if it exists
            if (padlockDropdown && typeof ElementPosition === 'function') {
                // ElementPosition uses center coordinates, so adjust X to center the 160px wide dropdown
                // For left edge at 1810, center should be at 1810 + (160/2) = 1890
                ElementPosition(padlockDropdownId, 1890, 525, 160, 24);
                padlockDropdown.value = selectedPadlock; // Ensure current selection is displayed
                
                // Apply styling without overriding position - let ElementPosition handle positioning
                padlockDropdown.style.fontSize = "14px";
                padlockDropdown.style.backgroundColor = "white";
                padlockDropdown.style.border = "1px solid #666";
                padlockDropdown.style.borderRadius = "2px";
                padlockDropdown.style.color = "black";
                padlockDropdown.style.fontFamily = "Arial, sans-serif";
                padlockDropdown.style.padding = "2px";
                padlockDropdown.style.zIndex = "1000";
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

            // 1. Create the bundle from the current character
            const appearanceBundle = ServerAppearanceBundle(CurrentCharacter.Appearance);

            // 2. Create the dummy character
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
                Name: ""  // Clear the name
            };

            // 3. Load the bundle onto the dummy character
            ServerAppearanceLoadFromBundle(
                displayChar,
                CurrentCharacter.AssetFamily,
                appearanceBundle,
                CurrentCharacter.MemberNumber
            );

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
                        // Only check for locked items in default mode and when hair only mode is not enabled
                        if (!isSortMode && !isExportMode && !isFolderManagementMode && !hairOnly && outfit?.data) {
                            const decompressed = LZString.decompressFromBase64(outfit.data);
                            if (!decompressed) {
                                throw new Error("Failed to decompress outfit data");
                            }

                            const outfitData = JSON.parse(decompressed);
                            if (!outfitData || !Array.isArray(outfitData)) {
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
                        try {
                            LoadOutfit(displayChar, outfit.name);
                            CharacterLoadCanvas(displayChar);
                        } catch (previewError) {
                            console.warn("BCOM: Error loading outfit preview:", previewError);
                            // Restore original appearance if preview fails
                            try {
                                if (typeof ServerAppearanceBundle === 'function' && typeof ServerAppearanceLoadFromBundle === 'function') {
                                    const appearanceBundle = ServerAppearanceBundle(CurrentCharacter.Appearance);
                                    ServerAppearanceLoadFromBundle(
                                        displayChar,
                                        CurrentCharacter.AssetFamily,
                                        appearanceBundle,
                                        CurrentCharacter.MemberNumber
                                    );
                                    CharacterLoadCanvas(displayChar);
                                }
                            } catch (restoreError) {
                                console.warn("BCOM: Error restoring character appearance:", restoreError);
                            }
                        }

                    } catch (error) {
                        console.error("Failed to load outfit data:", error);
                    }
                }

                // Add hair icon prefix for hair-only outfits
                const prefix = outfit.isHairOnly ? "✂️ " : "";

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
                    DrawButton(1210, yPos, 490, 60, `${outfitNumber}. ${prefix}${outfit.name}`, "White");
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
                    DrawButton(1210, yPos, 490, 60, `${outfitNumber}. ${prefix}${outfit.name}`, "White");
                } else if (isExportMode) {
                    // Calculate outfit number (exclude folders from numbering)
                    const outfitNumber = i + 1 - folderEntries.length;
                    DrawButton(1210, yPos, 490, 60, `${outfitNumber}. ${prefix}${outfit.name}`, "White");
                    // Export button instead of delete
                    DrawButton(1710, yPos + 5, 50, 50, "📋", "White", "", "Copy outfit code");
                } else {
                    // Normal mode - rename/delete buttons
                    DrawButton(1150, yPos + 5, 50, 50, "✎", "White", "", "Rename outfit");

                    // Calculate outfit number (exclude folders from numbering)
                    const outfitNumber = i + 1 - folderEntries.length;

                    // Check permission to apply outfits to current character (only in normal mode)
                    const hasPermission = CurrentCharacter.MemberNumber === Player.MemberNumber || CurrentCharacter.AllowItem;
                    const outfitButtonColor = hasPermission ? "White" : "Pink";

                    DrawButton(1210, yPos, 490, 60, `${outfitNumber}. ${prefix}${outfit.name}`, outfitButtonColor);
                    DrawButton(1710, yPos + 5, 50, 50, "🗑️", "White", "", "Delete outfit");
                }
            }

            // If not hovering any outfit, restore help text and original appearance
            if (!isHoveringAnyOutfit) {
                try {
                    if (typeof ServerAppearanceBundle === 'function' && typeof ServerAppearanceLoadFromBundle === 'function') {
                        const appearanceBundle = ServerAppearanceBundle(CurrentCharacter.Appearance);
                        ServerAppearanceLoadFromBundle(
                            displayChar,
                            CurrentCharacter.AssetFamily,
                            appearanceBundle,
                            CurrentCharacter.MemberNumber
                        );
                        displayChar.Pose = CurrentCharacter.Pose ? [...CurrentCharacter.Pose] : [];  // Copy current poses
                        if (typeof CharacterLoadCanvas === 'function') {
                            CharacterLoadCanvas(displayChar);
                        }
                    }
                } catch (error) {
                    console.error("BCOM: Error restoring character appearance:", error);
                }
            }
            /*if (!isHoveringAnyOutfit) {
                displayChar.Appearance = CurrentCharacter.Appearance.map(item => ({
                    ...item,
                    Property: item.Property ? { ...item.Property } : undefined,
                    Craft: item.Craft ? { ...item.Craft } : undefined,
                    Color: Array.isArray(item.Color) ? [...item.Color] : item.Color
                }));  // Deep copy
                displayChar.Pose = CurrentCharacter.Pose ? [...CurrentCharacter.Pose] : [];  // Copy current poses
                CharacterLoadCanvas(displayChar);
            }*/

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

            let y = 150;
            helpText.forEach((text, i) => {
                DrawText(text, 25, y, "White", "Black");
                y += 25;
                if (text.includes("Up to")) {
                    // Insert the dynamic line right after the max outfits line
                    const remaining = getRemainingOutfitSlots();
                    const color = getRemainingSlotsColor(remaining);
                    const prefix = "• You have ";
                    const numberText = `${remaining}`;
                    const suffix = " outfit slots remaining";
                    let x = 25;
                    // Draw prefix
                    DrawText(prefix, x, y, "White", "Black");
                    x += MainCanvas.measureText(prefix).width;
                    // Draw number in color
                    DrawText(numberText, x, y, color, "Black");
                    x += MainCanvas.measureText(numberText).width;
                    // Draw suffix
                    DrawText(suffix, x, y, "White", "Black");
                    y += 25;
                }
            });
            MainCanvas.textAlign = "center";
            MainCanvas.font = originalFont;

            // Pagination buttons - centered in the box
            if (totalPages > 1) {
                const paginationY = 930;

                // First page button - only show if on page 3 or higher
                if (currentPage >= 2) {
                    DrawButton(1100, paginationY, 100, 60, "First", "White");
                }

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

                // Last page button - only show if not on the last or second-to-last page
                if (currentPage < totalPages - 2) {
                    DrawButton(1700, paginationY, 100, 60, "Last", "White");
                }
            }

            // Draw version text and changelog link
            MainCanvas.font = "12px Arial";
            MainCanvas.textAlign = "right";
            DrawText(`v${VERSION_NUMBER}`, 1957, 965, "White", "Black");

            // Draw clickable changelog link below version
            const changelogText = "Changelog";
            const changelogY = 980;
            const changelogX = 1957;

            // Check if mouse is hovering over the changelog link
            const textWidth = MainCanvas.measureText(changelogText).width;
            const isHoveringChangelog = MouseIn(changelogX - textWidth, changelogY - 6, textWidth, 12);

            // Draw changelog text with hover effect
            DrawText(changelogText, changelogX, changelogY, isHoveringChangelog ? "Cyan" : "LightGray", "Black");

            // Add underline when hovering
            if (isHoveringChangelog) {
                DrawRect(changelogX - textWidth, changelogY + 1, textWidth, 1, "Cyan");
            }

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
            let outfitName;

            if (name) {
                // Validate provided name
                const validation = InputValidator.validateName(name, 'outfit');
                if (!validation.valid) {
                    ErrorHandler.showError(validation.error);
                    return;
                }
                outfitName = validation.sanitized;
            } else {
                // Get existing outfit names for validation
                const memberNumber = Player.MemberNumber;
                const storageKey = `${STORAGE_PREFIX}${memberNumber}`;
                const storageData = localStorage.getItem(storageKey);
                const existingNames = storageData ?
                    JSON.parse(storageData).outfits?.map(o => o.name) || [] : [];

                // Prompt with validation
                outfitName = InputValidator.promptForName("Enter outfit name:", 'outfit', existingNames);
                if (!outfitName) return; // User cancelled or validation failed
            }

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

                // Check outfit limit (MAX_OUTFITS maximum)
                if (outfitStorage.outfits.length >= MAX_OUTFITS && !outfitStorage.outfits.some(o => o.name === outfitName)) {
                    ShowOutfitNotification(`Maximum outfit limit (${MAX_OUTFITS}) reached. Please delete some outfits first.`);
                        return;
                    }

                // First check for outfit with same name in ANY folder
                const sameNameOutfits = outfitStorage.outfits.filter(o => o.name === outfitName);
                let overwriteIndex = -1;

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
                        overwriteIndex = existingIndex;
                    } else {
                        // Outfit exists in different folder(s) - prevent saving with same name
                        const otherFolders = sameNameOutfits.map(o => o.folder || "Main").join(", ");
                        alert(`An outfit named "${outfitName}" already exists in folder(s): ${otherFolders}.\nPlease choose a different name.`);
                        return;
                    }
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
                    ErrorHandler.showError("No clothing or restraints found to save as an outfit.");
                    return;
                }

                // Create the outfit object
                const newOutfit = {
                    name: outfitName,
                    folder: currentFolder,
                    isHairOnly: hairOnly,
                    data: LZString.compressToBase64(JSON.stringify(outfitData))
                };

                // If overwriting, replace at same index; otherwise add to end
                if (overwriteIndex >= 0) {
                    outfitStorage.outfits[overwriteIndex] = newOutfit;
                    const hairOnlyIndicator = newOutfit.isHairOnly ? " [Hair]" : "";
                    ShowOutfitNotification(`Outfit "${outfitName}${hairOnlyIndicator}" has been overwritten`);
                } else {
                    // Add the outfit with the current folder
                    outfitStorage.outfits.push(newOutfit);
                    const hairOnlyIndicator = newOutfit.isHairOnly ? " [Hair]" : "";
                    ShowOutfitNotification(`Outfit "${outfitName}${hairOnlyIndicator}" has been saved to folder "${currentFolder}"`);
                }

                // Save the outfitStorage object uncompressed
                localStorage.setItem(storageKey, JSON.stringify(outfitStorage));

            } catch (error) {
                ErrorHandler.showError(
                    "Failed to save outfit. This might be due to storage limitations or corrupted data.",
                    error,
                    false // Non-recoverable error
                );
            }
        }

        function LoadOutfit(C, outfitName) {
            try {
                if (!outfitName || !C) {
                    console.error("LoadOutfit called with invalid parameters:", {outfitName, C});
                    return false;
                }

                const memberNumber = Player?.MemberNumber;
                if (!memberNumber) {
                    console.error("LoadOutfit: Player member number not available");
                    return false;
                }

                const storageKey = `${STORAGE_PREFIX}${memberNumber}`;

                // Get storage
                const storageData = localStorage.getItem(storageKey);
                if (!storageData) return false;

                const outfitStorage = JSON.parse(storageData);

                const outfit = outfitStorage?.outfits?.find(o => o.name === outfitName);

                if (!outfit || !outfit.data) {
                    console.error("No outfit found with name or no data:", outfitName);
                    return false;
                }

                // Decompress the outfit data
                const decompressed = LZString.decompressFromBase64(outfit.data);
                if (!decompressed) {
                    console.error("Failed to decompress outfit data");
                    return false;
                }

                const outfitData = JSON.parse(decompressed);
                if (!outfitData || !Array.isArray(outfitData)) {
                    console.error("No valid outfit data found");
                    return false;
                }

                // Use the outfit's stored isHairOnly flag or the global hairOnly setting
                // This allows applying just the hair from any outfit if the checkbox is checked
                const isHairOnlyOutfit = outfit.isHairOnly || hairOnly;

                // Special handling for Hair Only mode - only replace hair items, keep everything else
                if (isHairOnlyOutfit) {
                    // Check if outfit has any hair items
                    const hasHairItems = outfitData.some(item =>
                        item.Group === "HairFront" || item.Group === "HairBack"
                    );

                    // Only remove existing hair if we have hair items to replace them with
                    if (hasHairItems) {
                        for (let A = C.Appearance.length - 1; A >= 0; A--) {
                            const item = C.Appearance[A];
                            if ((item.Asset.Group.Name === "HairFront" || item.Asset.Group.Name === "HairBack") &&
                                !InventoryItemHasEffect(InventoryGet(C, item.Asset.Group.Name), "Lock")) {
                                C.Appearance.splice(A, 1);
                            }
                        }

                        // Add hair items from the outfit
                        for (const item of outfitData) {
                            // Only process hair items
                            if (item.Group !== "HairFront" && item.Group !== "HairBack") continue;

                            // Validate item data
                            if (!item || !item.Group || !item.Name) {
                                console.warn("BCOM: Skipping invalid hair item in LoadOutfit:", item);
                                continue;
                            }

                            const asset = AssetGet(C.AssetFamily, item.Group, item.Name);
                            if (!asset) {
                                console.warn(`BCOM: Hair asset not found in LoadOutfit: ${item.Group}/${item.Name}`);
                                continue;
                            }

                            // Double-check asset validity
                            if (!asset.Name || !asset.Group) {
                                console.warn("BCOM: Invalid hair asset structure in LoadOutfit:", asset);
                                continue;
                            }

                            // Skip if the group is locked
                            if (InventoryItemHasEffect(InventoryGet(C, item.Group), "Lock")) continue;

                            const bondageSkill = Player.Skill.find(skill => skill.Type === "Bondage");

                            // Handle padlock replacement/removal for Hair Only mode
                            let itemProperty = item.Property ? {...item.Property} : undefined;
                            if (selectedPadlock && selectedPadlock !== "Keep Original" && itemProperty) {
                                if (selectedPadlock === "None") {
                                    // Remove all padlock-related properties
                                    delete itemProperty.LockedBy;
                                    delete itemProperty.LockMemberNumber;
                                    delete itemProperty.RemoveTimer;
                                    delete itemProperty.MaxTimer;
                                    delete itemProperty.MemberNumberList;
                                    delete itemProperty.CombinationNumber;
                                    delete itemProperty.Password;
                                    delete itemProperty.LockPickSeed;
                                    delete itemProperty.RemoveItem;
                                    delete itemProperty.Name; // DOGS mod DeviousPadlock
                                    
                                    // If no properties remain, set to undefined
                                    if (Object.keys(itemProperty).length === 0) {
                                        itemProperty = undefined;
                                    }
                                } else {
                                                                // Add or replace with selected padlock type
                                itemProperty.LockedBy = selectedPadlock;
                                itemProperty.LockMemberNumber = Player.MemberNumber; // Set to current player
                                
                                // Ensure Effect array includes "Lock"
                                if (!itemProperty.Effect) itemProperty.Effect = [];
                                if (!itemProperty.Effect.includes("Lock")) {
                                    itemProperty.Effect.push("Lock");
                                }
                                
                                // Clear properties that don't apply to the new lock type
                                delete itemProperty.LockPickSeed;
                                delete itemProperty.Name; // DOGS mod DeviousPadlock
                                
                                // Handle special properties based on new padlock type
                                if (selectedPadlock === "CombinationPadlock") {
                                    if (!itemProperty.CombinationNumber) {
                                                itemProperty.CombinationNumber = "0000";
                                            }
                                            delete itemProperty.Password;   
                                        } else if (selectedPadlock === "PasswordPadlock" || selectedPadlock === "SafewordPadlock") {
                                            if (!itemProperty.Password) {
                                                itemProperty.Password = "password";
                                            }
                                            delete itemProperty.CombinationNumber;
                                        } else if (selectedPadlock === "MistressTimerPadlock" || selectedPadlock === "LoversTimerPadlock") {
                                            const timerConfig = padlockConfigs[selectedPadlock];
                                            if (timerConfig.TimerDuration > 0) {
                                                itemProperty.RemoveTimer = CurrentTime + timerConfig.TimerDuration;
                                            }
                                            itemProperty.RemoveItem = timerConfig.RemoveItem;
                                            itemProperty.EnableRandomInput = timerConfig.EnableRandomInput;
                                            itemProperty.ShowTimer = timerConfig.ShowTimer;
                                            delete itemProperty.Password;
                                            delete itemProperty.CombinationNumber;
                                        } else if (selectedPadlock === "TimerPasswordPadlock") {
                                            if (!itemProperty.Password) {
                                                itemProperty.Password = "password";
                                            }
                                            delete itemProperty.CombinationNumber;
                                        } else {
                                            delete itemProperty.CombinationNumber;
                                            delete itemProperty.Password;
                                        }
                                    }
                                }

                            const newItem = {
                                Asset: asset,
                                Color: item.Color || "Default",
                                Property: itemProperty,
                                Difficulty: asset.Difficulty !== undefined ? asset.Difficulty + (bondageSkill ? bondageSkill.Level : 0) : 0
                            };
                            if (item.Craft) newItem.Craft = item.Craft;
                            C.Appearance.push(newItem);
                        }
                    }
                    // If no hair items in outfit, keep existing hair

                    CharacterRefresh(C);
                    if (C === CurrentCharacter) {
                        ChatRoomCharacterUpdate(C);
                    }
                    return true;
                }

                // Clear existing items, but keep cosplay items.  CharacterAppearanceNaked does not keep cosplay items.
                for (let A = C.Appearance.length - 1; A >= 0; A--) {
                    const item = C.Appearance[A];
                    // Keep cosplay items and items that can't be removed
                    if (!item.Asset.Group.AllowNone ||
                        item.Asset.Group.Category !== "Appearance" ||
                        item.Asset.BodyCosplay) {
                        continue;
                    }
                    C.Appearance.splice(A, 1);
                }

                // Check if outfit has any hair items
                const hasHairItems = outfitData.some(item =>
                    item.Group === "HairFront" || item.Group === "HairBack"
                );

                // Remove existing items except locked and blocked body cosplay
                const groupsToReplace = new Set(outfitData.map(item => item.Group));
                C.Appearance = C.Appearance.filter(item =>
                    // Keep items that aren't in the outfit
                    !groupsToReplace.has(item.Asset.Group.Name) ||
                    // Keep locked items
                    InventoryItemHasEffect(InventoryGet(C, item.Asset.Group.Name), "Lock") ||
                    // Keep all body cosplay items
                    item.Asset.BodyCosplay ||
                    // Keep hair if applyHairWithOutfit is false or if isHairOnlyOutfit and no hair items in outfit
                    (!applyHairWithOutfit && (item.Asset.Group.Name === "HairFront" || item.Asset.Group.Name === "HairBack")) ||
                    // Keep items that aren't clothing, items, body markings, or hair
                    !(item.Asset.Group.Clothing ||
                      item.Asset.Group.Name.includes("Item") ||
                      item.Asset.Group.Name.includes("BodyMarkings") ||
                      item.Asset.Group.Name === "HairFront" ||
                      item.Asset.Group.Name === "HairBack")
                );

                // Add new items
                for (const item of outfitData) {
                    // Validate item data
                    if (!item || !item.Group || !item.Name) {
                        console.warn("BCOM: Skipping invalid item in LoadOutfit:", item);
                        continue;
                    }

                    const asset = AssetGet(C.AssetFamily, item.Group, item.Name);
                    if (!asset) {
                        console.warn(`BCOM: Asset not found in LoadOutfit: ${item.Group}/${item.Name}`);
                        continue;
                    }

                    // Double-check asset validity
                    if (!asset.Name || !asset.Group) {
                        console.warn("BCOM: Invalid asset structure in LoadOutfit:", asset);
                        continue;
                    }

                    // Skip if the group is locked or if it's a cosplay item
                    if (InventoryItemHasEffect(InventoryGet(C, item.Group), "Lock")) continue;
                    if (asset.BodyCosplay) continue; // Always skip cosplay items from outfits

                    // Skip hair items if applyHairWithOutfit is false
                    if (!applyHairWithOutfit && (item.Group === "HairFront" || item.Group === "HairBack")) continue;

                    // Skip non-hair items if in hair-only mode
                    if (isHairOnlyOutfit && !(item.Group === "HairFront" || item.Group === "HairBack")) continue;

                    const bondageSkill = Player.Skill.find(skill => skill.Type === "Bondage");

                    // Handle padlock replacement/removal
                    let itemProperty = item.Property ? {...item.Property} : undefined;
                    if (selectedPadlock && selectedPadlock !== "Keep Original" && itemProperty) {
                        if (selectedPadlock === "None") {
                            // Remove all padlock-related properties
                            delete itemProperty.LockedBy;
                            delete itemProperty.LockMemberNumber;
                            delete itemProperty.RemoveTimer;
                            delete itemProperty.MaxTimer;
                            delete itemProperty.MemberNumberList;
                            delete itemProperty.CombinationNumber;
                            delete itemProperty.Password;
                            delete itemProperty.LockPickSeed;
                            delete itemProperty.RemoveItem;
                            delete itemProperty.Name; // DOGS mod DeviousPadlock
                            
                            // If no properties remain, set to undefined
                            if (Object.keys(itemProperty).length === 0) {
                                itemProperty = undefined;
                            }
                        } else {
                            // Add or replace with selected padlock type
                                itemProperty.LockedBy = selectedPadlock;
                                itemProperty.LockMemberNumber = Player.MemberNumber; // Set to current player
                                
                                // Ensure Effect array includes "Lock"
                                if (!itemProperty.Effect) itemProperty.Effect = [];
                                if (!itemProperty.Effect.includes("Lock")) {
                                    itemProperty.Effect.push("Lock");
                                }
                                
                                // Clear properties that don't apply to the new lock type
                                delete itemProperty.LockPickSeed;
                                delete itemProperty.Name; // DOGS mod DeviousPadlock
                                
                                // Handle special properties based on new padlock type
                                if (selectedPadlock === "CombinationPadlock") {
                                    // Use configured combination
                                    itemProperty.CombinationNumber = padlockConfigs.CombinationPadlock.CombinationNumber;
                                    delete itemProperty.Password;
                                } else if (selectedPadlock === "PasswordPadlock" || selectedPadlock === "SafewordPadlock") {
                                    // Use configured password and hint
                                    itemProperty.Password = padlockConfigs[selectedPadlock].Password;
                                    if (padlockConfigs[selectedPadlock].Hint) {
                                        itemProperty.Hint = padlockConfigs[selectedPadlock].Hint;
                                    }
                                    delete itemProperty.CombinationNumber;
                                } else if (selectedPadlock === "MistressTimerPadlock" || selectedPadlock === "LoversTimerPadlock") {
                                    // Use configured timer settings
                                    const timerConfig = padlockConfigs[selectedPadlock];
                                    if (timerConfig.TimerDuration > 0) {
                                        itemProperty.RemoveTimer = CurrentTime + timerConfig.TimerDuration;
                                    }
                                    // Handle random RemoveItem setting
                                    if (timerConfig.RemoveItem === "random") {
                                        itemProperty.RemoveItem = Math.random() < 0.4; // 40% chance
                                    } else {
                                        itemProperty.RemoveItem = timerConfig.RemoveItem;
                                    }
                                    itemProperty.EnableRandomInput = timerConfig.EnableRandomInput;
                                    itemProperty.ShowTimer = timerConfig.ShowTimer;
                                    delete itemProperty.Password;
                                    delete itemProperty.CombinationNumber;
                                } else if (selectedPadlock === "TimerPasswordPadlock") {
                                    // Use configured password, timer, and all properties
                                    itemProperty.Password = padlockConfigs.TimerPasswordPadlock.Password;
                                    if (padlockConfigs.TimerPasswordPadlock.Hint) {
                                        itemProperty.Hint = padlockConfigs.TimerPasswordPadlock.Hint;
                                    }
                                    if (padlockConfigs.TimerPasswordPadlock.TimerDuration > 0) {
                                        itemProperty.RemoveTimer = CurrentTime + padlockConfigs.TimerPasswordPadlock.TimerDuration;
                                    }
                                    // Handle random RemoveItem setting
                                    if (padlockConfigs.TimerPasswordPadlock.RemoveItem === "random") {
                                        itemProperty.RemoveItem = Math.random() < 0.4; // 40% chance
                                    } else {
                                        itemProperty.RemoveItem = padlockConfigs.TimerPasswordPadlock.RemoveItem;
                                    }
                                    itemProperty.EnableRandomInput = padlockConfigs.TimerPasswordPadlock.EnableRandomInput;
                                    itemProperty.ShowTimer = padlockConfigs.TimerPasswordPadlock.ShowTimer;
                                    delete itemProperty.CombinationNumber;
                                } else {
                                    // For basic padlocks, clear special properties
                                    delete itemProperty.CombinationNumber;
                                    delete itemProperty.Password;
                                    // Keep timing and member-related properties for compatibility
                                }
                        }
                    }

                    const newItem = {
                        Asset: asset,
                        Color: item.Color || "Default",
                        Property: itemProperty,
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
        function getCurrentOutfitBCXCode(C, includeHair = null, forceHairOnly = false, padlockOption = null) {
            try {
                // Use the passed parameter if provided, otherwise use the global setting
                const shouldIncludeHair = includeHair !== null ? includeHair : applyHairWithOutfit;

                // Use the passed forceHairOnly parameter if provided, otherwise use the global setting
                const isHairOnly = forceHairOnly !== false ? forceHairOnly : hairOnly;

                // Use the passed padlockOption parameter if provided, otherwise use the global setting
                const padlockSetting = padlockOption !== null ? padlockOption : selectedPadlock;

                const outfitData = C.Appearance
                    .filter(item => {
                        const group = item?.Asset?.Group;
                        if (!group) return false;

                        // If in hair-only mode, ONLY include hair items
                        if (isHairOnly) {
                            return group.Name === "HairFront" || group.Name === "HairBack";
                        }

                        // Otherwise, include clothing, items, and hair (if shouldIncludeHair is true)
                        if (!shouldIncludeHair && (group.Name === "HairFront" || group.Name === "HairBack")) {
                            return false;
                        }

                        return (
                            group.Clothing ||
                            group.Name.includes("Item") ||
                            group.Name.includes("BodyMarkings") ||
                            group.Name === "HairFront" ||
                            group.Name === "HairBack"
                        );
                    })
                    .map(item => {
                        // Handle padlock replacement/removal
                        let itemProperty = item.Property ? {...item.Property} : undefined;
                        if (padlockSetting && padlockSetting !== "Keep Original" && itemProperty) {
                            if (padlockSetting === "None") {
                                // Remove all padlock-related properties
                                delete itemProperty.LockedBy;
                                delete itemProperty.LockMemberNumber;
                                delete itemProperty.RemoveTimer;
                                delete itemProperty.MaxTimer;
                                delete itemProperty.MemberNumberList;
                                delete itemProperty.CombinationNumber;
                                delete itemProperty.Password;
                                delete itemProperty.LockPickSeed;
                                delete itemProperty.RemoveItem;
                                delete itemProperty.Name; // DOGS mod DeviousPadlock
                                
                                // If no properties remain, set to undefined
                                if (Object.keys(itemProperty).length === 0) {
                                    itemProperty = undefined;
                                }
                            } else {
                                // Add or replace with selected padlock type
                                    itemProperty.LockedBy = padlockSetting;
                                    itemProperty.LockMemberNumber = Player.MemberNumber; // Set to current player
                                    
                                    // Ensure Effect array includes "Lock"
                                    if (!itemProperty.Effect) itemProperty.Effect = [];
                                    if (!itemProperty.Effect.includes("Lock")) {
                                        itemProperty.Effect.push("Lock");
                                    }
                                    
                                    // Clear properties that don't apply to the new lock type
                                    delete itemProperty.LockPickSeed;
                                    delete itemProperty.Name; // DOGS mod DeviousPadlock
                                    
                                    // Handle special properties based on new padlock type
                                    if (padlockSetting === "CombinationPadlock") {
                                        itemProperty.CombinationNumber = padlockConfigs.CombinationPadlock.CombinationNumber;
                                        delete itemProperty.Password;
                                    } else if (padlockSetting === "PasswordPadlock" || padlockSetting === "SafewordPadlock") {
                                        itemProperty.Password = padlockConfigs[padlockSetting].Password;
                                        if (padlockConfigs[padlockSetting].Hint) {
                                            itemProperty.Hint = padlockConfigs[padlockSetting].Hint;
                                        }
                                        delete itemProperty.CombinationNumber;
                                    } else if (padlockSetting === "MistressTimerPadlock" || padlockSetting === "LoversTimerPadlock") {
                                        const timerConfig = padlockConfigs[padlockSetting];
                                        if (timerConfig.TimerDuration > 0) {
                                            itemProperty.RemoveTimer = CurrentTime + timerConfig.TimerDuration;
                                        }
                                                                                    // Handle random RemoveItem setting
                                            if (timerConfig.RemoveItem === "random") {
                                                itemProperty.RemoveItem = Math.random() < 0.4; // 40% chance
                                            } else {
                                                itemProperty.RemoveItem = timerConfig.RemoveItem;
                                            }
                                        itemProperty.EnableRandomInput = timerConfig.EnableRandomInput;
                                        itemProperty.ShowTimer = timerConfig.ShowTimer;
                                        delete itemProperty.Password;
                                        delete itemProperty.CombinationNumber;
                                    } else if (padlockSetting === "TimerPasswordPadlock") {
                                        itemProperty.Password = padlockConfigs.TimerPasswordPadlock.Password;
                                        if (padlockConfigs.TimerPasswordPadlock.Hint) {
                                            itemProperty.Hint = padlockConfigs.TimerPasswordPadlock.Hint;
                                        }
                                        if (padlockConfigs.TimerPasswordPadlock.TimerDuration > 0) {
                                            itemProperty.RemoveTimer = CurrentTime + padlockConfigs.TimerPasswordPadlock.TimerDuration;
                                        }
                                        // Handle random RemoveItem setting
                                        if (padlockConfigs.TimerPasswordPadlock.RemoveItem === "random") {
                                            itemProperty.RemoveItem = Math.random() < 0.4; // 40% chance
                                        } else {
                                            itemProperty.RemoveItem = padlockConfigs.TimerPasswordPadlock.RemoveItem;
                                        }
                                        itemProperty.EnableRandomInput = padlockConfigs.TimerPasswordPadlock.EnableRandomInput;
                                        itemProperty.ShowTimer = padlockConfigs.TimerPasswordPadlock.ShowTimer;
                                        delete itemProperty.CombinationNumber;
                                    } else {
                                        delete itemProperty.CombinationNumber;
                                        delete itemProperty.Password;
                                    }
                            }
                        }

                        return {
                            Name: item.Asset.Name,
                            Group: item.Asset.Group.Name,
                            Color: Array.isArray(item.Color) ? [...item.Color] :
                                (typeof item.Color === "string" && item.Color !== "" &&
                                    item.Color.toLowerCase() !== "default") ? item.Color : undefined,
                            Property: itemProperty,
                            Craft: item.Craft ? {...item.Craft} : undefined
                        };
                    });

                return LZString.compressToBase64(JSON.stringify(outfitData));
            } catch (error) {
                console.error('Failed to generate BCX code:', error);
                return "";
            }
        }

        function ShowOutfitNotification(message, duration = 5) { // increase duration to 5 seconds because of the new Toasts notification system
            // Use the new beep system, always silent
            ServerShowBeep(message, duration * 1000, { silent: true });
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

        // Export outfits to a file
        function backupOutfits() {
            try {
                const memberNumber = Player.MemberNumber;
                const storageKey = `${STORAGE_PREFIX}${memberNumber}`;
                const storageData = localStorage.getItem(storageKey);

                if (!storageData) {
                    ShowOutfitNotification("No outfits to backup");
                    return;
                }

                // Parse the full storage data
                const outfitData = JSON.parse(storageData);

                // Include settings in export
                const exportData = {
                    outfits: outfitData.outfits || [],
                    folders: outfitData.folders || [],
                    settings: outfitData.settings || {}
                };

                // Prepare the backup object
                const backupData = {
                    memberNumber: memberNumber,
                    data: exportData
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

                // Handle file selection with proper cleanup
                const removeChangeListener = eventListenerManager.add(inputElement, 'change', function() {
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
                                                        finalOutfits.settings = backupData.data.settings || (existingOutfits && existingOutfits.settings) || {};
                                                        actualImportCount = backupData.data.outfits.length;
                                                    } else {
                                                        // Keep existing outfits, only add non-conflicting ones
                                                        finalOutfits = {
                                                            outfits: [...existingOutfits.outfits, ...newOutfits],
                                                            folders: combinedFolders
                                                        };
                                                        finalOutfits.settings = backupData.data.settings || (existingOutfits && existingOutfits.settings) || {};
                                                        actualImportCount = newOutfits.length;
                                                    }
                                                } else {
                                                    // No conflicts, just add all
                                                    finalOutfits = {
                                                        outfits: [...existingOutfits.outfits, ...newOutfits],
                                                        folders: combinedFolders,
                                                        settings: backupData.data.settings || (existingOutfits && existingOutfits.settings) || {}
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
                                ShowOutfitNotification(`Imported ${actualImportCount} outfits in ${finalOutfits.folders.length} folders`);
                            } catch (error) {
                                console.error("Import failed:", error);
                                ShowOutfitNotification("Failed to import: Invalid backup file");
                            }
                        };

                        reader.readAsText(file);
                    }

                    // Clean up listeners and remove the input element
                    removeChangeListener();
                    eventListenerManager.removeAllForElement(inputElement);
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

        function targetfinder(input, isTabCompletion = false) {
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
                if (isTabCompletion) {
                    // For tab completion, return the matches array
                    return partialMatches;
                } else {
                    ChatRoomSendLocal(`Multiple characters with names containing "${input}" found. Please be more specific or use their member number.`, 10000);
                    return null;
                }
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

            // Handle special case for /bcom command in chatroom
            if (CurrentScreen === "ChatRoom") {
                restoreChatLog();
            }

            const importElement = document.getElementById("OutfitManagerImport");
            if (importElement) {
                importElement.remove();
            }

            const padlockDropdown = document.getElementById("PadlockReplacementDropdown");
            if (padlockDropdown) {
                padlockDropdown.remove();
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
                hairOnly = false;
                selectedPadlock = window.selectedPadlock || "Keep Original";
                selectedOutfits = [];

                toggleDialogElements(false);

                // Make sure PreviousDialogMode isn't blank
                if (!PreviousDialogMode || PreviousDialogMode === "") {
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

                // Properly remove the padlock dropdown if it exists
                const padlockDropdown = document.getElementById("PadlockReplacementDropdown");
                if (padlockDropdown) {
                    padlockDropdown.remove();
                    console.log("DialogMenuBack: Removed padlock dropdown");
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

        // Tab completion state
        let tabCompletionState = {
            isActive: false,
            originalInput: "",
            matches: [],
            currentIndex: 0,
            lastTabTime: 0
        };

        // Tab completion for /bcom command
        function setupTabCompletion() {
            const chatInput = document.getElementById("InputChat");
            if (!chatInput) return;

            const removeKeyDownListener = eventListenerManager.add(chatInput, "keydown", (event) => {
                if (event.key === "Tab") {
                    const inputValue = chatInput.value;
                    const cursorPos = chatInput.selectionStart;

                    // Check if cursor is at the end and we're dealing with a /bcom command
                    if (cursorPos === inputValue.length && inputValue.startsWith("/bcom")) {
                        event.preventDefault();
                        handleTabCompletion(chatInput, inputValue);
                    }
                } else {
                    // Reset tab completion state on any other key
                    resetTabCompletion();
                }
            });

            // Also reset on input changes (like clicking elsewhere)
            const removeInputListener = eventListenerManager.add(chatInput, "input", () => {
                resetTabCompletion();
            });
        }

        function resetTabCompletion() {
            tabCompletionState.isActive = false;
            tabCompletionState.originalInput = "";
            tabCompletionState.matches = [];
            tabCompletionState.currentIndex = 0;
        }

        function handleTabCompletion(chatInput, inputValue) {
            const now = Date.now();

            // If it's been more than 2 seconds since last tab, reset completion
            if (now - tabCompletionState.lastTabTime > 2000) {
                resetTabCompletion();
            }

            tabCompletionState.lastTabTime = now;

            // Parse the input
            const parts = inputValue.split(" ");
            if (parts[0] !== "/bcom") return;

            // If this is the first tab press or we're starting fresh
            if (!tabCompletionState.isActive) {
                tabCompletionState.isActive = true;
                tabCompletionState.originalInput = inputValue;
                tabCompletionState.currentIndex = 0;

                // Determine what we're completing
                if (parts.length === 1 || (parts.length === 2 && parts[1] === "")) {
                    // "/bcom " or "/bcom" - show all players
                    tabCompletionState.matches = getPlayerMatches("");
                } else if (parts.length === 2) {
                    // "/bcom partial" - show matching players
                    const partial = parts[1];
                    tabCompletionState.matches = getPlayerMatches(partial);
                }
            } else {
                // Cycle to next match
                tabCompletionState.currentIndex = (tabCompletionState.currentIndex + 1) % tabCompletionState.matches.length;
            }

            // Apply the completion
            if (tabCompletionState.matches.length > 0) {
                const selectedMatch = tabCompletionState.matches[tabCompletionState.currentIndex];
                chatInput.value = `/bcom ${CharacterNickname(selectedMatch)}`;
                chatInput.setSelectionRange(chatInput.value.length, chatInput.value.length);
            }
        }

        function getPlayerMatches(partial) {
            if (!ChatRoomCharacter || ChatRoomCharacter.length === 0) return [];

            const matches = [];
            const partialLower = partial.toLowerCase();

            // Get all characters in the room in their original order
            for (const character of ChatRoomCharacter) {
                const nickname = CharacterNickname(character);

                if (partial === "") {
                    // No partial - include all players
                    matches.push(character);
                } else {
                    // Check if nickname starts with the partial
                    if (nickname.toLowerCase().startsWith(partialLower)) {
                        matches.push(character);
                    }
                }
            }

            // Return matches in ChatRoomCharacter array order (no sorting)
            return matches;
        }

        // Set up tab completion when entering chat room
        modApi.hookFunction("ChatRoomRun", 0, (args, next) => {
            const result = next(args);
            setupTabCompletion();
            return result;
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
                    }

                    // Open dialog with target character
                    ChatRoomFocusCharacter(targetCharacter);

                    // After dialog is open, switch to outfit mode
                    setTimeout(() => {
                        // Store the current dialog mode before switching
                        PreviousDialogMode = DialogMenuMode;

                        // Reset outfit manager state
                        isSortMode = false;
                        isExportMode = false;
                        isFolderManagementMode = false;
                        hairOnly = false;
                        applyHairWithOutfit = false;
                        selectedPadlock = window.selectedPadlock || "Keep Original";
                        selectedOutfits = [];

                        DialogChangeMode("outfits");

                        // Remove the button since we're now in outfit mode
                        const button = document.getElementById("OutfitManagerButton");
                        if (button) {
                            button.remove();
                        }
                    }, 10);
                }
            }
        ]);

        // Add after line 71 (inside initMod function)

        // Event Listener Management System
        const eventListenerManager = {
            listeners: new Map(),

            add(element, event, handler, options) {
                if (!this.listeners.has(element)) {
                    this.listeners.set(element, new Map());
                }
                const elementListeners = this.listeners.get(element);
                const key = `${event}_${options ? JSON.stringify(options) : 'default'}`;

                // Remove existing listener if it exists
                if (elementListeners.has(key)) {
                    const oldHandler = elementListeners.get(key);
                    element.removeEventListener(event, oldHandler, options);
                }

                element.addEventListener(event, handler, options);
                elementListeners.set(key, handler);

                return () => this.remove(element, event, options);
            },

            remove(element, event, options) {
                if (!this.listeners.has(element)) return;

                const elementListeners = this.listeners.get(element);
                const key = `${event}_${options ? JSON.stringify(options) : 'default'}`;

                if (elementListeners.has(key)) {
                    const handler = elementListeners.get(key);
                    element.removeEventListener(event, handler, options);
                    elementListeners.delete(key);

                    if (elementListeners.size === 0) {
                        this.listeners.delete(element);
                    }
                }
            },

            removeAllForElement(element) {
                if (!this.listeners.has(element)) return;

                const elementListeners = this.listeners.get(element);
                for (const [key, handler] of elementListeners) {
                    const [event, optionsStr] = key.split('_');
                    const options = optionsStr === 'default' ? undefined : JSON.parse(optionsStr);
                    element.removeEventListener(event, handler, options);
                }
                this.listeners.delete(element);
            },

            cleanup() {
                for (const [element, elementListeners] of this.listeners) {
                    for (const [key, handler] of elementListeners) {
                        const [event, optionsStr] = key.split('_');
                        const options = optionsStr === 'default' ? undefined : JSON.parse(optionsStr);
                        element.removeEventListener(event, handler, options);
                    }
                }
                this.listeners.clear();
            }
        };

        // Animation frame manager to prevent leaks
        const animationManager = {
            activeAnimations: new Set(),

            start(animationFunction, id) {
                if (this.activeAnimations.has(id)) {
                    this.stop(id);
                }

                let animationId;
                const wrappedFunction = () => {
                    if (!this.activeAnimations.has(id)) return; // Stop if removed
                    animationFunction();
                    animationId = requestAnimationFrame(wrappedFunction);
                };

                this.activeAnimations.add(id);
                animationId = requestAnimationFrame(wrappedFunction);

                return () => this.stop(id);
            },

            stop(id) {
                this.activeAnimations.delete(id);
            },

            stopAll() {
                this.activeAnimations.clear();
            }
        };

    } catch (error) {
        console.error('BCOM: failed:', error);
    }
}

function restoreChatLog() {
    // First ensure the chat log is visible
    const chatLog = document.getElementById("TextAreaChatLog");
    if (chatLog) {
        chatLog.style.display = "";
    }
    // Use the game's own UI restoration functions
    if (typeof ChatRoomShowElements === 'function') {
        ChatRoomShowElements();
    }
    if (typeof ChatRoomResize === 'function') {
        ChatRoomResize();
    }
    // Critical: Refresh chat settings to reapply sensory deprivation effects
    if (typeof ChatRoomRefreshChatSettings === 'function') {
        ChatRoomRefreshChatSettings();
    }
    // Focus the chat input box
    const chatInput = document.getElementById("InputChat");
    if (chatInput) chatInput.focus();
}

function waitForPlayerAndInit() {
    if (window.Player && typeof Player.MemberNumber !== "undefined") {
        initMod();
    } else {
        setTimeout(waitForPlayerAndInit, 100);
    }
}

// Instead of calling initMod() directly:
if (window.bcModSdk?.registerMod) {
    waitForPlayerAndInit();
} else {
    window.addEventListener('bcModSdkLoaded', waitForPlayerAndInit);
    setTimeout(waitForPlayerAndInit, 5000);
}



function toggleDialogElements(hide = true) {
    const hiddenElementIds = [
        "dialog-expression", "dialog-expression-status", "dialog-expression-menubar",
        "dialog-expression-menu-left", "dialog-expression-button-grid",
        "dialog-inventory", "dialog-inventory-status", "dialog-inventory-grid",
        "dialog-inventory-icon", "dialog-inventory-paginate",
        "dialog-pose", "dialog-pose-status", "dialog-pose-menubar", "dialog-pose-button-grid",
        "dialog-expression-preset", "dialog-expression-preset-status",
        "dialog-expression-preset-menubar", "dialog-expression-preset-button-grid",
        "dialog-owner-rules", "dialog-owner-rules-status", "dialog-owner-rules-menubar", "dialog-owner-rules-grid"
    ];

    hiddenElementIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            if (hide) {
                element.style.display = "none";
                element.style.visibility = "hidden";
                element.style.opacity = "0";
                element.style.pointerEvents = "none";
            } else {
                element.style.display = "";
                element.style.visibility = "";
                element.style.opacity = "";
                element.style.pointerEvents = "";
            }
        }
    });

            // Clean up BCX text field and related elements when hiding
        if (!hide) {
            const importElement = document.getElementById("OutfitManagerImport");
            if (importElement) {
                importElement.remove();
            }

            // Clean up padlock dropdown
            const padlockDropdown = document.getElementById("PadlockReplacementDropdown");
            if (padlockDropdown) {
                padlockDropdown.remove();
            }

            // Clean up any additional containers
            ["OutfitManagerImportContainer", "OutfitExportField", "ImportExportContainer"].forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.remove();
                }
            });
        }
}
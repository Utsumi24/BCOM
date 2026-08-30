// Outfit management functionality for BC Outfit Manager

// All lock-related property keys (mirrors BC's ValidationAllLockProperties + Effect)
const BCOM_LockProperties = [
    "LockedBy", "LockMemberNumber", "LockMemberName", "LockMessage",
    "EnableRandomInput", "RemoveItem", "ShowTimer", "CombinationNumber",
    "Password", "Hint", "LockSet", "LockPickSeed",
    "MemberNumberList", "RemoveTimer", "MemberNumberListKeys"
];

// Strip all lock-related properties from a Property object
function stripLockProperties(property) {
    if (!property) return property;
    for (const key of BCOM_LockProperties) {
        delete property[key];
    }
    // Remove "Lock" from Effect array if present
    if (Array.isArray(property.Effect)) {
        property.Effect = property.Effect.filter(e => e !== "Lock");
        if (property.Effect.length === 0) delete property.Effect;
    }
    return property;
}

// Apply a lock to a worn item using BC's InventoryLock, then set config properties
function applyLockToItem(C, wornItem, lockType, padlockConfigs) {
    if (!wornItem || !lockType || lockType === "None") return;

    // Use BC's InventoryLock for proper initialization
    InventoryLock(C, wornItem, lockType, Player.MemberNumber, false);

    // Set lock-specific config properties after InventoryLock has initialized
    if (!wornItem.Property) return;

    if (lockType === "CombinationPadlock") {
        wornItem.Property.CombinationNumber = padlockConfigs.CombinationPadlock.CombinationNumber;
    } else if (lockType === "PasswordPadlock" || lockType === "SafewordPadlock") {
        wornItem.Property.Password = padlockConfigs[lockType].Password;
        if (padlockConfigs[lockType].Hint) {
            wornItem.Property.Hint = padlockConfigs[lockType].Hint;
        }
    } else if (lockType === "MistressTimerPadlock" || lockType === "LoversTimerPadlock") {
        const timerConfig = padlockConfigs[lockType];
        if (timerConfig.TimerDuration > 0) {
            wornItem.Property.RemoveTimer = CurrentTime + timerConfig.TimerDuration;
        }
        if (timerConfig.RemoveItem === "random") {
            wornItem.Property.RemoveItem = Math.random() < 0.4;
        } else {
            wornItem.Property.RemoveItem = timerConfig.RemoveItem;
        }
        wornItem.Property.EnableRandomInput = timerConfig.EnableRandomInput;
        wornItem.Property.ShowTimer = timerConfig.ShowTimer;
    } else if (lockType === "TimerPasswordPadlock") {
        const config = padlockConfigs.TimerPasswordPadlock;
        wornItem.Property.Password = config.Password;
        if (config.Hint) {
            wornItem.Property.Hint = config.Hint;
        }
        if (config.TimerDuration > 0) {
            wornItem.Property.RemoveTimer = CurrentTime + config.TimerDuration;
        }
        if (config.RemoveItem === "random") {
            wornItem.Property.RemoveItem = Math.random() < 0.4;
        } else {
            wornItem.Property.RemoveItem = config.RemoveItem;
        }
        wornItem.Property.EnableRandomInput = config.EnableRandomInput;
        wornItem.Property.ShowTimer = config.ShowTimer;
    }
}

// Apply padlock logic to saved item properties (used in export/copy paths)
// For load paths, use applyLockToItem + InventoryLock instead
function applyPadlockLogic(itemProperty, selectedPadlock, padlockConfigs) {
    if (!itemProperty) return itemProperty;

    if (selectedPadlock === "None") {
        stripLockProperties(itemProperty);
        if (Object.keys(itemProperty).length === 0) {
            itemProperty = undefined;
        }
    } else {
        // Strip existing lock properties first, then write new ones
        stripLockProperties(itemProperty);
        itemProperty.LockedBy = selectedPadlock;
        itemProperty.LockMemberNumber = Player.MemberNumber;

        if (selectedPadlock === "CombinationPadlock") {
            itemProperty.CombinationNumber = padlockConfigs.CombinationPadlock.CombinationNumber;
        } else if (selectedPadlock === "PasswordPadlock" || selectedPadlock === "SafewordPadlock") {
            itemProperty.Password = padlockConfigs[selectedPadlock].Password;
            if (padlockConfigs[selectedPadlock].Hint) {
                itemProperty.Hint = padlockConfigs[selectedPadlock].Hint;
            }
        } else if (selectedPadlock === "MistressTimerPadlock" || selectedPadlock === "LoversTimerPadlock") {
            const timerConfig = padlockConfigs[selectedPadlock];
            if (timerConfig.TimerDuration > 0) {
                itemProperty.RemoveTimer = CurrentTime + timerConfig.TimerDuration;
            }
            if (timerConfig.RemoveItem === "random") {
                itemProperty.RemoveItem = Math.random() < 0.4;
            } else {
                itemProperty.RemoveItem = timerConfig.RemoveItem;
            }
            itemProperty.EnableRandomInput = timerConfig.EnableRandomInput;
            itemProperty.ShowTimer = timerConfig.ShowTimer;
        } else if (selectedPadlock === "TimerPasswordPadlock") {
            const config = padlockConfigs.TimerPasswordPadlock;
            itemProperty.Password = config.Password;
            if (config.Hint) itemProperty.Hint = config.Hint;
            if (config.TimerDuration > 0) {
                itemProperty.RemoveTimer = CurrentTime + config.TimerDuration;
            }
            if (config.RemoveItem === "random") {
                itemProperty.RemoveItem = Math.random() < 0.4;
            } else {
                itemProperty.RemoveItem = config.RemoveItem;
            }
            itemProperty.EnableRandomInput = config.EnableRandomInput;
            itemProperty.ShowTimer = config.ShowTimer;
        }
    }
    return itemProperty;
}

// Get sorted outfits and folders based on current context
function getSortedOutfits() {
    const memberNumber = Player.MemberNumber;
    const storageKey = `${window.BCOM_Base.STORAGE_PREFIX}${memberNumber}`;
    const state = window.BCOM_ModInitializer.getState();

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
        if (state.currentFolder === "Default") {
            window.BCOM_ModInitializer.setState({ currentFolder: "Main" });
        }

        // In folder management mode, show folders and outfits differently based on context
        if (state.isFolderManagementMode) {
            // If we're in the Main folder, show all other folders for management
            if (state.currentFolder === "Main") {
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
                    outfit.folder === state.currentFolder
                );

                // Return back button first, then outfits
                return [backToMainEntry, ...outfits];
            }
        }

        // In normal mode, return appropriate items based on current folder
        if (state.currentFolder !== "Main") {
            // When in a subfolder, add a special "Back to Main" entry
            const backToMainEntry = {
                isFolder: true,
                isBackButton: true,
                name: "Main",
                displayName: `⬆️ Return to Main Folder`
            };

            // Get outfits in the current folder
            const outfits = outfitStorage.outfits.filter(outfit =>
                outfit.folder === state.currentFolder
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

// Save current outfit
function SaveOutfit(C, name = null) {
    let outfitName;
    const state = window.BCOM_ModInitializer.getState();
    const MAX_OUTFITS = window.BCOM_ModInitializer.UI_CONSTANTS.MAX_OUTFITS;

    if (name) {
        // Validate provided name
        const validation = InputValidator.validateName(name, 'outfit');
        if (!validation.valid) {
            ErrorHandler.showError(validation.error);
            return false;
        }
        outfitName = validation.sanitized;
    } else {
        // Get existing outfit names for validation
        const memberNumber = Player.MemberNumber;
        const storageKey = `${window.BCOM_Base.STORAGE_PREFIX}${memberNumber}`;
        const storageData = localStorage.getItem(storageKey);
        const existingNames = storageData ?
            JSON.parse(storageData).outfits?.map(o => o.name) || [] : [];

        // Prompt with validation
        // Variant save mode (outfit checked) → prompt mentions the source outfit so
        // the user knows they're creating a filtered copy, not capturing current look.
        const promptLabel = state.outfitToEdit
            ? `Enter name for filtered copy of "${state.outfitToEdit}":`
            : "Enter outfit name:";
        outfitName = InputValidator.promptForName(promptLabel, 'outfit', existingNames);
        if (!outfitName) return false; // User cancelled or validation failed
    }

    try {
        const memberNumber = Player.MemberNumber;
        const storageKey = `${window.BCOM_Base.STORAGE_PREFIX}${memberNumber}`;

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
            return false;
        }

        // First check for outfit with same name in ANY folder
        const sameNameOutfits = outfitStorage.outfits.filter(o => o.name === outfitName);
        let overwriteIndex = -1;

        if (sameNameOutfits.length > 0) {
            // Check if it exists in current folder
            const existingInCurrentFolder = sameNameOutfits.find(o =>
                (o.folder === state.currentFolder) || (!o.folder && state.currentFolder === "Main"));

            if (existingInCurrentFolder) {
                // Outfit exists in current folder - ask to overwrite
                if (!confirm(`Outfit "${outfitName}" already exists in folder "${state.currentFolder}". Do you want to overwrite it?`)) {
                    return false;
                }

                // Find the existing outfit index (we'll use it later)
                const existingIndex = outfitStorage.outfits.findIndex(o =>
                    o.name === outfitName &&
                    ((o.folder === state.currentFolder) || (!o.folder && state.currentFolder === "Main")));

                // We'll use this index to overwrite the outfit in place
                overwriteIndex = existingIndex;
            } else {
                // Outfit exists in different folder(s) - prevent saving with same name
                const otherFolders = sameNameOutfits.map(o => o.folder || "Main").join(", ");
                alert(`An outfit named "${outfitName}" already exists in folder(s): ${otherFolders}.\nPlease choose a different name.`);
                return false;
            }
        }

        // Two save paths:
        //   1. Filtered-copy mode — an outfit is checked (state.outfitToEdit) AND its
        //      stored data exists. Save a copy of that outfit's saved data with the
        //      user's X'd slots omitted, as a new named variant. Bakes the exclusions
        //      in permanently for the new outfit. The source outfit and its exclusion
        //      Set are untouched.
        //   2. Normal mode — no outfit checked. Capture the character's current
        //      appearance, with anti-impersonation logic for non-own characters.
        let outfitData;
        // Variant-save mode only triggers when the user clicks the Save button with
        // an outfit checked (state.outfitToEdit). Imports pass an explicit `name`
        // argument and should never enter this branch.
        const variantSaveEnabled = !name && !!state.outfitToEdit;
        const sourceOutfit = variantSaveEnabled
            ? outfitStorage.outfits.find(o => o.name === state.outfitToEdit)
            : null;
        const sourceExclusions = sourceOutfit
            ? window.BCOM_ModInitializer.getOutfitExclusions(sourceOutfit.name)
            : new Set();

        if (sourceOutfit && sourceOutfit.data) {
            try {
                const decompressed = LZString.decompressFromBase64(sourceOutfit.data);
                const sourceItems = decompressed ? JSON.parse(decompressed) : [];
                if (!Array.isArray(sourceItems)) {
                    ErrorHandler.showError("Source outfit data is invalid.");
                    return false;
                }
                outfitData = sourceItems.filter(item =>
                    item && item.Group && item.Name && !sourceExclusions.has(item.Group)
                );
            } catch (decompressErr) {
                ErrorHandler.showError("Failed to read source outfit for variant save.", decompressErr);
                return false;
            }
        } else {
            const isOwnCharacter = C === Player ||
                (typeof C.IsPlayer === 'function' && C.IsPlayer()) ||
                C.MemberNumber === Player.MemberNumber;

            let itemsToSave;
            if (isOwnCharacter) {
                itemsToSave = C.Appearance.filter(item => {
                    const group = item?.Asset?.Group;
                    return group && (group.Category === "Appearance" || group.Category === "Item");
                });
            } else {
                // Anti-impersonation: use Player's body features, layer other character's
                // clothing/restraints on top. Never store another character's body.
                const playerBodyItems = Player.Appearance.filter(item => {
                    const group = item?.Asset?.Group;
                    return group && group.Category === "Appearance" && !group.Clothing;
                });
                const otherClothingItems = C.Appearance.filter(item => {
                    const group = item?.Asset?.Group;
                    return group && (
                        (group.Category === "Appearance" && group.Clothing) ||
                        group.Category === "Item"
                    );
                });
                itemsToSave = [...playerBodyItems, ...otherClothingItems];
            }

            outfitData = itemsToSave.filter(item =>
                    item.Asset && item.Asset.Name && item.Asset.Group && item.Asset.Group.Name
                ).map(item => ({
                    Name: item.Asset.Name,
                    Group: item.Asset.Group.Name,
                    Color: Array.isArray(item.Color) ? [...item.Color] :
                           (typeof item.Color === "string" && item.Color !== "" &&
                            item.Color.toLowerCase() !== "default") ? item.Color : undefined,
                    Property: item.Property ? {...item.Property} : undefined,
                    Craft: item.Craft ? {...item.Craft} : undefined
                }));
        }

        if (outfitData.length === 0) {
            ErrorHandler.showError("No clothing or restraints found to save as an outfit.");
            return false;
        }

        // Create the outfit object. Saves always capture everything — per-slot
        // replacement is a load-time decision via Appearance Options.
        const newOutfit = {
            name: outfitName,
            folder: state.currentFolder,
            data: LZString.compressToBase64(JSON.stringify(outfitData))
        };

        // If overwriting, replace at same index; otherwise add to end
        if (overwriteIndex >= 0) {
            outfitStorage.outfits[overwriteIndex] = newOutfit;
            ShowOutfitNotification(`Outfit "${outfitName}" has been overwritten`);
        } else {
            outfitStorage.outfits.push(newOutfit);
            const variantSuffix = sourceOutfit
                ? ` (filtered copy of "${sourceOutfit.name}")`
                : "";
            ShowOutfitNotification(
                `Outfit "${outfitName}" has been saved to folder "${state.currentFolder}"${variantSuffix}`
            );
        }

        // Save the outfitStorage object uncompressed
        localStorage.setItem(storageKey, JSON.stringify(outfitStorage));
        return outfitName;

    } catch (error) {
        ErrorHandler.showError(
            "Failed to save outfit. This might be due to storage limitations or corrupted data.",
            error,
            false // Non-recoverable error
        );
        return false;
    }
}

// Ensure a Craft object has all fields BC's dialog expects
function sanitizeCraft(craft) {
    if (!craft) return craft;
    craft.MemberNumber = craft.MemberNumber ?? Player.MemberNumber ?? 0;
    craft.MemberName = craft.MemberName ?? CharacterNickname(Player) ?? "";
    craft.Private = craft.Private ?? false;
    craft.Name = craft.Name ?? "Crafted Item";
    craft.Description = craft.Description ?? "";
    craft.Effects = craft.Effects ?? {};
    craft.Lock = craft.Lock ?? "";
    craft.Color = craft.Color ?? "Default";
    craft.Property = craft.Property ?? null;
    craft.ItemProperty = craft.ItemProperty ?? null;
    craft.TypeRecord = craft.TypeRecord ?? null;
    return craft;
}

// Load outfit function with full padlock support
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

        const storageKey = `${window.BCOM_Base.STORAGE_PREFIX}${memberNumber}`;
        const state = window.BCOM_ModInitializer.getState();

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

        const outfitDataRaw = JSON.parse(decompressed);
        if (!outfitDataRaw || !Array.isArray(outfitDataRaw)) {
            console.error("No valid outfit data found");
            return false;
        }

        // Normalize item data — handle alternate field names from older formats or imports
        const outfitData = outfitDataRaw.map(item => {
            if (!item || typeof item !== 'object') return item;
            return {
                Name: item.Name || item.name || item.AssetName || item.asset,
                Group: item.Group || item.group || item.AssetGroup || item.Category,
                Color: item.Color || item.color,
                Property: item.Property || item.property,
                Craft: item.Craft || item.craft
            };
        });

        // New replacement policy: outfits apply "exactly as saved" — every slot in the
        // outfit data overwrites the corresponding slot on the character, unless the
        // user has X'd that slot in the Appearance Options modal for this specific
        // outfit. The exclusion Set is per-outfit (keyed by outfit.name) and persists
        // across the session until the outfit is actually applied (not just hovered).
        //
        // Exclusions only take effect while this outfit is the checked one
        // (state.outfitToEdit). Unchecking deactivates them but leaves them in the Map,
        // so re-checking the outfit restores the user's edits for the rest of the session.
        const exclusionsActive = state.outfitToEdit === outfit.name;
        const exclusions = exclusionsActive
            ? window.BCOM_ModInitializer.getOutfitExclusions(outfit.name)
            : new Set();
        // Legacy outfits saved with isHairOnly used to imply "hair only" — keep that
        // intent by excluding everything except the hair groups when applying.
        let hairOnlyApply = false;
        if (outfit.isHairOnly) hairOnlyApply = true;

        // Who are we applying to? On another character we never impose appearance
        // (body / hair / cosplay / face) — only clothing + restraints. On the player's
        // own character, clothing / hair / cosplay / restraints apply by default; body
        // is opt-in (see below).
        const isOwnCharacter = C === Player ||
            (typeof C.IsPlayer === 'function' && C.IsPlayer()) ||
            C.MemberNumber === Player.MemberNumber;

        const shouldApplyGroup = (name) => {
            if (!name) return false;
            if (hairOnlyApply && name !== "HairFront" && name !== "HairBack") return false;

            const g = (typeof AssetGroup !== 'undefined' ? AssetGroup : []).find(gg => gg.Name === name);
            const isAppearance = !!g && g.Category === "Appearance";
            const isClothing = isAppearance && g.Clothing;

            // Other players: only clothing + restraints (Item) may apply; appearance
            // groups are left untouched so we never change someone else's character.
            if (!isOwnCharacter && isAppearance && !isClothing) return false;

            // Body is opt-in. An outfit shouldn't reshape the player's body — that data
            // is kept mainly for backup/restore — so body slots apply only when the user
            // ticks them in Appearance Options (the slot is in the exclusion set, which
            // for body means "include"). Every other section applies by default and can
            // be toggled off (the slot in the set means "exclude").
            const isBody = isAppearance && !isClothing && !g.BodyCosplay
                && !(name.startsWith("Hair") || name === "Beard");
            const toggled = exclusions.has(name);
            return isBody ? toggled : !toggled;
        };

        // Slots this apply will overwrite. Two contributors:
        //   1. Every Group present in outfit data (replaces matching slot on player).
        //   2. Every Clothing slot the player currently wears (cleared so the result
        //      matches the saved outfit — clothing slots the outfit doesn't fill go empty).
        // Restraint (Item) slots are only touched where the outfit has data, so unrelated
        // restraints the player is wearing aren't removed.
        // Body (Appearance non-Clothing) slots are opt-in: shouldApplyGroup only returns
        // true for a body slot the user ticked, so untouched body slots stay as they are.
        // Excluded / locked slots are filtered out further down.
        const groupsBeingApplied = new Set();
        for (const item of outfitData) {
            if (item && item.Group && shouldApplyGroup(item.Group)) {
                groupsBeingApplied.add(item.Group);
            }
        }
        for (const item of C.Appearance) {
            const group = item?.Asset?.Group;
            if (!group || !group.Name) continue;
            const isClothing = group.Category === "Appearance" && group.Clothing;
            if (!isClothing) continue;
            if (!shouldApplyGroup(group.Name)) continue;
            groupsBeingApplied.add(group.Name);
        }

        // Clear existing items in slots about to be replaced, except locked items.
        // Cosplay items follow the per-slot rule: if their slot is flagged, they're
        // replaced; if not, the slot isn't in groupsBeingApplied so they stay.
        C.Appearance = C.Appearance.filter(item => {
            const groupName = item?.Asset?.Group?.Name;
            if (!groupName) return true;
            if (!groupsBeingApplied.has(groupName)) return true;
            if (InventoryItemHasEffect(InventoryGet(C, groupName), "Lock")) return true;
            return false;
        });

        // Add new items via InventoryWear for proper BC processing
        const bondageSkill = Player.Skill.find(skill => skill.Type === "Bondage");
        const bondageLevel = bondageSkill ? bondageSkill.Level : 0;

        for (const item of outfitData) {
            // Validate item data
            if (!item || !item.Name) {
                // Items with Group but no Name are empty slots — skip silently
                if (item && item.Group && !item.Name) continue;
                console.warn("BCOM: Skipping invalid item in LoadOutfit (keys: " +
                    (item ? Object.keys(item).join(", ") : "null") + "):", item);
                continue;
            }

            // Per-outfit exclusion: skip slots the user X'd for this outfit.
            if (!shouldApplyGroup(item.Group)) continue;

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

            // Skip if the group is locked. Cosplay items now follow the per-slot policy:
            // if shouldReplaceGroup returned true for this slot, the user opted in.
            if (InventoryItemHasEffect(InventoryGet(C, item.Group), "Lock")) continue;

            // Use InventoryWear for proper BC processing (ExtendedItemInit, InventoryCraft, etc.)
            const craft = item.Craft ? sanitizeCraft({...item.Craft}) : null;
            // Pre-validate craft data silently to auto-correct before InventoryWear logs warnings
            if (craft && typeof CraftingValidate === 'function') {
                CraftingValidate(craft, asset, false);
            }
            const wornItem = InventoryWear(
                C,
                item.Name,
                item.Group,
                item.Color || null,       // ItemColor — null lets InventoryWear use asset defaults
                bondageLevel,              // DifficultyFactor — bondage skill level
                Player.MemberNumber,       // MemberNumber — needed for InventoryCraft to find source
                craft,                     // Craft — full processing via InventoryCraft
                false                      // Refresh — defer until all items are applied
            );

            if (wornItem) {
                // InventoryWear + InventoryCraft already handled:
                // - ExtendedItemInit (type records, modular options)
                // - Craft color, lock, difficulty modifiers
                // - Expression triggers
                // Now we only need to handle the padlock dropdown override
                // and merge non-lock, non-craft properties from saved data.

                // Determine lock handling
                const padlockSetting = state.selectedPadlock || "Keep Original";
                const savedLockType = item.Property?.LockedBy;

                if (padlockSetting === "None") {
                    // Strip any lock that InventoryCraft may have applied
                    if (typeof ValidationDeleteLock === 'function') {
                        ValidationDeleteLock(wornItem.Property, false);
                    }
                } else if (padlockSetting !== "Keep Original") {
                    // Override: remove craft lock first, then apply dropdown selection
                    if (typeof ValidationDeleteLock === 'function') {
                        ValidationDeleteLock(wornItem.Property, false);
                    }
                    applyLockToItem(C, wornItem, padlockSetting, state.padlockConfigs);
                } else if (savedLockType && !wornItem.Property?.LockedBy) {
                    // "Keep Original" and InventoryCraft didn't already apply the lock
                    // (craft.Lock was empty but saved Property had a lock)
                    InventoryLock(C, wornItem, savedLockType, item.Property.LockMemberNumber || Player.MemberNumber, false);
                    if (item.Property.Password) wornItem.Property.Password = item.Property.Password;
                    if (item.Property.Hint) wornItem.Property.Hint = item.Property.Hint;
                    if (item.Property.CombinationNumber) wornItem.Property.CombinationNumber = item.Property.CombinationNumber;
                    if (item.Property.RemoveTimer) wornItem.Property.RemoveTimer = item.Property.RemoveTimer;
                    if (item.Property.ShowTimer != null) wornItem.Property.ShowTimer = item.Property.ShowTimer;
                    if (item.Property.EnableRandomInput != null) wornItem.Property.EnableRandomInput = item.Property.EnableRandomInput;
                    if (item.Property.RemoveItem != null) wornItem.Property.RemoveItem = item.Property.RemoveItem;
                    if (item.Property.MemberNumberListKeys) wornItem.Property.MemberNumberListKeys = item.Property.MemberNumberListKeys;
                }
                // For "Keep Original" with a craft lock: InventoryCraft already applied it — nothing to do

                // Merge non-lock saved properties (OverridePriority, TypeRecord, etc.)
                // Only skip lock properties and expression properties handled by BC
                if (item.Property) {
                    const skipKeys = new Set([
                        ...BCOM_LockProperties, "Effect", "Expression", "ExpressionTimer"
                    ]);
                    for (const [key, value] of Object.entries(item.Property)) {
                        if (!skipKeys.has(key) && value != null) {
                            if (!wornItem.Property) wornItem.Property = {};
                            wornItem.Property[key] = value;
                        }
                    }
                }
            }
        }

        CharacterRefresh(C);
        if (C === CurrentCharacter) {
            ChatRoomCharacterUpdate(C);
        }
        // Note: the per-outfit exclusion entry is cleared in the click handler that
        // *applies* the outfit, not here — otherwise hover preview would wipe choices.
        return true;

    } catch (error) {
        console.error('Failed to load outfit:', error);
        return false;
    }
}

// Get BCX code for a character's current outfit. Exported outfits always capture the
// full appearance — per-slot replacement is decided on apply, not export, so recipients
// can configure their own Appearance Options.
function getCurrentOutfitBCXCode(C, padlockOption = null) {
    try {
        const state = window.BCOM_ModInitializer.getState();

        const padlockSetting = padlockOption !== null ? padlockOption : state.selectedPadlock;
        
        // Same identity-preserving logic as SaveOutfit: use Player's body for other characters
        // to prevent BCOM from being an easy identity-copy tool for impersonating other players.
        const isOwnCharacter = C === Player ||
            (typeof C.IsPlayer === 'function' && C.IsPlayer()) ||
            C.MemberNumber === Player.MemberNumber;

        let itemsToProcess;
        if (isOwnCharacter) {
            itemsToProcess = C.Appearance;
        } else {
            // Player's full appearance/body — anti-impersonation: never use the other
            // character's body. Per-slot Appearance Options decide what actually applies.
            const playerBodyItems = Player.Appearance.filter(item => {
                const group = item?.Asset?.Group;
                return group && group.Category === "Appearance" && !group.Clothing;
            });
            const otherClothingItems = C.Appearance.filter(item => {
                const group = item?.Asset?.Group;
                return group && (
                    (group.Category === "Appearance" && group.Clothing) ||
                    group.Category === "Item"
                );
            });
            itemsToProcess = [...playerBodyItems, ...otherClothingItems];
        }

        const outfitData = itemsToProcess
            .filter(item => {
                const group = item?.Asset?.Group;
                if (!group) return false;
                // Drop empty-named appearance assets (some default body slots have
                // Asset.Name === "") — they'd otherwise fail the importer's
                // `item.Name && item.Group` check and the code reads as corrupted.
                // This mirrors SaveOutfit's filter so exports import cleanly.
                if (!item.Asset.Name || !group.Name) return false;
                // Capture restraints, clothing, and all body/hair/markings/etc.
                // Per-slot replacement is decided on apply, not at export time.
                return group.Category === "Item" || group.Category === "Appearance";
            })
            .map(item => {
                // Handle padlock replacement/removal
                let itemProperty = item.Property ? {...item.Property} : undefined;
                if (padlockSetting && padlockSetting !== "Keep Original" && itemProperty) {
                    itemProperty = applyPadlockLogic(itemProperty, padlockSetting, state.padlockConfigs);
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
        console.error("BCOM: Error generating BCX code:", error);
        return "";
    }
}

// Delete outfit function
function DeleteOutfit(outfitName) {
    const memberNumber = Player.MemberNumber;
    const storageKey = `${window.BCOM_Base.STORAGE_PREFIX}${memberNumber}`;
    
    try {
        const storageData = localStorage.getItem(storageKey);
        if (!storageData) return false;
        
        const outfitStorage = JSON.parse(storageData);
        
        // Find outfit index
        const outfitIndex = outfitStorage.outfits.findIndex(o => o.name === outfitName);
        if (outfitIndex === -1) {
            console.warn(`BCOM: Outfit "${outfitName}" not found for deletion`);
            return false;
        }
        
        // Remove the outfit
        outfitStorage.outfits.splice(outfitIndex, 1);
        
        // Save updated storage
        localStorage.setItem(storageKey, JSON.stringify(outfitStorage));
        
        return true;
        
    } catch (error) {
        console.error("BCOM: Failed to delete outfit:", error);
        return false;
    }
}

// Import BCX outfit from code
function ImportBCXOutfit() {
    const importElement = document.getElementById("OutfitManagerImport");
    try {
        if (!importElement || !importElement.value) {
            window.BCOM_Utils.ErrorHandler.showError("Please enter a BCX outfit code before importing.");
            if (importElement) importElement.value = "";
            return;
        }

        // Validate the BCX code
        const validation = window.BCOM_Utils.ErrorHandler.validateBCXCode(importElement.value);
        if (!validation.valid) {
            window.BCOM_Utils.ErrorHandler.showError(validation.error, validation.details);
            importElement.value = "";
            return;
        }

        const outfitData = validation.data;

        // Get outfit name
        let outfitName;
        do {
            outfitName = prompt("Enter name for imported outfit:");
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

        // Save the outfit using the existing SaveOutfit function. Outfits now always
        // capture full data; per-slot decisions happen at load time.
        SaveOutfit(tempChar, outfitName);

        // Clear the import field
        importElement.value = "";

    } catch (error) {
        window.BCOM_Utils.ErrorHandler.showError(
            "Failed to import. Check the code is complete and try again.",
            error
        );
        if (importElement) importElement.value = "";
    }
}

// Load outfit from raw data (used by import). Applies every slot present in the
// data — there's no named outfit to attach per-outfit Appearance Options to here.
function LoadOutfitFromData(C, outfitData) {
    try {
        const groupsBeingApplied = new Set();
        for (const item of outfitData) {
            if (item && item.Group) {
                groupsBeingApplied.add(item.Group);
            }
        }
        // Also clear all of the player's clothing slots so the result matches the
        // imported outfit; restraint and body slots only get touched where the import
        // has data, so unrelated restraints aren't removed.
        for (const item of C.Appearance) {
            const group = item?.Asset?.Group;
            if (!group || !group.Name) continue;
            const isClothing = group.Category === "Appearance" && group.Clothing;
            if (!isClothing) continue;
            groupsBeingApplied.add(group.Name);
        }

        C.Appearance = C.Appearance.filter(item => {
            const groupName = item?.Asset?.Group?.Name;
            if (!groupName) return true;
            if (!groupsBeingApplied.has(groupName)) return true;
            if (InventoryItemHasEffect(InventoryGet(C, groupName), "Lock")) return true;
            return false;
        });

        // Add new items via InventoryWear
        const bondageSkill = Player.Skill.find(skill => skill.Type === "Bondage");
        const bondageLevel = bondageSkill ? bondageSkill.Level : 0;

        for (const item of outfitData) {
            if (!item || !item.Group || !item.Name) continue;

            const asset = AssetGet(C.AssetFamily, item.Group, item.Name);
            if (!asset) continue;

            if (InventoryItemHasEffect(InventoryGet(C, item.Group), "Lock")) continue;

            const craft = item.Craft ? sanitizeCraft({...item.Craft}) : null;
            if (craft && typeof CraftingValidate === 'function') {
                CraftingValidate(craft, asset, false);
            }
            const wornItem = InventoryWear(
                C,
                item.Name,
                item.Group,
                item.Color || null,
                bondageLevel,
                Player.MemberNumber,
                craft,
                false
            );

            if (wornItem) {
                // Restore saved lock if InventoryCraft didn't already apply one
                const savedLockType = item.Property?.LockedBy;
                if (savedLockType && !wornItem.Property?.LockedBy) {
                    InventoryLock(C, wornItem, savedLockType, item.Property.LockMemberNumber || Player.MemberNumber, false);
                    if (item.Property.Password) wornItem.Property.Password = item.Property.Password;
                    if (item.Property.Hint) wornItem.Property.Hint = item.Property.Hint;
                    if (item.Property.CombinationNumber) wornItem.Property.CombinationNumber = item.Property.CombinationNumber;
                    if (item.Property.RemoveTimer) wornItem.Property.RemoveTimer = item.Property.RemoveTimer;
                    if (item.Property.ShowTimer != null) wornItem.Property.ShowTimer = item.Property.ShowTimer;
                    if (item.Property.EnableRandomInput != null) wornItem.Property.EnableRandomInput = item.Property.EnableRandomInput;
                    if (item.Property.RemoveItem != null) wornItem.Property.RemoveItem = item.Property.RemoveItem;
                    if (item.Property.MemberNumberListKeys) wornItem.Property.MemberNumberListKeys = item.Property.MemberNumberListKeys;
                }

                // Merge non-lock, non-effect saved properties
                if (item.Property) {
                    const skipKeys = new Set([
                        ...BCOM_LockProperties, "Effect", "Expression", "ExpressionTimer"
                    ]);
                    for (const [key, value] of Object.entries(item.Property)) {
                        if (!skipKeys.has(key) && value != null) {
                            if (!wornItem.Property) wornItem.Property = {};
                            wornItem.Property[key] = value;
                        }
                    }
                }
            }
        }

        CharacterRefresh(C);
        if (C === CurrentCharacter) {
            ChatRoomCharacterUpdate(C);
        }

        // Clear the import field
        if (document.getElementById("OutfitManagerImport")) {
            document.getElementById("OutfitManagerImport").value = "";
        }
        return true;


    } catch (error) {
        console.error("BCOM: Failed to load outfit from data:", error);
        return false;
    }
}

// Export outfit to BCX code
function ExportOutfit(outfitName) {
    const state = window.BCOM_ModInitializer.getState();
    
    if (outfitName) {
        // Export specific outfit
        const memberNumber = Player.MemberNumber;
        const storageKey = `${window.BCOM_Base.STORAGE_PREFIX}${memberNumber}`;
        
        try {
            const storageData = localStorage.getItem(storageKey);
            if (!storageData) return "";
            
            const outfitStorage = JSON.parse(storageData);
            const outfit = outfitStorage.outfits.find(o => o.name === outfitName);
            
            if (!outfit || !outfit.data) return "";
            
            return outfit.data; // Already compressed BCX format
            
        } catch (error) {
            console.error("BCOM: Failed to export outfit:", error);
            return "";
        }
    } else {
        // Export current outfit
        return getCurrentOutfitBCXCode(CurrentCharacter, state.selectedPadlock);
    }
}

// Save outfits function for sort mode
function saveOutfits(outfits) {
    const memberNumber = Player.MemberNumber;
    const storageKey = `${window.BCOM_Base.STORAGE_PREFIX}${memberNumber}`;
    const state = window.BCOM_ModInitializer.getState();
    
    // Get existing data
    const storageData = localStorage.getItem(storageKey);
    if (!storageData) return;
    
    const outfitStorage = JSON.parse(storageData);
    
    // Filter out folder entries and back buttons from the outfits array
    const realOutfits = outfits.filter(o => !o.isFolder);
    
    // Get all outfits not in the current folder to preserve them
    const otherFolderOutfits = outfitStorage.outfits.filter(o =>
        (o.folder || "Main") !== state.currentFolder
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

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        applyPadlockLogic,
        getSortedOutfits,
        SaveOutfit,
        LoadOutfit,
        LoadOutfitFromData,
        DeleteOutfit,
        ImportBCXOutfit,
        ExportOutfit,
        getCurrentOutfitBCXCode,
        saveOutfits
    };
}

// Global exports for direct script usage
window.BCOM_OutfitManager = {
    applyPadlockLogic,
    getSortedOutfits,
    SaveOutfit,
    LoadOutfit,
    LoadOutfitFromData,
    DeleteOutfit,
    ImportBCXOutfit,
    ExportOutfit,
    getCurrentOutfitBCXCode,
    saveOutfits
};
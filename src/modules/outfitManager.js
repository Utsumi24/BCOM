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
        outfitName = InputValidator.promptForName("Enter outfit name:", 'outfit', existingNames);
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

        // Convert appearance to BCX format outfit data.
        // When saving own character: capture all appearance/item groups.
        // When saving another player: use Player's body features (non-clothing Appearance items)
        // as the identity base, then layer the other character's clothing and restraints on top.
        // This preserves the player's own identity (eyes, skin, hair, etc.) while capturing
        // the outfit items from the other character.
        const isOwnCharacter = C === Player ||
            (typeof C.IsPlayer === 'function' && C.IsPlayer()) ||
            C.MemberNumber === Player.MemberNumber;

        let itemsToSave;
        if (isOwnCharacter) {
            // Save everything for own character — including required body features
            // (eyes, skin, mouth, etc.) so the player can fully revert their appearance.
            itemsToSave = C.Appearance.filter(item => {
                const group = item?.Asset?.Group;
                return group && (group.Category === "Appearance" || group.Category === "Item");
            });
        } else {
            // Player's optional body features (AllowNone=true, non-clothing: hair, tattoos, markings)
            // Excludes required body identity items (AllowNone=false: eyes, skin, mouth, etc.)
            const playerBodyItems = Player.Appearance.filter(item => {
                const group = item?.Asset?.Group;
                return group && group.Category === "Appearance" && !group.Clothing && group.AllowNone;
            });
            // Other character's clothing and restraints only
            const otherClothingItems = C.Appearance.filter(item => {
                const group = item?.Asset?.Group;
                return group && (
                    (group.Category === "Appearance" && group.Clothing) ||
                    group.Category === "Item"
                );
            });
            itemsToSave = [...playerBodyItems, ...otherClothingItems];
        }

        const outfitData = itemsToSave.filter(item =>
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

        if (outfitData.length === 0) {
            ErrorHandler.showError("No clothing or restraints found to save as an outfit.");
            return false;
        }

        // Create the outfit object
        const newOutfit = {
            name: outfitName,
            folder: state.currentFolder,
            isHairOnly: state.hairOnly,
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
            ShowOutfitNotification(`Outfit "${outfitName}${hairOnlyIndicator}" has been saved to folder "${state.currentFolder}"`);
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

        // Use the outfit's stored isHairOnly flag or the global hairOnly setting
        const isHairOnlyOutfit = outfit.isHairOnly || state.hairOnly;

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

                // Add hair items from the outfit via InventoryWear
                const bondageSkill = Player.Skill.find(skill => skill.Type === "Bondage");
                const bondageLevel = bondageSkill ? bondageSkill.Level : 0;

                for (const item of outfitData) {
                    // Only process hair items
                    if (item.Group !== "HairFront" && item.Group !== "HairBack") continue;

                    // Validate item data
                    if (!item || !item.Name) {
                        if (item && item.Group && !item.Name) continue;
                        console.warn("BCOM: Skipping invalid hair item in LoadOutfit (keys: " +
                            (item ? Object.keys(item).join(", ") : "null") + "):", item);
                        continue;
                    }

                    const asset = AssetGet(C.AssetFamily, item.Group, item.Name);
                    if (!asset) {
                        console.warn(`BCOM: Hair asset not found in LoadOutfit: ${item.Group}/${item.Name}`);
                        continue;
                    }

                    if (!asset.Name || !asset.Group) {
                        console.warn("BCOM: Invalid hair asset structure in LoadOutfit:", asset);
                        continue;
                    }

                    // Skip if the group is locked
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
                        const padlockSetting = state.selectedPadlock || "Keep Original";
                        const savedLockType = item.Property?.LockedBy;

                        if (padlockSetting === "None") {
                            if (typeof ValidationDeleteLock === 'function') {
                                ValidationDeleteLock(wornItem.Property, false);
                            }
                        } else if (padlockSetting !== "Keep Original") {
                            if (typeof ValidationDeleteLock === 'function') {
                                ValidationDeleteLock(wornItem.Property, false);
                            }
                            applyLockToItem(C, wornItem, padlockSetting, state.padlockConfigs);
                        } else if (savedLockType && !wornItem.Property?.LockedBy) {
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
            }

            CharacterRefresh(C);
            if (C === CurrentCharacter) {
                ChatRoomCharacterUpdate(C);
            }
            return true;
        }

        // Clear existing items, but keep cosplay items
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

        // Remove existing items except locked and blocked body cosplay
        const groupsToReplace = new Set(outfitData.map(item => item.Group));
        C.Appearance = C.Appearance.filter(item =>
            // Keep items that aren't in the outfit
            !groupsToReplace.has(item.Asset.Group.Name) ||
            // Keep locked items
            InventoryItemHasEffect(InventoryGet(C, item.Asset.Group.Name), "Lock") ||
            // Keep all body cosplay items
            item.Asset.BodyCosplay ||
            // Keep hair if applyHairWithOutfit is false
            (!state.applyHairWithOutfit && (item.Asset.Group.Name === "HairFront" || item.Asset.Group.Name === "HairBack")) ||
            // Keep items outside the saveable categories (not clothing, item groups, body markings, or hair)
            !(item.Asset.Group.Clothing ||
              item.Asset.Group.Name.includes("Item") ||
              item.Asset.Group.Name.includes("BodyMarkings") ||
              item.Asset.Group.Name === "HairFront" ||
              item.Asset.Group.Name === "HairBack")
        );

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
            if (!state.applyHairWithOutfit && (item.Group === "HairFront" || item.Group === "HairBack")) continue;

            // Skip non-hair items if in hair-only mode
            if (isHairOnlyOutfit && !(item.Group === "HairFront" || item.Group === "HairBack")) continue;

            // If the item is still present (AllowNone=false, survived the clearing steps),
            // skip it unless "Full Appearance" is enabled
            const existingItem = InventoryGet(C, item.Group);
            if (existingItem && !state.includeAppearance) continue;

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
        return true;

    } catch (error) {
        console.error('Failed to load outfit:', error);
        return false;
    }
}

// Get BCX code for a character's current outfit
function getCurrentOutfitBCXCode(C, includeHair = null, forceHairOnly = false, padlockOption = null) {
    try {
        const state = window.BCOM_ModInitializer.getState();
        
        // Use the passed parameter if provided, otherwise use the global setting
        const shouldIncludeHair = includeHair !== null ? includeHair : state.applyHairWithOutfit;
        
        // Use the passed forceHairOnly parameter if provided, otherwise use the global setting
        const isHairOnly = forceHairOnly !== false ? forceHairOnly : state.hairOnly;
        
        // Use the passed padlockOption parameter if provided, otherwise use the global setting
        const padlockSetting = padlockOption !== null ? padlockOption : state.selectedPadlock;
        
        // Same identity-preserving logic as SaveOutfit: use Player's body for other characters
        const isOwnCharacter = C === Player ||
            (typeof C.IsPlayer === 'function' && C.IsPlayer()) ||
            C.MemberNumber === Player.MemberNumber;

        let itemsToProcess;
        if (isOwnCharacter) {
            itemsToProcess = C.Appearance;
        } else {
            // Player's optional body features only (AllowNone=true excludes eyes, skin, etc.)
            const playerBodyItems = Player.Appearance.filter(item => {
                const group = item?.Asset?.Group;
                return group && group.Category === "Appearance" && !group.Clothing && group.AllowNone;
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

                // If in hair-only mode, ONLY include hair items
                if (isHairOnly) {
                    return group.Name === "HairFront" || group.Name === "HairBack";
                }

                // Skip hair if shouldIncludeHair is false
                if (!shouldIncludeHair && (group.Name === "HairFront" || group.Name === "HairBack")) {
                    return false;
                }

                if (group.Category === "Item") return true;
                if (group.Category !== "Appearance") return false;
                return group.Clothing || group.AllowNone;
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
        const state = window.BCOM_ModInitializer.getState();
        const originalHairOnly = state.hairOnly;
        if (isHairOnlyOutfit) {
            window.BCOM_ModInitializer.setState({ hairOnly: true });
        }

        // Save the outfit using the existing SaveOutfit function
        SaveOutfit(tempChar, outfitName);

        // Restore original hairOnly value
        window.BCOM_ModInitializer.setState({ hairOnly: originalHairOnly });

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

// Load outfit from raw data (used by import)
function LoadOutfitFromData(C, outfitData) {
    try {
        const state = window.BCOM_ModInitializer.getState();
        
        // Clear existing items (similar to LoadOutfit logic)
        for (let A = C.Appearance.length - 1; A >= 0; A--) {
            const item = C.Appearance[A];
            if (!item.Asset.Group.AllowNone ||
                item.Asset.Group.Category !== "Appearance" ||
                item.Asset.BodyCosplay) {
                continue;
            }
            C.Appearance.splice(A, 1);
        }
        
        // Add new items via InventoryWear
        const bondageSkill = Player.Skill.find(skill => skill.Type === "Bondage");
        const bondageLevel = bondageSkill ? bondageSkill.Level : 0;

        for (const item of outfitData) {
            if (!item || !item.Group || !item.Name) continue;

            const asset = AssetGet(C.AssetFamily, item.Group, item.Name);
            if (!asset) continue;

            if (InventoryItemHasEffect(InventoryGet(C, item.Group), "Lock")) continue;
            if (asset.BodyCosplay) continue;

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
        return getCurrentOutfitBCXCode(CurrentCharacter, state.applyHairWithOutfit, state.hairOnly, state.selectedPadlock);
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
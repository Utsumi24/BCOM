// UI Components and rendering for BC Outfit Manager

// Help text constants (exact from original)
const DEFAULT_HELP_TEXT = [
    "Outfit Manager Help:",
    "",
    `• Up to ${getUIConstants().MAX_OUTFITS || 80} outfits can be saved`,
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

const SORT_MODE_HELP_TEXT = [
    "Sort Mode:",
    "",
    "• Click on outfit names to swap their positions",
    "• Use up (↑) and down (↓) arrows to fine-tune order",
    "• The new order will be saved automatically",
    "• Click 'Done' to exit sort mode"
];

const EXPORT_MODE_HELP_TEXT = [
    "Export Mode:",
    "",
    "• Use the text field to copy/share your current outfit",
    "• Click 📋 next to individual outfits to copy them",
    "• The 'Apply Hair' and 'Hair Only' checkboxes affect",
    "  what gets included in the export",
    "• The 'Padlocks' dropdown changes locks in exports",
    "• Click 'Done' to exit export mode"
];

const FOLDER_MANAGEMENT_HELP_TEXT = [
    "Folder Management:",
    "",
    "• Click on folders to navigate between them",
    "• Use checkboxes to select outfits for moving",
    "• Click 'Add' to create new folders (Main folder only)",
    "• Click 'Move' to move selected outfits to current folder",
    "• Use ✎ to rename folders, 🗑️ to delete empty folders",
    "• Click 'Exit Folder Management' when done"
];

// UI Constants (get from modInitializer to avoid conflicts)
function getUIConstants() {
    return window.BCOM_ModInitializer?.UI_CONSTANTS || {
        BUTTON_SIZE: 60,
        BUTTON_GAP: 5,
        EXISTING_BUTTON_X: 70,
        MAX_OUTFITS: 100,
        OUTFITS_PER_PAGE: 8
    };
}

// Main outfit menu drawing function (copied from working original)
function DrawOutfitMenu() {
    const state = window.BCOM_ModInitializer.getState();
    
    // Create/update import text field with caching
    const importId = "OutfitManagerImport";
    let importElement = document.getElementById(importId);
    
    if (!importElement) {
        importElement = document.createElement("input");
        importElement.id = importId;
        importElement.type = "text";
        importElement.placeholder = "BCX Outfit Code";
        importElement.style.cssText = "font-size: 12px !important; line-height: 12px;";
        document.body.appendChild(importElement);
        // Cache it for future reference
        window.BCOM_Storage.getCachedElement(importId, () => importElement);
    }

    // If in export mode, fill with current outfit and disable editing
    if (state.isExportMode) {
        const currentOutfitCode = getCurrentOutfitBCXCode(CurrentCharacter, state.applyHairWithOutfit, state.hairOnly, state.selectedPadlock);
        if (importElement) {
            importElement.value = currentOutfitCode;
            importElement.readOnly = true;
        }
    } else {
        if (importElement) {
            importElement.readOnly = false;
        }
    }

    // Background and title - extend to top of page (match original exactly)  
    DrawRect(1100, 0, 700, 1000, "#ffffffdd");
    DrawText(`${CharacterNickname(Player)}'s Outfit Manager`, 1450, 80, "Black", "White");

    // Position the import/export field and button AFTER drawing background
    ElementPosition(importId, 1407, 30, 615, 36);

    // Draw Import/Export button based on mode
    DrawButton(1720, 13, 80, 36, state.isExportMode ? "Export" : "Import", "White");

    // Back button matching dialog.js coordinates
    DrawButton(1885, 15, 90, 90, "", "White", "Icons/Exit.png", "");

    // Draw sort button if 2+ outfits exist
    const outfits = window.BCOM_OutfitManager.getSortedOutfits();
    if (outfits.length >= 2) {
        DrawButton(1130, 110, 90, 60, state.isSortMode ? "Done" : "Sort", "Blue");
        // Add Export button opposite of Sort
        DrawButton(1680, 110, 90, 60, state.isExportMode ? "Done" : "Export", "Purple");
    }

    // Save button - centered in the box
    DrawButton(1250, 110, 400, 60, "Save New Outfit", "Green");

    // Draw backup and restore buttons using existing game icons
    DrawButton(1885, 115, 90, 90, "", "White", "Icons/Save.png", "Backup all outfits to a file");
    DrawButton(1885, 215, 90, 90, "", "White", "Icons/Download.png", "Import outfits from backup file");

    // Hair checkbox - shifted down to make room for Visual Creator button
    DrawTextFit("Apply Hair?", 1868, 425, 120, "White", "Black");
    DrawButton(1810, 447, 30, 30, "", "White");
    if (state.applyHairWithOutfit) {
        DrawImageResize("Icons/Checked.png", 1815, 452, 20, 20);
    }

    // Hair-only button - shifted down
    DrawTextFit("Hair Only", 1868, 505, 120, "White", "Black");
    DrawButton(1810, 519, 30, 30, "", "White");
    if (state.hairOnly) {
        DrawImageResize("Icons/Checked.png", 1815, 522, 20, 20);
    }

    // Padlock Replacement dropdown - shifted down
    DrawTextFit("Padlocks:", 1868, 577, 120, "White", "Black");
    drawPadlockDropdown();
    
    // Folder management controls (use exact original logic)
    const outfitStorage = window.BCOM_Storage.getCachedStorageData();
    if (state.isFolderManagementMode) {
        // In folder management mode, show Add button and Move button (when outfits are selected)
        // Only show Add button when in the Main folder
        if (state.currentFolder === "Main") {
            DrawButton(1130, 180, 90, 60, "Add", "Yellow");
        }
        // Only show the Move button when outfits are selected
        if (state.selectedOutfits.length > 0) {
            DrawButton(1680, 180, 90, 60, "Move", "Yellow");
        }
    }

    // Draw the center button with different text based on mode - back to original position
    const centerButtonText = state.isFolderManagementMode ?
        "Exit Folder Management" :
        "Manage Folders";
    DrawButton(1250, 180, 400, 60, centerButtonText, "Orange");

    // Add folder selection display at the top of the outfit list
    if (!state.isFolderManagementMode) {
        if (outfitStorage) {
            // Draw the folder selection header
            DrawRect(1175, 250, 550, 35, "#333333");
            const displayFolderName = truncateFolderName(state.currentFolder, 15);
            DrawText("Current Folder: " + displayFolderName, 1450, 270, "White", "center");
        }
    } else {
        // In folder management mode, draw a different header
        DrawRect(1175, 250, 550, 35, "#333333");
        const displayFolderName = truncateFolderName(state.currentFolder, 15);
        DrawText(`Managing Folder: ${displayFolderName}`, 1450, 270, "White", "center");
    }

    // Define constants (exact from original)
    let isHoveringAnyOutfit = false;
    let yOffset = 0;  // Reset the offset

    // Initialize help text early to prevent reference errors
    let helpText = DEFAULT_HELP_TEXT;
    if (state.isSortMode) {
        helpText = SORT_MODE_HELP_TEXT;
    } else if (state.isExportMode) {
        helpText = EXPORT_MODE_HELP_TEXT;
    } else if (state.isFolderManagementMode) {
        helpText = FOLDER_MANAGEMENT_HELP_TEXT;
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

    const constants = getUIConstants();
    const totalPages = Math.ceil(outfits.length / constants.OUTFITS_PER_PAGE);
    const currentPage = state.DialogOutfitPage || 0;
    const startIndex = currentPage * constants.OUTFITS_PER_PAGE;
    const endIndex = Math.min(startIndex + constants.OUTFITS_PER_PAGE, outfits.length);

    // Track which outfit is selected for editing (if any)
    let editingOutfitName = null;

    // Draw outfits for current page
    for (let i = startIndex; i < endIndex; i++) {
        const outfit = outfits[i];
        if (!outfit) {
            console.error("Missing outfit at index", i);
            continue;
        }
        
        const yPos = 290 + ((i - startIndex) * 80);
        const folderEntries = outfits.filter(o => o.isFolder);
        
        // Special handling for folder entries
        if (outfit.isFolder) {
            if (state.isFolderManagementMode && !outfit.isBackButton) {
                DrawButton(1210, yPos, 490, 60, outfit.displayName, "White");
                DrawButton(1150, yPos + 5, 50, 50, "✎", "White", "", "Rename folder");
                if (outfit.name !== "Main") {
                    DrawButton(1710, yPos + 5, 50, 50, "🗑️", "White", "", "Delete folder if empty");
                }
            } else {
                DrawButton(1210, yPos, 490, 60, outfit.displayName, "White");
            }
            continue;
        }
        
        // Check if hovering over this outfit button
        if (MouseIn(1210, yPos, 490, 60)) {
            isHoveringAnyOutfit = true;
            try {
                // Only check for locked items in default mode and when hair only mode is not enabled
                if (!state.isSortMode && !state.isExportMode && !state.isFolderManagementMode && !state.hairOnly && outfit?.data) {
                    const outfitData = window.BCOM_Storage.getCachedOutfitData(outfit);
                    if (outfitData && Array.isArray(outfitData)) {
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
                }
                // Use LoadOutfit to apply the outfit to our display character
                try {
                    window.BCOM_OutfitManager.LoadOutfit(displayChar, outfit.name);
                    CharacterLoadCanvas(displayChar);
                } catch (previewError) {
                    console.warn("BCOM: Error loading outfit preview:", previewError);
                    // Restore original appearance if preview fails
                    try {
                        if (typeof ServerAppearanceBundle === 'function' && typeof ServerAppearanceLoadFromBundle === 'function') {
                            const restoreBundle = ServerAppearanceBundle(CurrentCharacter.Appearance);
                            ServerAppearanceLoadFromBundle(
                                displayChar,
                                CurrentCharacter.AssetFamily,
                                restoreBundle,
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
        
        // Draw outfit buttons based on mode
        const prefix = outfit.isHairOnly ? "✂️ " : "";
        if (state.isFolderManagementMode) {
            // In folder management mode, show checkboxes for outfit selection
            const isSelected = state.selectedOutfits.includes(outfit.name);
            DrawButton(1150, yPos + 5, 50, 50, "", "White");
            // Only draw the checkmark if the outfit is selected
            if (isSelected) {
                DrawImageResize("Icons/Checked.png", 1155, yPos + 10, 40, 40);
            }
            const outfitNumber = i + 1 - folderEntries.length;
            const buttonColor = isSelected ? "LightGreen" : "White";
            DrawButton(1210, yPos, 490, 60, `${outfitNumber}. ${prefix}${outfit.name}`, buttonColor);
        } else if (state.isSortMode) {
            if (i > 0 && !outfits[i-1]?.isFolder) {
                DrawButton(1150, yPos + 5, 50, 50, "↑", "White", "", "Move outfit up");
            }
            if (i < outfits.length - 1 && !outfits[i+1]?.isFolder) {
                DrawButton(1710, yPos + 5, 50, 50, "↓", "White", "", "Move outfit down");
            }
            const outfitNumber = i + 1 - folderEntries.length;
            DrawButton(1210, yPos, 490, 60, `${outfitNumber}. ${prefix}${outfit.name}`, "White");
        } else if (state.isExportMode) {
            const outfitNumber = i + 1 - folderEntries.length;
            DrawButton(1210, yPos, 490, 60, `${outfitNumber}. ${prefix}${outfit.name}`, "White");
            DrawButton(1710, yPos + 5, 50, 50, "📋", "White", "", "Copy outfit code");
        } else {
            // Edit checkbox for Outfit Studio (smaller 30x30 size)
            const isSelectedForEdit = state.outfitToEdit === outfit.name;
            DrawButton(1110, yPos + 15, 30, 30, "", "White", "", "Edit in Outfit Studio");
            if (isSelectedForEdit) {
                DrawImageResize("Icons/Checked.png", 1113, yPos + 18, 24, 24);
                // Track the outfit name that's selected for editing
                editingOutfitName = outfit.name;
            }

            DrawButton(1150, yPos + 5, 50, 50, "✎", "White", "", "Rename outfit");
            const outfitNumber = i + 1 - folderEntries.length;
            const hasPermission = CurrentCharacter.MemberNumber === Player.MemberNumber || CurrentCharacter.AllowItem;
            const outfitButtonColor = hasPermission ? "White" : "Pink";
            DrawButton(1210, yPos, 490, 60, `${outfitNumber}. ${prefix}${outfit.name}`, outfitButtonColor);
            DrawButton(1710, yPos + 5, 50, 50, "🗑️", "White", "", "Delete outfit");
        }
    }

    // Visual Creator button - positioned under backup/restore buttons
    // Dynamic tooltip based on whether an outfit is selected for editing
    const visualCreatorTooltip = editingOutfitName
        ? `Outfit Studio: Edit ${editingOutfitName}`
        : "Outfit Studio: Create Custom Outfits";
    DrawButton(1885, 315, 90, 90, "🎨", "White", null, visualCreatorTooltip);

    // Draw pagination controls if needed
    if (totalPages > 1) {
        const paginationY = 930;
        if (currentPage >= 2) {
            DrawButton(1100, paginationY, 100, 60, "First", "White");
        }
        if (currentPage > 0) {
            DrawButton(1200, paginationY, 100, 60, "<", "White");
        }
        DrawRect(1310, paginationY, 280, 60, "#ffffffdd");
        DrawText(`Page ${currentPage + 1}/${totalPages}`, 1450, paginationY + 30, "Black", "center");
        if (currentPage < totalPages - 1) {
            DrawButton(1600, paginationY, 100, 60, ">", "White");
        }
        if (currentPage < totalPages - 2) {
            DrawButton(1700, paginationY, 100, 60, "Last", "White");
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

    // Draw the character
    DrawCharacter(displayChar, 500, yOffset, 1);
    
    let nameYOffset = yOffset + 980;
    
    // Draw the name manually below the character
    MainCanvas.font = CommonGetFont(30);
    DrawText(`${CharacterNickname(CurrentCharacter)} (Preview)`, 500 + 255, nameYOffset,
        (CommonIsColor(CurrentCharacter.LabelColor)) ? CurrentCharacter.LabelColor : "White",
        "Black"
    );
    
    // Draw help text (inline like original)
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

// Draw UI controls (checkboxes, dropdowns)
function drawUIControls() {
    const state = window.BCOM_ModInitializer.getState();
    
    // Hair checkbox - positioned outside the main window
    DrawTextFit("Apply Hair?", 1868, 345, 120, "White", "Black");
    DrawButton(1810, 367, 30, 30, "", "White");
    if (state.applyHairWithOutfit) {
        DrawImageResize("Icons/Checked.png", 1815, 372, 20, 20);
    }

    // Hair-only button
    DrawTextFit("Hair Only", 1868, 425, 120, "White", "Black");
    DrawButton(1810, 439, 30, 30, "", "White");
    if (state.hairOnly) {
        DrawImageResize("Icons/Checked.png", 1815, 442, 20, 20);
    }

    // Padlock Replacement dropdown
    DrawTextFit("Padlocks:", 1868, 497, 120, "White", "Black");
    
    drawPadlockDropdown();
}

// Draw padlock replacement dropdown
function drawPadlockDropdown() {
    const state = window.BCOM_ModInitializer.getState();
    
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
    if (!padlockOptions.includes(state.selectedPadlock)) {
        window.BCOM_ModInitializer.setState({ selectedPadlock: "Keep Original" });
        window.selectedPadlock = "Keep Original"; // Persist for session
    }
    
    if (!padlockDropdown) {
        try {
            padlockDropdown = ElementCreateDropdown(
                padlockDropdownId,
                padlockOptions,
                function(event) {
                    const newPadlock = event.target.value;
                    window.BCOM_ModInitializer.setState({ selectedPadlock: newPadlock });
                    window.selectedPadlock = newPadlock; // Persist for session
                    
                    // Configure special padlocks when selected
                    const specialPadlocks = ["CombinationPadlock", "PasswordPadlock", "SafewordPadlock", "MistressTimerPadlock", "TimerPasswordPadlock", "LoversTimerPadlock"];
                    if (specialPadlocks.includes(newPadlock)) {
                        // Use setTimeout to allow the dropdown to update first
                        setTimeout(() => {
                            configurePadlockProperties(newPadlock);
                        }, 100);
                    }
                    
                    // If in export mode, update the export code to reflect the padlock preference
                    if (state.isExportMode) {
                        const importElement = document.getElementById("OutfitManagerImport");
                        if (importElement) {
                            importElement.value = getCurrentOutfitBCXCode(CurrentCharacter, state.applyHairWithOutfit, state.hairOnly, newPadlock);
                        }
                    }
                }
            );
            padlockDropdown.value = state.selectedPadlock;
            
            // Enhanced styling for better visibility and usability
            padlockDropdown.style.fontSize = "14px";
            padlockDropdown.style.backgroundColor = "white";
            padlockDropdown.style.border = "1px solid #666";
            padlockDropdown.style.borderRadius = "2px";
            padlockDropdown.style.color = "black";
            padlockDropdown.style.fontFamily = "Arial, sans-serif";
            padlockDropdown.style.padding = "2px";
            padlockDropdown.style.zIndex = "1000";
            
        } catch (error) {
            console.error("Failed to create padlock dropdown:", error);
            // Fallback to text display - updated coordinates for shifted position
            DrawTextFit(state.selectedPadlock, 1868, 597, 120, "LightGray", "Black");
        }
    }
    
    // Position the dropdown if it exists - updated coordinates for shifted position
    if (padlockDropdown && typeof ElementPosition === 'function') {
        ElementPosition(padlockDropdownId, 1890, 605, 160, 24);
        padlockDropdown.value = state.selectedPadlock; // Ensure current selection is displayed
        
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
}

// Draw folder header showing current folder
function drawFolderHeader() {
    const state = window.BCOM_ModInitializer.getState();
    
    if (!state.isFolderManagementMode) {
        // Normal mode - show current folder header
        // Box for current folder display - use more saturated blue 
        DrawRect(1100, 250, 700, 35, "#4169E1DD");
        // Make truncation more aggressive to prevent overflow
        const displayFolderName = truncateFolderName(state.currentFolder, 15);
        // Adjust text position for the taller box
        DrawText("Current Folder: " + displayFolderName, 1450, 270, "White", "center");
    } else {
        // In folder management mode, draw a different header - increase height from 30 to 35 pixels
        DrawRect(1100, 250, 700, 35, "#FF8C00DD"); // Orange color for management mode
        // Make truncation more aggressive to prevent overflow
        const displayFolderName = truncateFolderName(state.currentFolder, 15);
        // Adjust text position for the taller box
        DrawText(`Managing Folder: ${displayFolderName}`, 1450, 270, "White", "center");
    }
}

// Draw folder management controls
function drawFolderControls() {
    const state = window.BCOM_ModInitializer.getState();
    
    // Add folder management row with side buttons - use cached storage data
    let canPrev = false;
    let canNext = false;

    const outfitStorage = window.BCOM_Storage.getCachedStorageData();
    if (outfitStorage && !state.isFolderManagementMode) {
        const folders = outfitStorage.folders || ["Main"];
        const currentIndex = folders.indexOf(state.currentFolder);
        canPrev = currentIndex > 0;
        canNext = currentIndex < folders.length - 1;
    }

    // Draw the buttons in the folder management row
    if (state.isFolderManagementMode) {
        // In folder management mode, show Add button and Move button (when outfits are selected)
        // Only show Add button when in the Main folder
        if (state.currentFolder === "Main") {
            DrawButton(1130, 180, 90, 60, "Add", "Yellow");
        }

        // Only show the Move button when outfits are selected
        if (state.selectedOutfits.length > 0) {
            DrawButton(1680, 180, 90, 60, "Move", "Yellow");
        }
    }

    // Draw the center button with different text based on mode
    const centerButtonText = state.isFolderManagementMode ?
        "Exit Folder Management" :
        "Manage Folders";
    // Keep button color consistent - Orange for folder management mode, Plum for normal mode
    DrawButton(1250, 180, 400, 60, centerButtonText, "Orange");
}

// Draw pagination controls (exact from original)
function drawPaginationControls(currentPage, totalPages) {
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
    // Page indicator (exact format from original)
    DrawText(`Page ${currentPage + 1}/${totalPages}`, 1450, paginationY + 30, "Black", "center");
    
    // Next page button
    if (currentPage < totalPages - 1) {
        DrawButton(1600, paginationY, 100, 60, ">", "White");
    }
    
    // Last page button - only show if not on last 2 pages
    if (currentPage < totalPages - 2) {
        DrawButton(1700, paginationY, 100, 60, "Last", "White");
    }
}

// Draw help text (exact from original)
function drawHelpText() {
    const state = window.BCOM_ModInitializer.getState();
    
    let helpText = DEFAULT_HELP_TEXT;
    if (state.isSortMode) {
        helpText = SORT_MODE_HELP_TEXT;
    } else if (state.isExportMode) {
        helpText = EXPORT_MODE_HELP_TEXT;
    } else if (state.isFolderManagementMode) {
        helpText = FOLDER_MANAGEMENT_HELP_TEXT;
    }
    
    // Draw help text on left side (exact original implementation)
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

}

// Utility functions for help text
function getRemainingOutfitSlots() {
    try {
        const memberNumber = Player.MemberNumber;
        const storageKey = `${window.BCOM_Base.STORAGE_PREFIX}${memberNumber}`;
        const storageData = localStorage.getItem(storageKey);
        if (!storageData) return getUIConstants().MAX_OUTFITS;
        const outfitStorage = JSON.parse(storageData);
        const currentOutfits = outfitStorage.outfits?.length || 0;
        return Math.max(0, getUIConstants().MAX_OUTFITS - currentOutfits);
    } catch (error) {
        console.error('Failed to calculate remaining slots:', error);
        return getUIConstants().MAX_OUTFITS;
    }
}

function getRemainingSlotsColor(remaining) {
    if (remaining <= 5) return "Red";
    if (remaining <= 15) return "Orange"; 
    return "Green";
}

// Utility functions
function truncateFolderName(folderName, maxLength) {
    if (folderName.length <= maxLength) return folderName;
    return folderName.substring(0, maxLength - 3) + "...";
}

// Use outfit manager functions
function getCurrentOutfitBCXCode(character, applyHair, hairOnly, padlock) {
    return window.BCOM_OutfitManager.getCurrentOutfitBCXCode(character, applyHair, hairOnly, padlock);
}

async function configurePadlockProperties(padlockType) {
    const state = window.BCOM_ModInitializer.getState();
    if (!state.padlockConfigs[padlockType]) return;
    
    const config = {...state.padlockConfigs[padlockType]};
    let configChanged = false;
    
    switch(padlockType) {
        case "CombinationPadlock":
            const combo = await window.BCOM_ModalSystem.createInputModal(
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
            const passwordResult = await window.BCOM_ModalSystem.createPasswordModal(padlockType, config);
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
            const timerPasswordResult = await window.BCOM_ModalSystem.createTimerPasswordModal(padlockType, config);
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
            const timerModalResult = await window.BCOM_ModalSystem.createTimerModal(padlockType, config);
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
        const updatedConfigs = { ...state.padlockConfigs };
        updatedConfigs[padlockType] = config;
        window.BCOM_ModInitializer.setState({ padlockConfigs: updatedConfigs });
        window.BCOM_Utils.ShowOutfitNotification(`${padlockType} configured`);
    }
}

// Register UI hooks with the mod SDK
function registerHooks(modApi) {
    // Register dialog handlers first
    if (window.BCOM_DialogHandlers && window.BCOM_DialogHandlers.registerDialogHooks) {
        window.BCOM_DialogHandlers.registerDialogHooks(modApi);
    }
    
    // Initialize Visual Creator integration
    if (window.BCOM_VisualCreator && window.BCOM_VisualCreator.BCOMInitializeVisualCreatorIntegration) {
        window.BCOM_VisualCreator.BCOMInitializeVisualCreatorIntegration(modApi);
    }
    
    // Update drawing code
    modApi.hookFunction("DialogDraw", 0, (args, next) => {
        // Exact condition from original - only create button in item/dialog modes when it doesn't exist
        if ((DialogMenuMode === "items" || DialogMenuMode === "dialog") && !document.getElementById("OutfitManagerButton")) {
            createOutfitManagerButton();
        }

        if (DialogMenuMode === "outfits") {
            window.BCOM_Utils.toggleDialogElements(true);
            DrawOutfitMenu();
            return;
        } else {
            window.BCOM_Utils.toggleDialogElements(false);
        }

        return next(args);
    });
    
    // Register dialog click handlers
    if (window.BCOM_DialogHandlers) {
        window.BCOM_DialogHandlers.registerDialogHooks(modApi);
    }
    
    // Hook DrawCharacter to handle character preview (from original)
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
    
    // Hook DialogMenuBack to ensure proper cleanup (from original)
    modApi.hookFunction("DialogMenuBack", 0, (args, next) => {
        if (DialogMenuMode === "outfits") {
            window.BCOM_Utils.toggleDialogElements(false);

            // Make sure PreviousDialogMode isn't blank
            const state = window.BCOM_ModInitializer.getState();
            if (!state.PreviousDialogMode || state.PreviousDialogMode === "") {
                window.BCOM_ModInitializer.setState({ PreviousDialogMode: "dialog" });
            }

            // Set DialogMenuMode to previous mode for the original function to handle
            DialogMenuMode = state.PreviousDialogMode;
            console.log(`DialogMenuBack: Set DialogMenuMode to ${state.PreviousDialogMode}`);

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
    
    // Clean up DOM button when leaving dialog (exact from original)
    modApi.hookFunction("DialogLeave", 0, (args, next) => {
        // Remove our button from DOM if it exists
        const outfitButton = document.getElementById("OutfitManagerButton");
        if (outfitButton) outfitButton.remove();

        // Make sure PreviousDialogMode isn't blank
        const state = window.BCOM_ModInitializer.getState();
        if (!state.PreviousDialogMode || state.PreviousDialogMode === "") {
            window.BCOM_ModInitializer.setState({ PreviousDialogMode: "dialog" });
        }

        // Handle special case for /bcom command in chatroom
        if (CurrentScreen === "ChatRoom") {
            window.BCOM_Utils.restoreChatLog();
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
    
    // Register bcom chat command
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
                    targetCharacter = window.BCOM_Utils.targetfinder(args);

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
                    const state = window.BCOM_ModInitializer.getState();
                    window.BCOM_ModInitializer.setState({ PreviousDialogMode: DialogMenuMode });

                    // Reset outfit manager state
                    window.BCOM_ModInitializer.setState({
                        isSortMode: false,
                        isExportMode: false,
                        isFolderManagementMode: false,
                        hairOnly: false,
                        applyHairWithOutfit: false,
                        selectedPadlock: window.selectedPadlock || "Keep Original",
                        selectedOutfits: []
                    });

                    DialogChangeMode("outfits");

                    // Remove the button since we're now in outfit mode
                    setTimeout(() => {
                        const button = document.getElementById("OutfitManagerButton");
                        if (button) {
                            button.remove();
                        }
                    }, 10);
                }, 500); // Wait for dialog to fully load
            }
        }
    ]);
    
    // Set up tab completion when entering chat room
    modApi.hookFunction("ChatRoomRun", 0, (args, next) => {
        const result = next(args);
        window.BCOM_Utils.setupTabCompletion();
        return result;
    });
}

// Create the outfit manager button
function createOutfitManagerButton() {
    // Check if button already exists
    if (document.getElementById("OutfitManagerButton")) {
        return; // Button already exists, don't create another
    }
    
    // Additional safety checks
    if (typeof Player === 'undefined' || !Player.MemberNumber) {
        console.warn("BCOM: Player not ready, cannot create button");
        return;
    }
    
    if (typeof CurrentCharacter === 'undefined') {
        console.warn("BCOM: CurrentCharacter not ready, cannot create button");
        return;
    }
    
    // Check if we have permission to modify the character's outfit
    const hasPermission = CurrentCharacter.MemberNumber === Player.MemberNumber || CurrentCharacter.AllowItem;
    const memberNumber = Player.MemberNumber;
    const storageKey = `${window.BCOM_Base.STORAGE_PREFIX}${memberNumber}`;
    const outfitStorage = window.BCOM_Storage.getCachedStorageData();
    
    let isFirstTimeUse = false;
    if (!outfitStorage || !outfitStorage.settings || !outfitStorage.settings.hasUsedOutfitManager) {
        isFirstTimeUse = true;
    }

    // Find main dialog element
    let dialogElement = document.getElementById("dialog");
    if (!dialogElement) {
        dialogElement = document.body;
    }

    // Create a proper DOM button for the outfit manager using the game's own button system
    const buttonX = 5; // Position to the left of speech bubble
    const buttonY = 905; // Standard position at bottom
    const constants = getUIConstants();

    // Use the game's native button creation function
    let buttonContainer;
    try {
        if (typeof ElementButton?.Create !== 'function') {
            console.error("BCOM: ElementButton.Create not available, cannot create outfit button");
            return;
        }
        buttonContainer = ElementButton.Create(
            "OutfitManagerButton",
            function() {
                // Mark as used for first-time users
                if (isFirstTimeUse) {
                    const memberNumber = Player.MemberNumber;
                    const storageKey = `${window.BCOM_Base.STORAGE_PREFIX}${memberNumber}`;
                    const storage = window.BCOM_Storage.getCachedStorageData();
                    if (!storage.settings) storage.settings = {};
                    storage.settings.hasUsedOutfitManager = true;
                    localStorage.setItem(storageKey, JSON.stringify(storage));
                }
                
                // Store current mode before switching
                window.BCOM_ModInitializer.setState({ PreviousDialogMode: DialogMenuMode });
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
        return;
    }

    // Set initial background color - always white since access is always allowed
    buttonContainer.style.backgroundColor = "white";
    // Set a high z-index to ensure button is always on top of other dialog elements
    buttonContainer.style.zIndex = "2000";
    buttonContainer.style.position = "absolute";

    // Create a single function reference for position updates
    const updatePositionFunction = () => {
        if (typeof ElementPositionFixed === 'function' && buttonContainer) {
            ElementPositionFixed(buttonContainer, buttonX, buttonY, constants.BUTTON_SIZE, constants.BUTTON_SIZE);
            // Ensure z-index is maintained after repositioning
            buttonContainer.style.zIndex = "2000";
        }
    };

    // Add resize listener using event manager
    const removeResizeListener = window.BCOM_Utils.eventListenerManager.add(window, "resize", updatePositionFunction);

    // Add hover listeners using event manager
    const removeMouseEnter = window.BCOM_Utils.eventListenerManager.add(buttonContainer, "mouseenter", () => {
        buttonContainer.style.backgroundColor = "cyan";
    });
    const removeMouseLeave = window.BCOM_Utils.eventListenerManager.add(buttonContainer, "mouseleave", () => {
        buttonContainer.style.backgroundColor = "white";
    });

    // Save the original remove method to ensure we clean up event listeners
    const originalRemove = buttonContainer.remove;
    buttonContainer.remove = function() {
        removeResizeListener();
        removeMouseEnter();
        removeMouseLeave();
        window.BCOM_Utils.animationManager.stop("buttonGlow");
        originalRemove.apply(this);
    };

    // Add to DOM
    dialogElement.appendChild(buttonContainer);
    
    // Use ElementPositionFixed after adding to DOM
    ElementPositionFixed(buttonContainer, buttonX, buttonY, constants.BUTTON_SIZE, constants.BUTTON_SIZE);

    // Add glow animation for first time users
    if (isFirstTimeUse) {
        const stopGlowAnimation = window.BCOM_Utils.animationManager.start(() => {
            if (!document.body.contains(buttonContainer)) {
                return false; // Stop animation if button is removed
            }
            
            const time = Date.now() / 1000;
            const glowIntensity = (Math.sin(time * 3) + 1) / 2; // Oscillates between 0 and 1
            const glowColor = `rgba(255, 215, 0, ${0.3 + glowIntensity * 0.4})`; // Golden glow
            buttonContainer.style.boxShadow = `0 0 ${10 + glowIntensity * 15}px ${glowColor}`;
            return true; // Continue animation
        }, "buttonGlow");

        // Stop glow after 10 seconds or when clicked
        setTimeout(() => {
            window.BCOM_Utils.animationManager.stop("buttonGlow");
            buttonContainer.style.boxShadow = "";
        }, 10000);

        // Add "New!" label (from original outfit.js line 408)
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
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DrawOutfitMenu,
        drawUIControls,
        drawHelpText,
        registerHooks
    };
}

// Global exports for direct script usage
window.BCOM_UI = {
    DrawOutfitMenu,
    drawUIControls,
    drawHelpText,
    registerHooks
};
// Complete dialog click handler copied from working original with minimal modular adaptations

// Register the complete, working DialogClick handler
function registerDialogHooks(modApi) {
    // Register "outfits" dialog mode in BC's DialogMenuMapping to prevent "setup missing" error
    if (typeof window !== 'undefined' && window.DialogMenuMapping && !window.DialogMenuMapping["outfits"]) {
        window.DialogMenuMapping["outfits"] = {
            Init: () => {},
            Load: () => {},
            Reload: () => {},
            Unload: () => {},
            Click: () => {},
            Draw: () => {},
            Resize: () => {},
            Exit: () => {},
            ids: { status: null }
        };
        console.log("[BCOM] Registered 'outfits' dialog mode with BC");
    }
    
    modApi.hookFunction("DialogClick", 0, (args, next) => {
        if (DialogMenuMode === "outfits") {
            if (MouseIn(0, 0, 1000, 1000)) {
                return;
            }

            // Get modular references but use original variable names for minimal changes
            const state = window.BCOM_ModInitializer.getState();
            const outfits = window.BCOM_OutfitManager.getSortedOutfits();
            const constants = window.BCOM_ModInitializer.UI_CONSTANTS;
            
            // Map modular state to original variable names
            let isSortMode = state.isSortMode;
            let isExportMode = state.isExportMode;
            let isFolderManagementMode = state.isFolderManagementMode;
            let hairOnly = state.hairOnly;
            let applyHairWithOutfit = state.applyHairWithOutfit;
            let selectedPadlock = state.selectedPadlock;
            let selectedOutfits = state.selectedOutfits;
            let allowMultipleSelect = state.allowMultipleSelect;
            let currentFolder = state.currentFolder;
            let DialogOutfitPage = state.DialogOutfitPage;
            let PreviousDialogMode = state.PreviousDialogMode;
            let padlockConfigs = state.padlockConfigs;

            const totalPages = Math.ceil(outfits.length / constants.OUTFITS_PER_PAGE);
            const currentPage = DialogOutfitPage || 0;
            const startIndex = currentPage * constants.OUTFITS_PER_PAGE;
            const endIndex = Math.min(startIndex + constants.OUTFITS_PER_PAGE, outfits.length);

            // Handle pagination clicks
            if (totalPages > 1) {
                const paginationY = 930;

                // First page button click
                if (currentPage >= 2 && MouseIn(1100, paginationY, 100, 60)) {
                    DialogOutfitPage = 0;
                    window.BCOM_ModInitializer.setState({ DialogOutfitPage: 0 });
                    return;
                }

                // Previous page button click
                if (currentPage > 0 && MouseIn(1200, paginationY, 100, 60)) {
                    DialogOutfitPage = currentPage - 1;
                    window.BCOM_ModInitializer.setState({ DialogOutfitPage: currentPage - 1 });
                    return;
                }

                // Next page button click
                if (currentPage < totalPages - 1 && MouseIn(1600, paginationY, 100, 60)) {
                    DialogOutfitPage = currentPage + 1;
                    window.BCOM_ModInitializer.setState({ DialogOutfitPage: currentPage + 1 });
                    return;
                }

                // Last page button click
                if (currentPage < totalPages - 2 && MouseIn(1700, paginationY, 100, 60)) {
                    DialogOutfitPage = totalPages - 1;
                    window.BCOM_ModInitializer.setState({ DialogOutfitPage: totalPages - 1 });
                    return;
                }
            }

            // Sort button click
            if (outfits.length >= 2 && MouseIn(1130, 110, 90, 60)) {
                isSortMode = !isSortMode;
                if (isSortMode) {
                    isExportMode = false;
                    isFolderManagementMode = false;
                    selectedOutfits = [];
                    const importElement = document.getElementById("OutfitManagerImport");
                    if (importElement) importElement.value = "";
                }
                window.BCOM_ModInitializer.setState({
                    isSortMode,
                    isExportMode,
                    isFolderManagementMode,
                    selectedOutfits
                });
                return;
            }

            // Export mode toggle button
            if (MouseIn(1680, 110, 90, 60)) {
                isExportMode = !isExportMode;
                if (isExportMode) {
                    isSortMode = false;
                    isFolderManagementMode = false;
                    selectedOutfits = [];
                }
                if (!isExportMode) {
                    const importElement = document.getElementById("OutfitManagerImport");
                    if (importElement) importElement.value = "";
                }
                window.BCOM_ModInitializer.setState({
                    isExportMode,
                    isSortMode,
                    isFolderManagementMode,
                    selectedOutfits
                });
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
                    window.BCOM_OutfitManager.ImportBCXOutfit();
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

            // Hair checkbox - updated coordinates to match shifted position
            if (MouseIn(1810, 447, 30, 30)) {
                applyHairWithOutfit = !applyHairWithOutfit;
                if (applyHairWithOutfit) {
                    hairOnly = false;
                }
                if (isExportMode) {
                    const importElement = document.getElementById("OutfitManagerImport");
                    if (importElement) {
                        importElement.value = window.BCOM_OutfitManager.getCurrentOutfitBCXCode(CurrentCharacter, true, hairOnly, selectedPadlock);
                    }
                }
                window.BCOM_ModInitializer.setState({ applyHairWithOutfit, hairOnly });
                return;
            }

            // Hair-only button - updated coordinates to match shifted position
            if (MouseIn(1810, 519, 30, 30)) {
                hairOnly = !hairOnly;
                if (hairOnly) {
                    applyHairWithOutfit = false;
                }
                if (isExportMode) {
                    const importElement = document.getElementById("OutfitManagerImport");
                    if (importElement) {
                        importElement.value = window.BCOM_OutfitManager.getCurrentOutfitBCXCode(CurrentCharacter, true, hairOnly, selectedPadlock);
                    }
                }
                window.BCOM_ModInitializer.setState({ hairOnly, applyHairWithOutfit });
                return;
            }

            // Changelog link click (bottom right corner) - coordinates match display
            const changelogText = "Changelog";
            const versionX = 1957;
            const versionY = 965;
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
                window.BCOM_ModInitializer.setState({
                    isSortMode: false,
                    isExportMode: false,
                    isFolderManagementMode: false,
                    hairOnly: false,
                    applyHairWithOutfit: false,
                    selectedPadlock: "Keep Original",
                    selectedOutfits: []
                });
                window.selectedPadlock = "Keep Original";

                window.BCOM_Utils.toggleDialogElements(false);

                if (!PreviousDialogMode || PreviousDialogMode === "") {
                    DialogLeave();
                    return;
                }

                if (CurrentScreen === "ChatRoom") {
                    if (PreviousDialogMode === "dialog" || PreviousDialogMode === "items") {
                        DialogMenuMode = PreviousDialogMode;
                        if (typeof DialogChangeMode === "function") {
                            DialogChangeMode(PreviousDialogMode, true);
                        }
                        return;
                    } else {
                        DialogMenuBack();
                        return;
                    }
                }

                DialogMenuMode = PreviousDialogMode;
                if (typeof DialogChangeMode === "function") {
                    DialogChangeMode(PreviousDialogMode, true);
                }
                return;
            }

            // Save button
            if (MouseIn(1250, 110, 400, 60)) {
                window.BCOM_OutfitManager.SaveOutfit(CurrentCharacter);
                return;
            }

            // Visual Creator button - new position under backup/restore buttons
            if (MouseIn(1885, 315, 90, 90)) {
                // Check if an outfit is selected for editing
                const outfitToEdit = state.outfitToEdit;

                if (outfitToEdit) {
                    // Load the outfit data and pass it to the Outfit Studio
                    const memberNumber = Player.MemberNumber;
                    const storageKey = `${window.BCOM_Base.STORAGE_PREFIX}${memberNumber}`;
                    const storageData = localStorage.getItem(storageKey);

                    if (storageData) {
                        const outfitStorage = JSON.parse(storageData);
                        const outfit = outfitStorage.outfits.find(o => o.name === outfitToEdit);

                        if (outfit) {
                            // Store the outfit data globally for the Outfit Studio to pick up
                            window.BCOM_OutfitStudio_EditMode = {
                                outfitName: outfit.name,
                                outfitData: outfit.data
                            };
                            console.log("[BCOM] Launching Outfit Studio in edit mode for:", outfit.name);
                        }
                    }

                    // Don't clear outfitToEdit - let it persist so the checkbox stays checked
                    // It will be cleared when the user saves the outfit or clicks the checkbox again
                }

                // Launch Visual Creator with modApi
                if (window.BCOM_VisualCreator && window.BCOM_VisualCreator.BCOMOpenVisualCreator) {
                    console.log("[BCOM] Visual Creator button clicked, launching...");
                    window.BCOM_VisualCreator.BCOMOpenVisualCreator(modApi).catch(error => {
                        console.error("[BCOM] Error launching Visual Creator:", error);
                    });
                } else {
                    console.warn("[BCOM] Visual Creator integration not loaded");
                }
                return;
            }

            // Folder management button - back to original position
            if (MouseIn(1250, 180, 400, 60)) {
                isFolderManagementMode = !isFolderManagementMode;
                if (isFolderManagementMode) {
                    isSortMode = false;
                    isExportMode = false;
                    selectedOutfits = [];
                    allowMultipleSelect = false;
                    const importElement = document.getElementById("OutfitManagerImport");
                    if (importElement) importElement.value = "";
                } else {
                    selectedOutfits = [];
                }
                window.BCOM_ModInitializer.setState({
                    isFolderManagementMode,
                    isSortMode,
                    isExportMode,
                    selectedOutfits,
                    allowMultipleSelect
                });
                return;
            }

            // Add Folder button (only in folder management mode)
            if (isFolderManagementMode && MouseIn(1130, 180, 90, 60)) {
                if (currentFolder !== "Main") {
                    ShowOutfitNotification("Folders can only be created in the Main folder");
                    return;
                }

                const memberNumber = Player.MemberNumber;
                const storageKey = `${window.BCOM_Base.STORAGE_PREFIX}${memberNumber}`;
                const storageData = localStorage.getItem(storageKey);
                const outfitStorage = storageData ?
                    JSON.parse(storageData) :
                    { outfits: [], folders: ["Main"], settings: {} };

                const existingFolders = outfitStorage.folders || ["Main"];
                const folderName = window.BCOM_Utils.InputValidator.promptForName("Enter new folder name:", 'folder', existingFolders);
                if (folderName) {
                    if (!outfitStorage.settings) outfitStorage.settings = {};

                    if (!outfitStorage.folders.includes(folderName)) {
                        const mainIndex = outfitStorage.folders.indexOf("Main");
                        if (mainIndex === 0) {
                            outfitStorage.folders.splice(1, 0, folderName);
                        } else {
                            outfitStorage.folders.unshift(folderName);
                        }

                        localStorage.setItem(storageKey, JSON.stringify(outfitStorage));
                        currentFolder = folderName;
                        DialogOutfitPage = 0;
                        
                        window.BCOM_ModInitializer.setState({ 
                            currentFolder,
                            DialogOutfitPage: 0
                        });
                        ShowOutfitNotification(`Folder "${folderName}" created`);
                    } else {
                        ShowOutfitNotification(`Folder "${folderName}" already exists`);
                    }
                }
                return;
            }

            // Edit Folder button (only in folder management mode)
            if (isFolderManagementMode && MouseIn(1680, 180, 90, 60) && selectedOutfits.length > 0) {
                const memberNumber = Player.MemberNumber;
                const storageKey = `${window.BCOM_Base.STORAGE_PREFIX}${memberNumber}`;
                const storageData = localStorage.getItem(storageKey);
                if (!storageData) return;

                const outfitStorage = JSON.parse(storageData);
                const outfitsToMove = [];
                const outfitsAlreadyInFolder = [];
                const conflictingOutfits = [];

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
                            conflictingOutfits.push(outfitName);
                        } else {
                            outfitsToMove.push({name: outfitName, index: outfitIndex});
                        }
                    }
                }

                if (conflictingOutfits.length > 0) {
                    ShowOutfitNotification(`Cannot move: ${conflictingOutfits.length} outfit(s) have name conflicts in "${currentFolder}"`);
                    return;
                }

                if (outfitsAlreadyInFolder.length > 0) {
                    ShowOutfitNotification(`${outfitsAlreadyInFolder.length} outfit(s) already in this folder`);
                }

                if (outfitsToMove.length > 0) {
                    for (const {name, index} of outfitsToMove) {
                        outfitStorage.outfits[index].folder = currentFolder;
                    }
                    localStorage.setItem(storageKey, JSON.stringify(outfitStorage));
                    selectedOutfits = [];
                    window.BCOM_ModInitializer.setState({ selectedOutfits });
                    ShowOutfitNotification(`Moved ${outfitsToMove.length} outfit(s) to "${currentFolder}"`);
                } else if (outfitsAlreadyInFolder.length === 0 && conflictingOutfits.length === 0) {
                    ShowOutfitNotification("No outfits selected to move");
                }
                return;
            }

            // Check outfit clicks for current page (EXACT ORIGINAL LOGIC)
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

                            const memberNumber = Player.MemberNumber;
                            const storageKey = `${window.BCOM_Base.STORAGE_PREFIX}${memberNumber}`;
                            const storageData = localStorage.getItem(storageKey);
                            if (!storageData) return;

                            const outfitStorage = JSON.parse(storageData);
                            const folders = outfitStorage.folders || ["Main"];

                            const otherFolders = folders.filter(f => f !== outfit.name);
                            const newName = window.BCOM_Utils.InputValidator.promptForName(
                                `Enter new name for folder "${outfit.name}":`,
                                'folder',
                                otherFolders
                            );
                            if (newName) {
                                if (folders.includes(newName)) {
                                    ShowOutfitNotification(`Folder "${newName}" already exists`);
                                    return;
                                }

                                const folderIndex = folders.indexOf(outfit.name);
                                if (folderIndex >= 0) {
                                    folders[folderIndex] = newName;

                                    outfitStorage.outfits.forEach(o => {
                                        if (o.folder === outfit.name) {
                                            o.folder = newName;
                                        }
                                    });

                                    outfitStorage.folders = folders;
                                    localStorage.setItem(storageKey, JSON.stringify(outfitStorage));

                                    if (currentFolder === outfit.name) {
                                        currentFolder = newName;
                                        window.BCOM_ModInitializer.setState({ currentFolder });
                                    }

                                    ShowOutfitNotification(`Folder "${outfit.name}" renamed to "${newName}"`);
                                }
                            }
                            return;
                        }

                        // Delete folder button
                        if (outfit.name !== "Main" && MouseIn(1710, yPos + 5, 50, 50)) {
                            const memberNumber = Player.MemberNumber;
                            const storageKey = `${window.BCOM_Base.STORAGE_PREFIX}${memberNumber}`;
                            const storageData = localStorage.getItem(storageKey);
                            if (!storageData) return;

                            const outfitStorage = JSON.parse(storageData);
                            const outfitsInFolder = outfitStorage.outfits.filter(o => o.folder === outfit.name);

                            if (outfitsInFolder.length > 0) {
                                ShowOutfitNotification(`Cannot delete folder "${outfit.name}" - it contains ${outfitsInFolder.length} outfit(s)`);
                                return;
                            }

                            if (confirm(`Are you sure you want to delete the empty folder "${outfit.name}"?`)) {
                                outfitStorage.folders = outfitStorage.folders.filter(f => f !== outfit.name);
                                localStorage.setItem(storageKey, JSON.stringify(outfitStorage));
                                ShowOutfitNotification(`Folder "${outfit.name}" has been deleted`);
                            }
                            return;
                        }

                        // Navigate when clicking on a folder, not select it
                        if (MouseIn(1210, yPos, 490, 60)) {
                            currentFolder = outfit.name;
                            DialogOutfitPage = 0;
                            window.BCOM_ModInitializer.setState({ 
                                currentFolder,
                                DialogOutfitPage: 0
                            });
                            return;
                        }
                    } else {
                        // Handle clicking on a folder - navigate into the folder
                        if (MouseIn(1210, yPos, 490, 60)) {
                            if (outfit.isBackButton) {
                                currentFolder = "Main";
                            } else {
                                currentFolder = outfit.name;
                            }
                            DialogOutfitPage = 0;
                            window.BCOM_ModInitializer.setState({ 
                                currentFolder,
                                DialogOutfitPage: 0
                            });
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
                            selectedOutfits.splice(outfitIndex, 1);
                        } else {
                            selectedOutfits.push(outfitName);
                        }
                        window.BCOM_ModInitializer.setState({ selectedOutfits: [...selectedOutfits] });
                        return;
                    }

                    // Outfit button - select/deselect in folder management mode
                    if (MouseIn(1210, yPos, 490, 60)) {
                        const outfitName = outfit.name;
                        const outfitIndex = selectedOutfits.indexOf(outfitName);

                        if (outfitIndex >= 0) {
                            selectedOutfits.splice(outfitIndex, 1);
                        } else {
                            selectedOutfits.push(outfitName);
                        }
                        window.BCOM_ModInitializer.setState({ selectedOutfits: [...selectedOutfits] });
                        return;
                    }
                } else if (isSortMode) {
                    // Up arrow click
                    if (i > 0 && !outfits[i-1].isFolder && MouseIn(1150, yPos + 5, 50, 50)) {
                        [outfits[i], outfits[i-1]] = [outfits[i-1], outfits[i]];
                        window.BCOM_OutfitManager.saveOutfits(outfits);
                        return;
                    }

                    // Down arrow click
                    if (i < outfits.length - 1 && !outfits[i+1].isFolder && MouseIn(1710, yPos + 5, 50, 50)) {
                        [outfits[i], outfits[i+1]] = [outfits[i+1], outfits[i]];
                        window.BCOM_OutfitManager.saveOutfits(outfits);
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

                    // Export button (replaces delete button) - EXACT ORIGINAL LOGIC
                    if (MouseIn(1710, yPos + 5, 50, 50)) {
                        try {
                            const outfitData = outfit?.data;
                            if (!outfitData) {
                                ShowOutfitNotification("No outfit data found");
                                return;
                            }

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

                            let filteredOutfitData = [...parsedOutfitData];

                            if (!applyHairWithOutfit) {
                                filteredOutfitData = filteredOutfitData.filter(item => 
                                    item.Group !== "HairFront" && item.Group !== "HairBack"
                                );
                            }

                            if (hairOnly) {
                                filteredOutfitData = filteredOutfitData.filter(item => 
                                    item.Group === "HairFront" || item.Group === "HairBack"
                                );
                            }

                            // Apply padlock filtering - EXACT ORIGINAL LOGIC
                            if (selectedPadlock && selectedPadlock !== "Keep Original") {
                                filteredOutfitData = filteredOutfitData.map(item => {
                                    if (!item.Property && selectedPadlock === "None") return item;

                                    const filteredItem = { ...item };
                                    let itemProperty = item.Property ? { ...item.Property } : {};

                                    if (selectedPadlock === "None") {
                                        delete itemProperty.LockedBy;
                                        delete itemProperty.LockMemberNumber;
                                        delete itemProperty.RemoveTimer;
                                        delete itemProperty.MaxTimer;
                                        delete itemProperty.MemberNumberList;
                                        delete itemProperty.CombinationNumber;
                                        delete itemProperty.Password;
                                        delete itemProperty.LockPickSeed;
                                        delete itemProperty.RemoveItem;
                                        delete itemProperty.Name;

                                        if (Object.keys(itemProperty).length === 0) {
                                            delete filteredItem.Property;
                                        } else {
                                            filteredItem.Property = itemProperty;
                                        }
                                    } else {
                                        itemProperty.LockedBy = selectedPadlock;
                                        itemProperty.LockMemberNumber = Player.MemberNumber;
                                        
                                        if (!itemProperty.Effect) itemProperty.Effect = [];
                                        if (!itemProperty.Effect.includes("Lock")) {
                                            itemProperty.Effect.push("Lock");
                                        }
                        
                                        delete itemProperty.LockPickSeed;
                                        delete itemProperty.Name;
                                        
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
                                            if (timerConfig.RemoveItem === "random") {
                                                itemProperty.RemoveItem = Math.random() < 0.4;
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
                                            if (padlockConfigs.TimerPasswordPadlock.RemoveItem === "random") {
                                                itemProperty.RemoveItem = Math.random() < 0.4;
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
                    // Edit checkbox for Outfit Studio (updated position and size to match 30x30 checkbox)
                    if (MouseIn(1110, yPos + 15, 30, 30)) {
                        const currentlySelected = state.outfitToEdit;
                        // Toggle: if clicking the same outfit, deselect; otherwise select the new one
                        const newSelection = (currentlySelected === outfit.name) ? null : outfit.name;
                        window.BCOM_ModInitializer.setState({ outfitToEdit: newSelection });

                        // Clear the edit mode object when unchecking
                        if (newSelection === null) {
                            window.BCOM_OutfitStudio_EditMode = null;
                        }
                        return;
                    }

                    // Rename button - EXACT ORIGINAL LOGIC
                    if (MouseIn(1150, yPos + 5, 50, 50)) {
                        try {
                            const memberNumber = Player.MemberNumber;
                            const storageKey = `${window.BCOM_Base.STORAGE_PREFIX}${memberNumber}`;
                            const storageData = localStorage.getItem(storageKey);
                            if (!storageData) {
                                window.BCOM_Utils.ErrorHandler.showError('No outfit data found for renaming.');
                                return;
                            }

                            const outfitStorage = JSON.parse(storageData);
                            let outfitIndex = outfitStorage.outfits.findIndex(o => o.name === outfit.name);
                            if (outfitIndex === -1) {
                                window.BCOM_Utils.ErrorHandler.showError('Could not find outfit to rename.');
                                return;
                            }

                            const existingNames = outfitStorage.outfits
                                .filter(o => o.name !== outfit.name)
                                .map(o => o.name);

                            const newName = window.BCOM_Utils.InputValidator.promptForName(
                                `Enter new name for outfit "${outfit.name}":`,
                                'outfit',
                                existingNames
                            );
                            if (!newName) return;

                            const existingOutfit = outfitStorage.outfits.find(o => o.name === newName);
                            if (existingOutfit) {
                                if (!confirm(`Outfit "${newName}" already exists. Do you want to overwrite it?`)) {
                                    return;
                                }
                                const existingIndex = outfitStorage.outfits.findIndex(o => o.name === newName);
                                if (existingIndex >= 0) {
                                    outfitStorage.outfits.splice(existingIndex, 1);
                                    if (existingIndex < outfitIndex) {
                                        outfitIndex--;
                                    }
                                }
                            }

                            if (outfitIndex >= 0 && outfitIndex < outfitStorage.outfits.length) {
                                outfitStorage.outfits[outfitIndex].name = newName;
                            } else {
                                window.BCOM_Utils.ErrorHandler.showError('Outfit index became invalid during rename operation.');
                                return;
                            }

                            localStorage.setItem(storageKey, JSON.stringify(outfitStorage));
                            ShowOutfitNotification(`Outfit renamed to "${newName}"`);

                        } catch (error) {
                            window.BCOM_Utils.ErrorHandler.showError(
                                'Failed to rename outfit. The outfit data may be corrupted.',
                                error
                            );
                        }
                        return;
                    }

                    // Outfit button - EXACT ORIGINAL LOGIC
                    if (MouseIn(1210, yPos, 490, 60)) {
                        const hasPermission = CurrentCharacter.MemberNumber === Player.MemberNumber || CurrentCharacter.AllowItem;
                        if (!hasPermission) {
                            ShowOutfitNotification("You don't have permission to apply outfits to this character");
                            return;
                        }

                        if (window.BCOM_OutfitManager.LoadOutfit(CurrentCharacter, outfit.name)) {
                            ShowOutfitNotification(`Outfit "${outfit.name}" has been applied`);
                            DialogLeave();
                        }
                        return;
                    }

                    // Delete button - EXACT ORIGINAL LOGIC
                    if (MouseIn(1710, yPos + 5, 50, 50)) {
                        if (confirm(`Are you sure you want to delete outfit "${outfit.name}"?`)) {
                            const memberNumber = Player.MemberNumber;
                            const storageKey = `${window.BCOM_Base.STORAGE_PREFIX}${memberNumber}`;
                            const storageData = localStorage.getItem(storageKey);
                            if (storageData) {
                                const outfitStorage = JSON.parse(storageData);
                                outfitStorage.outfits = outfitStorage.outfits.filter(o =>
                                    !(o.name === outfit.name && (o.folder || "Main") === currentFolder)
                                );
                                localStorage.setItem(storageKey, JSON.stringify(outfitStorage));
                            }

                            ShowOutfitNotification(`Outfit "${outfit.name}" has been deleted`);

                            const remainingOutfits = outfits.length - 1;
                            const newTotalPages = Math.ceil(remainingOutfits / constants.OUTFITS_PER_PAGE);
                            if (DialogOutfitPage > 0 && DialogOutfitPage >= newTotalPages) {
                                DialogOutfitPage = DialogOutfitPage - 1;
                                window.BCOM_ModInitializer.setState({ DialogOutfitPage });
                            }
                            return;
                        }
                    }
                }
            }
        }

        if (DialogMenuMode === "items" || DialogMenuMode === "dialog") {
            const constants = window.BCOM_ModInitializer.UI_CONSTANTS;
            if (MouseIn(constants.OUTFIT_BUTTON_X, 905, constants.BUTTON_SIZE, constants.BUTTON_SIZE)) {
                window.BCOM_ModInitializer.setState({ PreviousDialogMode: DialogMenuMode });
                DialogChangeMode("outfits");
                DialogMenuButton = [];
                return true;
            }
        }
        return next(args);
    });

    // Hook DialogChangeMode to handle "outfits" mode (from original outfit.js line 1259)
    modApi.hookFunction("DialogChangeMode", 4, (args, next) => {
        const [mode, reset] = args;

        if (mode === "outfits") {
            // Store the mode we're coming from
            const state = window.BCOM_ModInitializer.getState();
            window.BCOM_ModInitializer.setState({ 
                PreviousDialogMode: DialogMenuMode 
            });

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

        // Always call the original function for proper dialog flow
        return next(args);
    });
}

// Backup and restore functions (exact from original)
function backupOutfits() {
    try {
        const memberNumber = Player.MemberNumber;
        const storageKey = `${window.BCOM_Base.STORAGE_PREFIX}${memberNumber}`;
        const storageData = localStorage.getItem(storageKey);
        
        if (!storageData) {
            ShowOutfitNotification("No outfits to backup");
            return;
        }
        
        const outfitStorage = JSON.parse(storageData);
        const backupData = {
            version: window.BCOM_Base.VERSION_NUMBER,
            timestamp: new Date().toISOString(),
            memberNumber: memberNumber,
            data: outfitStorage
        };
        
        const backupString = JSON.stringify(backupData, null, 2);
        const blob = new Blob([backupString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `BCOM_Backup_${memberNumber}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        ShowOutfitNotification("Outfits backed up successfully");
        
    } catch (error) {
        console.error("BCOM: Backup failed:", error);
        ShowOutfitNotification("Failed to backup outfits");
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
        const removeChangeListener = window.BCOM_Utils.eventListenerManager.add(inputElement, 'change', function() {
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
                        const storageKey = `${window.BCOM_Base.STORAGE_PREFIX}${memberNumber}`;
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
                        const MAX_OUTFITS = window.BCOM_Base.getUIConstants().MAX_OUTFITS || 80;
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
                        const state = window.BCOM_ModInitializer.getState();
                        if (!finalOutfits.folders.includes(state.currentFolder)) {
                            window.BCOM_ModInitializer.setState({ currentFolder: "Main" });
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
            if (window.BCOM_Utils.eventListenerManager.removeAllForElement) {
                window.BCOM_Utils.eventListenerManager.removeAllForElement(inputElement);
            }
            document.body.removeChild(inputElement);
        });

        // Trigger file selection dialog
        inputElement.click();
    } catch (error) {
        console.error("Restore failed:", error);
        ShowOutfitNotification("Failed to setup restore");
    }
}

function ShowOutfitNotification(message) {
    window.BCOM_Utils.ShowOutfitNotification(message);
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        registerDialogHooks,
        backupOutfits,
        restoreOutfits,
        ShowOutfitNotification
    };
}

// Global exports for direct script usage
window.BCOM_DialogHandlers = {
    registerDialogHooks,
    backupOutfits,
    restoreOutfits,
    ShowOutfitNotification
};
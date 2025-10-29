// Folder management system for BC Outfit Manager

// Create a new folder
function createFolder(folderName) {
    const memberNumber = Player.MemberNumber;
    const storageKey = `${window.BCOM_Base.STORAGE_PREFIX}${memberNumber}`;
    
    try {
        const storageData = localStorage.getItem(storageKey);
        const outfitStorage = storageData ? 
            JSON.parse(storageData) : 
            { outfits: [], folders: ["Main"], settings: {} };
        
        // Initialize folders if needed
        if (!outfitStorage.folders) {
            outfitStorage.folders = ["Main"];
        }
        
        // Validate folder name
        if (!folderName || folderName.trim() === "") {
            alert("Folder name cannot be empty.");
            return false;
        }
        
        const trimmedName = folderName.trim();
        
        // Check for reserved names
        const reservedNames = ["Main", "Default"];
        if (reservedNames.includes(trimmedName)) {
            alert("This folder name is reserved. Please choose a different name.");
            return false;
        }
        
        // Check if folder already exists
        if (outfitStorage.folders.includes(trimmedName)) {
            alert("A folder with this name already exists.");
            return false;
        }
        
        // Add the new folder
        outfitStorage.folders.push(trimmedName);
        
        // Save to storage
        localStorage.setItem(storageKey, JSON.stringify(outfitStorage));
        
        console.log(`BCOM: Created folder "${trimmedName}"`);
        return true;
        
    } catch (error) {
        console.error("BCOM: Failed to create folder:", error);
        alert("Failed to create folder. Please try again.");
        return false;
    }
}

// Delete a folder (moves all outfits to Main folder)
function deleteFolder(folderName) {
    const memberNumber = Player.MemberNumber;
    const storageKey = `${window.BCOM_Base.STORAGE_PREFIX}${memberNumber}`;
    
    try {
        const storageData = localStorage.getItem(storageKey);
        if (!storageData) return false;
        
        const outfitStorage = JSON.parse(storageData);
        
        // Can't delete Main folder
        if (folderName === "Main") {
            alert("Cannot delete the Main folder.");
            return false;
        }
        
        // Check if folder exists
        if (!outfitStorage.folders || !outfitStorage.folders.includes(folderName)) {
            alert("Folder does not exist.");
            return false;
        }
        
        // Move all outfits from this folder to Main
        if (outfitStorage.outfits) {
            outfitStorage.outfits.forEach(outfit => {
                if (outfit.folder === folderName) {
                    outfit.folder = "Main";
                }
            });
        }
        
        // Remove the folder
        outfitStorage.folders = outfitStorage.folders.filter(f => f !== folderName);
        
        // Save to storage
        localStorage.setItem(storageKey, JSON.stringify(outfitStorage));
        
        // Update current folder if we deleted the current one
        const state = window.BCOM_ModInitializer.getState();
        if (state.currentFolder === folderName) {
            window.BCOM_ModInitializer.setState({ currentFolder: "Main" });
        }
        
        console.log(`BCOM: Deleted folder "${folderName}"`);
        return true;
        
    } catch (error) {
        console.error("BCOM: Failed to delete folder:", error);
        alert("Failed to delete folder. Please try again.");
        return false;
    }
}

// Move outfits to a different folder
function moveOutfitsToFolder(outfitNames, targetFolder) {
    const memberNumber = Player.MemberNumber;
    const storageKey = `${window.BCOM_Base.STORAGE_PREFIX}${memberNumber}`;
    
    try {
        const storageData = localStorage.getItem(storageKey);
        if (!storageData) return false;
        
        const outfitStorage = JSON.parse(storageData);
        
        // Validate target folder exists
        if (!outfitStorage.folders || !outfitStorage.folders.includes(targetFolder)) {
            alert("Target folder does not exist.");
            return false;
        }
        
        let movedCount = 0;
        
        // Move each outfit
        if (outfitStorage.outfits) {
            outfitStorage.outfits.forEach(outfit => {
                if (outfitNames.includes(outfit.name)) {
                    outfit.folder = targetFolder;
                    movedCount++;
                }
            });
        }
        
        // Save to storage
        localStorage.setItem(storageKey, JSON.stringify(outfitStorage));
        
        console.log(`BCOM: Moved ${movedCount} outfits to folder "${targetFolder}"`);
        return movedCount > 0;
        
    } catch (error) {
        console.error("BCOM: Failed to move outfits:", error);
        alert("Failed to move outfits. Please try again.");
        return false;
    }
}

// Get all available folders
function getAllFolders() {
    const memberNumber = Player.MemberNumber;
    const storageKey = `${window.BCOM_Base.STORAGE_PREFIX}${memberNumber}`;
    
    try {
        const storageData = localStorage.getItem(storageKey);
        if (!storageData) return ["Main"];
        
        const outfitStorage = JSON.parse(storageData);
        return outfitStorage.folders || ["Main"];
        
    } catch (error) {
        console.error("BCOM: Failed to get folders:", error);
        return ["Main"];
    }
}

// Get outfit count for a specific folder
function getOutfitCountInFolder(folderName) {
    const memberNumber = Player.MemberNumber;
    const storageKey = `${window.BCOM_Base.STORAGE_PREFIX}${memberNumber}`;
    
    try {
        const storageData = localStorage.getItem(storageKey);
        if (!storageData) return 0;
        
        const outfitStorage = JSON.parse(storageData);
        if (!outfitStorage.outfits) return 0;
        
        return outfitStorage.outfits.filter(outfit => 
            outfit.folder === folderName || (!outfit.folder && folderName === "Main")
        ).length;
        
    } catch (error) {
        console.error("BCOM: Failed to get outfit count:", error);
        return 0;
    }
}

// Navigate to a specific folder
function navigateToFolder(folderName) {
    const folders = getAllFolders();
    
    if (!folders.includes(folderName)) {
        console.error(`BCOM: Folder "${folderName}" does not exist`);
        return false;
    }
    
    window.BCOM_ModInitializer.setState({ currentFolder: folderName });
    console.log(`BCOM: Navigated to folder "${folderName}"`);
    return true;
}

// Toggle folder management mode
function toggleFolderManagementMode() {
    const state = window.BCOM_ModInitializer.getState();
    const newMode = !state.isFolderManagementMode;
    
    window.BCOM_ModInitializer.setState({ 
        isFolderManagementMode: newMode,
        selectedOutfits: [] // Clear selections when toggling
    });
    
    console.log(`BCOM: Folder management mode ${newMode ? 'enabled' : 'disabled'}`);
    return newMode;
}

// Select/deselect outfit for folder operations
function toggleOutfitSelection(outfitName) {
    const state = window.BCOM_ModInitializer.getState();
    let selectedOutfits = [...state.selectedOutfits];
    
    if (selectedOutfits.includes(outfitName)) {
        // Remove from selection
        selectedOutfits = selectedOutfits.filter(name => name !== outfitName);
    } else {
        // Add to selection
        selectedOutfits.push(outfitName);
    }
    
    window.BCOM_ModInitializer.setState({ selectedOutfits });
    return selectedOutfits;
}

// Clear all outfit selections
function clearOutfitSelections() {
    window.BCOM_ModInitializer.setState({ selectedOutfits: [] });
}

// Validate folder name
function validateFolderName(name) {
    if (!name || typeof name !== 'string') {
        return { valid: false, error: "Folder name must be a non-empty string" };
    }
    
    const trimmed = name.trim();
    
    if (trimmed.length === 0) {
        return { valid: false, error: "Folder name cannot be empty" };
    }
    
    if (trimmed.length > 50) {
        return { valid: false, error: "Folder name cannot exceed 50 characters" };
    }
    
    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(trimmed)) {
        return { valid: false, error: "Folder name contains invalid characters" };
    }
    
    // Check for reserved names
    const reservedNames = ["Main", "Default", "CON", "PRN", "AUX", "NUL"];
    if (reservedNames.includes(trimmed.toUpperCase())) {
        return { valid: false, error: "This folder name is reserved" };
    }
    
    return { valid: true, sanitized: trimmed };
}

// Prompt user to create a new folder
function promptCreateFolder() {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return false;
    
    const validation = validateFolderName(folderName);
    if (!validation.valid) {
        alert(validation.error);
        return false;
    }
    
    return createFolder(validation.sanitized);
}

// Prompt user to select a folder for moving outfits
function promptSelectTargetFolder(excludeCurrentFolder = true) {
    const folders = getAllFolders();
    const state = window.BCOM_ModInitializer.getState();
    
    let availableFolders = folders;
    if (excludeCurrentFolder) {
        availableFolders = folders.filter(f => f !== state.currentFolder);
    }
    
    if (availableFolders.length === 0) {
        alert("No available folders to move to.");
        return null;
    }
    
    // Simple prompt for now - could be enhanced with a proper dropdown
    const folderList = availableFolders.join(", ");
    const selectedFolder = prompt(`Select target folder (${folderList}):`);
    
    if (!selectedFolder || !availableFolders.includes(selectedFolder)) {
        return null;
    }
    
    return selectedFolder;
}

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createFolder,
        deleteFolder,
        moveOutfitsToFolder,
        getAllFolders,
        getOutfitCountInFolder,
        navigateToFolder,
        toggleFolderManagementMode,
        toggleOutfitSelection,
        clearOutfitSelections,
        validateFolderName,
        promptCreateFolder,
        promptSelectTargetFolder
    };
}

// Global exports for direct script usage
window.BCOM_FolderSystem = {
    createFolder,
    deleteFolder,
    moveOutfitsToFolder,
    getAllFolders,
    getOutfitCountInFolder,
    navigateToFolder,
    toggleFolderManagementMode,
    toggleOutfitSelection,
    clearOutfitSelections,
    validateFolderName,
    promptCreateFolder,
    promptSelectTargetFolder
};
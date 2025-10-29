// Utility functions for BC Outfit Manager

// Chat and UI restoration utilities
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

// Dialog element visibility control
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

// Player initialization check utility
function waitForPlayerAndInit(initCallback) {
    if (window.Player && typeof Player.MemberNumber !== "undefined") {
        initCallback();
    } else {
        setTimeout(() => waitForPlayerAndInit(initCallback), 100);
    }
}

// Event listener management utility
const eventListenerManager = {
    listeners: new Map(),
    add: function(element, event, handler) {
        const id = Date.now() + Math.random();
        element.addEventListener(event, handler);
        this.listeners.set(id, { element, event, handler });
        return () => {
            const listener = this.listeners.get(id);
            if (listener) {
                listener.element.removeEventListener(listener.event, listener.handler);
                this.listeners.delete(id);
            }
        };
    },
    removeAll: function() {
        for (const [id, { element, event, handler }] of this.listeners) {
            element.removeEventListener(event, handler);
        }
        this.listeners.clear();
    }
};

// Animation management utility
const animationManager = {
    animations: new Map(),
    start: function(callback, id = 'default') {
        this.stop(id);
        const animation = () => {
            callback();
            if (this.animations.has(id)) {
                requestAnimationFrame(animation);
            }
        };
        this.animations.set(id, true);
        requestAnimationFrame(animation);
        return () => this.stop(id);
    },
    stop: function(id) {
        this.animations.delete(id);
    },
    stopAll: function() {
        this.animations.clear();
    }
};

// Input validation utilities
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

        window.BCOM_Utils.ErrorHandler.showError(`Failed to get valid ${type} name after ${maxAttempts} attempts.`);
        return null;
    }
};

// Error handling utilities
const ErrorHandler = {
    showError: function(message, error = null, recoverable = true) {
        console.error("BCOM Error:", message, error);
        alert(`BCOM Error: ${message}`);
        
        if (!recoverable && error) {
            console.error("Full error details:", error);
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


// Notification system
function ShowOutfitNotification(message, duration = 5) { // increase duration to 5 seconds because of the new Toasts notification system
    // Use the new beep system, always silent
    ServerShowBeep(message, duration * 1000, { silent: true });
}

// Character search function for bcom command
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

// Tab completion functionality for /bcom command
const tabCompletionState = {
    isActive: false,
    originalInput: "",
    matches: [],
    currentIndex: 0,
    lastTabTime: 0
};

// Track tab completion listener cleanup functions
let tabCompletionCleanup = {
    removeKeyDownListener: null,
    removeInputListener: null
};

function setupTabCompletion() {
    const chatInput = document.getElementById("InputChat");
    if (!chatInput) return;

    // Clean up existing listeners first to prevent duplicates
    if (tabCompletionCleanup.removeKeyDownListener) {
        tabCompletionCleanup.removeKeyDownListener();
        tabCompletionCleanup.removeKeyDownListener = null;
    }
    if (tabCompletionCleanup.removeInputListener) {
        tabCompletionCleanup.removeInputListener();
        tabCompletionCleanup.removeInputListener = null;
    }

    // Set up new listeners and store cleanup functions
    tabCompletionCleanup.removeKeyDownListener = eventListenerManager.add(chatInput, "keydown", (event) => {
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
    tabCompletionCleanup.removeInputListener = eventListenerManager.add(chatInput, "input", () => {
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

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        restoreChatLog,
        toggleDialogElements,
        waitForPlayerAndInit,
        eventListenerManager,
        animationManager,
        InputValidator,
        ErrorHandler,
        ShowOutfitNotification,
        targetfinder,
        setupTabCompletion,
        resetTabCompletion,
        handleTabCompletion,
        getPlayerMatches
    };
}

// Global exports for direct script usage
window.BCOM_Utils = {
    restoreChatLog,
    toggleDialogElements,
    waitForPlayerAndInit,
    eventListenerManager,
    animationManager,
    InputValidator,
    ErrorHandler,
    ShowOutfitNotification,
    targetfinder,
    setupTabCompletion,
    resetTabCompletion,
    handleTabCompletion,
    getPlayerMatches
};
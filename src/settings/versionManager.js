// Version update notification system for BC Outfit Manager

function checkVersionUpdate() {
    try {
        const memberNumber = Player.MemberNumber;
        const storageKey = `${window.BCOM_Base.STORAGE_PREFIX}${memberNumber}`;
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
        const currentVersion = window.BCOM_Base.VERSION_NUMBER;

        // Check if this is a version update
        if (!isFirstTime && (!storedVersion || storedVersion !== currentVersion)) {
            // Send private message notification about update
            setTimeout(() => {
                const updateMessage = `BC Outfit Manager has been updated to v${currentVersion}!\n\n` +
                    `New changes have been added. ` +
                    `You can view the full changelog at:\n` +
                    `https://github.com/Utsumi24/BCOM/blob/main/CHANGELOG.md\n\n` +
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

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkVersionUpdate
    };
}

// Global exports for direct script usage
window.BCOM_VersionManager = {
    checkVersionUpdate
};
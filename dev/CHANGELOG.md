# Changelog 

Any changes made to the addon will be here for easier documentation.

## [v0.8]
- Converted the addon to a modular version.
- Introducing the the "Outfit Studio". A new addition that lets the player create custom outfits without having to tie up another player/NPC or themselves. It allows the player to apply restraints/locks/clothing to a "dummy" character and save the entire thing to the Outfit Manager or export as a BCX code.  The Outfit Studio also allows you to edit saved Outfit Manager outfits as well as import an outfit from a BCX code.
- Added checkboxes to the left of each Outfit Manager outfit so it can be edited in the Outfit Studio.
- Increased max outfits to `100`.

## [v0.7.8]
- Added tab auto-completion for the /bcom command.  Type "/bcom" and press tab to cycle through all players in the chatroom (in the order they're listed). Type in a partial name to only cycle through players of the partial name that was entered
- Added `ChatRoomRefreshChatSettings` when exiting the Outfit Manager when using the /bcom command so blind/deafened effects will apply to chat properly
- Changed player permission logic: You can now open the Outfit Manager on any player regardless of permissions, but you will not be able to apply outfits if you do not have permissions. Attempting to apply an outfit will show a "You don't have permission to apply outfits to this character" notification
	- If you do not have permission to apply outfits to the `CurrentCharacter`, all outfits listed will be pink for visual feedback
- Changed Notification duration from a default of `3` seconds to `5` seconds with the new Toasts notification system
- Added a "Padlocks" dropdown menu to give the user the option to remove or replace all locks on an outfit that is being applied
	- When selecting a padlock from the dropdown that has configurable options, a modal-based dialog box will appear that will let you configure the padlock's properties (password, timer, combo, etc).  If the dialog box is cancelled, the default properties will be used
	- Available padlocks in the list will reflect the `CurrentCharacter`'s permissions and whether or not you can use them based on relationship status (Owner/Lover)
	- Selected padlocks from the dropdown will be reflected when exporting a saved outfit as a BCX code
	- For timed padlocks, added an option to randomize the "Remove item when timer expires" option for each applied padlock
- Added checks for cosplay items in saved outfits: Cosplay items will neither replace or be added when applying an outfit to the `CurrentCharacter`
- Changed the "Import outfits from backup file" icon to use the down arrow icon (to also match the crafting screen for consistency)

## [v0.7.7]
- When BCOM detects a version change (which will happen starting with this version), a private message will be sent to the player notifying them and to look at the changelog if they desire.
- Changed how cosplay items are detected.  Used `asset.BodyCosplay` instead of `asset.Group.BodyCosplay` because it seems the surface level value is more accurate? (See `HairAccessory1` + `BunnyEars2`). Depending on any potential feedback, this may change back to the old behavior or I might include checking for both cases.
- Added message in the help text to display how many outfit slots you have remaining
- Reverted some changes made in how outfits are loaded as it was for some reason changing the Y-position of the `CurrentCharacter` and/or Player before quickly fixing itself when an outfit is applied.
- Changed how the Outfit Manager is initialized and waits until the Player is initialized after login before initializing the Outfit Manager itself.  This was done so the remaining outfit slots can be properly calculated as it needs to read the proper key labeled with the player's member number.
- Added a "New!" text with the Outfit Manager icon with a glow if you haven't opened the Outfit Manager before as a way to show new users. Starting with this version, all users will see this.
- Added checks when creating new folders or renaming them so certain folder names cannot be used.
- Added more robust outfit code checking when importing from BCX codes
- Added some additional error handling

## [v0.7.6.2]
- Reverted a change to not use `CharacterAppearanceNaked` to not remove existing cosplay items when applying outfits as `CharacterAppearanceNaked` still removes them if you apply an outfit to yourself or others that allow for cosplay changes.


## [v0.7.6.1]
- Fixed initialization of `C.Appearance` to always be an array for compatibility with the game.
- Used `ServerAppearanceBundle` and `ServerAppearanceLoadFromBundle` to copy the CurrentCharacter's appearance to the display character.
- Added "First" and "Last" page buttons to pagination controls for easier navigation if you are two or more pages away from the first or last pages.
- Updated notification system to use `ServerShowBeep` with silent and duration options.
- Improved deep copying of appearance when not previewing an outfit.

## [v0.7.6]
- Added a "Hair Only" checkbox to the outfit manager to allow players to save only hairstyles as outfits and to only apply hairstyles instead of the entire outfit.
- Added help text to explain the Hair Only checkbox.
- The help text will not change to show locked items if the Hair Only checkbox is checked.
- Added a ✂️ icon to denote "Hair Only" outfits.
- Changed how BCX importing works to instead pass the imported outfit into the saveOutfit function instead of using its own saving method.
- Altered how the BCX export code is generated to only export hair if the Hair Only checkbox is checked.
- Added a check when importing a BCX code to check if it only contains hair, and if so, it will import it as a hair only outfit.

## [v0.7.5.1]
- Recreated the Outfit Manager button to use DOM elements so it can be clicked on over other DOM elements.
- Properly hide and restore the Pose, Expressions, and Owner Rules Menus when the Outfit Manager is opened or closed.
- Fixed dialog restoration when exiting the Outfit Manager due to DOM element integration.

## [v0.7.5] 
- Added a checkbox to apply hairstyles when wearing an outfit.
- Saving outfits now saves the hairstyle as well.
- Added help text regarding the apply hair checkbox.
- Made the Outfit Manager's title to only use the player's nickname instead of the CurrentCharacter's name to avoid confusion.
- Fixed outfit position preservation when overwriting outfits.
- Enhanced export mode to update BCX codes in real-time when hair preference changes.

## [v0.7.4.1]
- Fixed issue with sorting outfits. Outfit sorting works as intended again.

## [v0.7.4]
- Added a better check for the /bcom command when a name is specified, it exclusively checks for the character's nickname.
- Added a check for the /bcom command if more than one character has the same first name, it will notify the user to use the member number instead.
- Fixed exit button not working if there is no previous dialog mode to return to, it now defaults to the 'dialog'.
- Added permission check to prevent the outfit manager from being opened if the player doesn't have permission to interact with the character that was clicked on.
- Added permission check for the /bcom command.

## [v0.7.3]
- Cosplay items are not removed when previewing or applying an outfit.

## [v0.7.2]
- Fixed issue with duplicate outfit names across different folders.
- Added check to prevent moving outfits when name conflicts exist in the destination folder.
- Added check to prevent saving an outfit when the name already exists in another folder.
- Fixed notification when importing outfits to show the actual number of outfits imported instead of the total number of outfits.
- Added chat command "bcom" to open the outfit manager for a specific character, if a name is provided, or for yourself if no name is provided.

## [v0.7.1] 
- Ensured that all modes are reset when exiting Outfit Manager.

## [v0.7.0]
- Added folder system for organizing outfits.
  - Allows the user to create, rename, and delete folders.
  - Allows the user to move outfits between folders.
  - Added a breadcrumb-style back button to navigate through folders.

## [v0.6.1]
- Added backup and restore buttons to outfit manager.
- Removed debug coordinates.

## [v0.6.0]
- Added support for exporting outfits.
- Added separate help text for sort mode and export mode.
- Checked if body cosplay is blocked before applying cosplay items from outfits.

## [v0.5.3]
- Added outfit limit of 80 outfits.
- Prevented exiting the outfit manager when the display character is clicked on.

## [v0.5.2]
- Added notification when you try to apply an outfit while in sort mode.
- Amended help text to let player know they can't apply an outfit when in sort mode.

## [v0.5.1]
- Changed how display character's name is displayed to display the CurrentCharacter's nickname so it will show (Preview) more reliably.
- Made display character visible when blind while in outfit manager.
- Made room background visible when blind while in outfit manager.

## [v0.5.0]
- Removed legacy UTF16 compression support.
- Standardized outfit storage to exclusively use BCX format.
- Changed how outfits are saved to use a single storage key per member number.
- Added outfit sorting functionality with up/down controls.
- Cleaned up and optimized codebase.
- Improved error handling for BCX outfit validation.

## [v0.4.1]
- Fixed console warning by properly implementing "outfits" dialog mode.
- Improved dialog mode transitions to/from outfit manager.
- Added proper cleanup when switching dialog modes.

## [v0.4.0]
- Added support for importing BCX outfits.
- Improved data storage format using Base64 compression.
- Added backwards compatibility for legacy outfit formats.
- Fixed preview display issues with imported outfits.
- Added robust error handling and validation for BCX outfit imports.
- Added error codes (E1-E4) for better debugging of import issues.
- Improved outfit rename functionality with better error handling.
- Added validation to prevent empty outfit names.
- Added confirmation dialog for overwriting existing outfits.
- Added support for both Base64 and UTF16 decompression when loading outfits.
- Added user feedback notifications for outfit actions.
- Added version text to bottom right corner of game window.

## [v0.3.1]
- Fixed issue where character poses weren't updating correctly in outfit preview.
- Removed unnecessary Y-position offset adjustments that were causing display issues for poses.
- Added "(Preview)" suffix to display character's name.
- Improved display of locked items that cannot be replaced by outfit changes by using the help text instead of the button's hover text.

## [v0.3.0]
- Added outfit preview functionality when hovering over outfits.
- Added help text section showing outfit information and locked items.
- Improved outfit menu layout and organization.
- Added pagination for outfits (8 outfits per page).

## [v0.2.1]
- Fixed issue where outfit menu would not properly return to previous dialog mode.
- Added support for both 'items' and 'dialog' mode when accessing outfit manager.
- Improved button positioning consistency across different dialog modes.
- Fixed back button location to match game's standard positioning depending on dialog mode.

## [v0.2.0]
- Added rename functionality for outfits.
- Added delete functionality for outfits.
- Added confirmation dialogs for overwriting and deleting outfits.
- Added notification system for outfit actions.
- Improved error handling and user feedback.

## [v0.1.0]
- Initial release.
- Basic outfit saving and loading functionality.
- Added outfit manager button to character dialog.
- Basic outfit menu interface. 



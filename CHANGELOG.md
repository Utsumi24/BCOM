# Changelog

All notable changes to this project will be documented in this file.

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

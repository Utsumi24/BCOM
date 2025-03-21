# BC Outfit Manager (BCOM)

### Where do I find it?
You can open the Outfit Manager in two ways:
-The Outfit Manager is found after you click on your character or another character.  It will be located in the lower-left corner of your screen (to the left of the WCE Instant Message button if you use it).
-Typing '/bcom' in chat.  If you specify a player name or a member number, it'll open the Outfit Manager as that targeted player instead.

### What does this do?
It allows you to save outfits (including restraints) to your browser's local storage and also saving outfits via BCX outfit codes.  Outfits can also be applied to other players if you click on them in chatrooms. WCE's anti-cheat will still trigger if the target player has it enabled. The Outfit Manager provides help text on the left side of the screen. You can even export your entire Outfit Manager list to be saved locally and to be imported later.

### Why use this over the game's default wardrobe system?
You don't have to. It's merely just an alternate way of saving custom outfits. The biggest reason I made this is from hearing a bunch of people losing their wardrobe outfits and me wanting to have some kind of alternative way of saving them... and I was also affected by wardrobe loss too.

### How many outfits can I save?
Up to 80.  I figured it was a nice round number. ¯\\_(ツ)_/¯

### Tampermonkey/Violentmonkey install:
https://utsumi24.github.io/BCOM/bcomloader.user.js

### Bookmark:
```
javascript:(()=>{fetch('https://utsumi24.github.io/BCOM/bcom.js?'+Date.now()).then(r=>r.text()).then(r=>eval(r));})();
```

### Disclaimer
I have only tested this on Chrome on a desktop browser.  I have not tested this on mobile or any other browser, so your mileage my vary. This addon won't be very useful if you use Incognito Mode.

I'm also a complete newbie to Github and coding in general, so don't be too overly critical :)
If you have any questions or find bugs/crashes, you can @ me in the BC Scripting Community discord server.

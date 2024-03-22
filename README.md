# Virtual's Custom Quest Loader

### A lightweight dependency that takes care of quests, locales, images, assorts and zones importing, with an included GUI for quest zone creation. All importing is done in-memory so SPT directories are not modified.

## Installation
Download the appropriate release zip and extract it into your SPT folder. If done correctly, Virtual's Custom Quest Loader will be automatically placed in the correct location (/user/mods/). 

## Full Feature List (3.8.0)
* Quest Importing
* Image Importing
* Locale Importing (With a placeholder feature)
* Trader and Quest Assort Importing
* Zone Importing
* Tool for Zone Creation / Visualisation
* Side Specific Quests (USEC / BEAR Only)
* Date Range Quests

## Quest Making QnA
### What do I need to create a quest?
The bare minimum is Notepad, or any basic text editor. However I do recommend VSCode because it allows you to see basic syntactical errors and prettify files.

### How can I learn to create quests?
The easiest way is to start simple. Look at the existing quest files, and some modded quests to see how quests work, and start changing some values. Then when you get more confident, try to create your own. You do not need to create every single quest from scratch. If there is a base game quest that is similar to what you want, copy it and change the values. If you find that you are spending alot of time and still receiving errors, come ask in the discord for help. You also have tools like this Reference Sheet to help you.

### How do I upload my quest / mod requiring VCQL?
All you need to do is include a path to "user/mods/Virtual's Custom Quest Loader" with the same folder structure you used to develop your quests. When a user downloads VCQL, and then your mod, they will be able to place it straight into the loader and the files will go to where they need to be. Please see VCQ as an example on this structure. Do not include the mod directly in your download.

## Modding Info
### General Overview
For a working quest, you will need a file for quests and a file for locales. Each quest has various conditions to start, such as level, loyalty level, previous quest etc. Conditions to finish such as kill, find, place etc. And rewards for completing the conditions. Learning how quests function and getting efficient at creating quests is a very steep curve. This has, and can be achieved by aspiring modders with no experience in modifying games, or creating mods. This loader is designed to remove all code aspects of importing quests and associated files into the game, and leaves the task of creating quests to be solely within JSON files. I advise all new and interested people to look at my VCQ mod, and how it is setup, to better understand quests and how this loader works.

(For assistance with creating quests, feel free to reference [Resources: Quest Values Reference Tool](https://hub.sp-tarkov.com/doc/entry/57-resources-quest-values-reference-tool/))

### Quests
* Quest files can have any name and any number of quests. They are simply an array of quests objects. They need to follow the format seen in 'AKI_DATA/server/database/templates/quests.json' as this is where the mod will import to.

### Locales
* Locales are the language files associated with text, items, events and any other object in EFT with a text to display. Each quest, and all of its conditions require locales that will be displayed to the user. Locales are key value pairs where the key is the quest or condition ID and the value is the string of text to be displayed to the user (e.g. "VCQ_1 name": "Welcome To Tarkov". All files in the locales folder will be imported to their corresponding component in AKI_DATA/server/database/locales/global/#LANGUAGE#.
* VCQL supports all languages currently available in SPT, and ensures that quests without translated locales will be consistent in other languages. This is done by adding the supplied locales to every other language where there isn't a translated text. For instance, most quests will only have 'en' or English locales, these will be added to every other language in SPT, so the default key is not shown, and more users can enjoy your quests.

### Images
* All images should be 314 x 177 and MUST be either a .png or .jpg
* To use custom images, place the image into the 'res/quests' or 'res/traders' directory and reference the name of the image in your quest / trader file, in the same format that the default images are referenced.
* All Tarkov images are in AKI_DATA/server/images/ for reference but please use the provided loader directory and do not direct images straight to this location.

## 3.8.0 Features
### Assorts
* Base game assorts are in AKI_DATA/server/database/traders/#traderID#/assort and questassort.json
* Assorts are trades that are offered by a trader, which can either be a purchase with cash or a barter.
* Base Values
  * In any assort file for VCQL, a "traderID", "items", "barter_scheme" and "loyal_level_items" property are required. 'traderID' specifies the trader that will be used for every assort in that file. 'items' lists all the barters and how many are available. 'barter_scheme' lists the items required for a trader. 'loyal_level'items' uses the id values from a barter item as the key and specifies the loyalty level required. 
  * All assort items have a 'parentId' and a 'slotId', which for any single item will have the value 'hideout'. In the case of nested items, like a weapon preset, these values then change to reference eachother in a tree-like structure. (Weapon builds can be saved in the profile and copied to assorts (with a few changes) to save time, instead of manually building each preset)
* VCQL Specific Values
  * Barter items can have a 'unlockedOn' and 'questID' property to specify that they will be unlocked upon the satisfaction of that quest condition. (Assorts without these values will just be treated as normal barters, so you can use this system to add assorts to traders)
  * 'questID' is simply the ID of the quest and 'unlockedOn' is the condition type that unlocks the assort, which can be either 'started', 'success' or 'fail'.

### Side Specific and Date Ranges
* Side specific quests are supported. This acts as a whitelist for which side can access the quest. To enable this, add a property to a quest called "sideExclusive" with either "Bear" or "Usec" as the value.
* To enable a date range, 4 properties are required within the base of a quest. 'startMonth', 'endMonth', 'startDay', 'endDay'. By configuring these properties, a quest will only be available to the user during the specified date.

## Zones
* Zones and Places are used to specify locations on the map used (in our case) for quest conditions. Conditions such as eliminating bots in a zone, finding a zone, placing an item / marker and launching a flare all require the location to be specified.
* Zone files are output by the GUI tool and can be placed in the 'zones' directory. By referencing the 'ZoneId', they can be loaded in and used by quests.
* (See below if you need valid values)

## Zone Creation Tool
(I forgot to adjust the order of section 1, so thats why they are backwards)
![Tool](https://github.com/VirtualAE/Virtuals-Custom-Quest-Loader/assets/134059573/2db2156b-004d-4095-ad32-6167f6e60c8a)

### Creating a New Zone
* The Zone Type corresponds to the type of quest condition you want to make.
    * Placeitem is used for placing markers, items and beacons.
    * Visit is for exploration conditions, where the user needs to enter the zone.
    * Botzonekill is for zones where the user needs to eliminate targets in that specific area.
    * Flarezone is for conditions where the user needs to launch a flare.
        * If Flarezone is used, then the Flare Type must also be specified.
* With a Zone Type and Zone ID specified, a new zone can be created. A red box will be placed at the feet of your player.
![Red Zone Box](https://github.com/VirtualAE/Virtuals-Custom-Quest-Loader/assets/134059573/3b1f9aa5-426f-4c64-8c7b-89eea038c3bd)

### Navigating Through Zones
* To navigate through the zones, the 'next' and 'prev' buttons can be used to cycle through the zone cubes you have placed. The currently selected zone cube will be green.
* When a different zone is selected, the Zone ID will be displayed in the middle box and the position, rotation and scale boxes will be updated with the values of the newly selected zone cube.
![Selected Zone](https://github.com/VirtualAE/Virtuals-Custom-Quest-Loader/assets/134059573/6de044e7-29f1-4f29-bb92-b8cff3efdaeb)
![Green Box](https://github.com/VirtualAE/Virtuals-Custom-Quest-Loader/assets/134059573/5e5a7315-c8e3-480c-9a48-6413f0b70549)

### Configuring a Zone
* The boxes containing the values themselves cannot be edited as they are string representations (to be fixed). To cater for this, the Zone Adjustment Value can be changed as needed to alter the position, scale and rotation of the zone.
* You can use the arrows to move, scale and rotate the zone cube as you need. Keep in mind that if you are inside the cube, you won't be able to see it.
![Configuration of Zone](https://github.com/VirtualAE/Virtuals-Custom-Quest-Loader/assets/134059573/c38811eb-9207-4c3c-8036-b7aa7d554e75)

### Output Zones
* Once you have all the zones you want, the 'Output Zones' button will output the zones into a JSON format that the loader can read.
* The output file will be put into your SPT folder and will start with 'VCQL'. This file can be renamed and put straight into the 'zones' directory within the loader.

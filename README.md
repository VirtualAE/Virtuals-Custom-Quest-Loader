## **Custom Quest Loader**
Modders can follow these instructions to easily import quests into the game.
(You can include this dependency file within your own download)

For a successful quest you always need a database/quests entry and a database/locales entry. 
To help with values, I suggest following through existing quests or modded ones to see their functionality. You can also utilise this reference tool to help create quests. https://hub.sp-tarkov.com/doc/entry/57-resources-quest-values-reference-tool/
 

## **database/quests**
Here is where you place all json files that contain the contents of the quests. They should have the same format as quests.json in aki-data/server/database/templates/ as this is the file that we are importing into. There is no required naming scheme or max number of quests allowed for each file. You can utilise multiple json quest files within this folder.


## **database/locales**
Locale files need to be placed into the correct folder so they are loaded to the correct language setting. You can however use any name for the locale file itself. You can locate the correct abbreviation by searching the server files within SPT (EN is English). Locales for quests contain the string values used for all displayed text. These files must follow the format located at AKI_DATA/server/database/locales/global/#LANGUAGE#/quests as this is the file that we are importing into.


## **res/quests**
PLEASE USE THIS METHOD FOR QUEST IMAGES. Creating a folder path directly to the users images is bad practice. All images need to be 314 x 177 AND need to be either a .png or .jpg. Imported pictures don't necessarily need to be used but TO use them the name of the image is used in the corresponding option for image within database/quests. 

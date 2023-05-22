"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const modPath = path.normalize(path.join(__dirname, '..'));
const fs = require('fs');
class Mod {
    postDBLoad(container) {
        const logger = container.resolve("WinstonLogger");
        //counters
        let questCounter = 0;
        let imageCounter = 0;
        //get database from server
        const databaseServer = container.resolve("DatabaseServer");
        const database = databaseServer.getTables();
        const imageRouter = container.resolve("ImageRouter");
        //quests variable
        const questsServer = database.templates.quests;
        const questsPath = modPath + ("/database/quests/");
        //locales
        const localesServer = database.locales.global;
        const localesPath = modPath + ("/database/locales/");
        const allLocales = [
            "ch", "cz", "en", "es-mx", "es", "fr", "ge", "hu", "it", "jp", "pl", "po", "ru", "sk", "tu"
        ];
        //images
        const imagesPath = modPath + ("/res/quests/");
        //read the directory of locales and import all files from each locale
        for (const language in allLocales) {
            const languageValue = allLocales[language];
            fs.readdir(localesPath + languageValue, function (err, files) {
                if (files.length == 0) {
                    return;
                }
                else if (err) {
                    logger.log(files + "Error loading locales from Virtual's Custom Quest Loader", "red");
                }
                else {
                    files.forEach(function (file) {
                        const filePopLocale = file.split('.').pop();
                        if (filePopLocale == "json") {
                            const localesFullPath = localesPath + languageValue + "/" + file;
                            const localeSelected = require('' + localesFullPath);
                            const serverLocaleFile = localesServer[languageValue];
                            for (const i in localeSelected) {
                                serverLocaleFile[i] = localeSelected[i];
                            }
                            logger.log(file + " loaded from " + languageValue + " locale", "yellow");
                        }
                    });
                }
            });
        }
        //read the directory of quests and import all quest files
        fs.readdir(questsPath, function (err, files) {
            if (files.length == 0) {
                return;
            }
            else if (err) {
                logger.log("Error loading quests files from Virtual's Custom Quest Loader", "red");
            }
            else {
                files.forEach(function (file) {
                    const filePopQuests = file.split('.').pop();
                    if (filePopQuests == "json") {
                        const questsFullPath = path.join(questsPath, file);
                        const questSelected = require('' + questsFullPath);
                        for (const i in questSelected) {
                            questsServer[i] = questSelected[i];
                            questCounter += 1;
                        }
                        logger.log(file + " loaded from Virtual's Custom Quest Loader", "yellow");
                    }
                });
                if (questCounter > 0) {
                    logger.log(questCounter + " quests total loaded from Virtual's Custom Quest Loader", "yellow");
                }
            }
        });
        //images
        fs.readdir(imagesPath, function (err, files) {
            if (err) {
                logger.log("Error loading images from Virtual's Custom Quest Loader", "red");
            }
            else {
                for (const x in files) {
                    const arrayValue = files[x];
                    const imagesFullPath = (path.join(imagesPath, arrayValue));
                    const filePopImage = arrayValue.split('.').pop();
                    if (filePopImage == "jpg" || filePopImage == "png") {
                        //extension checker
                        //logger.log(arrayValue+" loaded from Virtual's Custom Quests", "yellow")
                        let fileExtens = "";
                        switch (filePopImage) {
                            case "jpg":
                                fileExtens = ".jpg";
                                break;
                            case "png":
                                fileExtens = ".png";
                                break;
                        }
                        //router
                        imageRouter.addRoute("/files/quest/icon/" + arrayValue.replace(fileExtens, ""), imagesFullPath);
                        imageCounter += 1;
                    }
                }
                if (imageCounter > 0) {
                    logger.log(imageCounter + " images total loaded from Virtual's Custom Quest Loader", "yellow");
                }
            }
        });
    }
}
module.exports = {
    mod: new Mod()
};

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
const fs = require('fs');
const modPath = path.normalize(path.join(__dirname, '..'));
class VCQL {
    postDBLoad(container) {
        const database = container.resolve("DatabaseServer").getTables();
        const imageRouter = container.resolve("ImageRouter");
        const logger = container.resolve("WinstonLogger");
        const configServer = container.resolve("ConfigServer");
        this.importQuests(database, logger);
        this.importLocales(database, configServer);
        this.routeImages(imageRouter, logger);
    }
    loadFiles(dirPath, extName, cb) {
        if (!fs.existsSync(dirPath))
            return;
        const dir = fs.readdirSync(dirPath, { withFileTypes: true });
        dir.forEach(item => {
            const itemPath = path.normalize(`${dirPath}/${item.name}`);
            if (item.isDirectory())
                this.loadFiles(itemPath, extName, cb);
            else if (extName.includes(path.extname(item.name)))
                cb(itemPath);
        });
    }
    importQuests(database, logger) {
        let questCount = 0;
        this.loadFiles(`${modPath}/database/quests/`, [".json"], function (filePath) {
            const item = require(filePath);
            if (Object.keys(item).length < 1)
                return;
            for (const quest in item) {
                database.templates.quests[quest] = item[quest];
                questCount++;
            }
        });
        logger.success(`[VCQL] Loaded ${questCount} custom quests.`);
    }
    importLocales(database, configServer) {
        const serverLocales = configServer.getConfig("aki-locale").serverSupportedLocales;
        const addedLocales = {};
        for (const locale of serverLocales) {
            this.loadFiles(`${modPath}/database/locales/${locale}`, [".json"], function (filePath) {
                const localeFile = require(filePath);
                if (Object.keys(localeFile).length < 1)
                    return;
                for (const currentItem in localeFile) {
                    database.locales.global[locale][currentItem] = localeFile[currentItem];
                    if (!Object.keys(addedLocales).includes(locale))
                        addedLocales[locale] = {};
                    addedLocales[locale][currentItem] = localeFile[currentItem];
                }
            });
        }
        // placeholders
        for (const locale of serverLocales) {
            if (locale == "en")
                continue;
            for (const englishItem in addedLocales["en"]) {
                if (locale in addedLocales) {
                    if (englishItem in addedLocales[locale])
                        continue;
                }
                if (database.locales.global[locale] != undefined)
                    database.locales.global[locale][englishItem] = addedLocales["en"][englishItem];
            }
        }
    }
    routeImages(imageRouter, logger) {
        let imageCount = 0;
        this.loadFiles(`${modPath}/res/quests/`, [".png", ".jpg"], function (filePath) {
            imageRouter.addRoute(`/files/quest/icon/${path.basename(filePath, path.extname(filePath))}`, filePath);
            imageCount++;
        });
        logger.success(`[VCQL] Loaded ${imageCount} custom images.`);
    }
}
module.exports = { mod: new VCQL() };

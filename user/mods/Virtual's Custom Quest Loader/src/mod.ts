import { DependencyContainer} from "tsyringe";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { ConfigServer } from "@spt-aki/servers/ConfigServer";
import { ConfigTypes } from "@spt-aki/models/enums/ConfigTypes";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { ImageRouter } from "@spt-aki/routers/ImageRouter";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import * as path from "path";
const fs = require('fs');
const modPath = path.normalize(path.join(__dirname, '..'));

class VCQL implements IPostDBLoadMod {
    public postDBLoad(container: DependencyContainer): void 
    {
        const database = container.resolve<DatabaseServer>("DatabaseServer").getTables()
        const imageRouter = container.resolve< ImageRouter >("ImageRouter")
        const logger = container.resolve<ILogger>("WinstonLogger")
        const config = container.resolve<ConfigServer>("ConfigServer").getConfig(ConfigTypes.QUEST)

        this.importQuests(database, logger, config)
        this.importLocales(database)
        this.routeImages(imageRouter, logger)
    }

    public loadFiles(dirPath, extName, cb) {
        if (!fs.existsSync(dirPath)) return
        const dir = fs.readdirSync(dirPath, { withFileTypes: true })
        dir.forEach(item => {
            const itemPath = path.normalize(`${dirPath}/${item.name}`)
            if (item.isDirectory()) this.loadFiles(itemPath, extName, cb)
            else if (extName.includes(path.extname(item.name))) cb(itemPath)
        });
    }

    public importQuests(database, logger, config) {
        let questCount = 0
        this.loadFiles(`${modPath}/database/quests/`, [".json"], function(filePath) {
            const item = require(filePath)
            if (Object.keys(item).length < 1) return 
            for (const quest in item) {
                if (item[quest].side == "Usec") config.usecOnlyQuests.push(quest)
                if (item[quest].side == "Bear") config.bearOnlyQuests.push(quest)
                item[quest].side = "Pmc"
                database.templates.quests[quest] = item[quest]
                questCount++
            }
        })
        logger.success(`[VCQL] Loaded ${questCount} custom quests.`)
    }

    public importLocales(database) {
        const serverLocales = ['ch','cz','en','es','es-mx','fr','ge','hu','it','jp','pl','po','ru','sk','tu']
        const addedLocales = {}
        for (const locale of serverLocales) {
            this.loadFiles(`${modPath}/database/locales/${locale}`, [".json"], function(filePath) {
                const localeFile = require(filePath)
                if (Object.keys(localeFile).length < 1) return
                for (const currentItem in localeFile) {
                    database.locales.global[locale][currentItem] = localeFile[currentItem]
                    if (!Object.keys(addedLocales).includes(locale)) addedLocales[locale] = {}
                    addedLocales[locale][currentItem] = localeFile[currentItem]
                }
            })
        }

        // placeholders
        for (const locale of serverLocales) {
            if (locale == "en") continue
            for (const englishItem in addedLocales["en"]) {
                if (locale in addedLocales) { 
                    if (englishItem in addedLocales[locale]) continue
                }
                if (database.locales.global[locale] != undefined) database.locales.global[locale][englishItem] = addedLocales["en"][englishItem]
            }
        }
    }

    public routeImages(imageRouter, logger) {
        let imageCount = 0
        this.loadFiles(`${modPath}/res/quests/`, [".png", ".jpg"], function(filePath) {
            imageRouter.addRoute(`/files/quest/icon/${path.basename(filePath, path.extname(filePath))}`, filePath)
            imageCount++
        })
        logger.success(`[VCQL] Loaded ${imageCount} custom images.`)
    }
}

module.exports = { mod: new VCQL() }
import { DependencyContainer} from "tsyringe";
import { IPostDBLoadMod } from "@spt/models/external/IPostDBLoadMod";
import { IPreSptLoadMod } from "@spt/models/external/IPreSptLoadMod"
import type {StaticRouterModService} from "@spt/services/mod/staticRouter/StaticRouterModService";
import { ConfigServer } from "@spt/servers/ConfigServer";
import { ConfigTypes } from "@spt/models/enums/ConfigTypes";
import { DatabaseServer } from "@spt/servers/DatabaseServer";
import { ImageRouter } from "@spt/routers/ImageRouter";
import { ILogger } from "@spt/models/spt/utils/ILogger";
import * as path from "path";
const fs = require('fs');
const modPath = path.normalize(path.join(__dirname, '..'));

class VCQL implements IPostDBLoadMod, IPreSptLoadMod {
    private enableLogging;
    private enableDebugLogging;
    private ignoreSideExclusive;
    private zones;

    public preSptLoad(container: DependencyContainer): void {
        const staticRouterModService: StaticRouterModService = container.resolve<StaticRouterModService>("StaticRouterModService")
        const logger = container.resolve<ILogger>("WinstonLogger")

        this.loadZones()
        staticRouterModService.registerStaticRouter(
            "vcql-get-zones",
            [
                {
                    url: "/vcql/zones/get",
                    action: (url, info, sessionId, output) => 
                    {
                        if (this.enableDebugLogging) logger.success("[VCQL-DEBUG] Zone router hit.")
                        return JSON.stringify(this.zones);
                    }
                }
            ],
            "vcql-get"
        )
    }

    public postDBLoad(container: DependencyContainer): void 
    {
        const database = container.resolve<DatabaseServer>("DatabaseServer").getTables()
        const imageRouter = container.resolve< ImageRouter >("ImageRouter")
        const logger = container.resolve<ILogger>("WinstonLogger")
        const config = container.resolve<ConfigServer>("ConfigServer").getConfig(ConfigTypes.QUEST)

        this.importConfig()
        this.importQuests(database, logger, config)
        this.importAssorts(database, logger)
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

    public loadZones() {
        let zones = []
        this.loadFiles(`${modPath}/database/zones/`, [".json"], function(filePath) {
            const zoneFile = require(filePath)
            if (Object.keys(zoneFile).length > 0)
                zones.push(... zoneFile)
        })
        this.zones = zones
    }

    public importConfig() {
        let config = require(`${modPath}/database/config/config.json`)
        this.enableLogging = config.enableLogging 
        this.enableDebugLogging = config.enableDebugLogging
        this.ignoreSideExclusive = config.ignoreSideExclusive
    }

    public importQuests(database, logger, config) {
        let questCount = 0
		let prunedCount = 0
        let debugLogging = this.enableDebugLogging
        let ignoreSideExclusive = this.ignoreSideExclusive
        this.loadFiles(`${modPath}/database/quests/`, [".json"], function(filePath) {
            const item = require(filePath)
            if (Object.keys(item).length < 1) return 
            for (const quest in item) {
				// Date check
				if (item[quest].startMonth && item[quest].startMonth > 0) {
                    let currentDate = new Date()

                    let questStartDate = new Date(currentDate.getFullYear(), item[quest].startMonth - 1, item[quest].startDay)
                    let questEndDate = new Date(currentDate.getFullYear(), item[quest].endMonth - 1, item[quest].endDay)

                    if (currentDate < questStartDate || currentDate > questEndDate) {
                        if (debugLogging) logger.success(`[VCQL-DEBUG] Removing quest ${item[quest]._id} because it is outside the date range`)
                        prunedCount++
					    continue
                    }
				}
				// Cleanup
				delete item[quest].startMonth; delete item[quest].endMonth; delete item[quest].startDay; delete item[quest].endDay
				// Push
                if (item[quest].sideExclusive) {
                    if (item[quest].sideExclusive == "Usec" && !ignoreSideExclusive) {
                        config.usecOnlyQuests.push(quest)
                        if (debugLogging) logger.success(`[VCQL-DEBUG] Adding quest ${item[quest]._id} as a Usec exclusive quest.`)
                    }
                    if (item[quest].sideExclusive == "Bear" && !ignoreSideExclusive) {
                        config.bearOnlyQuests.push(quest)
                        if (debugLogging) logger.success(`[VCQL-DEBUG] Adding quest ${item[quest]._id} as a Bear exclusive quest.`)
                    }
                    delete item[quest].sideExclusive
                } 
                database.templates.quests[quest] = item[quest]
                questCount++
            }
        })

        if (this.enableLogging) {
            logger.success(`[VCQL] Loaded ${questCount} custom quests.`)
            logger.success(`[VCQL] ${prunedCount} custom quests were pruned due to date settings.`)
        }
    }

    public importAssorts(database, logger) {
        let debugLogging = this.enableDebugLogging
        this.loadFiles(`${modPath}/database/assorts/`, [".json"], function(filePath) {
            const assorts = require(filePath)
            if (assorts.items == undefined || assorts.traderID == undefined || assorts.barter_scheme == undefined || assorts.loyal_level_items == undefined) return
            
            let traderID = assorts.traderID
            let databaseTrader = database.traders[traderID]

            // If assort is for a custom trader, ensure that they have the appropriate assort tables
            if (databaseTrader.questassort == undefined) databaseTrader.questassort = {
                started: {},
                success: {},
                fail: {}
            }

            if (databaseTrader.assort == undefined) databaseTrader.assort = {
                items: [],
                barter_scheme: {},
                loyal_level_items: {}
            }
            
            // Add barter scheme, loyalty level, quest assort and general assort, where applicable
            for (const assort of assorts.items) {
                if (assorts.barter_scheme[assort._id] != undefined) {
                    databaseTrader.assort.barter_scheme[assort._id] = assorts.barter_scheme[assort._id]
                } else {
                    if (assort.parentId == "hideout") logger.error(`[VCQL] Parent assort ${assort._id} has no associated barter scheme.`)
                }

                if (assorts.loyal_level_items[assort._id] != undefined) {
                    databaseTrader.assort.loyal_level_items[assort._id] = assorts.loyal_level_items[assort._id]
                } else {
                    if (assort.parentId == "hideout") logger.error(`[VCQL] Parent assort ${assort._id} has no associated loyalty level`)
                }

                if (assort.unlockedOn != undefined && assort.questID != undefined) {
                    databaseTrader.questassort[assort.unlockedOn][assort._id] = assort.questID
                    delete assort.unlockedOn
                    delete assort.questID
                } 

                databaseTrader.assort.items.push(assort)
                if (debugLogging) logger.success(`[VCQL-DEBUG] Adding assort ${assort._id} to the trader ${traderID}`)
            }
        })
    }

    public importLocales(database) {
        const serverLocales = ['ch','cz','en','es','es-mx','fr','ge','hu','it','jp','kr','pl','po','ru','sk','tu']
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
        let questImageCount = 0
        let debugLogging = this.enableDebugLogging
        this.loadFiles(`${modPath}/res/quests/`, [".png", ".jpg"], function(filePath) {
            imageRouter.addRoute(`/files/quest/icon/${path.basename(filePath, path.extname(filePath))}`, filePath)
            if (debugLogging) logger.success(`[VCQL-DEBUG] Adding quest image ${path.basename(filePath)}`)
            questImageCount++
        })

        let traderImageCount = 0
        this.loadFiles(`${modPath}/res/traders/`, [".png", ".jpg"], function(filePath) {
            imageRouter.addRoute(`/files/trader/avatar/${path.basename(filePath, path.extname(filePath))}`, filePath)
            if (debugLogging) logger.success(`[VCQL-DEBUG] Adding quest image ${path.basename(filePath)}`)
            traderImageCount++
        })

        if (this.enableLogging) {
            logger.success(`[VCQL] Loaded ${questImageCount} custom quest images.`)
            logger.success(`[VCQL] Loaded ${traderImageCount} custom trader images.`)
        }
    }
}

module.exports = { mod: new VCQL() }

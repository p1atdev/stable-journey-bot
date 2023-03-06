import { StableJourneyBot } from "./bot.ts"
import { loadBotConfig } from "./botOptions.ts"

const config = await loadBotConfig("./config.yaml")

const bot = new StableJourneyBot(config)

await bot.start()

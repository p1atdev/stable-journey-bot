import { Bot, createBot, startBot } from "./deps.ts"
import { log } from "./log.ts"
import { StableJourneyBotOptions } from "./types/botOptions.ts"
import { refreshCommands } from "./utils.ts"

export class StableJourneyBot {
    private readonly options: StableJourneyBotOptions
    private readonly bot: Bot

    constructor(options: StableJourneyBotOptions) {
        const { DISCORD_TOKEN } = options
        this.options = options
        this.bot = createBot({
            token: DISCORD_TOKEN,
            intents: undefined,
        })
    }

    private setup = async () => {
        await refreshCommands(this.bot, this.options)

        this.bot.events.ready = () => {
            log.success("Successfully connected to gateway")
        }
    }

    start = async () => {
        await this.setup()
        await startBot(this.bot)
    }
}

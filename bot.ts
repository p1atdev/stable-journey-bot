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
        try {
            await refreshCommands(this.bot, this.options)
        } catch (err) {
            log.error("Error occurred when setting up bot:", err)
            log.error("Please check your config file or server status and try again!")
            Deno.exit(1)
        }

        this.bot.events.ready = () => {
            log.success("Successfully connected to gateway")
        }
    }

    start = async () => {
        await this.setup()
        await startBot(this.bot)
    }
}

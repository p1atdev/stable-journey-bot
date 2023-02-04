import { StableJourneyBot } from "./bot.ts"
import { yaml, z } from "./deps.ts"

const configFile = await Deno.readTextFile("./config.yaml")
const config = yaml.parse(configFile)

const configSchema = z.object({
    DISCORD_TOKEN: z.string(),
    GUILD_ID: z.string(),
    globalCommands: z.boolean(),
    allows: z.array(z.string()),
    defaultStyle: z.string(),
    defaultAspect: z.string(),
    defaultSampler: z.string(),
    host: z.string(),
})

const validatedConfig = configSchema.parse(config)

const bot = new StableJourneyBot(validatedConfig)
await bot.start()

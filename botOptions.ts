import { yaml } from "./deps.ts"
import { StableJourneyBotOptions } from "./types/mod.ts"
import { validateObject } from "./utils.ts"

export const loadBotConfig = async (path: string) => {
    const configFile = await Deno.readTextFile(path)
    const config = yaml.parse(configFile)
    const validatedConfig = validateObject<StableJourneyBotOptions>(config)
    return validatedConfig
}

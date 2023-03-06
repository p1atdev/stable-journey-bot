import { registerCommands } from "./commands.ts"
import { StableJourneyBotOptions } from "./types/botOptions.ts"
import { Bot } from "./deps.ts"
import { createAUTO1111Commands, createCommonCommands } from "./commands/mod.ts"
import { log } from "./log.ts"

export const base64ToBlob = (base64: string, type: string) => {
    const binary = atob(base64)
    const array = []
    for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i))
    }
    return new Blob([new Uint8Array(array)], { type })
}

export const refreshCommands = async (bot: Bot, options: StableJourneyBotOptions) => {
    const server = options.serverType

    const commonCommands = await createCommonCommands({
        options,
    })

    switch (server) {
        case "AUTOMATIC1111": {
            const commands = [
                ...(await createAUTO1111Commands({
                    options,
                })),
                ...commonCommands,
            ]
            await registerCommands(bot, commands, options.GUILD_ID, options.globalCommands)
            break
        }
        default: {
            throw log.error("Server type not found")
        }
    }
}

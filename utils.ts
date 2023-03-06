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

    const commonCommands = createCommonCommands({
        options,
    })

    switch (server) {
        case "AUTOMATIC1111": {
            const commands = await createAUTO1111Commands({
                options,
            })
            const slashCommands = [...commands.slash, ...commonCommands]
            await registerCommands(bot, slashCommands, commands.actionRow, options.GUILD_ID, options.globalCommands)
            break
        }
        default: {
            throw log.error("Server type not found")
        }
    }
}

export const checkObject = <T extends Record<string, unknown>>(obj: unknown): obj is T => {
    if (typeof obj !== "object" || obj === null) {
        throw log.error("Expected object, but got something else")
    }

    for (const key in obj) {
        if (key in ({} as T)) {
            const expectedType = typeof ({} as T)[key]
            const valueType = typeof (obj as Record<string, unknown>)[key]

            if (valueType !== expectedType) {
                throw log.error(`Expected ${key} to be of type ${expectedType}, but got ${valueType}`)
            }
        }
    }

    return true
}

export const validateObject = <T extends Record<string, unknown>>(obj: unknown): T => {
    checkObject<T>(obj)
    return obj as T
}

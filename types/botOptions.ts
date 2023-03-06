export type ServerType = "AUTOMATIC1111" | "Lsmith"

export type SizeNumber = 2048 | 1920 | 1600 | 1280 | 1024 | 960 | 896 | 832 | 768 | 640 | 512
export const SizeNumbers: SizeNumber[] = [512, 640, 768, 832, 896, 960, 1024, 1280, 1600, 1920, 2048]

export interface StableJourneyBotOptions extends Record<string, unknown> {
    DISCORD_TOKEN: string
    GUILD_ID: string
    globalCommands: boolean
    allows: string[]

    defaultParameters: {
        style?: string
        sampler?: string
        height?: SizeNumber
        width?: SizeNumber
        highresFix?: boolean
        clipSkip?: number
    }

    additionalParameters: {
        promptPrefix?: string
        promptSuffix?: string
        negativePromptPrefix?: string
        negativePromptSuffix?: string
    }

    serverType: ServerType

    host: string
}

export const defaultBotOptions: StableJourneyBotOptions = {
    DISCORD_TOKEN: "",
    GUILD_ID: "",
    globalCommands: false,
    allows: [],

    defaultParameters: {
        style: undefined,
        sampler: "Euler A",
        height: 512,
        width: 512,
        highresFix: false,
        clipSkip: 1,
    },

    additionalParameters: {
        promptPrefix: "",
        promptSuffix: "",
        negativePromptPrefix: "",
        negativePromptSuffix: "",
    },

    serverType: "AUTOMATIC1111",

    host: "http://localhost:7860",
}

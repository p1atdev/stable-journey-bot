export type ServerType = "AUTOMATIC1111" | "Lsmith"

export interface StableJourneyBotOptions {
    DISCORD_TOKEN: string
    GUILD_ID: string
    globalCommands: boolean
    allows: string[]

    defaultStyle: string
    defaultAspect: string
    defaultSampler: string

    // defaultParameters: {}

    serverType: ServerType

    host: string
}

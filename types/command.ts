import { Bot, CreateSlashApplicationCommand, Interaction } from "../deps.ts"

export interface SlashCommand {
    command: CreateSlashApplicationCommand
    action: (bot: Bot, interaction: Interaction) => void
}

export interface ActionRowCommand {
    command: {
        customId: string
    }
    action: (bot: Bot, interaction: Interaction) => void
}

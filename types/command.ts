import { Bot, CreateSlashApplicationCommand, Interaction } from "../deps.ts"

export interface SlashCommand {
    command: CreateSlashApplicationCommand
    action: (bot: Bot, interaction: Interaction) => void
}

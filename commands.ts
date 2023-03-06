import { Bot } from "./deps.ts"
import { log } from "./log.ts"
import { SlashCommand } from "./types/command.ts"

export const registerCommands = async (bot: Bot, commands: SlashCommand[], guildId?: string, global = false) => {
    log.info(
        "Commands:",
        commands.map((c) => c.command.name)
    )

    bot.events.interactionCreate = (b, interaction) => {
        const name = interaction.data?.name
        if (!name) return

        const command = commands.find((c) => c.command.name === name)
        if (!command) return

        const action = command.action
        if (!action) return

        action(b, interaction)
    }

    log.info("Registered handling interactions")

    if (global) {
        log.info("Registering commands globally")

        await bot.helpers.upsertGlobalApplicationCommands(commands.map((c) => c.command))

        log.info("Commands registered in global")
    }

    if (guildId) {
        log.info("Registering commands locally")

        await bot.helpers.upsertGuildApplicationCommands(
            guildId,
            commands.map((c) => c.command)
        )

        log.info("Registered commands in guild")
    }
}

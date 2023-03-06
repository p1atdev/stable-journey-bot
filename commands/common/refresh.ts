import { InteractionResponseTypes } from "../../deps.ts"
import { SlashCommand, StableJourneyBotOptions } from "../../types/mod.ts"
import { log } from "../../log.ts"
import { refreshCommands } from "../../utils.ts"

interface Props {
    options: StableJourneyBotOptions
}

export default ({ options }: Props): SlashCommand => {
    return {
        command: {
            name: "refresh",
            description: "Refresh the model list",
        },
        action: async (b, interaction) => {
            log.info("Refreshing...")

            await b.helpers.sendInteractionResponse(interaction.id, interaction.token, {
                type: InteractionResponseTypes.ChannelMessageWithSource,
                data: {
                    content: "Refreshing...",
                },
            })

            await refreshCommands(b, options)

            await b.helpers.editOriginalInteractionResponse(interaction.token, {
                content: "✅ Refreshed!",
            })

            log.info("Refreshed")
        },
    }
}

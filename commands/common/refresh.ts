import { InteractionResponseTypes } from "../../deps.ts"
import { SlashCommand, StableJourneyBotOptions } from "../../types/mod.ts"
import { log } from "../../log.ts"
import { refreshCommands } from "../../utils.ts"
import { EmbedColor } from "../../message.ts"

interface Props {
    options: StableJourneyBotOptions
}

export default ({ options }: Props): SlashCommand => {
    return {
        command: {
            name: "refresh",
            description: "Refresh the stable diffusion model list",
        },
        action: async (b, interaction) => {
            log.info("Refreshing...")

            await b.helpers.sendInteractionResponse(interaction.id, interaction.token, {
                type: InteractionResponseTypes.ChannelMessageWithSource,
                data: {
                    embeds: [
                        {
                            title: "Refreshing...",
                            color: EmbedColor.blue,
                        },
                    ],
                },
            })

            await refreshCommands(b, options)

            await b.helpers.editOriginalInteractionResponse(interaction.token, {
                embeds: [
                    {
                        title: "Done!",
                        description: "Commands have been refreshed.",
                        color: EmbedColor.green,
                    },
                ],
            })

            log.info("Refreshed")
        },
    }
}

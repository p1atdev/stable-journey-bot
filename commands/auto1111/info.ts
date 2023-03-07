import { InteractionResponseTypes, transformEmbed } from "../../deps.ts"
import { SlashCommand } from "../../types/mod.ts"
import { AUTO1111 } from "../../auto1111.ts"
import { log } from "../../log.ts"
import { EmbedColor } from "../../message.ts"

interface Props {
    client: AUTO1111
}

export default ({ client }: Props): SlashCommand => {
    return {
        command: {
            name: "info",
            description: "Show current model",
        },
        action: async (b, interaction) => {
            if (!interaction.data) {
                return
            }

            const auto1111options = await client.options()

            log.info("Current Model:", auto1111options.sd_model_checkpoint)

            await b.helpers.sendInteractionResponse(interaction.id, interaction.token, {
                type: InteractionResponseTypes.ChannelMessageWithSource,
                data: {
                    embeds: [
                        transformEmbed(b, {
                            title: "Information",
                            fields: [
                                {
                                    name: "Current Model",
                                    value: auto1111options.sd_model_checkpoint,
                                },
                            ],
                            color: EmbedColor.blue,
                        }),
                    ],
                },
            })
        },
    }
}

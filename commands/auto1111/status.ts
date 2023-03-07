import { InteractionResponseTypes, transformEmbed } from "../../deps.ts"
import { SlashCommand } from "../../types/mod.ts"
import { AUTO1111 } from "../../auto1111.ts"
import { log } from "../../log.ts"
import { EmbedColor } from "../../message.ts"
import { checkPerformance, onCommandError } from "../../utils.ts"

interface Props {
    client: AUTO1111
}

export default ({ client }: Props): SlashCommand => {
    return {
        command: {
            name: "status",
            description: "Check bot and server status",
        },
        action: async (b, interaction) => {
            if (!interaction.data) {
                return
            }

            log.info("Checking status...")

            await b.helpers.sendInteractionResponse(interaction.id, interaction.token, {
                type: InteractionResponseTypes.ChannelMessageWithSource,
                data: {
                    embeds: [
                        transformEmbed(b, {
                            title: "Checking status...",
                            color: EmbedColor.blue,
                        }),
                    ],
                },
            })

            try {
                const time = await checkPerformance(async () => {
                    await client.options()
                })
                const timeRounded = Math.round(time * 10) / 10

                await b.helpers.editOriginalInteractionResponse(interaction.token, {
                    embeds: [
                        transformEmbed(b, {
                            title: "Status",
                            fields: [
                                {
                                    name: "Bot",
                                    value: "✅ Online",
                                },
                                {
                                    name: "Server",
                                    value: `✅ Online (took ${timeRounded} ms)`,
                                },
                            ],
                            color: EmbedColor.green,
                        }),
                    ],
                })
            } catch (err) {
                log.error("Error:", err)

                await b.helpers.editOriginalInteractionResponse(interaction.token, {
                    embeds: [
                        transformEmbed(b, {
                            title: "Status",
                            fields: [
                                {
                                    name: "Bot",
                                    value: "✅ Online",
                                },
                                {
                                    name: "Server",
                                    value: `❌ Offline`,
                                },
                                {
                                    name: "Error message",
                                    value: `${err}`,
                                },
                            ],
                            color: EmbedColor.red,
                        }),
                    ],
                })
            }
        },
    }
}

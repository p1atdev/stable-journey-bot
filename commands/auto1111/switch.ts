import { ApplicationCommandOptionTypes, InteractionResponseTypes, transformEmbed } from "../../deps.ts"
import { SDModel, SlashCommand } from "../../types/mod.ts"
import { AUTO1111 } from "../../auto1111.ts"
import { log } from "../../log.ts"
import { EmbedColor } from "../../message.ts"

interface Props {
    sdModels: SDModel[]
    client: AUTO1111
}

export default ({ sdModels, client }: Props): SlashCommand => {
    return {
        command: {
            name: "switch",
            description: "Switch stable diffusion model",
            options: [
                {
                    type: ApplicationCommandOptionTypes.String,
                    name: "name",
                    description: "Stable diffusion model name",
                    choices: (sdModels.length > 25 ? sdModels.slice(0, 25) : sdModels).map((model) => ({
                        name: model.model_name,
                        value: model.title,
                    })),
                    required: true,
                },
            ],
        },
        action: async (b, interaction) => {
            if (!interaction.data) {
                return
            }

            const author = interaction.user

            const auto1111options = await client.options()

            const model = interaction.data.options?.find((o) => o.name === "name")

            if (typeof model?.value !== "string") {
                await b.helpers.sendInteractionResponse(interaction.id, interaction.token, {
                    type: InteractionResponseTypes.ChannelMessageWithSource,
                    data: {
                        embeds: [
                            transformEmbed(b, {
                                title: "Model is wrong",
                                color: EmbedColor.red,
                            }),
                        ],
                    },
                })

                return
            }

            log.info(`Switching model from ${auto1111options.sd_model_checkpoint} to ${model?.value}...`)

            await b.helpers.sendInteractionResponse(interaction.id, interaction.token, {
                type: InteractionResponseTypes.ChannelMessageWithSource,
                data: {
                    embeds: [
                        transformEmbed(b, {
                            title: `Switching model...`,
                            fields: [
                                {
                                    name: "From",
                                    value: auto1111options.sd_model_checkpoint,
                                },
                                {
                                    name: "To",
                                    value: model?.value,
                                },
                            ],
                            color: EmbedColor.blue,
                        }),
                    ],
                },
            })

            await client.switchModel(model.value)

            await b.helpers.editOriginalInteractionResponse(interaction.token, {
                embeds: [
                    transformEmbed(b, {
                        title: "Model switched successfully!",
                        description: `Current model: **${model?.value}**`,
                        color: EmbedColor.green,
                        footer: {
                            text: `Requested by ${author.username}#${author.discriminator}`,
                            icon_url: b.helpers.getAvatarURL(author.id, author.discriminator, {
                                avatar: author.avatar,
                            }),
                        },
                    }),
                ],
            })

            log.info(`Model switched to ${model?.value} successfully!`)
        },
    }
}

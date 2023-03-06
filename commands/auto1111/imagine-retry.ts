import { InteractionResponseTypes, transformEmbed, MessageComponentTypes, ButtonStyles } from "../../deps.ts"
import { ActionRowCommand } from "../../types/mod.ts"
import { AUTO1111, ImagineOptions } from "../../auto1111.ts"
import { log } from "../../log.ts"
import { base64ToBlob } from "../../utils.ts"
import { EmbedColor } from "../../message.ts"
import { SizeNumber } from "../../types/botOptions.ts"

interface Props {
    client: AUTO1111
}

export default ({ client }: Props): ActionRowCommand => {
    return {
        command: {
            customId: "imagine:retry",
        },
        action: async (b, interaction) => {
            if (!interaction.data) {
                return
            }

            const author = interaction.user

            const params: Record<string, any> = {}
            interaction.message?.embeds[0].fields?.forEach((option) => {
                if (!option.value) return
                params[option.name] = option.value.replaceAll("`", "")
            })

            // log.info("params:", params)

            await b.helpers.sendInteractionResponse(interaction.id, interaction.token, {
                type: InteractionResponseTypes.ChannelMessageWithSource,
                data: {
                    embeds: [
                        {
                            title: "Generating...",
                            color: EmbedColor.blue,
                        },
                    ],
                },
            })

            const imagineOptions: Partial<ImagineOptions> = {
                prompt: params["prompt"],
                negativePrompt: params["negativePrompt"],
                seed: params["seed"] ? parseInt(params["seed"]) : undefined,
                sampler: params["sampler"],
                steps: params["steps"] ? parseInt(params["steps"]) : undefined,
                scale: params["scale"] ? parseFloat(params["scale"]) : undefined,
                width: params["width"] ? (parseInt(params["width"]) as SizeNumber) : undefined,
                height: params["height"] ? (parseInt(params["height"]) as SizeNumber) : undefined,
                highresFix: params["highresFix"] === "true",
                clipSkip: params["clipSkip"] ? parseInt(params["clipSkip"]) : undefined,
                count: params["count"] ? parseInt(params["count"]) : undefined,
            }

            log.info("Imagine (Reload):", imagineOptions)

            const paramsFields = Object.entries(imagineOptions)
                .filter(([_, value]) => {
                    return value !== undefined
                })
                .map(([key, value]) => ({
                    name: key,
                    value: `\`${value}\``,
                    inline: ["prompt", "negativePrompt", "width", "height", "clipSkip"].includes(key),
                }))

            let finished = false

            const imaginating = client
                .imagine({
                    ...imagineOptions,
                })
                .then((result) => {
                    finished = true
                    return result
                })

            const waiting = async () => {
                while (!finished) {
                    await new Promise((resolve) => setTimeout(resolve, 500))
                    const progress = await client.progress()
                    if (progress.progress === 0) {
                        continue
                    }

                    const progressStr = (progress.progress * 100).toFixed(1)
                    const eta = progress.eta_relative.toFixed(1)

                    await b.helpers.editOriginalInteractionResponse(interaction.token, {
                        content: `Generating for ${author.username} | ${progressStr} % (ETA: ${eta} s)`,
                        embeds: [
                            {
                                fields: paramsFields,
                                color: EmbedColor.blue,
                            },
                        ],
                    })
                }
            }

            const progress = waiting()

            const [result, _] = await Promise.all([imaginating, progress])

            await b.helpers.editOriginalInteractionResponse(interaction.token, {
                content: `Done! - <@${author.id}>`,
                file: result.images.map((image) => ({
                    name: "image.png",
                    blob: base64ToBlob(image, "image/png"),
                })),
                embeds: [
                    transformEmbed(b, {
                        fields: paramsFields,
                        timestamp: new Date().toISOString(),
                        color: EmbedColor.green,
                        footer: {
                            text: `${author.username}#${author.discriminator}`, // - Click ❌ to delete`,
                            icon_url: b.helpers.getAvatarURL(author.id, author.discriminator, {
                                avatar: author.avatar,
                            }),
                        },
                    }),
                ],
                components: [
                    {
                        type: MessageComponentTypes.ActionRow,
                        components: [
                            {
                                type: MessageComponentTypes.Button,
                                label: "",
                                style: ButtonStyles.Secondary,
                                customId: "imagine:retry",
                                emoji: {
                                    name: "🔄",
                                },
                            },
                            // not working yet
                            // {
                            //     type: MessageComponentTypes.Button,
                            //     label: "",
                            //     style: ButtonStyles.Secondary,
                            //     customId: "imagine:delete",
                            //     emoji: {
                            //         name: "❌",
                            //     },
                            // },
                        ],
                    },
                ],
                allowedMentions: {
                    users: [author.id],
                },
            })
        },
    }
}

import {
    ApplicationCommandOptionTypes,
    InteractionResponseTypes,
    transformEmbed,
    MessageComponentTypes,
    ButtonStyles,
} from "../../deps.ts"
import { StableJourneyBotOptions, SlashCommand, PromptStyle } from "../../types/mod.ts"
import { AUTO1111, ImagineOptions } from "../../auto1111.ts"
import { log } from "../../log.ts"
import { base64ToBlob, onCommandError } from "../../utils.ts"
import { Sampler } from "../../types/sampler.ts"
import { SizeNumbers } from "../../types/botOptions.ts"
import { EmbedColor } from "../../message.ts"

interface Props {
    client: AUTO1111
    samplers: Sampler[]
    promptStyles: PromptStyle[]
    options: StableJourneyBotOptions
}

export default ({ client, samplers, promptStyles, options: botOptions }: Props): SlashCommand => {
    return {
        command: {
            name: "imagine",
            description: "Thinking to the world of dreams...",
            options: [
                {
                    type: ApplicationCommandOptionTypes.String,
                    name: "prompt",
                    description: "Positive prompt",
                    required: true,
                },
                {
                    type: ApplicationCommandOptionTypes.String,
                    name: "negative",
                    description: "Negative prompt",
                    required: false,
                },
                {
                    type: ApplicationCommandOptionTypes.String,
                    name: "prompt-style",
                    description: "Prompt style",
                    choices: promptStyles.map((style) => ({
                        name: style.name,
                        value: style.name,
                    })),
                    required: false,
                },
                {
                    type: ApplicationCommandOptionTypes.Integer,
                    name: "width",
                    description: "Image width",
                    choices: SizeNumbers.map((size) => ({
                        name: size.toString(),
                        value: size,
                    })),
                    required: false,
                },
                {
                    type: ApplicationCommandOptionTypes.Integer,
                    name: "height",
                    description: "Image height",
                    choices: SizeNumbers.map((size) => ({
                        name: size.toString(),
                        value: size,
                    })),
                    required: false,
                },
                {
                    type: ApplicationCommandOptionTypes.Integer,
                    name: "seed",
                    description: "Like finding a single shining star in the vastness of space",
                    required: false,
                },
                {
                    type: ApplicationCommandOptionTypes.String,
                    name: "sampler",
                    description: "Sampling method",
                    choices: (samplers.length > 25 ? samplers.slice(0, 25) : samplers).map((sampler) => ({
                        name: sampler.name,
                        value: sampler.name,
                    })),
                    required: false,
                },
                {
                    type: ApplicationCommandOptionTypes.Integer,
                    name: "steps",
                    description: "Number of steps",
                    required: false,
                },
                {
                    type: ApplicationCommandOptionTypes.Number,
                    name: "scale",
                    description: "CFG scale",
                    required: false,
                },
                {
                    type: ApplicationCommandOptionTypes.Integer,
                    name: "count",
                    description: "Number of images to generate",
                    required: false,
                    minValue: 1,
                    maxValue: 4,
                },
                {
                    type: ApplicationCommandOptionTypes.Boolean,
                    name: "highres-fix",
                    description: "High resolution fix",
                    required: false,
                },
                {
                    type: ApplicationCommandOptionTypes.Integer,
                    name: "clip-skip",
                    description: "Clip skip",
                    required: false,
                },
            ],
        },
        action: async (b, interaction) => {
            if (!interaction.data) {
                return
            }

            const author = interaction.user

            const params: Record<string, any> = {}
            interaction.data.options?.forEach((option) => {
                if (!option.value) return
                params[option.name] = option.value
            })

            log.info("params:", params)

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
                negativePrompt: params["negative"],
                seed: params["seed"],
                sampler: params["sampler"],
                steps: params["steps"],
                scale: params["scale"],
                width: params["width"],
                height: params["height"],
                highresFix: params["highres-fix"],
                clipSkip: params["clip-skip"],
                count: params["count"],
            }

            if (params["prompt-style"]) {
                const promptStyle = promptStyles.find((style) => style.name === params["prompt-style"])
                if (promptStyle) {
                    imagineOptions.prompt = promptStyle.prompt + imagineOptions.prompt
                    imagineOptions.negativePrompt = promptStyle.negative_prompt + imagineOptions.negativePrompt
                }
            } else {
                const promptStyle = promptStyles.find((style) => style.name === botOptions.defaultParameters.style)
                if (promptStyle) {
                    imagineOptions.prompt = promptStyle.prompt + imagineOptions.prompt
                    imagineOptions.negativePrompt = promptStyle.negative_prompt + imagineOptions.negativePrompt
                } else {
                    log.warn("Prompt style not found:", botOptions.defaultParameters.style)
                    log.warn(
                        "Available prompt styles:",
                        promptStyles.map((style) => style.name)
                    )
                }
            }

            Object.entries(botOptions.defaultParameters).forEach(([key, value]) => {
                switch (key) {
                    case "style": {
                        break
                    }
                    default: {
                        if (imagineOptions[key] === undefined) {
                            imagineOptions[key] = value
                        }
                        break
                    }
                }
            })

            const additionalParameters = botOptions.additionalParameters
            if (additionalParameters) {
                if (additionalParameters.promptPrefix) {
                    imagineOptions.prompt = [additionalParameters.promptPrefix, imagineOptions.prompt].join(", ")
                }
                if (additionalParameters.negativePromptPrefix) {
                    imagineOptions.negativePrompt = [
                        additionalParameters.negativePromptPrefix,
                        imagineOptions.negativePrompt,
                    ].join(", ")
                }
                if (additionalParameters.promptSuffix) {
                    imagineOptions.prompt = [imagineOptions.prompt, additionalParameters.promptSuffix].join(", ")
                }
                if (additionalParameters.negativePromptSuffix) {
                    imagineOptions.negativePrompt = [
                        imagineOptions.negativePrompt,
                        additionalParameters.negativePromptSuffix,
                    ].join(", ")
                }
            }

            log.info("Imagine:", imagineOptions)

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
                .catch((err) => {
                    finished = true
                    throw err
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

            try {
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
                                text: `${author.username}#${author.discriminator} | Click ❌ to delete`,
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
                                {
                                    type: MessageComponentTypes.Button,
                                    label: "",
                                    style: ButtonStyles.Secondary,
                                    customId: "imagine:delete",
                                    emoji: {
                                        name: "❌",
                                    },
                                },
                            ],
                        },
                    ],
                    allowedMentions: {
                        users: [author.id],
                    },
                })
            } catch (err) {
                log.error("Error:", err)
                await onCommandError(b, interaction, "An error occurred while generating the image.", `${err}`)
            }
        },
    }
}

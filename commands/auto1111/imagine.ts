import { ApplicationCommandOptionTypes, InteractionResponseTypes } from "../../deps.ts"
import { SDModel, StableJourneyBotOptions, SlashCommand, PromptStyle } from "../../types/mod.ts"
import { AUTO1111, ImagineOptions } from "../../auto1111.ts"
import { log } from "../../log.ts"
import { base64ToBlob } from "../../utils.ts"
import { Sampler } from "../../types/sampler.ts"

interface Props {
    client: AUTO1111
    samplers: Sampler[]
    promptStyles: PromptStyle[]
    options: StableJourneyBotOptions
}

export default ({ client, samplers, promptStyles, options }: Props): SlashCommand => {
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
                    type: ApplicationCommandOptionTypes.String,
                    name: "aspect",
                    description: "Aspect ratio",
                    choices: [
                        {
                            name: "2:3",
                            value: "2:3",
                        },
                        {
                            name: "1:1",
                            value: "1:1",
                        },
                        {
                            name: "3:2",
                            value: "3:2",
                        },
                    ],
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
            ],
        },
        action: async (b, interaction) => {
            if (!interaction.data) {
                return
            }

            const paramerters = `${interaction.data.options
                ?.map((option) => `${option.name}: \`${option.value}\``)
                .join("\n")}`

            await b.helpers.sendInteractionResponse(interaction.id, interaction.token, {
                type: InteractionResponseTypes.ChannelMessageWithSource,
                data: {
                    content: `\n${paramerters}`,
                },
            })

            const imagineOptions: ImagineOptions = {
                prompt: interaction.data.options?.find((o) => o.name === "prompt")?.value as string,
                negativePrompt: interaction.data.options?.find((o) => o.name === "negative")?.value as string,
                aspect: (() => {
                    const value =
                        interaction.data.options?.find((o) => o.name === "aspect")?.value ?? options.defaultAspect
                    switch (value) {
                        case "2:3":
                        case "1:1":
                        case "3:2": {
                            return value
                        }
                        default: {
                            return "1:1"
                        }
                    }
                })(),
                seed: interaction.data.options?.find((o) => o.name === "seed")?.value as number,
                sampler:
                    (interaction.data.options?.find((o) => o.name === "sampler")?.value as string | undefined) ??
                    options.defaultSampler,
                steps: interaction.data.options?.find((o) => o.name === "steps")?.value as number,
                scale: interaction.data.options?.find((o) => o.name === "scale")?.value as number,
                count: interaction.data.options?.find((o) => o.name === "count")?.value as number,
            }

            log.info("Imagine:", options)

            const promptStyleName =
                interaction.data.options?.find((o) => o.name === "prompt-style")?.value ?? options.defaultStyle
            if (typeof promptStyleName === "string") {
                const promptStyle = promptStyles.find((style) => style.name === promptStyleName)
                if (promptStyle) {
                    imagineOptions.prompt = promptStyle.prompt + imagineOptions.prompt
                    imagineOptions.negativePrompt = promptStyle.negative_prompt + imagineOptions.negativePrompt
                }
            }

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
                    await b.helpers.editOriginalInteractionResponse(interaction.token, {
                        content: `${paramerters}\n${(progress.progress * 100).toFixed(
                            1
                        )} % (ETA: ${progress.eta_relative.toFixed(1)} s)`,
                    })
                }
            }

            const progress = waiting()

            const [result, _] = await Promise.all([imaginating, progress])

            await b.helpers.editOriginalInteractionResponse(interaction.token, {
                content: `${paramerters}\n✅ Done!`,
                file: result.images.map((image) => ({
                    name: "image.png",
                    blob: base64ToBlob(image, "image/png"),
                })),
            })
        },
    }
}

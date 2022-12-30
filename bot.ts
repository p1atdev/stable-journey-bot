import { AUTO1111, ImagineOptions } from "./auto1111.ts"
import {
    createBot,
    Intents,
    startBot,
    CreateSlashApplicationCommand,
    InteractionResponseTypes,
    ApplicationCommandOptionTypes,
} from "./deps.ts"
import { Secret } from "./secret.ts"
import { base64ToBlob } from "./utils.ts"

const DISCORD_TOKEN = Deno.env.get("DISCORD_TOKEN")!

const client = new AUTO1111({
    host: Secret.AUTO1111_Host,
})

const [sdModels, samplers, promptStyles] = await Promise.all([
    client.sdModels(),
    client.samplers(),
    client.promptStyles(),
])

const bot = createBot({
    token: DISCORD_TOKEN,
    intents: Intents.Guilds | Intents.GuildMessages | Intents.MessageContent | Intents.GuildMembers,
    events: {
        ready() {
            console.log("Successfully connected to gateway")
        },
    },
})

const switchModelCommand: CreateSlashApplicationCommand = {
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
}

const imagineCommand: CreateSlashApplicationCommand = {
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
}

const commands = [imagineCommand, switchModelCommand]

await Promise.all(
    commands.map((command) => {
        bot.helpers.createGuildApplicationCommand(command, Secret.GUILD_ID)
    })
)
await bot.helpers.upsertGuildApplicationCommands(Secret.GUILD_ID, commands)

bot.events.interactionCreate = async (b, interaction) => {
    switch (interaction.data?.name) {
        case "switch": {
            const auto1111options = await client.options()

            const model = interaction.data.options?.find((o) => o.name === "name")

            if (typeof model?.value !== "string") {
                await b.helpers.sendInteractionResponse(interaction.id, interaction.token, {
                    type: InteractionResponseTypes.ChannelMessageWithSource,
                    data: {
                        content: "Something went wrong. Model is wrong",
                    },
                })

                return
            }

            await b.helpers.sendInteractionResponse(interaction.id, interaction.token, {
                type: InteractionResponseTypes.ChannelMessageWithSource,
                data: {
                    content: `Switching model from **${auto1111options.sd_model_checkpoint}** to **${model?.value}**...`,
                },
            })

            await client.switchModel(model.value)

            await b.helpers.editOriginalInteractionResponse(interaction.token, {
                content: `✅ Model switched to **${model?.value}** successfully!`,
            })

            break
        }
        case "imagine": {
            const paramerters = `${interaction.data.options
                ?.map((option) => `${option.name}: \`${option.value}\``)
                .join("\n")}`

            await b.helpers.sendInteractionResponse(interaction.id, interaction.token, {
                type: InteractionResponseTypes.ChannelMessageWithSource,
                data: {
                    content: `\n${paramerters}`,
                },
            })

            const options: ImagineOptions = {
                prompt: interaction.data.options?.find((o) => o.name === "prompt")?.value as string,
                negativePrompt: interaction.data.options?.find((o) => o.name === "negative")?.value as string,
                aspect: (() => {
                    const value = interaction.data.options?.find((o) => o.name === "aspect")?.value as string
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
                sampler: interaction.data.options?.find((o) => o.name === "sampler")?.value as string,
                steps: interaction.data.options?.find((o) => o.name === "steps")?.value as number,
                scale: interaction.data.options?.find((o) => o.name === "scale")?.value as number,
                count: interaction.data.options?.find((o) => o.name === "count")?.value as number,
            }

            const promptStyleName = interaction.data.options?.find((o) => o.name === "prompt-style")?.value
            if (typeof promptStyleName === "string") {
                const promptStyle = promptStyles.find((style) => style.name === promptStyleName)
                if (promptStyle) {
                    options.prompt = promptStyle.prompt + options.prompt
                    options.negativePrompt = promptStyle.negative_prompt + options.negativePrompt
                }
            }

            let finished = false

            const imaginating = client
                .imagine({
                    ...options,
                })
                .then((result) => {
                    finished = true
                    return result
                })

            const waiting = async () => {
                while (!finished) {
                    await new Promise((resolve) => setTimeout(resolve, 500))
                    const progress = await client.progress()
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

            break
        }
        default: {
            break
        }
    }
}

await startBot(bot)

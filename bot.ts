import { AUTO1111, ImagineOptions } from "./auto1111.ts"
import { createCommands, registerCommands } from "./command.ts"
import { createBot, Intents, startBot, InteractionResponseTypes } from "./deps.ts"
import { log } from "./log.ts"
import { Secret } from "./secret.ts"
import { base64ToBlob } from "./utils.ts"

const DISCORD_TOKEN = Deno.env.get("DISCORD_TOKEN")!

const client = new AUTO1111({
    host: Secret.AUTO1111_Host,
})

const bot = createBot({
    token: DISCORD_TOKEN,
    intents: Intents.Guilds | Intents.GuildMessages | Intents.MessageContent | Intents.GuildMembers,
    events: {
        ready() {
            console.log("Successfully connected to gateway")
        },
    },
})

const refreshParameters = async () => {
    await client.refreshCheckpoints()

    return await Promise.all([client.sdModels(), client.samplers(), client.promptStyles()])
}

const [_sdModels, _samplers, promptStyles] = await refreshParameters()

const refreshCommands = async () => {
    const commands = createCommands(...(await refreshParameters()))
    await registerCommands(bot, commands, false)
    log.info("Commands refreshed")
}

bot.events.ready = async () => {
    log.success("Successfully connected to gateway")
    await refreshCommands()
}

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

            log.info(`Switching model from ${auto1111options.sd_model_checkpoint} to ${model?.value}...`)

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

            log.info(`Model switched to ${model?.value} successfully!`)

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

            log.info("Imagine:", options)

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

            break
        }
        case "refresh": {
            log.info("Refreshing...")

            await b.helpers.sendInteractionResponse(interaction.id, interaction.token, {
                type: InteractionResponseTypes.ChannelMessageWithSource,
                data: {
                    content: "Refreshing...",
                },
            })

            await refreshCommands()

            await b.helpers.editOriginalInteractionResponse(interaction.token, {
                content: "✅ Refreshed!",
            })

            log.info("Refreshed")

            break
        }
        default: {
            break
        }
    }
}

await startBot(bot)

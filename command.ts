import { Bot, CreateSlashApplicationCommand, ApplicationCommandOptionTypes } from "./deps.ts"
import { PromptStyle } from "./types/promptStyle.ts"
import { Sampler } from "./types/sampler.ts"
import { SDModel } from "./types/sdModel.ts"

const createSwitchModelCommand = (sdModels: SDModel[]) => {
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

    return switchModelCommand
}

const createImagineCommand = (samplers: Sampler[], promptStyles: PromptStyle[]) => {
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

    return imagineCommand
}

const createRefreshCommand = () => {
    const refreshCommand: CreateSlashApplicationCommand = {
        name: "refresh",
        description: "Refresh stable diffusion model and other parameters",
    }

    return refreshCommand
}

export const createCommands = (sdModels: SDModel[], samplers: Sampler[], promptStyles: PromptStyle[]) => {
    const commands = [
        createSwitchModelCommand(sdModels),
        createImagineCommand(samplers, promptStyles),
        createRefreshCommand(),
    ]

    return commands
}

export const registerCommands = async (
    bot: Bot,
    commands: CreateSlashApplicationCommand[],
    guildId: string,
    global: boolean
) => {
    const current = global
        ? await bot.helpers.getGlobalApplicationCommands()
        : await bot.helpers.getGuildApplicationCommands(guildId)
    current.forEach(async (command) => {
        if (global) {
            await bot.helpers.deleteGlobalApplicationCommand(command.id)
        } else {
            await bot.helpers.deleteGuildApplicationCommand(command.id, guildId)
        }
    })

    await Promise.all(
        commands.map(async (command) => {
            if (global) {
                // await bot.helpers.deleteGlobalApplicationCommand(command.name)
                await bot.helpers.createGlobalApplicationCommand(command)
            } else {
                // await bot.helpers.deleteGuildApplicationCommand(command.name, Secret.GUILD_ID)
                await bot.helpers.createGuildApplicationCommand(command, guildId)
            }
        })
    )

    if (global) {
        await bot.helpers.upsertGlobalApplicationCommands(commands)
    } else {
        await bot.helpers.upsertGuildApplicationCommands(guildId, commands)
    }
}

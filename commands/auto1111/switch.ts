import { ApplicationCommandOptionTypes, InteractionResponseTypes } from "../../deps.ts"
import { SDModel, SlashCommand } from "../../types/mod.ts"
import { AUTO1111 } from "../../auto1111.ts"
import { log } from "../../log.ts"

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
        },
    }
}

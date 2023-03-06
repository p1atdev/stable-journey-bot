import { SlashCommand } from "../../types/command.ts"
import { InteractionResponseTypes } from "../../deps.ts"

export default (): SlashCommand => {
    return {
        command: {
            name: "neko",
            description: "Neko",
        },
        action: async (b, interaction) => {
            await b.helpers.sendInteractionResponse(interaction.id, interaction.token, {
                type: InteractionResponseTypes.ChannelMessageWithSource,
                data: {
                    content: "nya~",
                },
            })
        },
    }
}

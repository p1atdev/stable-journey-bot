import { ActionRowCommand } from "../../types/mod.ts"
import { log } from "../../log.ts"

export default (): ActionRowCommand => {
    return {
        command: {
            customId: "imagine:delete",
        },
        action: async (b, interaction) => {
            if (!interaction.data) {
                return
            }

            const targetMessage = interaction.message

            if (!targetMessage) {
                return
            }

            log.info("Result deleted:", targetMessage)

            await b.helpers.deleteOriginalInteractionResponse(interaction.token)
            // await b.helpers.deleteOriginalInteractionResponse(interaction.token)
        },
    }
}

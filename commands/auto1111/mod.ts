import { AUTO1111 } from "../../auto1111.ts"
import { StableJourneyBotOptions } from "../../types/mod.ts"

import imagineCommand from "./imagine.ts"
import switchCommand from "./switch.ts"
import infoCommand from "./info.ts"
import statusCommand from "./status.ts"

import imagineRetryCommand from "./imagine-retry.ts"
import imagineDeleteCommand from "./imagine-delete.ts"

interface Props {
    options: StableJourneyBotOptions
}

export const createAUTO1111Commands = async ({ options }: Props) => {
    const client = new AUTO1111(options)

    const [sdModels, promptStyles, samplers] = await Promise.all([
        client.sdModels(),
        client.promptStyles(),
        client.samplers(),
    ])

    return {
        slash: [
            imagineCommand({
                client,
                samplers,
                promptStyles,
                options,
            }),
            switchCommand({
                client,
                sdModels,
            }),
            infoCommand({
                client,
            }),
            statusCommand({
                client,
            }),
        ],
        actionRow: [
            imagineRetryCommand({
                client,
            }),
            imagineDeleteCommand(),
        ],
    }
}

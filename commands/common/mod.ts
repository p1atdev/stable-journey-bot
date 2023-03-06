import { StableJourneyBotOptions } from "../../types/mod.ts"

import refreshCommand from "./refresh.ts"
import nekoCommand from "./neko.ts"

interface Props {
    options: StableJourneyBotOptions
}

export const createCommonCommands = ({ options }: Props) => {
    return [refreshCommand({ options }), nekoCommand()]
}

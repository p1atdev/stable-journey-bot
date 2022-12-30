import { loadSync } from "./deps.ts"
loadSync({ export: true })

export const Secret = {
    AUTO1111_Host: Deno.env.get("AUTO1111_HOST")!,
    DISCORD_TOKEN: Deno.env.get("DISCORD_TOKEN")!,
    GUILD_ID: Deno.env.get("GUILD_ID")!,
}

import { AUTO1111 } from "../auto1111.ts"
import { assertExists } from "../deps.ts"

const host = "http://localhost:7861"

Deno.test("get sdmodels", async () => {
    const client = new AUTO1111({
        host,
    })

    const sdModels = await client.sdModels()

    assertExists(sdModels)
})

Deno.test("get samplers", async () => {
    const client = new AUTO1111({
        host,
    })

    const samplers = await client.samplers()

    assertExists(samplers)
})

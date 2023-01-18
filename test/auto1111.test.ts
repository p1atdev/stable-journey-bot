import { AUTO1111 } from "../auto1111.ts"
import { assertExists, assertEquals } from "../deps.ts"

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

Deno.test("refresh checkpoints", async () => {
    const client = new AUTO1111({
        host,
    })

    const result = await client.refreshCheckpoints()

    assertEquals(result, true)
})

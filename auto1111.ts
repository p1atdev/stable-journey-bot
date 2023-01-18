import {
    Sampler,
    SDModel,
    SDAPIOptions,
    defaultTxt2ImgOptions,
    Txt2ImgOptions,
    Txt2ImgRes,
    Progress,
    PromptStyle,
} from "./types/mod.ts"

export interface AUTO1111Options {
    host: string
}

export interface ImagineOptions {
    prompt: string
    negativePrompt: string
    steps: number
    scale: number
    seed: number
    sampler: string
    aspect: "2:3" | "1:1" | "3:2"
    count: number
}

export class AUTO1111 {
    private host: string

    constructor({ host }: AUTO1111Options) {
        this.host = host
    }

    sdModels = async () => {
        const url = new URL("/sdapi/v1/sd-models", this.host)
        const res = await fetch(url)
        const data: SDModel[] = await res.json()
        return data
    }

    samplers = async () => {
        const url = new URL("/sdapi/v1/samplers", this.host)
        const res = await fetch(url)
        const data: Sampler[] = await res.json()
        return data
    }

    promptStyles = async () => {
        const url = new URL("/sdapi/v1/prompt-styles", this.host)
        const res = await fetch(url)
        const data: PromptStyle[] = await res.json()
        return data
    }

    options = async () => {
        const url = new URL("/sdapi/v1/options", this.host)
        const res = await fetch(url)
        const data: SDAPIOptions = await res.json()
        return data
    }

    switchModel = async (modelName: string) => {
        const url = new URL("/sdapi/v1/options", this.host)
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sd_model_checkpoint: modelName,
            }),
        })
        const data: SDAPIOptions = await res.json()
        return data
    }

    imagine = async ({
        prompt,
        negativePrompt,
        steps,
        scale,
        seed,
        sampler,
        aspect,
        count,
    }: ImagineOptions): Promise<Txt2ImgRes> => {
        const reqBody: Txt2ImgOptions = defaultTxt2ImgOptions
        reqBody.prompt = prompt
        reqBody.negative_prompt = negativePrompt ?? ""
        reqBody.steps = steps ?? 20
        reqBody.cfg_scale = scale ?? 7.0
        reqBody.seed = seed ?? -1
        reqBody.sampler_name = sampler ?? "Euler a"
        reqBody.batch_size = count ?? 1
        switch (aspect) {
            case "2:3": {
                reqBody.width = 512
                reqBody.height = 768
                break
            }
            case "1:1": {
                reqBody.width = 512
                reqBody.height = 512
                break
            }
            case "3:2": {
                reqBody.width = 768
                reqBody.height = 512
                break
            }
        }

        const url = new URL("/sdapi/v1/txt2img", this.host)
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(reqBody),
        })

        const data: Txt2ImgRes = await res.json()

        return data
    }

    progress = async () => {
        const url = new URL("/sdapi/v1/progress", this.host)
        const res = await fetch(url)
        const data: Progress = await res.json()
        return data
    }
}

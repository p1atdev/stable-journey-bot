import { log } from "./log.ts"
import { SizeNumber } from "./types/mod.ts"
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

export interface ImagineOptions extends Record<string, any> {
    prompt: string
    negativePrompt: string
    steps: number
    scale: number
    seed: number
    sampler: string
    width: SizeNumber
    height: SizeNumber
    highresFix: boolean
    clipSkip: number
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

    refreshCheckpoints = async () => {
        const url = new URL("/sdapi/v1/refresh-checkpoints", this.host)
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        })
        const _data = await res.text()
        if (res.status === 200) {
            return true
        } else {
            return false
        }
    }

    imagine = async ({
        prompt,
        negativePrompt,
        steps,
        scale,
        seed,
        sampler,
        width,
        height,
        highresFix,
        clipSkip,
        count,
    }: Partial<ImagineOptions>): Promise<Txt2ImgRes> => {
        const reqBody: Partial<Txt2ImgOptions> = structuredClone(defaultTxt2ImgOptions)
        if (prompt !== undefined) reqBody.prompt = prompt
        if (negativePrompt !== undefined) reqBody.negative_prompt = negativePrompt
        if (steps !== undefined) reqBody.steps = steps
        if (scale !== undefined) reqBody.cfg_scale = scale
        if (seed !== undefined) reqBody.seed = seed
        if (sampler !== undefined) reqBody.sampler_name = sampler
        if (width !== undefined) reqBody.width = width
        if (height !== undefined) reqBody.height = height
        if (count !== undefined) reqBody.n_iter = count
        if (highresFix !== undefined) {
            reqBody.enable_hr = highresFix
        }

        reqBody.override_settings = {}
        reqBody.override_settings_restore_afterwards = true

        if (clipSkip !== undefined) {
            reqBody.override_settings.CLIP_stop_at_last_layers = clipSkip
        }

        // log.info("Imagine parameters:", reqBody)

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

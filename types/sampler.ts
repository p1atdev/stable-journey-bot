export interface Sampler {
    name: string
    aliases: string[]
    options: Options
}

export interface Options {
    discard_next_to_last_sigma?: string
    scheduler?: string
}

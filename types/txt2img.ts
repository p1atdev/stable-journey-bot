export interface Txt2ImgOptions {
    enable_hr: boolean
    denoising_strength: number
    firstphase_width: number
    firstphase_height: number
    prompt: string
    styles: string[]
    seed: number
    subseed: number
    subseed_strength: number
    seed_resize_from_h: number
    seed_resize_from_w: number
    sampler_name: string
    batch_size: number
    n_iter: number
    steps: number
    cfg_scale: number
    width: number
    height: number
    restore_faces: boolean
    tiling: boolean
    negative_prompt: string
    eta: number
    s_churn: number
    s_tmax: number
    s_tmin: number
    s_noise: number
    override_settings: any
    override_settings_restore_afterwards: boolean
    sampler_index: string
}

export const defaultTxt2ImgOptions: Txt2ImgOptions = {
    enable_hr: false,
    denoising_strength: 0.0,
    firstphase_width: 0,
    firstphase_height: 0,
    prompt: "",
    styles: [],
    seed: -1,
    subseed: -1,
    subseed_strength: 0,
    seed_resize_from_h: -1,
    seed_resize_from_w: -1,
    sampler_name: "Euler A",
    batch_size: 1,
    n_iter: 1,
    steps: 24,
    cfg_scale: 7,
    width: 512,
    height: 512,
    restore_faces: false,
    tiling: false,
    negative_prompt: "",
    eta: 0,
    s_churn: 0,
    s_tmax: 0,
    s_tmin: 0,
    s_noise: 1,
    override_settings: {},
    override_settings_restore_afterwards: false,
    sampler_index: "",
}

export interface Txt2ImgRes {
    images: string[]
    parameters: Txt2ImgResParameters
    info: string
}

export interface Txt2ImgResParameters {
    enable_hr: boolean
    denoising_strength: number
    firstphase_width: number
    firstphase_height: number
    prompt: string
    styles: string[]
    seed: number
    subseed: number
    subseed_strength: number
    seed_resize_from_h: number
    seed_resize_from_w: number
    sampler_name: string
    batch_size: number
    n_iter: number
    steps: number
    cfg_scale: number
    width: number
    height: number
    restore_faces: boolean
    tiling: boolean
    negative_prompt: string
    eta: number
    s_churn: number
    s_tmax: number
    s_tmin: number
    s_noise: number
    override_settings: any
    override_settings_restore_afterwards: boolean
    sampler_index: string
}

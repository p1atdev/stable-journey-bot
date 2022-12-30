export interface Progress {
    progress: number
    eta_relative: number
    state: ProgressState
    current_image: null
}

export interface ProgressState {
    skipped: boolean
    interrupted: boolean
    job: string
    job_count: number
    job_no: number
    sampling_step: number
    sampling_steps: number
}

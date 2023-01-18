import { colors } from "./deps.ts"

export class log {
    static info(...args: any[]) {
        console.log(colors.blue.bold("[INFO]"), ...args)
    }

    static error(...args: any[]) {
        console.log(colors.red.bold("[ERROR]"), ...args)
    }

    static warn(...args: any[]) {
        console.log(colors.yellow.bold("[WARN]"), ...args)
    }

    static success(...args: any) {
        console.log(colors.green.bold("[SUCCESS]"), ...args)
    }
}

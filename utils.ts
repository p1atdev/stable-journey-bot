export const base64ToBlob = (base64: string, type: string) => {
    const binary = atob(base64)
    const array = []
    for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i))
    }
    return new Blob([new Uint8Array(array)], { type })
}

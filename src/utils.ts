import type { EventStatus } from './api/event/event.dto'

export function renderStatusChip(status: EventStatus) {
    if (status === 'Ongoing') return 'success'
    if (status === 'Completed') return 'warning'
}

export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

export function dateConverter(date: string) {
    return date.split('T')[0]
}

export async function compressAndEncode(
    file: File,
    opts: { maxW?: number; maxH?: number; quality?: number; mime?: 'image/jpeg' | 'image/webp' } = {}
): Promise<string> {
    const maxW = opts.maxW ?? 1200
    const maxH = opts.maxH ?? 1200
    const quality = opts.quality ?? 0.8
    const mime = opts.mime ?? 'image/webp'

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const url = URL.createObjectURL(file)
        const image = new Image()
        image.onload = () => { URL.revokeObjectURL(url); resolve(image) }
        image.onerror = reject
        image.src = url
    })

    let { width, height } = img
    const ratio = Math.min(maxW / width, maxH / height, 1)
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0, width, height)

    const base64 = canvas.toDataURL(mime, quality)
    return base64
}

export function base64SizeInBytes(dataUrl: string): number {
    const b64 = dataUrl.split(',')[1] ?? ''
    const padding = (b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0)
    return (b64.length * 3) / 4 - padding
}
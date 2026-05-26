export type FormatOptions = {
    color?: string
    outlineColor?: string
    outlineWidth?: number
}

type TextTransform = (content: string) => string

export function pipe(content: string, ...fns: TextTransform[]): string {
    return fns.reduce((acc, fn) => fn(acc), content)
}

export const withColor = (color: string): TextTransform =>
    (content) => `<color=${color}>${content}</color>`

export const withOutline = (color: string = '#000000', width: number = 2): TextTransform =>
    (content) => `<outline color=${color} width=${width}>${content}</outline>`

export const withBold = (): TextTransform =>
    (content) => `<b>${content}</b>`

export const withItalic = (): TextTransform =>
    (content) => `<i>${content}</i>`

const defaults: Required<FormatOptions> = {
    color: '#00ff00',
    outlineColor: '#000000',
    outlineWidth: 2,
}

export default function fmtText(content: string, options: FormatOptions = {}): string {
    const { color, outlineColor, outlineWidth } = { ...defaults, ...options }
    return pipe(content, withColor(color), withOutline(outlineColor, outlineWidth))
}

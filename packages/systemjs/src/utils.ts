import type { Color } from 'colors'
import colors from 'colors'

export function log(msg: string, color: keyof Color = 'green') {
  // eslint-disable-next-line no-console
  console.log(colors[color](`${colors.cyan('[dubhe]')} ${msg}`))
}

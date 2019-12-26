import { css } from 'styled-components/macro'
import {
  desaturate,
  lighten,
} from 'polished'

const createMediaQuery = (minWidth: number) =>
  (...args: any[]) =>
    css`
      @media screen and (min-width: ${minWidth}rem) {
        ${css.apply(null, args as any)}
      }
    `

export const base = '16px'

export const breakpoints = {
  mediumPlus: 720,
  largePlus: 1104,
}
export const media = {
  mediumPlus: createMediaQuery(breakpoints.mediumPlus),
  largePlus: createMediaQuery(breakpoints.largePlus),
}

export const fontFamily = `Lato,'Helvetica Neue',Helvetica,Arial,sans-serif`

const rem = (x: number) => x+'rem'

export const fontSizes = {
  bodySmall2: rem(3/4),
  bodySmall1: rem(7/8),
  body: rem(1),
  bodyLarge1: rem(5/4),

  displaySmall1: rem(3/2),
  display: rem(2),
  displayLarge1: rem(5/2),
  displayLarge2: rem(7/2),
  displayLarge3: rem(9/2)
}

export const fontWeights = {
  standard: 500,
  bold: 700,
}
export const lineHeights = {
  body: 1.5,
  display: 1.25,
}

const baseBodyTextStyle = {
  fontWeight: fontWeights.standard,
  lineHeight: lineHeights.body
}
const baseDisplayTextStyle = {
  fontWeight: fontWeights.bold,
  lineHeight: lineHeights.display
}

export const textStyles = {
  bodySmall2: {
    fontSize: fontSizes.bodySmall2,
    ...baseBodyTextStyle
  },
  bodySmall1: {
    fontSize: fontSizes.bodySmall1,
    ...baseBodyTextStyle
  },
  body: {
    fontSize: fontSizes.body,
    ...baseBodyTextStyle
  },
  bodyLarge1: {
    fontSize: fontSizes.bodyLarge1,
    ...baseBodyTextStyle
  },

  displaySmall1: {
    fontSize: fontSizes.displaySmall1,
    ...baseDisplayTextStyle
  },
  display: {
    fontSize: fontSizes.display,
    ...baseDisplayTextStyle
  },
  displayLarge1: {
    fontSize: fontSizes.displayLarge1,
    ...baseDisplayTextStyle
  },
  displayLarge2: {
    fontSize: fontSizes.displayLarge2,
    ...baseDisplayTextStyle
  },
}

const white = '#fff'
const black = '#0f0035'
const lightBlack = '#342656'
const text = '#0f0035'
const borderGray = '#dae1f2'
const primary = '#8233ff'
const lightPrimary = desaturate(0.15, lighten(0.15, primary))
const red = '#dd3c6f'
const lightRed = '#f54391'
const green = '#12c8ba'
const lightGreen = desaturate(0.15, lighten(0.2, green))
const lighterGray = '#f0f4fc'
const lightGray = '#dae1f2'
const gray = '#a9a9c9'
const darkGray = '#8a8ab5'
const darkerGray = '#7272a3'

export const colors = {
  white,
  black,
  lightBlack,
  text,
  borderGray,
  primary,
  lightPrimary,
  red,
  lightRed,
  green,
  lightGreen,
  lighterGray,
  lightGray,
  gray,
  darkGray,
  darkerGray,
}

export const radius = '3px'
export const radiuses = {
  standard: '2px',
  large: '6px',
}

export const boxShadows = [
  `0 0 2px 0 rgba(0,0,0,.04),0 1px 4px 0 rgba(0,0,0,.08)`,
  `0 0 2px 0 rgba(0,0,0,.04),0 2px 8px 0 rgba(0,0,0,.08)`,
  `0 0 2px 0 rgba(0,0,0,.04),0 4px 16px 0 rgba(0,0,0,.08)`,
  `0 0 2px 0 rgba(0,0,0,.04),0 8px 32px 0 rgba(0,0,0,.08)`
]

export const timingFunctions = {
  easeInOut: `cubic-bezier(0.770, 0.000, 0.175, 1.000)`,
  easeOut: `cubic-bezier(0.165, 0.840, 0.440, 1.000)`,
  easeIn: `cubic-bezier(0.895, 0.030, 0.685, 0.220)`
}

export const durations = {
  short: `120ms`,
  medium: `280ms`,
  long: `600ms`,
}
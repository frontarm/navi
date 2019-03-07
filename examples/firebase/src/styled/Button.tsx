import React from 'react'
import { css, keyframes } from 'styled-components/macro'
import { colors, fontSizes } from '../utils/theme'
import { lighten } from 'polished';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  busy?: boolean

  bgcolor?: string
  color?: string
}

const boxShadow = `0 4px 16px -4px rgba(146, 146, 186, 0.5)`;

const animation = keyframes`
  0% {
    box-shadow: 0px 0px 16px 8px rgba(255, 255, 255,0.32) inset, ${boxShadow};
  }
  50% {
    box-shadow: 0px 0px 16px 8px rgba(255, 255, 255,0.12) inset, ${boxShadow};
  }
  100% {
    box-shadow: 0px 0px 16px 8px rgba(255, 255, 255,0) inset, ${boxShadow};
  }
`

const Button = ({ bgcolor, color, busy, children, ...buttonProps }: ButtonProps) => {
  if (!bgcolor) {
    color = colors.darkerGray
    bgcolor = colors.lightGray
  }
  else if (!color) {
    color = colors.white
  }

  return (
    <button {...buttonProps} css={css`
      display: inline-block;
      position: relative;
      cursor: pointer;
      font-size: ${fontSizes.bodyLarge1};
      line-height: 1.5rem;
      font-weight: 500;
      font-family: inherit;
      color: ${color};
      height: 3.5rem;
      border: 1px solid ${bgcolor};
      border-radius: 2rem;
      text-decoration: none;
      padding: 0.9rem 1.5rem 1.1rem 1.5rem;
      background: linear-gradient(${lighten(0.2, bgcolor)}, ${bgcolor});
      box-shadow: ${boxShadow};
      transition: box-shadow 120ms ease-out, transform 120ms ease-out;
      text-decoration: none !important;
      white-space: nowrap;

      ${busy && css`
        animation: ${animation} 1s infinite;
      `}
    `}>
      {children}
    </button>
  )
}

export default Button

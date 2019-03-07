import React from 'react'
import { css } from 'styled-components/macro'
import { fontSizes, colors } from '../utils/theme'

export interface FieldProps {
  children: React.ReactNode
  description?: string
  label: string
  error?: string
}

const Field = (props: FieldProps) => (
  <label
    css={css`
      display: block;
      width: 100%;
      margin: 0 0 1rem;
    `}>
    <span css={css`
      display: block;
      font-size: ${fontSizes.bodySmall2};
      padding-left: 0.75rem;
      letter-spacing: 0.2px;
      font-weight: bold;
    `}>{props.label}</span>
    {props.children}
    {props.error &&
      <p css={css`
        color: ${colors.red};
        font-size: ${fontSizes.bodySmall1};
        padding-left: 0.75rem;
      `}>
        {props.error || null}
      </p>
    }
    {props.description && !props.error &&
      <p css={css`
        color: ${colors.darkGray};
        font-size: ${fontSizes.bodySmall1};
        padding-left: 0.75rem;
      `}>
        {props.error || null}
      </p>
    }
  </label>
)

export default Field

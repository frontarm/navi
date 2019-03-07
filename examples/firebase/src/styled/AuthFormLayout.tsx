import React from 'react'
import { css } from 'styled-components/macro'
import { colors, boxShadows } from '../utils/theme'

interface AuthFormLayoutProps {
  children: React.ReactNode
  heading: string
}

const AuthFormLayout = (props: AuthFormLayoutProps) =>
  <>
    <div css={css`
      background-color: ${colors.primary};
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      z-index: -1;
    `} />
    <div css={css`
      background-color: ${colors.white};
      border-radius: 2rem;
      box-shadow: ${boxShadows[0]};
      padding: 2rem;
      margin: 0 auto;
      max-width: 420px;
      position: relative;
    `}>
      <h1>{props.heading}</h1>
      {props.children}
    </div>
  </>

export default AuthFormLayout
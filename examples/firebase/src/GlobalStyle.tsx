import { createGlobalStyle } from 'styled-components/macro'
import { base, colors } from './utils/theme'

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Lato:300,400,400i,700,900|Inconsolata:400,700');

  * {
    box-sizing: border-box;
  }

  html {
    font-family: Lato, sans-serif;
    font-size: ${base};
  }

  body {
    color: ${colors.text};
    margin: 0;
    padding: 0;
    font-size: 1rem;
    line-height: 1.5rem;
  }
`

export default GlobalStyle
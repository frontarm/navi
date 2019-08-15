import styled from 'styled-components'
import { fontSizes, colors, radiuses, boxShadows, durations } from '../utils/theme';

const Input = styled.input`
  appearance: none;
  display: block;
  width: 100%;
  font-family: inherit;
  margin: 0;
  padding: 0.75rem;
  font-size: ${fontSizes.bodySmall1};
  border-radius: ${radiuses.large};
  border: 1px solid ${colors.white};
  background-color: ${colors.lighterGray};
  box-shadow: ${boxShadows[2]} inset;
  transition: border ${durations.short} linear;
  color: ${colors.lightBlack};

  &::placeholder{
    color: ${colors.borderGray};
  }
  &:focus{
    outline: none !important;
    border-color: ${colors.red};
  }
  
  ::-ms-clear {
    display: none;
  }
`

export default Input
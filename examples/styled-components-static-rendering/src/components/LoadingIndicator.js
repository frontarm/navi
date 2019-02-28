import styled, { keyframes } from 'styled-components/macro'

const animation = keyframes`
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: -35px -35px;
  }
`

const LoadingIndicator = styled.div`
  position: fixed;
  height: 4px;
  top: 0;
  left: 0;
  right: 0;
  background-color: #1cde78;
  background-image: linear-gradient(-45deg, rgba(255,255,255,0.25) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.25) 75%, transparent 75%, transparent);
  background-size: 35px 35px;
  z-index: 1000;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) inset;
  transform: translateY(-4px);
  transition: transform ease-in 300ms, opacity ease-in 300ms;
  transition-delay: 0;
  animation: ${animation} 2s cubic-bezier(.4,.45,.6,.55) infinite;
  opacity: 0;

  ${({ active }) => !active ? '' : `
    transition-delay: 100ms;
    transform: translateY(0);
    opacity: 1;
  `}
`

export default LoadingIndicator

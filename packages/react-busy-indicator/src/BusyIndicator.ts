import * as React from 'react'

const baseClass = 'BusyIndicator-'+Math.random().toString(36).slice(2)

// Add busy indicator stylesheet
var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = `
.${baseClass} {
  position: fixed;
  height: 4px;
  top: 0;
  left: 0;
  right: 0;
  background-image: linear-gradient(-45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent);
  background-color: #1cde78;
  background-size: 35px 35px;
  z-index: 1000;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) inset;
  transform: translateY(-4px);
  transition: transform ease-in 300ms, opacity ease-in 300ms;
  transition-delay: 0;
  animation: ${baseClass} 2s cubic-bezier(.4,.45,.6,.55) infinite;
  opacity: 0;
}

.${baseClass}-visible {
  transition-delay: 333ms;
  transform: translateY(0);
  opacity: 1;
}

@keyframes ${baseClass} {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: -35px -35px;
  }
}`;
document.getElementsByTagName('head')[0].appendChild(style);


interface BusyIndicatorProps extends React.HTMLAttributes<any> {
  color?: string
  show?: boolean
}

export default function BusyIndicator({ className, color, show, style, ...props }) {
  return React.createElement('div', {
    ...props,
    className: `
      ${baseClass}
      ${show ? baseClass+'-visible' : ''}
      ${className || ''}
    `,
    style: {
      backgroundColor: color,
      ...style
    }
  })
}

(BusyIndicator as any).defaultProps = {
  color: '#1cde78',
}

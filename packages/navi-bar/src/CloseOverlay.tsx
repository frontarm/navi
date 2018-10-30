import * as React from 'react'

export const CloseOverlayContext = React.createContext<{
  open: boolean
  toggleOpen: () => void
}>({
  open: false,
  toggleOpen: () => {},
})

export function CloseOverlay(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <CloseOverlayContext.Consumer>
      {({ open, toggleOpen }) =>
        !open ? null : (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
            }}
            {...props}
            onClick={e => {
              if (props.onClick) {
                props.onClick(e)
              }
              if (!e.defaultPrevented) {
                toggleOpen()
              }
            }}
          />
        )
      }
    </CloseOverlayContext.Consumer>
  )
}

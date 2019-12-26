import * as React from 'react'

export type HashScrollBehavior =
  | 'smooth'
  | 'auto'
  | 'none'
  | ((hash: string | undefined | null) => void)

export const HashScrollContext = React.createContext<HashScrollBehavior>('auto')

export interface HashScrollProps {
  behavior?: HashScrollBehavior
  children: React.ReactNode
}

export function HashScroll(props: HashScrollProps) {
  if (!props.behavior) {
    return <>{props.children}</>
  }

  return (
    <HashScrollContext.Provider value={props.behavior}>
      {props.children}
    </HashScrollContext.Provider>
  )
}

function smoothScroll(left: number, top: number) {
  try {
    window.scroll({
      top,
      left,
      behavior: 'smooth',
    })
  } catch (e) {
    window.scroll(left, top)
  }
}

const behaviors = {
  none: () => {},
  auto: (hash: string | undefined | null) => {
    if (hash) {
      let id = document.getElementById(hash.slice(1))
      if (id) {
        let { top, left } = id.getBoundingClientRect()
        window.scroll(left + window.pageXOffset, top + window.pageYOffset)
      }
    } else {
      window.scroll(0, 0)
    }
  },
  smooth: (hash: string | undefined | null) => {
    if (hash) {
      let id = document.getElementById(hash.slice(1))
      if (id) {
        let { top, left } = id.getBoundingClientRect()
        smoothScroll(left + window.pageXOffset, top + window.pageYOffset)

        // Focus the element, as default behavior is cancelled.
        // https://css-tricks.com/snippets/jquery/smooth-scrolling/
        id.focus()
      }
    } else {
      smoothScroll(0, 0)
    }
  },
}

export function scrollToHash(
  hash: string | undefined | null,
  behavior: HashScrollBehavior = 'auto',
) {
  const fn = typeof behavior === 'string' ? behaviors[behavior] : behavior
  fn(hash)
}

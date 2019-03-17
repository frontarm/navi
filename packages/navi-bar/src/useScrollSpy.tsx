import * as React from 'react'
import { createScrollSpy, ScrollSpy as IScrollSpy, ScrollSpyOptions } from './headlessScrollSpy'

interface ScrollSpyState {
  id?: any,
  parentIds: any[],
  heading?: any,
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export function useScrollSpy(options: Omit<ScrollSpyOptions, 'callback'>) {
  let [state, setState] = React.useState<ScrollSpyState>({
    parentIds: [],
  })

  let scrollSpyCallback = React.useCallback(item => {
    setState(item ? { ...state, ...item } : {
      id: null,
      parentIds: [],
      heading: null,
    })
  }, [])

  let spyRef = React.useRef<IScrollSpy | undefined>(undefined)

  React.useEffect(() => {
    if (spyRef.current) {
      spyRef.current.refresh()
    }
  })

  React.useEffect(() => {
    if (options.tableOfContents) {
      if (spyRef.current) {
        spyRef.current.dispose()
      }
      spyRef.current = createScrollSpy({
        ...options,
        callback: scrollSpyCallback,
      })
      return () => {
        if (spyRef.current) {
          spyRef.current!.dispose()
        }
      }
    }
  }, [
    // Skipping this, as tableOfContents is a deeply nested object that
    // probably changes on every render, and we don't want to recreate the
    // scrollspy on each render.
    // options.tableOfContents,

    options.offset,
    options.container,
  ])

  return state
}
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

export interface RespondsContext {
  active: boolean
  focused: boolean
  hovering: boolean

  focus(triggerWithDelayOut?: number | undefined): () => void;
  hover(triggerWithDelayOut?: number | undefined): () => void;
  registerTrigger(): () => void,
}

export interface RespondsProps {
  children?: React.ReactNode
}

export interface RespondsToProps {
  children?: React.ReactElement<any, any>
  hover?: boolean
  focus?: boolean
  delay?: number
  delayIn?: number
  delayOut?: number
}

export interface RespondsWithProps {
  children?: React.ReactElement<any, any> | RespondsWithRenderer | null
  render?: RespondsWithRenderer
}

export interface RespondsWithRendererProps {
  active: boolean
  focused: boolean
  hovering: boolean
}

export type RespondsWithRenderer = (props: RespondsWithRendererProps) => React.ReactElement<any, any> | null

export const RespondsContext = React.createContext<RespondsContext>({
  active: false,
  focused: false,
  hovering: false,
  
  focus: () => () => {},
  hover: () => () => {},
  registerTrigger: () => () => {},
})

export const Responds: React.FC<RespondsProps> = ({ children }) => {
  let [focusCount, incrementFocusCount] = useFocusCounter()
  let [hoverCount, incrementHoverCount] = useFocusCounter()
  let [triggerCount, incrementTriggerCount] = useFocusCounter()

  let context: RespondsContext = useMemo(() => ({
    active: triggerCount > 0 && (focusCount > 0 || hoverCount > 0),
    focused: triggerCount > 0 && focusCount > 0,
    hovering: triggerCount > 0 && hoverCount > 0,

    focus: incrementFocusCount,
    hover: incrementHoverCount,
    registerTrigger: () => incrementTriggerCount(0),
  }), [focusCount, hoverCount, triggerCount, incrementFocusCount, incrementHoverCount, incrementTriggerCount])

  return (
    <RespondsContext.Provider value={context}>
      {children}
    </RespondsContext.Provider>
  )
}

export const RespondsTo: React.FC<RespondsToProps> = (props: RespondsToProps) => {
  let delay = props.delay || 10
  let { 
    children,
    hover,
    focus,
    delayIn = delay,
    delayOut = delay,
  } = props
  let ref = useRef<HTMLElement | undefined>()
  let context = useContext(RespondsContext)

  useEffect(context.registerTrigger, [])
  
  useTriggers(
    ref,
    context,
    !!hover,
    !!focus,
    delayIn,
    delayOut
  )

  let cloneProps = !focus ? undefined : {
    tabIndex: children!.props.tabIndex || -1,
  }

  return cloneWithRef(children!, ref, cloneProps)
}

export const RespondsWith: React.FC<RespondsWithProps> = ({ children, render }) => {
  let context = useContext(RespondsContext)
  let ref = useRef()

  let { hovering, focused, active } = context

  useTriggers(
    ref,
    context,
    !!hovering,
    !!focused
  )

  if (React.isValidElement(children)) {
    render = ({ active }) => active ? children : null
  }
  else if (children) {
    render = children as any
  }

  return cloneWithRef(render!({ active, focused, hovering }), ref)
}

export default Object.assign(Responds, {
  To: RespondsTo,
  With: RespondsWith,
})

function useFocusCounter() {
  let [count, setCount] = useState(0)
  let countRef = useRef(count)
  let lastDecrementDelayRef = useRef(0)

  // The decrement occurs within a `setTimeout()`, but the current count can
  // change before the setTimeout occurs, so we need a ref to access it.
  countRef.current = count

  let timeouts: Set<number> = new Set()
  useEffect(() => {
    return () => {
      timeouts.forEach(timeout => window.clearTimeout(timeout))
    }
  })

  let increment = useCallback((triggerAndSetDecrementDelay?: number): (() => void) => {
    if (triggerAndSetDecrementDelay !== undefined || countRef.current > 0) {
      setCount(countRef.current + 1)
      if (triggerAndSetDecrementDelay !== undefined) {
        lastDecrementDelayRef.current = triggerAndSetDecrementDelay
      }
      else {
        triggerAndSetDecrementDelay = lastDecrementDelayRef.current
      }
      return () => {
        let timeout = window.setTimeout(() => {
          setCount(Math.max(countRef.current - 1, 0))
          timeouts.delete(timeout)
        }, triggerAndSetDecrementDelay)

        timeouts.add(timeout)
      }
    }
    return () => {}
  }, [timeouts])

  return [count, increment] as [number, (triggerWithDelayOut?: number | undefined) => () => void]
}

function useTriggers(
  ref: React.MutableRefObject<HTMLElement | undefined>,
  context: RespondsContext,
  hover: boolean,
  focus: boolean,
  delayIn?: number,
  delayOut?: number
) {
  let stateRef = useRef<{
    focusTimeout?: number,
    hoverTimeout?: number,
    focusOut?: () => void,
    hoverOut?: () => void,
    focus?: boolean,
    hover?: boolean,
  }>({})

  stateRef.current.focus = focus
  stateRef.current.hover = hover

  useEffect(() => {
    let node = ref.current!
    let current = stateRef.current

    let handleFocusIn = () => {
      stateRef.current.focusTimeout = setTimeout(() => {
        stateRef.current.focusTimeout = undefined
        if (stateRef.current.focusOut) {
          stateRef.current.focusOut()
        }
        stateRef.current.focusOut = context.focus(delayOut)
      }, delayIn)
    }
    let handleFocusOut = () => {
      if (stateRef.current.focusTimeout !== undefined) {
        clearTimeout(stateRef.current.focusTimeout)
      }
      else if (stateRef.current.focusOut) {
        stateRef.current.focusOut()
        stateRef.current.focusOut = undefined
      }
    }

    let handleMouseEnter = () => {
      stateRef.current.hoverTimeout = setTimeout(() => {
        stateRef.current.hoverTimeout = undefined
        stateRef.current.hoverOut = context.hover(delayOut)
      }, delayIn)
    }
    let handleMouseLeave = () => {
      if (stateRef.current.hoverTimeout !== undefined) {
        clearTimeout(stateRef.current.hoverTimeout)
      }
      else if (stateRef.current.hoverOut) {
        stateRef.current.hoverOut()
        stateRef.current.hoverOut = undefined
      }
    }

    if (focus) {
      node.addEventListener('focusin', handleFocusIn, false)
      node.addEventListener('focusout', handleFocusOut, false)
    }
    if (hover) {
      node.addEventListener('mouseenter', handleMouseEnter, false)
      node.addEventListener('mouseleave', handleMouseLeave, false)
    }

    return () => {
      if (current.focusTimeout) {
        clearTimeout(current.focusTimeout)
      }
      if (!current.focus && current.focusOut) {
        current.focusOut()
      }
      if (current.hoverTimeout) {
        clearTimeout(current.hoverTimeout)
      }
      if (!current.hover && current.hoverOut) {
        current.hoverOut()
      }
      if (focus) {
        node.removeEventListener('focusin', handleFocusIn, false)
        node.removeEventListener('focusout', handleFocusOut, false)
      }
      if (hover) {
        node.removeEventListener('mouseenter', handleMouseEnter, false)
        node.removeEventListener('mouseleave', handleMouseLeave, false)
      }
    }
  }, [hover, focus, delayIn, delayOut, context, ref])
}

// Based on the `cloneWithRef` from react-dnd
// Copyright (c) 2015 Dan Abramov, MIT License
// https://github.com/react-dnd/react-dnd/blob/fcbe0e0252422efeb187b2471d0075c808b80fe1/packages/react-dnd/src/utils/cloneWithRef.ts
function cloneWithRef(
	element: any,
  newRef: any,
  props?: any,
): React.ReactElement<any> {
  const previousRef = element.ref
	
	if (!previousRef) {
		// When there is no ref on the element, use the new ref directly
		return React.cloneElement(element, {
      ...props,
      ref: newRef,
		})
  }

	return React.cloneElement(element, {
    ...props,
		ref: (node: any) => {
      if (typeof newRef === 'function') {
			  newRef(node)
      }
      else {
        newRef.current = node
      }
			if (typeof previousRef === 'function') {
				previousRef(node)
      }
      else if (previousRef) {
        previousRef.current = node
      }
		},
	})
}
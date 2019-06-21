import * as React from 'react'

export type HashScrollBehavior = 'smooth' | 'auto'

export const HashScrollContext = React.createContext<HashScrollBehavior>('auto')

export interface HashScrollProps { behavior?: HashScrollBehavior, children: React.ReactNode }

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

function scroll(left: number, top: number, behavior: HashScrollBehavior) {
    if (behavior === 'auto') {
        window.scroll(left, top)
    }
    else {
        try {
            window.scroll({
                top,
                left,
                behavior,
            })
        }
        catch (e) {
            window.scroll(left, top)
        }
    }
}

export function scrollToHash(hash: string | undefined | null, behavior: HashScrollBehavior = 'auto') {
    if (hash) {
        let id = document.getElementById(hash.slice(1))
        if (id) {
            let { top, left } = id.getBoundingClientRect()

            scroll(left + window.pageXOffset, top + window.pageYOffset, behavior)

            // Focus the element, as default behavior is cancelled.
            // https://css-tricks.com/snippets/jquery/smooth-scrolling/
            id.focus()
        }
    }
    else {
        scroll(0, 0, behavior)
    }
}

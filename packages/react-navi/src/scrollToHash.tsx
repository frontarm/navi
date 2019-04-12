export function scrollToHash(hash, behavior) {
    if (hash) {
        let id = document.getElementById(hash.slice(1))
        if (id) {
            let { top, left } = id.getBoundingClientRect()

            try {
                window.scroll({
                    top: top + window.pageYOffset,
                    left: left + window.pageXOffset,
                    behavior,
                })
            } catch (err) {
                window.scroll(left + window.pageXOffset, top + window.pageYOffset)   
            }

            // Focus the element, as default behavior is cancelled.
            // https://css-tricks.com/snippets/jquery/smooth-scrolling/
            id.focus()
        }
    }
    else {
        window.scroll({
            top: 0, 
            left: 0, 
            behavior,
        })
    }
}

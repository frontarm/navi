export function scrollToHash(hash, behavior) {
  if (hash) {
      let id = document.getElementById(hash.slice(1))
      if (id) {
          id.scrollIntoView({
              behavior: behavior,
              block: 'start'
          })

          // Focus the element, as default behavior is cancelled.
          // https://css-tricks.com/snippets/jquery/smooth-scrolling/
          id.focus()
      }
  }
  else {
      window.scroll({
          top: 0, 
          left: 0, 
          behavior: 'auto',
      })
  }
}

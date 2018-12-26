import React from 'react'

const BlogContext = React.createContext({
  /**
   * The pathname at which the app is mounted. Set within pages/index.js.
   */
  pathname: undefined,

  /**
   * The app's title, as it appears in the header. Set within pages/index.js.
   */
  title: undefined,
})

export default BlogContext
module.exports = {
  wrap: function(id, meta, pathname, content) {
    const page = typeof meta == 'function' ? {} : meta

    if (content) {
      page.content = content
    }

    const api = {
      set: function(data) {
        Object.assign(page, data)
        return api
      },

      get: function(pages, processors=[], patterns=[]) {
        const pattern = function(pattern, data) {
          patterns.push([pattern, data])
        }

        if (typeof meta == 'function') {
          if (!pages) {
            throw new Error("You cannot include a SITE.js file as another SITE.js file's content.")
          }
          Object.assign(page, meta(pattern))
        }

        const contentFn = page.content

        if (page.content && typeof page.content.get == 'function') {
          Object.assign(page, contentFn.get(null, processors.slice(0), patterns.slice(0)))
        }

        if (page.index) {
          const index = page.index

          let lastPage
          for (var i = 0, len = index.length; i < index.length; i++) {
            const child = index[i]

            let childPage
            if (child != contentFn) {
              childPage = index[i] = child.get(pages, processors.slice(0), patterns.slice(0))
              childPage.parent = page
            }
            else {
              childPage = index[i] = page
            }

            if (!('previous' in childPage) && i !== 0) {
              childPage.previous = index[i - 1]
            }
            if (lastPage) {
              lastPage.next = childPage
            }
            lastPage = childPage
          }
        }
        
        for (let [pattern, patternData] of patterns) {
          if (pattern.test(pathname)) {
            Object.assign(page, patternData)
          }
        }

        if (pages) {
          page.id = id

          for (let processor of processors) {
            processor(page)
          }

          if (pages[id]) {
            return Object.assign(pages[id], page)
          }
          else {
            pages[id] = page
            return page
          }
        }
        else {
          return page
        }
      },

      initialize: function(processor) {
        const pages = {}
        const processors = [processor]
        return {
          pages: pages,
          root: api.get(pages, processors),
        }
      },
    }

    return api
  }
}


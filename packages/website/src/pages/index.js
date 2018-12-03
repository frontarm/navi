import * as React from 'react'
import * as Navi from 'navi'

export default Navi.createSwitch({
  paths: {
    '/': Navi.createPage({
      title: "Start Here",
      getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./start-here.md')),
      meta: {
        description: 'A batteries-included router for React.',
      },
    }),

    '/motivation': Navi.createPage({
      title: 'Motivation',
      getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./motivation.md')),
    }),

    // TODO: get this added back in ASAP
    // '/core-concepts': Navi.createPage({
    //   title: 'Core concepts',
    //   getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./core-concepts.md')),
    // }),

    '/tutorial': Navi.createPage({
      title: 'Tutorial: Make a blog',
      getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./tutorial/make-a-blog.md')),
    }),

    '/guides': Navi.createSwitch({
      title: 'Guides',

      paths: {
        '/quick-start': Navi.createPage({
          title: 'Quick start',
          getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./guides/quick-start.md')),
        }),

        '/static-rendering': Navi.createPage({
          title: 'Static rendering',
          getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./guides/static-rendering.md')),
        }),

        '/authenticated-routes': Navi.createPage({
          title: 'Authenticated routes',
          getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./guides/authenticated-routes.md')),
        }),

        '/integrating-react-router': Navi.createPage({
          title: 'Integrating with react-router',
          getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./guides/integrating-react-router.md')),
        }),

    //     '/integrating-express': Navi.createPage({
    //       title: 'Integrating with Express',
    //       getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./guides/integrating-express.md')),
    //     }),
      }
    }),

    '/reference': Navi.createSwitch({
      title: 'API Reference',
      paths: {
        '/defining-pages': Navi.createPage({
          title: 'Declaring pages',
          getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./reference/defining-pages.md')),
        }),
        '/navigation': Navi.createPage({
          title: 'Navigation objects',
          getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./reference/navigation.md')),
        }),
        '/react-components': Navi.createPage({
          title: 'React components',
          getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./reference/components.md')),
        }),
        '/route': Navi.createPage({
          title: 'Routes, Segments and URL Descriptors',
          getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./reference/routes-and-segments.md')),
        }),
        '/router': Navi.createPage({
          title: 'Router',
          getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./reference/router.md')),
        }),
      }
    }),
  },
})

async function getDocumentExports(modulePromise) {
  let mod = await modulePromise
  let { default: Document, tableOfContents } = mod
  return { Document, tableOfContents }
}
import * as React from 'react'
import * as Navi from 'navi'

export default Navi.createSwitch({
  paths: {
    '/': Navi.createPage({
      title: "Start here",
      getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./pitch.md')),
      meta: {
        description: 'A batteries-included router for React.',
      },
    }),

    // '/tutorial': Navi.createPage({
    //   title: 'Make a blog',
    //   getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./tutorial.md')),
    // }),

    // '/important-concepts': Navi.createPage({
    //   title: 'What you need to know',
    //   getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./important-concepts.md')),
    // }),

    // '/examples': Navi.createSwitch({
    //   title: 'Examples',
    //   paths: {
    //     '/basic': Navi.createPage({
    //       title: 'Basic',
    //       getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./examples/basic.md')),
    //     }),
    //     '/site-map': Navi.createPage({
    //       title: 'Site Map',
    //     }),
    //   }
    // }),

    '/api-reference': Navi.createSwitch({
      title: 'API Reference',
      paths: {
        '/defining-pages': Navi.createPage({
          title: 'Defining pages',
          getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./api/defining-pages.md')),
        }),
        '/react-components': Navi.createPage({
          title: 'Components',
          getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./api/components.md')),
        }),
        '/route': Navi.createPage({
          title: 'Routes and Segments',
          getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./api/routes-and-segments.md')),
        }),
        '/navigation': Navi.createPage({
          title: 'Navigation',
          getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./api/navigation.md')),
        }),
        '/router': Navi.createPage({
          title: 'Router',
          getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./api/router.md')),
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
import React from 'react'
import * as Navi from 'navi'
import { Layout } from './Layout'

export default Navi.createSwitch({
  getContent: async env =>
    <Layout siteMap={await env.router.resolveSiteMap('/')} />,

  paths: {
    '/': Navi.createPage({
      title: "Start Here",
      getContent: env =>
        getDocumentExports(import('!babel-loader!mdx-loader!./start-here.md')),
      meta: {
        description: 'A batteries-included router for React.',
      },
    }),

    '/motivation': Navi.createPage({
      title: 'Motivation',
      getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./motivation.md')),
    }),

    // '/core-concepts': Navi.createPage({
    //   title: 'Core concepts',
    //   getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./core-concepts.md')),
    // }),

    // this really is a short course... probably should just add a redirect to it
    // '/tutorial': Navi.createPage({
    //   title: 'Tutorial: Make a blog',
    //   getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./tutorial/make-a-blog.md')),
    // }),

    '/guides': Navi.createSwitch({
      title: 'Guides',

      paths: {
        '/minimal-example': Navi.createPage({
          title: 'A Minimal Example',
          getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./guides/minimal-example.md')),
        }),

        '/static-rendering': Navi.createPage({
          title: 'Static Rendering',
          getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./guides/static-rendering.md')),
        }),

        '/authenticated-routes': Navi.createPage({
          title: 'Authenticated Routes',
          getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./guides/authenticated-routes.md')),
        }),

        '/integrating-react-router': Navi.createPage({
          title: 'Integrating with react-router',
          getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./guides/integrating-react-router.md')),
        }),

    //     '/integrating-express': Navi.createPage({
    //       title: 'Server Rendering with Express',
    //       getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./guides/integrating-express.md')),
    //     }),
      }
    }),

    '/reference': Navi.createSwitch({
      title: 'API Reference',
      paths: {
        '/declarations': Navi.createPage({
          title: 'Declaring pages',
          getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./reference/defining-pages.md')),
        }),
        '/navigation': Navi.createPage({
          title: 'Navigation',
          getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./reference/navigation.md')),
        }),
        '/react-components': Navi.createPage({
          title: 'Components',
          getContent: env => getDocumentExports(import('!babel-loader!mdx-loader!./reference/components.md')),
        }),
        '/routes-segments-urls': Navi.createPage({
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
  let { default: Component, tableOfContents } = mod
  return { Component, tableOfContents }
}
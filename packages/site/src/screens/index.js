import * as React from 'react'
import { createSwitch, createPage } from 'junctions'
import { MDXWrapper } from '../MDXWrapper'

export const rootSwitch = createSwitch({
  paths: {
    '/': createPage({
      title: 'Junctions',
      getContent: async () =>
        <MDXWrapper
          document={await import('!babel-loader!mdx-loader!./landing.md')}
        />,
      meta: {
        socialTitle: 'Junctions',
        socialDescription: 'A batteries-included router for React.',
      },
    }),

    '/api-reference': createPage({
      title: 'Junctions API Reference',
      getContent: async () =>
        <MDXWrapper
          document={await import('!babel-loader!mdx-loader!./api-reference.md')}
        />,
      meta: {
        socialTitle: 'Junctions API Reference',
        socialDescription: 'Complete documentation on the Junctions API.',
      },
    }),

    '/static-sites-with-create-react-app': createPage({
      title: 'Static sites with create-react-app and Junctions',
      getContent: async () =>
        <MDXWrapper
          document={await import('!babel-loader!mdx-loader!./static-sites-with-create-react-app.md')}
        />,
      meta: {
        socialTitle: 'Static rendering for create-react-app',
        socialDescription: "Build static HTML files for your create-react-app project, in just five steps!",
      },
    }),

    '/tutorial': createPage({
      title: 'Junctions Tutorial',
      getContent: async () =>
        <MDXWrapper
          document={await import('!babel-loader!mdx-loader!./tutorial.md')}
        />,
      meta: {
        socialTitle: 'Build a static documentation site, with create-react-app and Junctions',
        socialDescription: "In this step-by-step tutorial, you'll build a small documentation website with static rendering -- just like this one!",
      },
    }),

    '/why-another-router': createPage({
      title: 'Why another Router?',
      getContent: async () =>
        <MDXWrapper
          document={await import('!babel-loader!mdx-loader!./why-another-router.md')}
        />,
      meta: {
        socialTitle: 'react-router vs. Junctions',
        socialDescription: "While react-router gives you the flexibility to work with native apps, Junctions is laser-focused on routing for websites and web apps.",
      },
    }),

    '/why-another-static-site-generator': createPage({
      title: 'Why another Router?',
      getContent: async () =>
        <MDXWrapper
          document={await import('!babel-loader!mdx-loader!./why-another-static-site-generator.md')}
        />,
      meta: {
        socialTitle: 'Gatsby vs. Junctions',
        socialDescription: "While Gatsby is infinitely configurable, Junctions is designed to complement create-react-app. And it's still ridiculously fast.",
      },
    }),
  },
})

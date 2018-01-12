import React from 'react'
import { createJunctionTemplate, createPageTemplate, JunctionActiveChild } from 'react-junctions'
import { MDXWrapper } from './MDXWrapper'
import { Sidebar } from './Sidebar'
import './App.css'


export const App = ({ env, junction }) =>
  <div className="App">
    <Sidebar env={env} className="App-sidebar" />    

    <main className="App-content">
      <JunctionActiveChild
        junction={junction}
        notFoundElement={
          <div className='App-notfound'>
            <h1>404</h1>
          </div>
        }
      />
    </main>
  </div>


export const AppJunctionTemplate = createJunctionTemplate({
  children: {
    '/': createPageTemplate({
      title: 'Junctions',
      component: MDXWrapper,
      getContent: () => import('!babel-loader!mdx-loader!./pages/landing.md'),
    }),

    '/api-reference': createPageTemplate({
      title: 'Junctions API Reference',
      component: MDXWrapper,
      getContent: () => import('!babel-loader!mdx-loader!./pages/api-reference.md'),
    }),

    '/static-sites-with-create-react-app': createPageTemplate({
      title: 'Static sites with create-react-app and Junctions',
      component: MDXWrapper,
      getContent: () => import('!babel-loader!mdx-loader!./pages/static-sites-with-create-react-app.md'),
    }),

    '/tutorial': createPageTemplate({
      title: 'Junctions Tutorial',
      component: MDXWrapper,
      getContent: () => import('!babel-loader!mdx-loader!./pages/tutorial.md'),
    }),

    '/why-another-router': createPageTemplate({
      title: 'Why another Router?',
      component: MDXWrapper,
      getContent: () => import('!babel-loader!mdx-loader!./pages/why-another-router.md'),
    }),

    '/why-another-static-site-generator': createPageTemplate({
      title: 'Why another Router?',
      component: MDXWrapper,
      getContent: () => import('!babel-loader!mdx-loader!./pages/why-another-static-site-generator.md'),
    }),
  },

  component: App,
})

import React from 'react'
import { createJunctionTemplate, createPageTemplate, JunctionActiveChild } from 'react-junctions'
import { MDXWrapper } from './MDXWrapper'
import { Sidebar } from './Sidebar'
import './App.css'


export class App extends React.Component {
  state = {
    open: false,
  }

  handleToggleMenu = () => {
    this.setState({ open: !this.state.open })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.junction !== this.props.junction) {
      this.setState({ open: false })
    }
  }

  render() {
    let { env, junction } = this.props

    return (
      <div className="App">
        <div className={`App-nav ${this.state.open ? 'App-nav-open' : ''}`}>
          <Sidebar
            env={env}
            className='App-nav-sidebar'
          />
          <button
            className='App-nav-hamburger'
            onClick={this.handleToggleMenu}
            onTouchStart={this.handleToggleMenu}>
            <div className='App-nav-hamburger-icon' />
          </button>
        </div>

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
    )
  }
}


export const AppJunctionTemplate = createJunctionTemplate({
  children: {
    '/': createPageTemplate({
      title: 'Junctions',
      component: MDXWrapper,
      getContent: () => import('!babel-loader!mdx-loader!./pages/landing.md'),
      meta: {
        socialTitle: 'Junctions',
        socialDescription: 'A batteries-included router for React.',
      },
    }),

    '/api-reference': createPageTemplate({
      title: 'Junctions API Reference',
      component: MDXWrapper,
      getContent: () => import('!babel-loader!mdx-loader!./pages/api-reference.md'),
      meta: {
        socialTitle: 'Junctions API Reference',
        socialDescription: 'Complete documentation on the Junctions API.',
      },
    }),

    '/static-sites-with-create-react-app': createPageTemplate({
      title: 'Static sites with create-react-app and Junctions',
      component: MDXWrapper,
      getContent: () => import('!babel-loader!mdx-loader!./pages/static-sites-with-create-react-app.md'),
      meta: {
        socialTitle: 'Static rendering for create-react-app',
        socialDescription: "Build static HTML files for your create-react-app project, in just five steps!",
      },
    }),

    '/tutorial': createPageTemplate({
      title: 'Junctions Tutorial',
      component: MDXWrapper,
      getContent: () => import('!babel-loader!mdx-loader!./pages/tutorial.md'),
      meta: {
        socialTitle: 'Build a static documentation site, with create-react-app and Junctions',
        socialDescription: "In this step-by-step tutorial, you'll build a small documentation website with static rendering -- just like this one!",
      },
    }),

    '/why-another-router': createPageTemplate({
      title: 'Why another Router?',
      component: MDXWrapper,
      getContent: () => import('!babel-loader!mdx-loader!./pages/why-another-router.md'),
      meta: {
        socialTitle: 'react-router vs. Junctions',
        socialDescription: "While react-router gives you the flexibility to work with native apps, Junctions aims to be the best router for the web.",
      },
    }),

    '/why-another-static-site-generator': createPageTemplate({
      title: 'Why another Router?',
      component: MDXWrapper,
      getContent: () => import('!babel-loader!mdx-loader!./pages/why-another-static-site-generator.md'),
      meta: {
        socialTitle: 'Gatsby vs. Junctions',
        socialDescription: "While Gatsby is infinitely configurable, Junctions is designed to complement create-react-app. And it's still ridiculously fast.",
      },
    }),
  },

  component: App,
})

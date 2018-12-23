import React, { Component } from 'react';
import { NavProvider, NavLink, NavLoading, NavContent, NavNotFoundBoundary } from 'react-navi';
import { MDXProvider } from '@mdx-js/tag';
import Layout from './Layout'
import NotFound from './NotFound'

class App extends Component {
  render() {
    return (
      <NavProvider navigation={this.props.navigation}>
        <MDXProvider components={{
          // Use Navi's <NavLink> component to render links in any
          // MDX components, ensuring navigation is handled by Navi.
          a: NavLink,
        }}>
          <NavLoading>
            {loadingRoute =>
              <Layout isLoading={!!loadingRoute}>
                <NavNotFoundBoundary render={() => <NotFound />}>
                  <NavContent />
                </NavNotFoundBoundary>
              </Layout>
            }
          </NavLoading>
        </MDXProvider>
      </NavProvider>
    );
  }
}

export default App;

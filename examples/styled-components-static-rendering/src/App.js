import React from 'react';
import { Link, View, NotFoundBoundary, useLoadingRoute } from 'react-navi';
import { MDXProvider } from '@mdx-js/react';
import { ThemeProvider } from 'styled-components/macro';
import GlobalStyle from './GlobalStyle';
import Layout from './components/Layout';
import theme from './theme';

function App() {
  let loadingRoute = useLoadingRoute()

  return (
    <ThemeProvider theme={theme}>
      <>
        <GlobalStyle />
        <Layout isLoading={loadingRoute}>
          <NotFoundBoundary render={renderNotFound}>
            <MDXProvider components={{
              // Use Navi's <Link> component to render links in
              // Markdown files, ensuring navigation is handled by Navi.
              a: Link,
            }}>
              <View />
            </MDXProvider>
          </NotFoundBoundary>
        </Layout>
      </>
    </ThemeProvider>
  );
}

// Note that create-react-navi-app will always show an error screen when this
// is called. This is because the underlying react-scripts package show
// the error screen when a NotFoundError is thrown, even though it's caught
// by <NotFoundBoundary>. To see the error rendered by this function,
// you'll just need to close the error overlay with the "x" at the top right.
function renderNotFound() {
  return (
    <Layout>
      <div className='App-error'>
        <h1>404 - Not Found</h1>
      </div>
    </Layout>
  )
} 

export default App;

import React, { Suspense, useState, useEffect } from 'react'
import { Router, View } from 'react-navi'
import firebase from 'firebase/app'
import { ThemeProvider } from 'styled-components/macro'
import Firebase from './Firebase'
import GlobalStyle from './GlobalStyle'
import routes from './routes'
import theme from './theme'
import Layout from './components/Layout'
import { RoutingContext } from './types/RoutingContext'

function App() {
  let [firebase] = useState(() => new Firebase())
  let [currentUser, setCurrentUser] = useState<firebase.User | null>(null)
  useEffect(firebase.auth.onAuthStateChanged(setCurrentUser), [])

  let context: RoutingContext = {
    currentUser,
    firebase
  }

  return (
    <ThemeProvider theme={theme}>
      <Router routes={routes} context={context}>
        <GlobalStyle />
        <Layout>
          <Suspense fallback={null}>
            <View />
          </Suspense>
        </Layout>
      </Router>
    </ThemeProvider>
  )
}

export default App
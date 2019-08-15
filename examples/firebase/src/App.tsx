import React, { Suspense, useState, useEffect } from 'react'
import { withView, compose } from 'navi'
import { Router, View } from 'react-navi'
import * as firebaseApp from 'firebase/app'
import Firebase from './Firebase'
import GlobalStyle from './GlobalStyle'
import routes from './routes'
import Layout from './styled/AppLayout'
import { RoutingContext } from './types/RoutingContext'

const routesWithLayout = compose(
  // Instead of rendering the latest `currentUser`, we render its value at the
  // time that the route was generated. Given that changing the user rebuilds
  // the route, it will always be up-to-date -- and doing it this way helps
  // avoid flashes of content when navigating between auth actions.
  withView((request, context: RoutingContext) =>
    <Layout user={context.currentUser}>
      <Suspense fallback={null}>
        <View />
      </Suspense>
    </Layout>
  ),
  routes
)

function App() {
  let [firebase] = useState(() => new Firebase())
  let [currentUser, setCurrentUser] = useState<firebaseApp.User | null | undefined>(undefined)
  useEffect(() => firebase.auth.onAuthStateChanged(setCurrentUser), [firebase.auth, currentUser])

  let context: RoutingContext = {
    currentUser,
    firebase
  }

  return (
    <Router routes={routesWithLayout as any} context={context}>
      <GlobalStyle />
      <View />
    </Router>
  )
}

export default App
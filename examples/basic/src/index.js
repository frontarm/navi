import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import { Router, View } from 'react-navi'
import reactNaviHelmet from 'react-navi-helmet'
import Layout from './components/AppLayout'
import './index.css'
import routes from './routes'
import * as serviceWorker from './serviceWorker'

ReactDOM.render(
  <Router
    hashScrollBehavior="smooth"
    routes={routes}
    renderViewHead={reactNaviHelmet}>
    <Layout>
      <Suspense fallback={null}>
        <View />
      </Suspense>
    </Layout>
  </Router>,
  document.getElementById('root'),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()

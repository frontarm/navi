import * as Navi from 'navi'
import React from 'react'
import ReactDOM from 'react-dom'
import { NaviProvider, NaviView } from 'react-navi'
import routes from './routes'

it('renders without crashing', () => {
  const div = document.createElement('div')
  const navigation = Navi.createBrowserNavigation({ routes })

  ReactDOM.render(
    <NaviProvider navigation={navigation}>
      <NaviView />
    </NaviProvider>,
    div
  )
  ReactDOM.unmountComponentAtNode(div)
})

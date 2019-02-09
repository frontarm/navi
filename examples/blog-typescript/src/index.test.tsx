import * as Navi from 'navi'
import React from 'react'
import ReactDOM from 'react-dom'
import { NavProvider, NavView } from 'react-navi'
import routes from './routes'

it('renders without crashing', () => {
  const div = document.createElement('div')
  const navigation = Navi.createBrowserNavigation({ routes })

  ReactDOM.render(
    <NavProvider navigation={navigation}>
      <NavView />
    </NavProvider>,
    div
  )
  ReactDOM.unmountComponentAtNode(div)
})

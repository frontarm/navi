import { createMemoryNavigation, route, mount } from 'navi'
import React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { Router, useActive } from '../src'

function Active() {
  let rootActive = useActive('/', { loading: true })
  let anywhereActive = useActive('/', { exact: false })

  return [rootActive && 'root', anywhereActive && 'anywhere']
    .filter(x => !!x)
    .join(' ')
}

describe('useActive', () => {
  test('only returns true when at the exact url by default', async () => {
    let navigation = createMemoryNavigation({
      url: '/test',
      routes: mount({
        '/': route(),
        '/test': route(),
      }),
    })

    let component = ReactTestRenderer.create(
      <Router navigation={navigation}>
        <Active />
      </Router>,
    )

    expect(component.toJSON()).toEqual('anywhere')
  })
})

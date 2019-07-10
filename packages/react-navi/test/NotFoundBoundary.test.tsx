import { createMemoryNavigation, route, mount } from 'navi'
import React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { NotFoundBoundary, Router, View } from '../src'

describe('NotFoundBoundary', () => {
  test('renders when navigating to a missing url', async () => {
    let navigation = createMemoryNavigation({
      url: '/',
      routes: mount({
        '/': route({
          view: 'test',
        }),
      }),
    })

    let component = ReactTestRenderer.create(
      <Router navigation={navigation}>
        <NotFoundBoundary render={() => 'not found'}>
          <View />
        </NotFoundBoundary>
      </Router>,
    )

    expect(component.toJSON()).toEqual('test')

    await navigation.navigate('/test')
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(component.toJSON()).toEqual('not found')
  })

  test('renders the original content after navigating away from missing url', async () => {
    let navigation = createMemoryNavigation({
      url: '/test',
      routes: mount({
        '/': route({
          view: 'test',
        }),
      }),
    })

    await navigation.getCurrentValue()

    let component = ReactTestRenderer.create(
      <Router navigation={navigation}>
        <NotFoundBoundary render={() => 'not found'}>
          <View />
        </NotFoundBoundary>
      </Router>,
    )

    expect(component.toJSON()).toEqual('not found')

    await navigation.navigate('/')
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(component.toJSON()).toEqual('test')
  })
})

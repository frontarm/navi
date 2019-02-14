import { createMemoryNavigation, composeMatchers, withView, route, map } from 'navi'
import React, { Component } from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { View, NaviProvider } from '../src'

describe("View", () => {
  test("supports nested nested views", async () => {
    let navigation = createMemoryNavigation({
      url: '/test/',
      routes: composeMatchers(
        withView(() =>
          function Wrapper() {
            return <div><View /></div>
          }
        ),
        map({
          '/test': route({
            view: 'nested content'
          }),
        })
      ),
    })

    await navigation.steady()

    let component = ReactTestRenderer.create(
      <NaviProvider navigation={navigation}>
        <View />
      </NaviProvider>,
    )

    expect(component.toJSON().children[0]).toEqual('nested content')
  })

  test("renders class component content as an element with a 'route' prop", async () => {
    let navigation = createMemoryNavigation({
      url: '/test/',
      routes: map({
        '/test': route({
          title: 'title',
          view:
            class TestClassComponent extends Component<any> {
                render() {
                    return this.props.route.title
                }
            },
        }),
      }),
    })

    await navigation.steady()

    let component = ReactTestRenderer.create(
      <NaviProvider navigation={navigation}>
        <View />
      </NaviProvider>,
    )
    let output = component.toJSON()
    
    expect(output).toEqual('title')
  })

  test("renders function component content as an element with a 'route' prop", async () => {
    let navigation = createMemoryNavigation({
      url: '/test/',
      routes: map({
        '/test': route({
          title: 'title',
          view: ({ route }) => route.title
        }),
      }),
    })

    await navigation.steady()

    let component = ReactTestRenderer.create(
      <NaviProvider navigation={navigation}>
        <View />
      </NaviProvider>,
    )
    
    expect(component.toJSON()).toEqual('title')
  })

  test("renders element content", async () => {
    let navigation = createMemoryNavigation({
      url: '/test/',
      routes: map({
        '/test': route({
          view: <>test content</>
        }),
      }),
    })

    await navigation.steady()

    let component = ReactTestRenderer.create(
      <NaviProvider navigation={navigation}>
        <View />
      </NaviProvider>,
    )
    
    expect(component.toJSON()).toEqual('test content')
  })

  test("renders string content", async () => {
    let navigation = createMemoryNavigation({
      url: '/test/',
      routes: map({
        '/test': route({
          view: "test content"
        }),
      }),
    })

    await navigation.steady()

    let component = ReactTestRenderer.create(
      <NaviProvider navigation={navigation}>
        <View />
      </NaviProvider>,
    )
    
    expect(component.toJSON()).toEqual('test content')
  })
})

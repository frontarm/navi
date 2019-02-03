import * as Navi from 'navi'
import React, { Component } from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { NavContent, NavProvider } from '../src'

describe("NavContent", () => {
  test("supports nested nested content", async () => {
    let navigation = Navi.createMemoryNavigation({
      url: '/test/',
      pages: Navi.createSwitch({
        content: function Wrapper() {
          return <div><NavContent /></div>
        },
        paths: {
          '/test': Navi.createPage({
            content: 'nested content'
          }),
        }
      }),
    })

    await navigation.steady()

    let component = ReactTestRenderer.create(
      <NavProvider navigation={navigation}>
        <NavContent />
      </NavProvider>,
    )

    expect(component.toJSON().children[0]).toEqual('nested content')
  })

  test("renders class component content as an element with a 'route' prop", async () => {
    let navigation = Navi.createMemoryNavigation({
      url: '/test/',
      pages: Navi.createSwitch({
        paths: {
          '/test': Navi.createPage({
            title: 'title',
            content:
              class TestClassComponent extends Component<any> {
                  render() {
                      return this.props.route.title
                  }
              },
          }),
        }
      }),
    })

    await navigation.steady()

    let component = ReactTestRenderer.create(
      <NavProvider navigation={navigation}>
        <NavContent />
      </NavProvider>,
    )
    let output = component.toJSON()
    
    expect(output).toEqual('title')
  })

  test("renders function component content as an element with a 'route' prop", async () => {
    let navigation = Navi.createMemoryNavigation({
      url: '/test/',
      pages: Navi.createSwitch({
        paths: {
          '/test': Navi.createPage({
            title: 'title',
            content: ({ route }) => route.title
          }),
        }
      }),
    })

    await navigation.steady()

    let component = ReactTestRenderer.create(
      <NavProvider navigation={navigation}>
        <NavContent />
      </NavProvider>,
    )
    
    expect(component.toJSON()).toEqual('title')
  })

  test("renders element content", async () => {
    let navigation = Navi.createMemoryNavigation({
      url: '/test/',
      pages: Navi.createSwitch({
        paths: {
          '/test': Navi.createPage({
            content: <>test content</>
          }),
        }
      }),
    })

    await navigation.steady()

    let component = ReactTestRenderer.create(
      <NavProvider navigation={navigation}>
        <NavContent />
      </NavProvider>,
    )
    
    expect(component.toJSON()).toEqual('test content')
  })

  test("renders string content", async () => {
    let navigation = Navi.createMemoryNavigation({
      url: '/test/',
      pages: Navi.createSwitch({
        paths: {
          '/test': Navi.createPage({
            content: "test content"
          }),
        }
      }),
    })

    await navigation.steady()

    let component = ReactTestRenderer.create(
      <NavProvider navigation={navigation}>
        <NavContent />
      </NavProvider>,
    )
    
    expect(component.toJSON()).toEqual('test content')
  })
})

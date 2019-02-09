import { route, map } from 'navi'
import React from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { Navigation } from '../src'

describe("Navigation", () => {
  test("can update child context", async () => {
    const createElementWithContext = context =>
      <Navigation 
        context={context}
        fallback={'waiting'}
        routes={
          map({
            '/': route({
              getView: (req, context: any) => context.test
            }),
          })
        }
      />

    let component = ReactTestRenderer.create(
      createElementWithContext({ test: 'hello' })
    )

    expect(component.toJSON()).toEqual('waiting')
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(component.toJSON()).toEqual('hello')

    component.update(
      createElementWithContext({ test: 'updated' })
    )

    await new Promise(resolve => setTimeout(resolve, 10))
    expect(component.toJSON()).toEqual('updated')
  })

  test("does not update equal contexts", async () => {
    let getViewCount = 0

    const createElementWithContext = context =>
      <Navigation 
        context={context}
        fallback={'waiting'}
        routes={
          map({
            '/': route({
              getView: (req, context: any) => {
                getViewCount++
                return context.test
              }
            }),
          })
        }
      />

    let component = ReactTestRenderer.create(
      createElementWithContext({ test: 'hello' })
    )
    await new Promise(resolve => setTimeout(resolve, 10))
    component.update(
      createElementWithContext({ test: 'hello' })
    )
    await new Promise(resolve => setTimeout(resolve, 10))
    expect(getViewCount).toEqual(1)
  })
})

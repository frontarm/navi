import { route, mount } from 'navi'
import React, { Suspense } from 'react'
import ReactTestRenderer from 'react-test-renderer'
import { Router } from '../src'

describe("Navigation", () => {
  test("can update child context", async () => {
    const createElementWithContext = context =>
      <Suspense fallback={'waiting'}>
        <Router 
          context={context}
          routes={
            mount({
              '/': route({
                getView: async (req, context: any) => context.test
              }),
            })
          }
        />
      </Suspense>

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
      <Suspense fallback={'waiting'}>
        <Router 
          context={context}
          routes={
            mount({
              '/': route({
                getView: async (req, context: any) => {
                  getViewCount++
                  return context.test
                }
              }),
            })
          }
        />
      </Suspense>

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

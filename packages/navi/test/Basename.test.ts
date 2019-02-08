import { createMemoryNavigation } from '../src'
import { fixtureMap } from './fixtures/switches'

describe("basename", () => {
  test("works without final /", async () => {
    let nav = createMemoryNavigation({
      url: '/nested/examples',
      basename: '/nested',
      matcher: fixtureMap,
    })

    let route = await nav.getSteadyValue()
    
    expect(route.info.title).toBe('Basic example')
  })

  test("works with final /", async () => {
    let nav = createMemoryNavigation({
      url: '/nested/examples',
      basename: '/nested/',
      matcher: fixtureMap,
    })

    let route = await nav.getSteadyValue()
    
    expect(route.info.title).toBe('Basic example')
  })
})
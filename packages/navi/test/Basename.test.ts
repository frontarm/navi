import { createMemoryNavigation } from '../src'
import { fixtureMap } from './fixtures/switches'

describe("basename", () => {
  test("works without final /", async () => {
    let nav = createMemoryNavigation({
      url: '/nested/examples',
      basename: '/nested',
      routes: fixtureMap,
    })

    let route = await nav.getRoute()
    
    expect(route.title).toBe('Basic example')
  })

  test("works with final /", async () => {
    let nav = createMemoryNavigation({
      url: '/nested/examples',
      basename: '/nested/',
      routes: fixtureMap,
    })

    let route = await nav.getRoute()
    
    expect(route.title).toBe('Basic example')
  })
})
import { createMemoryNavigation } from '../src'
import { fixtureSwitch } from './fixtures/switches'

describe("basename", () => {
  test("works without final /", async () => {
    let nav = createMemoryNavigation({
      url: '/nested/examples',
      basename: '/nested',
      pages: fixtureSwitch,
    })

    let route = await nav.getSteadyValue()
    
    expect(route.title).toBe('Basic example')
  })

  test("works with final /", async () => {
    let nav = createMemoryNavigation({
      url: '/nested/examples',
      basename: '/nested/',
      pages: fixtureSwitch,
    })

    let route = await nav.getSteadyValue()
    
    expect(route.title).toBe('Basic example')
  })
})
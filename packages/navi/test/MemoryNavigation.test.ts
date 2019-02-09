import { createMemoryNavigation, map, route } from '../src'

describe("MemoryNavigation", () => {
  test("can specify method", async () => {
    let nav = createMemoryNavigation({
      routes: map({
        '/test': route(req => ({
          view: req.method === 'POST' ? 'result' : 'form'
        })),
      }),
      request: {
        method: 'POST',
        url: '/test',
      }
    })

    let r = await nav.getSteadyValue()

    expect(r.views[0]).toBe('result')
  })
})
import { createMemoryNavigation, mount, route } from '../src'

describe("MemoryNavigation", () => {
  test("can specify method", async () => {
    let nav = createMemoryNavigation({
      routes: mount({
        '/test': route(req => ({
          view: req.method === 'POST' ? 'result' : 'form'
        })),
      }),
      request: {
        method: 'POST',
        url: '/test',
      }
    })

    let r = await nav.getRoute()

    expect(r.views[0]).toBe('result')
  })
})
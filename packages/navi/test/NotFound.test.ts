import { mount, withView, NotFoundError, createMemoryNavigation } from '../src'

describe("pageMap", () => {
  const routes = mount({
    '/declared/:id': withView(({ params }) => {
      if (params.id !== "1") {
        throw new NotFoundError()
      }
    })
  })

  test("accessing a undeclared path results in a NotFoundError", async () => {
      let navi = createMemoryNavigation({ routes: routes, url: '/undeclared' })
      let route = await navi.getRoute()
      expect(route.error).toBeInstanceOf(NotFoundError)
      expect(route.error.pathname).toBe('/undeclared')
  })

  test("getView can choose not to throw a NotFoundError", async () => {
    let navi = createMemoryNavigation({ routes: routes, url: '/declared/1' })
    let route = await navi.getRoute()
    expect(route.error).toBeFalsy()
  })
   
  test("accessing a declared path that throws NotFoundError results in a NotFoundError", async () => {
    let navi = createMemoryNavigation({ routes: routes, url: '/declared/2' })
    let route = await navi.getRoute()
    expect(route.error).toBeInstanceOf(NotFoundError)
    expect(route.error.pathname).toBe('/declared/2')
  })
})
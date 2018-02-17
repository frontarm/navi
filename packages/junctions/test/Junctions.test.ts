import { createPageTemplate, createJunctionTemplate, StaticNavigation } from '../src'

describe("page under '/test' with 'redirectTo' param", () => {
    function root() {
        let pageTemplate = createPageTemplate({
            title: 'Test',
            params: ['redirectTo'],
            component: null,
        })

        return createJunctionTemplate({
            children: {
                '/test': pageTemplate,
            },
            component: null,
        })
    }

    test("is parsed correctly", async () => {
        let nav = new StaticNavigation({
            rootJunctionTemplate: root(),
            location: {
                pathname: '/test',
                search: '?redirectTo=no',
            },
        })
        let route = await nav.getFinalRoute()
        
        expect(route[0].type).toBe('junction')
        expect(route[0].activePattern).toBe('/test')
        expect(route[1].type).toBe('page')
        expect((route[1] as any).title).toBe('Test')
        expect(route[1].params).toEqual({ redirectTo: 'no' })
    })
})
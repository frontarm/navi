import { 
    createPage,
    createJunction,
    createRedirect,

    PageRoute,
    JunctionRoute,
} from '../src'


let Landing = createPage({
    title: "React Armory",

    getContent() {
        return () => React.createElement("div", {}, "hello")
    }
})
let Latest = createPage({
    title: "Latest",

    getContent() {
        return () => React.createElement("div", {}, "latest")
    }
})



let Article1 = createPage({
    title: "Article 1",
})
let Article2 = createPage({
    title: "Article 2",
})


class ArticlesComponent extends React.Component {
    render() {
        let { route } = this.props

        return (
            route.nextRoute
                ? React.createElement('div', {}, route.nextRoute.content)
                : null
        )
    }
}
let ArticlesJunction = createJunction({
    paths: {
        '/1': () => Promise.resolve(Article1),
        '/2': () => Promise.resolve(Article2),
    },
    
    meta: {
        bob: 'your uncle'
    },

    getContent() {
        return ArticlesComponent
    }
})


class AppComponent extends React.Component {
    render() {
        let { route } = this.props

        return (
            (route.nextRoute && route.nextRoute.content)
                ? React.createElement(route.nextRoute.content, {
                    route: route.nextRoute
                  })
                : React.createElement('div', {}, route.nextRoute.contentStatus)
        )
    }
}
let AppJunction = createJunction({
    paths: {
        '/': Landing,
        '/latest': Latest,
        '/articles': () => Promise.resolve(ArticlesJunction),
    },
})

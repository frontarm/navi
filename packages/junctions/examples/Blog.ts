import React from 'react'
import { 
    PageRoute,
    JunctionRoute,

    Page,

    createPage,
    createJunction,
    createRedirect
} from '../src/index'


function ArticleComponent(props: { route: PageRoute<typeof Landing> }) {
    let { route } = props
    props.route.status === "ready" && props.route.component
    return null
}


let Landing = createPage({
    title: "React Armory",
    component: ArticleComponent,
})
let Latest = createPage({
    title: "Latest",
    component: ArticleComponent,
})



let Article1 = createPage({
    title: "Article 1",
    component: ArticleComponent,
})
let Article2 = createPage({
    title: "Article 2",
    component: ArticleComponent,
})



let ArticlesJunction = createJunction(({ split }) => ({
    children: {
        '/1': split(() => Promise.resolve(Article1)),
        '/2': split(() => Promise.resolve(Article2)),
    },
    
    payload: {
        bob: 'your uncle'
    },

    component: class ArticlesComponent {
        props: {
            env: any,
            route: JunctionRoute<typeof ArticlesJunction>,
        }
    
        render() {
            let { env, route } = this.props
            
            return (
                route.child.status === "ready"
                    ? React.createElement(route.child.component, { env, route: route.child })
                    : null
            )
        }
    }
}))


let AppJunction = createJunction(({ split }) => ({
    children: {
        '/': Landing,
        '/latest': Latest,
        '/articles': split(() => Promise.resolve(ArticlesJunction)),
    },

    component: class AppComponent {
        props: {
            env: any,
            route: JunctionRoute<typeof AppJunction>,
        }
    
        render() {
            let { env, route } = this.props

            return (
                route.child.status === "ready"
                    ? React.createElement(route.child.component, { env, route: route.child })
                    : null
            )
        }
    },
}))

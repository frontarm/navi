import React from 'react'
import { 
    Page,
    Junction,

    definePage,
    defineJunction,
    defineRedirect
} from '../src/index'


function ArticleComponent(props: { page: Page<typeof Landing> }) {
    let { page } = props
    props.page.status === "ready" && props.page.component
    return null
}


let Landing = definePage({
    title: "React Armory",
    component: ArticleComponent,
})
let Latest = definePage({
    title: "Latest",
    component: ArticleComponent,
})



let Article1 = definePage({
    title: "Article 1",
    component: ArticleComponent,
})
let Article2 = definePage({
    title: "Article 2",
    component: ArticleComponent,
})



let ArticlesJunction = defineJunction(({ split }) => ({
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
            junction: Junction<typeof ArticlesJunction>,
        }
    
        render() {
            let { env, junction } = this.props
            
            return (
                junction.activeChild.status === "ready"
                    ? React.createElement(junction.activeChild.component, { env, page: junction.activeChild })
                    : null
            )
        }
    }
}))


let AppJunction = defineJunction(({ split }) => ({
    children: {
        '/': Landing,
        '/latest': Latest,
        '/articles': split(() => Promise.resolve(ArticlesJunction)),
    },

    component: class AppComponent {
        props: {
            env: any,
            junction: Junction<typeof AppJunction>,
        }
    
        render() {
            let { env, junction } = this.props

            // junction.activeChild.status === "ready" && junction.activeChild.type === "page" && junction.activeChild.component

            return (
                junction.activeChild.status === "ready"
                    ? React.createElement(junction.activeChild.component, {
                        env,
                        [junction.activeChild.type]: junction.activeChild
                      })
                    : null
            )
        }
    },
}))

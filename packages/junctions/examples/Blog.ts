import * as React from 'react'
import { 
    createPageTemplate,
    createJunctionTemplate,
    createRedirectTemplate,

    Page,
    Junction,
} from '../src/index'


function ArticleComponent(props: { page: Page<typeof Landing> }) {
    let { page } = props
    return null
}


let Landing = createPageTemplate({
    title: "React Armory",
    component: ArticleComponent,
})
let Latest = createPageTemplate({
    title: "Latest",
    component: ArticleComponent,
})



let Article1 = createPageTemplate({
    title: "Article 1",
    component: ArticleComponent,
})
let Article2 = createPageTemplate({
    title: "Article 2",
    component: ArticleComponent,
})



let ArticlesJunction = createJunctionTemplate(({ split }) => ({
    children: {
        '/1': split(() => Promise.resolve(Article1)),
        '/2': split(() => Promise.resolve(Article2)),
    },
    
    payload: {
        bob: 'your uncle'
    },

    component: class ArticlesComponent extends React.Component<{ env, junction: Junction<typeof ArticlesJunction>, }, any> {
        render() {
            let { env, junction } = this.props

            return (
                junction.activeChild
                    ? React.createElement(junction.activeChild.component, { env, page: junction.activeChild })
                    : null
            )
        }
    }
}))


let AppJunction = createJunctionTemplate(({ split }) => ({
    children: {
        '/': Landing,
        '/latest': Latest,
        '/articles': split(() => Promise.resolve(ArticlesJunction)),
    },

    component: class AppComponent extends React.Component<{ env, junction: Junction<typeof AppJunction> }> {
        render() {
            let { env, junction } = this.props

            return (
                junction.activeChild
                    ? React.createElement(junction.activeChild.component, {
                        env,
                        [junction.activeChild.type]: junction.activeChild
                      })
                    : React.createElement('div', {}, junction.status)
            )
        }
    },
}))

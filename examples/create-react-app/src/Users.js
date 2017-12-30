import React, { Component } from 'react'
import { createJunction, createPage } from 'junctions'
import './Users.css'

class Users extends Component {
    render() {
        let route = this.props.route

        return (
            <div className="Users">
                <div className="Users-content">
                    {
                        route.child.component &&
                        React.createElement(route.child.component, { route: route.child })
                    }
                </div>
            </div>
        );
    }
}


class NewUser extends Component {
    render() {
        return <div><h2>New User</h2></div>
    }
}


class UserDetails extends Component {
    render() {
        return <div><h2>User #{this.props.route.params.id}</h2></div>
    }
}

export default createJunction(({ split }) => ({
    component: Users,

    children: {
        '/': createPage({
            title: 'Users',
            component: ContentRenderer,
            getContent: () => import('./UserList').then(m => m.default),
        }),

        '/new': createPage({
            title: 'New user',
            component: NewUser,
        }),

        '/:id': split(() => Promise.resolve(createPage({
            title: 'User details',
            params: ['id'],
            component: ContentRenderer,
            getContent: () => Promise.resolve(UserDetails),
        }))),
    },
}))


function ContentRenderer({ route }) {
    return route.content
        ? React.createElement(route.content, { route })
        : null
}
import React, { Component } from 'react'
import './Users.css'

class Users extends Component {
    render() {
        let nav = this.props.nav

        return (
            <div className="Users">
                <div className="Users-content">
                    {   nav.child
                        ? (nav.child.content && React.createElement(nav.child.content, { nav: nav.child }))
                        : (nav.content && React.createElement(nav.content, { nav: nav.child }))
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
        return <div><h2>User #{this.props.nav.params.id}</h2></div>
    }
}

export default {
    meta: {
        pageTitle: 'Users',
        wrapper: Users,
    },

    getContent: () => import('./UserList').then(m => m.default),

    children: {
        '/new': {
            meta: {
                pageTitle: 'New user',
            },

            getContent: () => NewUser,
        },

        '/:id': Promise.resolve({
            meta: {
                pageTitle: 'User details',
            },

            params: ['id'],

            getContent: () => Promise.resolve(UserDetails),
        }),
    },
}
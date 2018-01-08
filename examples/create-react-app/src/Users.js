import React, { Component } from 'react'
import { createJunctionTemplate, createPageTemplate } from 'junctions'
import './Users.css'

class Users extends Component {
    render() {
        let segment = this.props.segment

        return (
            <div className="Users">
                <div className="Users-content">
                    {
                        segment.activeChild.component &&
                        React.createElement(segment.activeChild.component, { segment: segment.activeChild })
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
        return <div><h2>User #{this.props.segment.params.id}</h2></div>
    }
}

export default createJunctionTemplate(({ split }) => ({
    component: Users,

    children: {
        '/': createPageTemplate({
            title: 'Users',
            component: ContentRenderer,
            getContent: () => import('./UserList').then(m => m.default),
        }),

        '/new': createPageTemplate({
            title: 'New user',
            component: NewUser,
        }),

        '/:id': split(() => Promise.resolve(createPageTemplate({
            title: 'User details',
            params: ['id'],
            component: ContentRenderer,
            getContent: () => Promise.resolve(UserDetails),
        }))),
    },
}))


function ContentRenderer({ segment }) {
    return segment.content
        ? React.createElement(segment.content, { segment })
        : null
}
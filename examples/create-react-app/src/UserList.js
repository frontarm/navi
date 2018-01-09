import React, { Component } from 'react'
import { Link } from 'react-junctions'


export default class UserList extends Component {
    render() {
        return (
            <div className="Users-nav">
                <h1>Select a user</h1>
                <ul>
                    <li><Link href="/users/1">User 1</Link></li>
                    <li><Link href="/users/2">User 2</Link></li>
                    <li><Link href="/users/new">New User</Link></li>
                </ul>
            </div>
        )
    }
}
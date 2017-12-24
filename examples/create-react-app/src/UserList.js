import React, { Component } from 'react'


export default class UserList extends Component {
    render() {
        return (
            <div className="Users-nav">
                <h1>Select a user</h1>
                <ul>
                    <li><a href="/users/1">User 1</a></li>
                    <li><a href="/users/2">User 2</a></li>
                </ul>
            </div>
        )
    }
}
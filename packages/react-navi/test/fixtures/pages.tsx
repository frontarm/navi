import React, { Component } from 'react'
import { createPage, createSwitch } from 'navi'
import { NavContent } from '../../src'

class TestClassComponent extends Component<any> {
    render() {
        return this.props.route.title
    }
}

function TestFunctionComponent({ title }) {
    return title
}

export default createSwitch({
    content: function Wrapper({ children }) {
        // Tests nested content
        return <NavContent />
    },

    paths: {
        '/class-component': () => createPage({
            title: 'class component title',
            content: TestClassComponent,
        }),

        '/function-component': () => createPage({
            title: 'function component title',
            content: TestFunctionComponent,
        }),

        '/element': () => createPage({
            title: 'element title',
            content: <TestFunctionComponent title='title prop' />,
        }),

        '/string': () => createPage({
            title: 'string title',
            content: 'string',
        }),
    }
})
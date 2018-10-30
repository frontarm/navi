import * as React from 'react'
import { TableOfContents, createScrollSpy, Item, ScrollSpy as IScrollSpy } from './headlessScrollSpy'

export interface ScrollSpyProps {
  children: (item: Partial<Item>) => React.ReactNode
  container?: any
  tableOfContents: TableOfContents
  offset?: number
}

export class ScrollSpy extends React.Component<ScrollSpyProps, Partial<Item>> {
  spy?: IScrollSpy

  constructor(props: ScrollSpyProps) {
    super(props)
    this.state = {
      parentIds: [],
    }
  }

  componentDidMount() {
    let { children, ...props } = this.props

    if (props.tableOfContents) {
      this.spy = createScrollSpy({
        ...props,
        callback: this.handleUpdate,
      })
    }
  }

  componentDidUpdate(prevProps: ScrollSpyProps) {
    if (
      this.props.container !== prevProps.container ||
      this.props.tableOfContents !== prevProps.tableOfContents ||
      this.props.offset !== prevProps.offset) {
      let { children, ...props } = this.props
      if (this.spy) {
        this.spy.dispose()
      }
      if (props.tableOfContents) {
        this.spy = createScrollSpy({
          ...props,
          callback: this.handleUpdate,
        })
      }
    }
    else if (this.spy) {
      this.spy.refresh()
    }
  }

  componentWillUnmount() {
    if (this.spy) {
      this.spy.dispose()
      delete this.spy
    }
  }

  handleUpdate = (item: Item) => {
    this.setState(item || {
      id: null,
      parentIds: [],
      heading: null,
    })
  }

  render() {
    return this.props.children(this.state)
  }
}
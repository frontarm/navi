import React from 'react'
import { DocumentContext } from '../DocumentContext'

export interface HideWhenStaticProps {
  children: React.ReactNode
}

export class HideWhenStatic extends React.Component<HideWhenStaticProps> {
  static contextType = DocumentContext

  render() {
    return this.context.isStatic ? null : this.props.children
  }
}
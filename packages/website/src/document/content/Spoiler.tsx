import React from 'react'
import { DocumentContext } from '../DocumentContext'

export interface SpoilerProps extends React.HTMLAttributes<any> {
  children: React.ReactNode
  title?: string
}

export class Spoiler extends React.Component<SpoilerProps> {
  static contextType = DocumentContext

  render() {
    return <this.context.components.Spoiler title='Spoiler' {...this.props} />
  }
}


import React from 'react'
import { DocumentContext } from '../DocumentContext'

export interface DetailsProps extends React.HTMLAttributes<any> {
  children: React.ReactNode
  title?: string
  TitleComponent?: string | React.ComponentType
}

export class Details extends React.Component<DetailsProps> {
  static contextType = DocumentContext

  render() {
    return <this.context.components.Details title="Details" TitleComponent="h4" {...this.props} />
  }
}
import React from 'react'
import MarkdownView from '../views/MarkdownView'

export default function MarkdownWrapper({ page, navigateToPage }) {
  console.log(page.content)

  return (
    <MarkdownView
      key={page.id}
      html={page.content}
      onClickLink={(url) => {
        navigateToPage(
          url[0] == '/'
            ? url
            : [url].concat(page.id.split('/').reverse().slice(1)).reverse().join('/')
        )
      }}
    />
  )
}

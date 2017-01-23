import React from 'react'
import { PageContentLoader } from 'sitepack'
import MarkdownView from '../views/MarkdownView'


export default function MarkdownWrapper({ page, navigateToPage }) {
  return (
    <PageContentLoader
      page={page}
      render={
        <MarkdownView
          onClickLink={(url) =>
            navigateToPage(
              url[0] == '/'
                ? url
                : [url].concat(page.id.split('/').reverse().slice(1)).reverse().join('/')
            )
          }
        />
      }
    />
  )
}

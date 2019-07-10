import React from 'react'
import { renderViewHead } from '../src'

describe('renderViewHead', () => {
  test('returns an element', () => {
    let element = renderViewHead([
      {
        type: 'view',
      },
      {
        type: 'title',
        title: 'testtitle',
      },
      {
        type: 'data',
      },
      {
        type: 'head',
        head: (
          <>
            <meta name="description" content="testdesc" />
            <meta name="theme-color" content="#ffffff" />
          </>
        ),
      },
    ] as any)

    expect(React.isValidElement(element)).toBeTruthy()
  })
})

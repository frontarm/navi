import * as React from 'react'
import * as Nav from 'react-navi'

export default function Tag(props) {
  return (
    <div>
      <h1>{props.name} Tag</h1>
      <ul>
        {props.pages.map(page =>
          <li key={page.href}>
            <Nav.Link href={page.href}>{page.title}</Nav.Link>
          </li>  
        )}
      </ul>
    </div>
  )
}
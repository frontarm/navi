import * as React from 'react'
import * as Nav from 'react-navi'

export default function TagIndex(props) {
  return (
    <div>
      <h1>Tags</h1>
      <ul>
        {props.tags.map(tag =>
          <li key={tag.href}>
            <Nav.Link href={tag.href}>{tag.name}</Nav.Link>
          </li>  
        )}
      </ul>
    </div>
  )
}
import * as React from 'react'
import * as Nav from 'react-navi'

export default function BlogIndex(props) {
  return (
    <div>
      <h1>Navi Blog</h1>
      <ul>
        {props.posts.map(post =>
          <li key={post.href}>
            <Nav.Link href={post.href}>{post.route.title}</Nav.Link>
          </li>  
        )}
      </ul>
      <footer>
        <p>Page {props.pageNumber} / {props.pageCount}</p>
        {
          props.pageCount > 1 &&
          <p>
            {
              props.pageNumber !== 1 &&
              <Nav.Link href={props.getPageHref(props.pageNumber - 1)}>&laquo; Previous </Nav.Link>
            }
            {
              props.pageNumber < props.pageCount &&
              <Nav.Link href={props.getPageHref(props.pageNumber + 1)}> Next &raquo;</Nav.Link>
            }
          </p>
        }
      </footer>
    </div>
  )
}
import * as React from 'react'
import * as Navi from 'navi'
import { NavLink } from 'react-navi'

function BlogIndex(props) {
  return (
    <div>
      <h1>Navi Blog</h1>
      <ul>
        {props.posts.map(post =>
          <li key={post.href}>
            <NavLink href={post.href}>{post.route.title}</NavLink>
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
              <NavLink href={props.getPageHref(props.pageNumber - 1)}>&laquo; Previous </NavLink>
            }
            {
              props.pageNumber < props.pageCount &&
              <NavLink href={props.getPageHref(props.pageNumber + 1)}> Next &raquo;</NavLink>
            }
          </p>
        }
      </footer>
    </div>
  )
}

export const createBlogIndexPage = ({
  getPageHref,
  pageCount,
  pageNumber,
  pagePosts,
}) =>
  Navi.createPage({
    title: 'My Blog',
    getContent: () =>
      <BlogIndex
        getPageHref={getPageHref}
        pageNumber={pageNumber}
        pageCount={pageCount}
        posts={pagePosts}
      />,
  })
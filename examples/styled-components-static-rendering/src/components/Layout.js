import React from 'react';
import { Link } from 'react-navi';
import styled from 'styled-components/macro';
import LoadingIndicator from './LoadingIndicator';

const activeClassName = 'layout-link-active'

const NavLink = styled(Link).attrs({
    activeClassName
})`
  display: inline-block;
  color: ${({ theme }) => theme.lightTextColor};
  font-weight: bold;
  font-size: 18px;
  line-height: 32px;
  margin-right: 2rem;
  text-decoration: none;
  transition: color 150ms ease-out;

  &.${activeClassName} {
    color: ${({ theme }) => theme.primaryColor};
  }
`;

const Header = styled.nav`
  border-bottom: 1px solid ${({ theme }) => theme.borderColor};
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  z-index: 10;
  padding: 1rem 1.5rem;
`

const Main = styled.main`
  margin: 1.5rem;
  margin-top: calc(1.5rem + 64px);
`

function Layout({ children, isLoading }) {
  return (
    <>
      <LoadingIndicator active={isLoading} />
      <Header>
        <NavLink href='/' exact>
          Home
        </NavLink>
        <NavLink href='/about/'>
          About
        </NavLink>
        <NavLink href='/404/'>
          404
        </NavLink>
      </Header>
      <Main>
        {children}
      </Main>
    </>
  )
}

export default Layout
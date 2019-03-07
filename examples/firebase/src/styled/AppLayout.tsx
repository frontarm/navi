import React from 'react'
import firebase from 'firebase/app'
import styled from 'styled-components/macro'
import AppHeader from './AppHeader'
import LoadingIndicator from './LoadingIndicator'

const Main = styled.main`
  margin: 1.5rem;
  margin-top: calc(1.5rem + 64px);
`

interface LayoutProps {
  children: React.ReactNode
  isLoading?: boolean
  user?: firebase.User | null
}

function Layout({ children, isLoading, user }: LayoutProps) {
  return (
    <>
      <LoadingIndicator active={isLoading} />
      <AppHeader user={user} />
      <Main>
        {children}
      </Main>
    </>
  )
}

export default Layout
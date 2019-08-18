import React from 'react'
import { Link, useCurrentRoute } from 'react-navi'
import firebase from 'firebase/app'
import { css } from 'styled-components/macro'
import AuthLink, { AuthLinkProps } from '../controls/AuthLink'
import Gravatar from '../controls/Gravatar'
import Responds from '../controls/Responds'
import { colors, durations, timingFunctions, media, fontSizes, boxShadows, radius } from '../utils/theme'

interface AppHeaderProps {
  user?: firebase.User | null
}

const height = 3
const verticalPadding = 1/2
const contentHeight = height - verticalPadding*2

const NavLink = (props: Link.Props) =>
  <Link
    {...props}
    activeStyle={{
      color: colors.primary,
    }}
    css={css`
      display: inline-block;
      color: ${colors.gray};
      font-weight: bold;
      line-height: 2rem;
      margin-right: 2rem;
      text-decoration: none;
      transition: color ${durations.short} ${timingFunctions.easeOut};
    `}
  />

const StyledAuthLink = (props: AuthLinkProps) => {
  let { url } = useCurrentRoute()
  let isViewingLogin = url.pathname.startsWith('/login')
  let href = isViewingLogin ? '/register' : '/login'
  let color = isViewingLogin ? colors.green : colors.lightGray
  return (
    <AuthLink
      {...props}
      href={href}
      css={css`
        border: 1px solid ${color};
        border-radius: ${contentHeight/2}rem;
        color: ${color};
        display: inline-block;
        font-size: ${fontSizes.bodySmall1};
        font-weight: bold;
        line-height: calc(${contentHeight}rem - 2px);
        text-decoration: none;
        height: ${height - verticalPadding*2}rem;
        padding: 0 1rem;
      `}>
      {isViewingLogin ? 'Sign Up' : 'Login'} 
    </AuthLink>
  )
}

const Identity = React.forwardRef(({ user, tabIndex }: { user: firebase.User, tabIndex?: number }, ref: React.Ref<any>) => {
  let { email, photoURL } = user

  return (
    <div ref={ref} tabIndex={0} css={css`
      cursor: pointer;
      color: ${colors.lightGray};

      :hover {
        color: ${colors.lighterGray};
      }
    `}>
      {photoURL && <img src={photoURL} alt={`Identity`}/>}
      <Gravatar
        email={email!}
        size={32}
        alt={`Avatar for ${email}`} 
        css={css`
          border-radius: 9999px;
          margin-right: 1rem;
          vertical-align: middle;
        `}
      />
      {email}
    </div>
  )
})

const IdentityMenu = React.forwardRef(({ visible }: { visible: boolean }, ref: React.Ref<any>) => {
  return (
    <div
      ref={ref}
      css={css`
        background-color: ${colors.lightBlack};
        border-bottom-left-radius: ${radius};
        border-bottom-right-radius: ${radius};
        box-shadow: ${boxShadows[1]};
        display: ${visible ? 'block' : 'none'};
        line-height: ${height}rem;
        top: 0.5rem;
        position: relative;

        > a {
          color: ${colors.lightGray};
          display: block;
          text-decoration: none;
          padding: 0 1rem;
        }
      `}>
      <Link href="/account-details">Account Details</Link>
      <Link href="/account-details">Order History</Link>
      <Link href="/logout">Logout</Link>
    </div>
  )
})

function UserControls({ user }: { user?: firebase.User | null }) {
  if (user === undefined) {
    // Wait until we know what the user's state is before showing anything
    return null
  }
  
  return (
    <Responds>
      <div css={css`
        position: relative;
      `}>
        {user ? (
          <Responds.To focus>
            <Identity user={user} />
          </Responds.To>
        ) : (
          <StyledAuthLink />
        )}
        <Responds.With>
          {({ active }) => <IdentityMenu visible={active} />}
        </Responds.With>
      </div>
    </Responds>
  )
}



function AppHeader({ user }: AppHeaderProps) {
  return (
    <header css={css`
      background-color: ${colors.black};
      box-shadow: ${boxShadows[1]};
      display: flex;
      height: ${height}rem;
      justify-content: space-between;
      padding: ${verticalPadding}rem 1rem;
      position: relative;

      ${media.mediumPlus`
        padding-left: 2rem;
        padding-right: 2rem;
      `}
    `}>
      <nav>
        <img
          src={require('../media/logo.svg')}
          alt="Frontend Armory Logo"
          css={css`
            margin: 0;
            margin-right: 2rem;
            height: ${contentHeight}rem;
            width: ${contentHeight}rem;
            float: left;
            vertical-align: middle;
          `}
        />
        <NavLink href="/categories/apparel">
          Apparel
        </NavLink>
        <NavLink href="/categories/accessories">
          Accessories
        </NavLink>
      </nav>
      <UserControls user={user} />
    </header>
  )
}

export default AppHeader

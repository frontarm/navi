import { map, redirect } from 'navi'
import { RoutingContext } from '../types/RoutingContext'

const logoutRoute = map<RoutingContext>(async ({ context }) => {
  await context.firebase.auth.signOut()
  return redirect('/login')
})

export default logoutRoute
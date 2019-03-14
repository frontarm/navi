import { map, redirect } from 'navi'
import { RoutingContext } from '../types/RoutingContext'

const logoutRoute = map(async (request, context: RoutingContext) => {
  await request.serializeEffectToHistory(() => context.firebase.auth.signOut())
  return redirect('/login')
})

export default logoutRoute
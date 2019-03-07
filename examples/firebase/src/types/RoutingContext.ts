import firebase from 'firebase/app'
import Firebase from '../Firebase'

export interface RoutingContext {
  currentUser:
    | firebase.User
    | null // anonymous
    | undefined // app has just loaded, and we don't know the auth state,
  firebase: Firebase
}
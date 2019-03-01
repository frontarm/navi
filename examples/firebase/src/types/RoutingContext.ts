import firebase from 'firebase/app'
import Firebase from '../Firebase'

export interface RoutingContext {
  currentUser: firebase.User | null,
  firebase: Firebase
}
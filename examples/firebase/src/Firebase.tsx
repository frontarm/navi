import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/functions";
import config from "./config";

class Firebase {
  auth: firebase.auth.Auth
  db: firebase.database.Database

  constructor() {
    let app = firebase.apps.length !== 0 ? firebase.app() : firebase.initializeApp(config.firebase);

    this.auth = app.auth();
    this.db = app.database();
  }
}

export default Firebase
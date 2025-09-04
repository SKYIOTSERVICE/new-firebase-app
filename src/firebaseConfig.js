// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAoWpeTjm86FKu3f9h0yXvhbFuEJst0IlQ",
  authDomain: "sky2-9d324.firebaseapp.com",
  databaseURL: "https://sky2-9d324-default-rtdb.firebaseio.com",
  projectId: "sky2-9d324",
  storageBucket: "sky2-9d324.appspot.com",
  messagingSenderId: "647142405341",
  appId: "1:647142405341:web:7543badeccfcd7e482d734"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export { database, auth };

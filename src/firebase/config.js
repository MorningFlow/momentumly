// Firebase configuration — Momentumly project
// Project: momentumly-1 | App: Momentumly

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey:            "AIzaSyD7q0tXIz1ieTzd4Wunpf0s6m-HAS0lnnA",
  authDomain:        "momentumly-1.firebaseapp.com",
  projectId:         "momentumly-1",
  storageBucket:     "momentumly-1.firebasestorage.app",
  messagingSenderId: "133846983080",
  appId:             "1:133846983080:web:97a858dacf0bf5be11bd9d",
  measurementId:     "G-CCKXCN5FQB",
}

const app  = initializeApp(firebaseConfig)
export const db          = getFirestore(app)
export const auth        = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export default app

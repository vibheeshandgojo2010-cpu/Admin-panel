// firebase-config.js - USE YOUR CREDENTIALS
const firebaseConfig = {
  apiKey: "AIzaSyA7UunDAzOUWBVjNchrQUNy-gANVy7EtFk",
  authDomain: "customlabs-2638c.firebaseapp.com",
  projectId: "customlabs-2638c",
  storageBucket: "customlabs-2638c.firebasestorage.app",
  messagingSenderId: "224153222671",
  appId: "1:224153222671:web:e30bf6bfd338d29bfd2d7a",
  measurementId: "G-04K4E8G67F"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

console.log('✅ Firebase configured');
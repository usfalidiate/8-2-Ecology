// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC04QzoczMLF4p3qa1WjrcnKzke-pI5SRU",
  authDomain: "gamedlessons.firebaseapp.com",
  projectId: "gamedlessons",
  storageBucket: "gamedlessons.firebasestorage.app",
  messagingSenderId: "346571176421",
  appId: "1:346571176421:web:7d5a0e2bffb096fa40970c"
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };

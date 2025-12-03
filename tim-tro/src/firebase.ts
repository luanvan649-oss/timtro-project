import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics"; // Analytics is optional

const firebaseConfig = {
    apiKey: "AIzaSyA7EphLsA7T54X3e2H3CrYfUOuAxQngz54",
    authDomain: "tim-1cc29.firebaseapp.com",
    projectId: "tim-1cc29",
    storageBucket: "tim-1cc29.firebasestorage.app",
    messagingSenderId: "836930677210",
    appId: "1:836930677210:web:eaea16b635627ca91678e3",
    measurementId: "G-PHQ71E3RWX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // Initialize analytics if needed

// Initialize Firebase Auth
const auth = getAuth(app);

// Initialize Auth Providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { auth, googleProvider, facebookProvider };

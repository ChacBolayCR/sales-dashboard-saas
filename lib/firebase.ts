/*// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD1j5QzZRZu_MFGgkQnCZNvxXrgOlzZEKE",
  authDomain: "sales-analytics-feedback.firebaseapp.com",
  projectId: "sales-analytics-feedback",
  storageBucket: "sales-analytics-feedback.firebasestorage.app",
  messagingSenderId: "849701599606",
  appId: "1:849701599606:web:6c85c8ec1a109f2ea72257",
  measurementId: "G-31E6WFQBRM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);*/

import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyD1j5QzZRZu_MFGgkQnCZNvxXrgOlzZEKE",
  authDomain: "sales-analytics-feedback.firebaseapp.com",
  projectId: "sales-analytics-feedback",
  storageBucket: "sales-analytics-feedback.firebasestorage.app",
  messagingSenderId: "849701599606",
  appId: "1:849701599606:web:6c85c8ec1a109f2ea72257",
  measurementId: "G-31E6WFQBRM"
};

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)

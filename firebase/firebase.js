// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import {getFirestore} from 'firebase/firestore'
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAxVFBExEpudwV98ACiXe0z5gCkok4zsyA",
  authDomain: "bestudious-ec937.firebaseapp.com",
  projectId: "bestudious-ec937",
  storageBucket: "bestudious-ec937.appspot.com",
  messagingSenderId: "23694101993",
  appId: "1:23694101993:web:ee19182ca659a580b78f78",
  measurementId: "G-322HTFC4GQ"
};

// Initialize Firebase
const FIREBASE_APP = initializeApp(firebaseConfig);

export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage) // for expo, user doesn't get logged out when you close the app
});
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
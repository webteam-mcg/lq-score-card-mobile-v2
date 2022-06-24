import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB_fCrqzAGkDkAYDtdtERw_IMwoCgmkrJQ",
    authDomain: "lqlk-5370b.firebaseapp.com",
    databaseURL: "https://lqlk-5370b.firebaseio.com",
    projectId: "lqlk-5370b",
    storageBucket: "lqlk-5370b.appspot.com",
    messagingSenderId: "612878491224",
    appId: "1:612878491224:web:be9732520ddf14b97c742d",
    measurementId: "G-0QQYMZPR82"
  };

const app = initializeApp(firebaseConfig);

export default getFirestore(app);
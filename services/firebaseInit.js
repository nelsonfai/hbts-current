
import { initializeApp } from 'firebase/app';
const firebaseConfig = {
    apiKey: 'AIzaSyC4B0EqMTynQoPwenKkE95xsJxjqIH2_-Y',
    projectId: 'habtsus-1087b',
    authDomain: 'habtsus-1087b.firebaseapp.com',
    storageBucket: 'habtsus-1087b.appspot.com',
    messagingSenderId: '652492783706',
    appId: '1:652492783706:android:9b484e0857388e252d5863',
  };
const app = initializeApp(firebaseConfig);
console.log('Firebase initialized',app)
export default app;

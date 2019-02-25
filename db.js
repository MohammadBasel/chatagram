import firebase from "firebase";
import "firebase/firestore"
//My Config
const config = {
  apiKey: "AIzaSyDIEn9EDZRBfpVzHukDUcmEolebqVnmSLU",
  authDomain: "cp3700-f238e.firebaseapp.com",
  databaseURL: "https://cp3700-f238e.firebaseio.com",
  projectId: "cp3700-f238e",
  storageBucket: "cp3700-f238e.appspot.com",
  messagingSenderId: "747924501575"
};
//Mr. Doug Config
// const config = {
//   apiKey: "AIzaSyC7kIJ7T1sLRWYT8yhirrLOuEw-5MSEVg4",
//   authDomain: "cp3700-f5264.firebaseapp.com",
//   databaseURL: "https://cp3700-f5264.firebaseio.com",
//   projectId: "cp3700-f5264",
//   storageBucket: "cp3700-f5264.appspot.com",
//   messagingSenderId: "143283342395"
//   };
firebase.initializeApp(config);
const settings = {timestampsInSnapshots: true};
const db = firebase.firestore();
db.settings(settings);
export default db;
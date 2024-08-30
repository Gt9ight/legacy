
import { initializeApp } from 'firebase/app';
import {getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword} from 'firebase/auth'
import {getStorage} from 'firebase/storage'
import { getFirestore, doc, getDoc, setDoc, collection, writeBatch, query, getDocs} from 'firebase/firestore'


const firebaseConfig = {
    apiKey: "AIzaSyDUwSQ8RlDzcwPY5Eq2wdmpLKRHqSw9NHw",
    authDomain: "plm-fleet.firebaseapp.com",
    projectId: "plm-fleet",
    storageBucket: "plm-fleet.appspot.com",
    messagingSenderId: "581262701095",
    appId: "1:581262701095:web:9cebef65a6c3d3f6f45402"
  };
  

  const app = initializeApp(firebaseConfig);
  export const db = getFirestore();
  export const storage = getStorage()







  export const createFleetDatabase = async (collectionKey, objectsToAdd) => {
    try {
      const TaskCollectionRef = collection(db, collectionKey);
      const batch = writeBatch(db);
  
      objectsToAdd.forEach((object) => {
        const newDocRef = doc(TaskCollectionRef); 
        batch.set(newDocRef, object);
      });
  
      await batch.commit();
      console.log('Documents added successfully!');
    } catch (error) {
      console.error('Error adding documents: ', error);
    }       
  };


  const provider = new GoogleAuthProvider();
  
  provider.setCustomParameters({
    prompt: 'select_account'
  });

  export const auth = getAuth()
  export const signInWithGooglePopup = () => signInWithPopup(auth, provider);


  export const createUserDocumentFromAuthForTechs = async ( userAuth, additionalInformation = {}) => {
    if(!userAuth) return;
    const userDocRef = doc(db, 'Techusers', userAuth.uid);

    console.log(userDocRef)

    const userSnapshot = await getDoc(userDocRef);
    console.log(userSnapshot)

    if(!userSnapshot.exists()) {
      const {displayName, email} = userAuth;
      
      const createdAt = new Date();
      try{
        await setDoc(userDocRef, {
          displayName,
          email,
          createdAt,
          ...additionalInformation
        });

      }catch(error){
        console.log('error creating user', error.message)
    }}
    return userDocRef
  }

 
  export const createUserDocumentFromAuthForCustomers = async (userAuth, additionalInformation = {}) => {
    if(!userAuth) return;
    const CustomeruserDocRef = doc(db, 'FleetManagerusers', userAuth.uid);

    console.log(CustomeruserDocRef)

    const userSnapshot = await getDoc(CustomeruserDocRef);
    console.log(userSnapshot)

    if(!userSnapshot.exists()) {
      const {displayName, email} = userAuth;
      const createdAt = new Date();
      try{
        await setDoc(CustomeruserDocRef, {
          displayName,
          email,
          createdAt,
          ...additionalInformation
        });

      }catch(error){
        console.log('error creating user', error.message)
    }}
    return CustomeruserDocRef
  }


  export const createUserDocumentFromAuthForFleetManagers = async (userAuth, additionalInformation = {}) => {
    if(!userAuth) return;
    const ManageruserDocRef = doc(db, 'FleetManagerusers', userAuth.uid);

    console.log(ManageruserDocRef)

    const userSnapshot = await getDoc(ManageruserDocRef);
    console.log(userSnapshot)

    if(!userSnapshot.exists()) {
      const {displayName, email} = userAuth;
      const createdAt = new Date();
      try{
        await setDoc(ManageruserDocRef, {
          displayName,
          email,
          createdAt,
          ...additionalInformation
        });

      }catch(error){
        console.log('error creating user', error.message)
    }}
    return ManageruserDocRef
  }


  export const createAuthUserWithEmailAndPassword = async (email, password) => {
    if(!email || !password) return;

   return await createUserWithEmailAndPassword(auth, email, password)
  }

  export const signInAuthUserWithEmailAndPassword = async (email, password) => {
    if(!email || !password) return;

   return await signInWithEmailAndPassword(auth, email, password)
  }








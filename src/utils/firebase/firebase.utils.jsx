import { initializeApp } from 'firebase/app';
import { 
    signInWithEmailAndPassword, 
    getAuth,
    createUserWithEmailAndPassword , 
    signInWithRedirect, 
    signInWithPopup, 
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import {collection, writeBatch, getFirestore, query, getDocs, doc, getDoc, setDoc} from 'firebase/firestore'; 


const firebaseConfig = {
  apiKey: "AIzaSyBUuye7UGPbJF3HpJHSyw44VJW1shRSdf4",
  authDomain: "crwn-clothing-db-5b939.firebaseapp.com",
  projectId: "crwn-clothing-db-5b939",
  storageBucket: "crwn-clothing-db-5b939.appspot.com",
  messagingSenderId: "427402776098",
  appId: "1:427402776098:web:c903aea7ad7eb0fc79447b"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: "select_account"
});

export const auth = getAuth();
export const signInWithGooglePopup = () => signInWithPopup(auth,googleProvider);
export const signInWithGoogleRedirect = () => signInWithRedirect(auth,googleProvider);

export const db = getFirestore();

export const addCollectionAndDocuments = async(collectionKey,objectsToAdd) => {
    const collectionRef = collection(db,collectionKey);
    const batch = writeBatch(db);

    objectsToAdd.forEach((object) => {
        const docRef = doc(collectionRef, object.title.toLowerCase());
        batch.set(docRef,object);
    });

    await batch.commit();
    console.log('done');
};

export const getCategoriesAndDocuments = async () => {
    const collectionRef = collection(db,'categories');
    const q = query(collectionRef);

    const querySnapshot = await getDocs(q);
    const categoryMap = querySnapshot.docs.reduce((acc, docSnapshot) => {
        const {title,items} = docSnapshot.data();
        acc[title.toLowerCase()] = items;
        return acc;
    }, {})

    return categoryMap;
}

export const createUserDocumentFromAuth = async (
    userAuth,
    additionalInformation = {}
    ) => {
    if(!userAuth) return;

    const userDocRef = doc(db,'users',userAuth.uid);

    console.log(userDocRef);

    const userSnapshot = await getDoc(userDocRef);
    
    if(!userSnapshot.exists()){
        const {displayName, email} = userAuth;
        const createdAt = new Date();

        try {
            await setDoc(userDocRef, {
                displayName,
                email,
                createdAt,
                ...additionalInformation,
            });
        } catch (error) {
            console.log("error createing the user",error.message);
        }
    }

    return userDocRef;
}

export const createAuthUserWithEmailAndPassword = async (email,password) => {
    if(!email || !password) return ;

    return await createUserWithEmailAndPassword(auth, email, password);
};

export const signInAuthUserWithEmailAndPassword = async (email,password) => {
    if(!email || !password) return ;

    return await signInWithEmailAndPassword(auth, email, password);
};

export const signOutUser = async () => await signOut(auth);

export const onAuthStateChangedListener = (callback) => 
    onAuthStateChanged(auth,callback);
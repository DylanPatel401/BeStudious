import { FIRESTORE_DB, FIREBASE_AUTH } from '../firebase/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, reauthenticateWithCredential } from 'firebase/auth';


export async function userSignUp(email, password, displayName) {
  try {
    const res = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
    await updateProfile(res.user, {
      displayName: displayName
    });

    const collectionRef = collection(FIRESTORE_DB, 'displayNames');
    const newDocRef = await addDoc(collectionRef, {
      uid: FIREBASE_AUTH.currentUser.uid,
      displayName,
    });

  } catch (err) {
    console.log(err);
    return alert(err);
  }
}


export async function userSignIn({ email: email, password: password }) {
  try {
    const res = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
    uid = res.user.uid
  } catch (error) {
    console.error('Error signing in user:', error);
    return (alert('Error signing in user: ' + error))
  }
}

export async function getDisplayName({ uid }) {
  try {
    const displayNameRef = collection(FIRESTORE_DB, 'displayNames');
    const displayNameQ = query(displayNameRef, where('uid', '==', uid));
    const displayNameSnapshot = await getDocs(displayNameQ);
    if (displayNameSnapshot.isEmpty) {
      throw new Error('User does not exist in displayName');
    }
    const displayNameDoc = displayNameSnapshot.docs[0];
    return displayNameDoc.data().displayName
  } catch (error) {
    return 'Placeholder Name'
  }
}

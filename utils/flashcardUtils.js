import { FIRESTORE_DB, FIREBASE_AUTH } from '../firebase/firebase';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  doc,
  updateDoc,
  arrayRemove,
  deleteDoc,
} from 'firebase/firestore';

//util functions

const checkIfUserCreatedSet = async (setId) => {
  try {
    const docRef = doc(FIRESTORE_DB, 'studySets', setId)

    if (!docRef.empty) {
      const setDocRef = await getDoc(docRef);
      const creatorUID = setDocRef.data().creatorUID;
      return creatorUID === FIREBASE_AUTH.currentUser.uid;
    }

    return false;
  } catch (error) {
    console.error('Error checking user set:', error);
    return false; // Return false on error
  }
};


export const createFlashcardSet = async (setName, setDescription, flashcardsArray) => {
  try {

    // Use 'StudyGroups' as the collection name
    const collectionRef = collection(FIRESTORE_DB, 'studySets');

    // Check if the flashcard set already exists
    const setQuery = query(collectionRef, where('setName', '==', setName), where('creatorUID', '==', FIREBASE_AUTH.currentUser.uid));
    const querySnapshot = await getDocs(setQuery);

    if (!querySnapshot.empty) {
      throw new Error('Flashcard set already exists');
    }

    // Add a metadata doc at the beginning for set information
    const newDocRef = await addDoc(collectionRef, {
      setName,
      setDescription,
      creatorUID: FIREBASE_AUTH.currentUser.uid,
      createdAt: serverTimestamp(),
      flashcards: flashcardsArray, // Include the flashcards array in the document
    });

    return newDocRef; // Return the new document reference
  } catch (error) {
    console.error('Error creating flashcard set:', error);
    throw error; // Rethrow the error to be caught by the caller
  }
};

export const updateSet = async (setId, flashcardsArray, setName, setDescription) => {
  try {
    const docRef = doc(FIRESTORE_DB, 'studySets', setId)

    if(setDescription == null){
      setDescription = '';
    }

    if (!docRef.empty) {
      const setDocRef = await getDoc(docRef);

      // Check if the user created the set
      if (!(await checkIfUserCreatedSet(setId))) {
        throw new Error("You can't update sets you haven't made");
      }

      // Update the document with the new flashcards array
      const newDocRef = await updateDoc(docRef, { setName: setName, description: setDescription, flashcards: flashcardsArray });

      return newDocRef

    } else {
      throw new Error('No documents found in the collection');
    }
  } catch (error) {
    console.error('Error updating flashcard set:', error);
    throw error; // Rethrow the error to be caught by the caller
  }
};


export const removeFlashcardSet = (setName) => {
  return async () => {
    try {

      const flashcardSetsRef = collection(FIRESTORE_DB, setName);
      const q = query(flashcardSetsRef);
      const querySnapshot = await getDocs(q);

      if (!(await checkIfUserCreatedSet(setName))) {
        throw new Error("You can't edit sets you haven't made");
      }

      //No direct call to delete collections, so must delete every doc in collection
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

    } catch (error) {
      console.error('Error removing flashcard set:', error);
    }
  };
};

/**
 * Deletes a specific flashcard from a flashcard set.
 * @param {string} setId - The ID of the flashcard set and the flashcard to be deleted.
 * @returns {boolean} Returns true if the flashcard is successfully deleted, otherwise false.
 */
export const deleteFlashcardSet = async (setId) => {
  try {
    // Reference to the flashcard set document
    const setDocRef = doc(FIRESTORE_DB, 'studySets', setId);

    // Check if the flashcard set exists
    const setDocSnapshot = await getDoc(setDocRef);
    if (!setDocSnapshot.exists()) {
      throw new Error('Flashcard set does not exist.')
    }

    if (setDocSnapshot.data().creatorUID != FIREBASE_AUTH.currentUser.uid) {
      throw new Error('You don\'t have permission to do this');
    }

    // Delete the flashcard set document
    await deleteDoc(setDocRef);

    //Remove from any groups
    const groupsCollectionRef = collection(FIRESTORE_DB, 'StudyGroups');
    const groupsQ = query(groupsCollectionRef, where('flashcardSetsId', 'array-contains', setId));
    const groupsQuerySnapshot = await getDocs(groupsQ);

    // Array to hold all update promises
    const groupsUpdatePromises = [];

    groupsQuerySnapshot.forEach((doc) => {
      // Create an update promise to remove the element from the array
      const updatePromise = updateDoc(doc.ref, {
        flashcardSetsId: arrayRemove(setId) // Remove setId from the array
      });
      groupsUpdatePromises.push(updatePromise);
    });

    // Wait for all update promises to complete
    await Promise.all(groupsUpdatePromises);

    //Delete any games that use the set
    const gamesCollectionRef = collection(FIRESTORE_DB, 'games');
    const gamesQ = query(gamesCollectionRef, where('setName', '==', setDocSnapshot.data().setName), where('members', 'array-contains', FIREBASE_AUTH.currentUser.uid));
    const gamesQuerySnapshot = await getDocs(gamesQ);

    // Array to hold all delete promises
    const gamesDeletePromises = [];

    gamesQuerySnapshot.forEach((doc) => {
      // Create a promise to delete each document
      const deletePromise = deleteDoc(doc.ref);
      gamesDeletePromises.push(deletePromise);
    });

    // Wait for all delete promises to resolve
    await Promise.all(gamesDeletePromises);

    return true; // Flashcard successfully deleted
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    // alert('Error deleting flashcard:', error)
    return false; // Error occurred while deleting flashcard
  }
};


/**
 * Retrieves details of a specific flashcard set.
 * @param {string} setId - The ID of the flashcard set to retrieve details for.
 * @returns {Object|number} The details of the flashcard set if found, otherwise -1.
 */
export const getFlashcardSet = async (setId) => {
  try {
    const docRef = doc(FIRESTORE_DB, 'studySets', setId);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      let tempData = docSnapshot.data();
      tempData.flashcardId = setId;
      return tempData;
    } else {
      return -1;
    }
  } catch (error) {
    console.error('Error getting flashcard set:', error);
    return alert(error);
  }
};


/**
 * Retrieves flashcard sets owned by a specific user.
 * @param {string} ownerId - The ID of the user whose flashcard sets are to be retrieved.
 * @returns {Array} An array of flashcard sets owned by the user.
 */
export const getOwnersFlashcardSet = async (ownerId) => {
  try {
    const flashcardSetsRef = collection(FIRESTORE_DB, 'studySets');

    const q = query(flashcardSetsRef, where('creatorUID', '==', ownerId), orderBy('createdAt', 'desc'));

    const querySnapshot = await getDocs(q);

    const flashcardSets = [];

    querySnapshot.forEach((doc) => {
      const tempData = doc.data();
      tempData.flashcardId = doc.id;
      flashcardSets.push(tempData);
    });
    return flashcardSets;
  } catch (error) {
    console.error('Error getting flashcard sets owned by user:', error);
    return alert(error);
  }
};


// Action for creating, editing, and removing flashcards


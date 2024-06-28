import { FIRESTORE_DB, FIREBASE_AUTH } from '../firebase/firebase';
import moment from 'moment';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  doc,
  updateDoc,
  serverTimestamp,
  orderBy,
  deleteDoc,
} from 'firebase/firestore';


//Function to create a game for the first time
export const createGame = async (setName, groupName, startDate, endDate) => {
  try {
    //Check if the game exists already, need to add a case for where there may be more than one game per set/group
    const collectionRef = collection(FIRESTORE_DB, 'games');
    const setQuery = query(collectionRef, where('setName', '==', setName), where('groupName', '==', groupName));
    const querySnapshot = await getDocs(setQuery);

    if (!querySnapshot.empty) {
      throw new Error('Game already exists');
    }

    //Ensure group exists
    const groupRef = collection(FIRESTORE_DB, 'StudyGroups');
    const groupQ = query(groupRef, where('name', '==', groupName), where('ownerId', '==', FIREBASE_AUTH.currentUser.uid));
    const groupQuerySnapshot = await getDocs(groupQ);
    const groupDoc = groupQuerySnapshot.docs[0];
    if (!groupDoc.exists()) {
      throw new Error('Group does not exist, or you don\'t have permission');
    }


    //Ensure set exists
    const flashcardSetRef = collection(FIRESTORE_DB, 'studySets');
    const flashcardQ = query(flashcardSetRef, where('setName', '==', setName), where('creatorUID', '==', FIREBASE_AUTH.currentUser.uid));
    const flashcardQuerySnapshot = await getDocs(flashcardQ);
    const flashcardSetDoc = flashcardQuerySnapshot.docs[0];
    if (!flashcardSetDoc.exists()) {
      throw new Error('Set does not exist, or you don\'t have permission');
    }

    //Set current date to yesterday so all players can play immediately
    const leaderboardArray = [];
    const currentDate = moment().subtract(1, 'days').format('YYYY-MM-DD'); // Format date as string

    groupDoc.data().members.forEach(id => {
      const date = currentDate;
      const newItem = { id, date, score: 0 };
      leaderboardArray.push(newItem);
    });

    const newDocRef = await addDoc(collectionRef, {
      setName,
      groupName,
      startDate,
      endDate,
      leaderboard: leaderboardArray,
      members: groupDoc.data().members,
      createdAt: serverTimestamp(),
    });
    
    alert("Game Created")

    return newDocRef; // Return the new document reference
  } catch (error) {
    alert(error)
    // console.error('Error creating game:', error);
    // throw error; // Rethrow the error to be caught by the caller
  }
};

//Function to ensure players can play the game within date boundaries
export const canPlay = async (setName, groupName) => {
  try {

    //Ensure game exists
    const gamesCollectionRef = collection(FIRESTORE_DB, 'games');
    const q = query(gamesCollectionRef, where('setName', '==', setName), where('groupName', '==', groupName), orderBy('endDate', 'desc'));
    const querySnapshot = await getDocs(q);
    const docRef = querySnapshot.docs[0].ref;

    if (docRef.empty) {
      throw new Error('Game does not exist')
    }

    const gameDocRef = await getDoc(docRef);

    //check if player is a member of the game, this can be found by checking the leaderboard
    const player = gameDocRef.data().leaderboard.find(player => player.id === FIREBASE_AUTH.currentUser.uid);
    if (!player) {
      throw new Error(`Player with ID ${uid} not found on the leaderboard.`);
    }

    //Check to see if the player already played today
    // const currentDate = moment().format('YYYY-MM-DD');
    const currentDate = moment().startOf('day')
    const dateToCheck = moment(player.date, 'YYYY-MM-DD').startOf('day');
    console.log(currentDate)
    console.log(dateToCheck)
    if (dateToCheck.isSameOrAfter(currentDate)) {
      throw new Error('Player already played today')
    }

    //Make sure current date is within start/end date range
    if (currentDate.isBefore(gameDocRef.data().startDate) || currentDate.isAfter(gameDocRef.data().endDate)) {
      throw new Error('The game is not active')
    }

    return true;

  } catch (error) {
    return false
    // console.error('Error creating game:', error);
    // throw error; // Rethrow the error to be caught by the caller
  }
};

//Update the leaderboard for a player
export const updateLeaderboard = async (setName, groupName, score) => {
  try {

    //Ensure game exists
    const gamesCollectionRef = collection(FIRESTORE_DB, 'games');
    const q = query(gamesCollectionRef, where('setName', '==', setName), where('groupName', '==', groupName), orderBy('endDate', 'desc'));
    const querySnapshot = await getDocs(q);
    const docRef = querySnapshot.docs[0].ref;

    const gameDocRef = await getDoc(docRef);



    if (gameDocRef.empty) {
      throw new Error('Game does not exist')
    }



    // Find the index of the item in the array based on the ID
    const leaderboard = gameDocRef.data().leaderboard;
    const index = gameDocRef.data().leaderboard.findIndex(item => item.id === FIREBASE_AUTH.currentUser.uid);

    if (index === -1) {
      throw new Error(`Item with ID ${FIREBASE_AUTH.currentUser.uid} not found.`);
    }

    //update score and change date to today's date
    leaderboard[index].date = moment().format('YYYY-MM-DD');
    leaderboard[index].score += score;

    // Update the leaderboard array in Firestore
    await updateDoc(docRef, { leaderboard });

  } catch (error) {
    console.error('Error creating game:', error);
    throw error; // Rethrow the error to be caught by the caller
  }

};

//Get all games for a given user, order by endDate desc to get most recent games first
export const getAllGamesbyUserID = async () => {
  try {
    const gamesCollectionRef = collection(FIRESTORE_DB, 'games');
    const q = query(gamesCollectionRef, where('members', 'array-contains', FIREBASE_AUTH.currentUser.uid), orderBy('endDate', 'desc'));
    const querySnapshot = await getDocs(q);

    const games = [];
    querySnapshot.forEach((doc) => {
      const game = doc.data();
      games.push(game);
    });

    return games
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }
};

export async function deleteGame(setName, groupName) {
  try {
    // Create a query to find the game document based on setName and groupName

    const gamesCollectionRef = collection(FIRESTORE_DB, 'games');
    const gameQuery = query(gamesCollectionRef, where('setName', '==', setName), where('groupName', '==', groupName));
    const gameQuerySnapshot = await getDocs(gameQuery);

    if (gameQuerySnapshot.empty) {
      throw new Error('Game not found.');
    }

    // Get the first document found by the query (assuming only one document matches)
    const gameDocSnapshot = gameQuerySnapshot.docs[0];
    // Delete the game document
    await deleteDoc(doc(FIRESTORE_DB, 'games', gameDocSnapshot.id));
    console.log(`Game with ID ${gameDocSnapshot.id} deleted successfully.`);

    return true; // Return true indicating successful deletion
  } catch (error) {
    console.error('Error deleting game:', error);
    return false; // Return false to indicate deletion failure
  }
}
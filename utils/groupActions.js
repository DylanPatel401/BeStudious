import { FIREBASE_AUTH, FIRESTORE_DB } from '../firebase/firebase'
import { collection, doc, addDoc, getDoc, updateDoc, deleteDoc, arrayUnion, arrayRemove, serverTimestamp, query, where, getDocs, Query} from 'firebase/firestore';

//const uid = FIREBASE_AUTH?.currentUser?.uid;

import { getFlashcardSet } from './flashcardUtils';
 

/**
 * Creates a new study group with the provided group name, description, and PIN.
 * @param {Object} params - Parameters for creating the group.
 * @param {string} params.groupName - The name of the group.
 * @param {string} params.groupDescription - The description of the group.
 * @param {number} params.pin - The PIN for joining the group.
 */
export async function createGroup ({groupName, groupDescription, pin, uid}) {
    
    const groupData = {
      name: groupName,
      description: groupDescription,
      ownerId: uid,
      flashcardSetsId: [],
      createdAt: serverTimestamp(),
      members: [uid],
      pendingMembers: [],
      pin: pin,
    };

    try{
        const groupRef = collection(FIRESTORE_DB, 'StudyGroups');
        await addDoc(groupRef, groupData);
    }catch(err){
        console.log(err);
        return alert(err);
    }

};


/**
 * Joins a user to a study group.
 * @param {string} groupID - The ID of the group to join.
 * @param {string} userPin - The PIN entered by the user to join the group.
 */
export async function joinGroup({groupID, userPin, uid}) {
    try {
        const groupDocRef = doc(FIRESTORE_DB, 'StudyGroups', groupID);
        const groupDocSnapshot = await getDoc(groupDocRef);



        // Check if the document exists
        if (groupDocSnapshot.exists()) {
            const groupData = groupDocSnapshot.data();

            // Check if the entered pin matches the group's pin
            if (groupData.pin == userPin) {
                // Check if the user is already a member of the group
                if (groupData.members.includes(uid)) {
                    alert("You are already part of the group!");
                } else {
                    // Update the MEMBERS array with the current user's uid
                    await updateDoc(groupDocRef, {
                        members: arrayUnion(uid)
                    });

                    return alert("Joined group successfully!");
                }
            } else {
                return alert("Incorrect PIN. Cannot join the group.");
            }
        } else {
            return alert("No group found with ID: ", groupID);
        }
    } catch (error) {
        console.error("Error joining group:", error);
        return alert(error);
    }
}

/**
 * Searches for a study group based on the provided search query.
 * @param {Object} params - Parameters for searching the group.
 * @param {string} params.searchQuery - The search query used to find the group by name.
 * @returns {number|QuerySnapshot} Returns -1 if no group is found, otherwise returns the QuerySnapshot.
 */
export async function searchGroup ({searchQuery, uid}){
    try{
        const querySnapshot = await getDocs(
            query(collection(FIRESTORE_DB, 'StudyGroups'), where('name', '==', searchQuery))
        );

        
        if (querySnapshot.empty) {
            return -1;
        }else{
            const studyGroupData  = []
            querySnapshot.forEach(async doc => {
                const tempData = doc.data();
                tempData.groupID = doc.id;
                studyGroupData.push(tempData);
            })
            return studyGroupData;
        }
    }catch(error){
        console.log(error);
        return alert(error);
    }

}

/**
 * Retrieves study groups owned by the current user.
 * @returns {number|Array} Returns -1 if no groups are found, otherwise returns an array of owner's groups.
 */
export async function getOwnersGroup ({uid}){
    try{
        console.log(uid)
        const querySnapshot = await getDocs(
            query(collection(FIRESTORE_DB, 'StudyGroups'), where('ownerId', '==', uid))
        );

        if (querySnapshot.empty) {
            console.log("empty")
            return -1;
        }else{
            const ownerGroups = []
            querySnapshot.forEach(async doc => {
                const tempData = doc.data();
                tempData.groupID = doc.id;
                ownerGroups.push(tempData);
            })
            return ownerGroups;
        }
    }catch(error){
        console.log(error);
        return alert(error);
    }

}

/**
 * Edits the details of a study group.
 * @param {string} groupID - The ID of the group to be edited.
 * @param {string} groupName - The new name for the group.
 * @param {string} groupDescription - The new description for the group.
 * @param {string} groupPin - The new pin for the group.
 */
export async function editGroup({groupID, groupName, groupDescription, groupPin, uid}){
    try{
        const groupDocRef = doc(FIRESTORE_DB, 'StudyGroups', groupID);
        await updateDoc(groupDocRef, {
            name: groupName,
            description: groupDescription,
            pin: parseInt(groupPin)
        });
    }catch(error){
        return alert("Edit group err: " + error);
    }
}

/**
 * Adds a flashcard ID to the study group --> flashcardSetsId array.
 * @param {string} flashcardId - The ID of the flashcard to be added.
 * @param {string} groupID - The ID of the group where the flashcard will be added.
 */

export async function addFlashcardId({flashcardId, groupID}) {
    try {
        const groupDocRef = doc(FIRESTORE_DB, 'StudyGroups', groupID);

        // Update the document by appending the flashcardId to the flashcardSetsId array
        await updateDoc(groupDocRef, {
            flashcardSetsId: arrayUnion(flashcardId)
        });

        console.log(`Flashcard ID ${flashcardId} added to group ${groupID} successfully.`);
    } catch (error) {
        console.error('Error adding flashcard ID to group:', error);
        return alert('Error adding flashcard ID to group. Please try again.');
    }
}

/**
 * Removes a flashcard ID from study group --> flashcardSetsId array.
 * @param {string} flashcardId - The ID of the flashcard to be removed.
 * @param {string} groupID - The ID of the group from which the flashcard will be removed.
 */
export async function removeSetFromGroup({ flashcardId, groupID }) {
    try {
        const groupDocRef = doc(FIRESTORE_DB, 'StudyGroups', groupID);

        await updateDoc(groupDocRef, {
            flashcardSetsId: arrayRemove(flashcardId)
        });

        console.log(`Flashcard ID ${flashcardId} removed from group ${groupID} successfully.`);
    } catch (error) {
        console.log('Error removing flashcard ID from group:', error);
        return alert('Error removing flashcard ID from group. ', error);
    }
}

/**
 * Retrieves details of a specific study group.
 * @param {string} groupID - The ID of the group to retrieve details for.
 * @returns {Object|null} The details of the group if found, otherwise null.
 */
export async function getGroup({groupID}) {
    try {
        // Query for the specific group document using the provided groupId
        const groupDocRef = doc(FIRESTORE_DB, 'StudyGroups', groupID);
        const groupDocSnapshot = await getDoc(groupDocRef);

        // Check if the group document exists
        if (groupDocSnapshot.exists()) {
            const groupData = groupDocSnapshot.data();
            groupData.groupID = groupDocSnapshot.id;
            return groupData;
        } else {
            // If the group document doesn't exist, return null
            return null;
        }
    } catch (error) {
        console.error('Error retrieving group:', error);
        return null;
    }
}


/**
 * Retrieves ALL flashcard sets associated with study groups that the provided user is a member of.
 * @param {string} uid - The ID of the user whose associated flashcard sets are to be retrieved.
 * @returns {Array} An array of flashcard sets associated with the user's study groups.
 */
export async function userGroupFlashSets(uid) {
    try {
        const querySnapshot = await getDocs(
            query(collection(FIRESTORE_DB, 'StudyGroups'), where('members', 'array-contains', uid))
        );

        // an array of array 
        let flashIds = [];
        querySnapshot.forEach(doc => {
            const data = doc.data()
            data.flashcardId = doc.id;
            flashIds.push(data.flashcardSetsId);
        });

        let flashcardData = []
        if(!flashIds) return -1;
        for(let i = 0; i < flashIds?.length; i++){
            if(flashIds[i]){
                for(let x = 0; x < flashIds[i].length; x++){
                    const set = await getFlashcardSet(flashIds[i][x]);
                    if(set) flashcardData.push(set);
                }
            }
        }
 
        return flashcardData;
    } catch (error) {
        console.error('Error retrieving group IDs:', error);
        return [];
    }
}

/**
 * Retrieves study groups associated with the provided user ID, along with their nested flashcard sets.
 * @param {string} uid - The ID of the user to retrieve study groups for.
 * @returns {Array|null} An array of study groups with nested flashcard sets, or null if an error occurs.
 */
export async function groupWithNestedFlashcards(uid) {
    try {
        const querySnapshot = await getDocs(
            query(collection(FIRESTORE_DB, 'StudyGroups'), where('members', 'array-contains', uid))
        );

        const returnData = await Promise.all(querySnapshot.docs.map(async doc => {
            try {
                const data = doc.data();
                data.groupID = doc.id;

                // If flashcardSetsId is absent, return data without further processing
                if (!data.flashcardSetsId) {
                    return data;
                }

                // Map over flashcard sets IDs and await each getFlashcardSet call
                const purifyData = [];
                await Promise.all(data.flashcardSetsId.map(async setId => {
                    const flashcardSet = await getFlashcardSet(setId);
                    // Check if flashcardSet is not equal to -1 (indicating it was found)
                    if (flashcardSet != -1) {
                        purifyData.push(flashcardSet); // Add to purifyData array
                    }
                    return flashcardSet; // Return the result regardless
                }));
                
                data.flashcards = purifyData;

                return data;
            } catch (error) {
                console.error('Error processing group:', error);
                return null; 
            }
        }));

        return returnData;
    } catch (error) {
        console.error('Error querying study groups:', error);
        return null; // Or handle error as appropriate
    }
}

/**
 * Deletes a study group.
 * @param {string} id - The ID of the group to be deleted.
 */
export async function deleteGroup({ id }) {
    try {
        const groupDocRef = doc(FIRESTORE_DB, 'StudyGroups', id);
        const groupDocSnapshot = await getDoc(groupDocRef);

        if (!groupDocSnapshot.exists()) {
            throw new Error('Group does not exist.')
        }

        //Delete any games that use the group
        const gamesCollectionRef = collection(FIRESTORE_DB, 'games');
        const gamesQ = query(gamesCollectionRef, where('groupName', '==', groupDocSnapshot.data().name), where('members', 'array-contains', FIREBASE_AUTH.currentUser.uid));
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

        await deleteDoc(groupDocRef);

        console.log(`Study group with ID ${id} deleted successfully.`);

        return true; // or you can return any specific value indicating success
    } catch (error) {
        console.error('Error deleting study group:', error);
        return false; // or you can handle the error as appropriate
    }
}

/**
 * Retrieves all study groups that the provided user ID is a member of EXCEPT IF USER OWNS THE study group .
 * @param {string} uid - The ID of the user.
 * @returns {Array|null} An array of study groups the user is a member of, or null if an error occurs.
 */
export async function getUserGroups({uid}) {
    try {
        const querySnapshot = await getDocs(
            query(collection(FIRESTORE_DB, 'StudyGroups'), where('members', 'array-contains', uid))
        );

        const userGroups = [];
        querySnapshot.forEach(doc => {
            const groupData = doc.data();
            groupData.groupID = doc.id;
            if(groupData.ownerId != uid) userGroups.push(groupData);
        });

        return userGroups;
    } catch (error) {
        console.log('Error retrieving user groups:', error);
        return alert(error);
    }
}


/**
 * Removes a user from a study group.
 * @param {string} groupID - The ID of the group from which the user will be removed.
 * @param {string} uid - The UID of the user to be removed from the group.
 */
export async function removeUserFromGroup({ groupID, uid }) {
    try {
        const groupDocRef = doc(FIRESTORE_DB, 'StudyGroups', groupID);

        await updateDoc(groupDocRef, {
            members: arrayRemove(uid)
        });

        return alert("You have left the group!");
    } catch (error) {
        console.log('Error removing user from group:', error);
        return alert("Error: ", error);
    }
}

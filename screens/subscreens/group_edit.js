import React, { useState, useEffect} from 'react';
import { Text, View, StyleSheet, TextInput, ScrollView, Button, TouchableOpacity} from 'react-native';
import { updateDoc, doc } from 'firebase/firestore';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebase/firebase';

import { editGroup,addFlashcardId, getGroup, removeSetFromGroup, deleteGroup} from '../../utils/groupActions';
import { getFlashcardSet,getOwnersFlashcardSet } from '../../utils/flashcardUtils';
 
import { useNavigation } from '@react-navigation/native';

export default function GroupEdit({ route }) {
    const { groupData } = route.params;
    const [groupName, setGroupName] = useState(groupData.name);
    const [groupDescription, setGroupDescription] = useState(groupData.description);
    const [groupPin, setGroupPin] = useState(groupData.pin.toString());

    const [canGiveAccessToFlashcardSet, setcanGiveAccessToFlashcardSet] = useState(null);
    const [hasAccessToFlashcardSet, sethasAccessToFlashcardSet] = useState(null);
    const nav = useNavigation();


    const uid = FIREBASE_AUTH.currentUser.uid;

    const handleSaveChanges = async () => {
        try {  
            await editGroup({groupName:groupName, groupDescription: groupDescription, groupPin, groupID: groupData.groupID})
            alert('Changes saved successfully!');
        } catch (error) {
            console.error('Error saving changes:', error);
            alert('Error saving changes. Please try again.');
        }
    };


    const addSetToGroup = async(flashcardId) => {
        await addFlashcardId({flashcardId: flashcardId, groupID:groupData.groupID})
        setAccess()
        setHasAccess()
    }    

    const removeSet = async(flashcardId) => {
        await removeSetFromGroup({flashcardId: flashcardId, groupID: groupData.groupID})
        setAccess()
        setHasAccess()
    }

    const setAccess = async (flashcardId) => {
        try {
            const sets = await getOwnersFlashcardSet(uid);
            const group = await getGroup({ groupID: groupData.groupID });
            
            if(!group.flashcardSetsId) return setcanGiveAccessToFlashcardSet(null)
            const setsNotInGroup = sets.filter(set => !group.flashcardSetsId.includes(set.flashcardId));
            
            setcanGiveAccessToFlashcardSet(setsNotInGroup);
        } catch (error) {
            console.error('Error setting access:', error);
            // Handle error gracefully
        }
    }
    
    const setHasAccess = async () => {
        try {
            const data = await getGroup({ groupID: groupData.groupID });
            const sets = [];
    
            for (const flashcardId of data?.flashcardSetsId || []) {
                const set = await getFlashcardSet(flashcardId);
                if (set !== -1) {
                    sets.push(set);
                }
            }
    
            sethasAccessToFlashcardSet(sets);
        } catch (error) {
            console.error('Error setting access:', error);
            // Handle error gracefully
        }
    }
    
    const handleDeleteGroup = async () => {
        try{
            const groupId = groupData.groupID;

            await deleteGroup({id: groupId})   
            nav.goBack()
            nav.goBack()


        }catch(err){
            console.log(err);
            return alert(err);
        }


    }

    useEffect(() => {
        setAccess();
        setHasAccess();
    }, [])

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Group Name:</Text>
            <TextInput
                style={styles.input}
                value={groupName}
                onChangeText={text => setGroupName(text)}
            />
            <Text style={styles.label}>Group Description:</Text>
            <TextInput
                style={styles.input}
                value={groupDescription}
                onChangeText={text => setGroupDescription(text)}
                multiline={true}
            />
            <Text style={styles.label}>Group PIN:</Text>
            <TextInput
                style={styles.input}
                value={groupPin}
                onChangeText={text => setGroupPin(text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
            />
            <View style={styles.buttonContainer}>
                <Button title="Save Changes" onPress={handleSaveChanges} />
            </View>

            <View style={styles.buttonContainer}>
                <Button title="Delete Group Immediately" onPress={handleDeleteGroup} />
            </View>


            <View style={{marginTop:20}}>
                <Text style={styles.label}>
                    Members in group has access to these flashcard sets:
                </Text>                
            </View>

            <ScrollView horizontal style={{borderWidth:1, borderRadius:10}}>
                {hasAccessToFlashcardSet?.map((set,index) => {

                    return(
                        <TouchableOpacity 
                            style={{flex:1}} 
                            onPress={() => {removeSet(set.flashcardId)}}
                            key={index}
                        >
                            <View style={{backgroundColor: 'teal', padding:10, borderRadius:10}}>
                                <Text style={{textAlign: 'center', color:'white'}}>
                                    {set.setName}
                                </Text>
                            </View>
                        </TouchableOpacity>                        
                    )
                })}

            </ScrollView>


            <View style={{marginTop:20}}>
                <Text style={styles.label}>
                    Click to give members of this group access to the flashcard set!
                </Text>                
            </View>

            <ScrollView horizontal style={{borderWidth:1, borderRadius:10}}>
                {canGiveAccessToFlashcardSet?.map((set,index) => {
                    return(
                        <TouchableOpacity 
                            style={{}} 
                            onPress={() => {addSetToGroup(set.flashcardId)}}
                            key={index}
                        >
                            <View style={{backgroundColor: 'teal', padding:10, borderRadius:10}}>
                                <Text style={{textAlign: 'center', color:'white'}}>
                                    {set.setName}
                                </Text>
                            </View>
                        </TouchableOpacity>                        
                    )
                })}
            </ScrollView>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    buttonContainer: {
        marginTop: 20,
    },
    membersContainer: {
        marginTop: 20,
    },
});

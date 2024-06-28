import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, ScrollView, Button, TextInput } from 'react-native';
import {txt, colors, btnView} from '../styles/style'

import { FIRESTORE_DB, FIREBASE_AUTH} from '../firebase/firebase'
import { addDoc, doc, setDoc, updateDoc, getDocs, update,getDoc, collection, arrayUnion,  query, where,} from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { joinGroup, removeUserFromGroup } from '../utils/groupActions';
import { set } from 'firebase/database';


const MyTextInput = ({ valueVar, name, type, onChange }) => {
    return (
         <TextInput
            style={styles.input}
            value={valueVar}
             onChangeText={text => onChange({ name, type, text })}
         />
    );
 };

function GroupsComponent ({studyGroups, renderPin}) {
    const nav = useNavigation();
    const uid = FIREBASE_AUTH.currentUser.uid;
    const [userPin, setUserPin] = useState('');

    const joinStudyGroup = async (groupID) => {
        if(!userPin) return alert("Please enter group's pin before hitting join group button!")
      
        try {
            await joinGroup({groupID: groupID, userPin: userPin, uid, uid})
            nav.goBack();
            
        } catch (error) {
            alert("Error joining group: " + error)
            console.error("Error joining group:", error);
        }
    };
    
    const PinComp = () => {
        if(renderPin == true){
            return(
                <View style={{flex:1}}>
                    <Text style={[txt.mediumText, {margin:10, marginTop:20}]}>
                        Enter Pin to join the corresponding group! 
                    </Text>


                    <TextInput
                        style={[styles.inputBox, {margin:10}]}
                        value={userPin}
                        onChangeText={(txt) => {setUserPin(txt)}}
                        placeholder="Enter group's pin"
                    />

                </View>
            );

        }else{
            return(null)
        }
    }


    const handleEditGroup = (group) => {
        nav.navigate("Group Edit", {groupData: group});
    }

    const leaveStudyGroup = (groupID) => {
        removeUserFromGroup({groupID:groupID, uid: uid})
        nav.goBack();
    }

    return (
        
        <ScrollView>
                {
                    (renderPin == true) ? 
                    (
                        <View style={{flex:1}}>
                        <Text style={[txt.mediumText, {margin:10, marginTop:20}]}>
                            Enter Pin to join the corresponding group! 
                        </Text>
    
    
                        <TextInput
                            style={[styles.inputBox, {margin:10}]}
                            value={userPin}
                            onChangeText={(txt) => {setUserPin(txt)}}
                            placeholder="Enter group's pin"
                        />
    
                    </View>  
                    ) :
                    (null)
                }
          


            {studyGroups.map((group,index) => (
                <TouchableHighlight key={index} style={styles.groupContainer} 
                    onPress={ group.ownerId == uid ? (() => handleEditGroup(group)) : () => console.log("not owner")}
                >
                    <View style={{flex:1}}>
    
                        <View style={{...styles.groupContent, flexDirection:'row'}}>
                            <View style={{flex:2}}>
                                <Text style={txt.mediumText}>
                                    {group.name}
                                </Text>                                
                            </View>


                            <View style={{flex:1, alignItems: 'flex-end'}}>
                                {group.ownerId == uid && (
                                    <Text style={txt.mediumText}>
                                        Pin: {group.pin}
                                    </Text>
                                )}

                            
                            </View>
                        </View>
    
                        <View style={{marginTop:10}}>
                            <Text style={txt.smallText}>
                                {group.description}
                            </Text>
                        </View>    


                        {/* This ensures that join group button only shows up when user is not the owner or member of the group*/}
                        {group.owner != uid && !group.members.includes(uid) ? (
                            <View style={{ marginTop: 10 }}>
                                <Button
                                    title="Join Group"
                                    onPress={() => joinStudyGroup(group.groupID)}
                                />
                            </View>
                            ):(null)
                        }

                        {/* This ensures that leave group button only shows up when user is NOT the owner and is a member of the group*/}
                        {group.ownerId != uid && group.members.includes(uid) ? (
                            <View style={{ marginTop: 10 }}>
                                <Button
                                    title="Leave Group"
                                    onPress={() => leaveStudyGroup(group.groupID)}
                                />
                            </View>
                            ):(null)
                        }
    
                    </View>
                </TouchableHighlight>
            ))}
        </ScrollView>
    );
             
};

const styles = StyleSheet.create({
    groupContainer: {
        flex:1,
        margin: 10,
        padding: 10,
        borderRadius: 10,        
        backgroundColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    groupContent: {
        flex: 1,
    },
    groupTitle: {
        fontSize: 18,
        marginBottom: 5,
        fontFamily: 'lexend-bold',
    },
    groupDescription: {
        fontSize: 14,
    },
    scrollViewContent: {
        alignItems: 'flex-start',
    },
    inputBox: {height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft:10},
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 20,
        padding: 10,
        width: '100%',
      },
});

export {GroupsComponent, }
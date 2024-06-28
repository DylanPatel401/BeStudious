import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableHighlight } from 'react-native';
import { txt, colors } from '../../styles/style';


import { FIRESTORE_DB, FIREBASE_AUTH } from '../../firebase/firebase';
import { addDoc, doc, setDoc, getDocs, collection, query, where, } from 'firebase/firestore';

import { useNavigation } from '@react-navigation/native';

// import { useDispatch } from 'react-redux';


import { createGroup, searchGroup, getOwnersGroup, getUserGroups } from '../../utils/groupActions';
import { create4DigitPin } from '../../utils/utils';


export default function GroupsScreen({ route, navigation }) {//can't use this navigation because this a different stack navigator
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const uid = FIREBASE_AUTH.currentUser.uid;
    const nav = useNavigation();

    const handleCreateGroup = () => {
        if (!groupName) return alert("Please fill out the group name!");
        if (!groupDescription) return alert("Please fill out the group description!")

        createGroup({ groupName: groupName, groupDescription: groupDescription, pin: create4DigitPin(), uid: uid });

        setGroupName('');
        setGroupDescription('');
        alert("Your group has been created!")
    }


    const handleSearchGroup = async () => {

        try {
            // This should contain data of all groups that has same name as searchQuery
            const searchGroupData = await searchGroup({ searchQuery: searchQuery, uid: uid });

            if (searchGroupData == -1) return alert("Could not find the group. Group name must be exact!")

            nav.navigate("Group Detail", { studyGroups: searchGroupData });


        } catch (err) {
            return alert(err);
        }
    }

    const handleSeeGroups = async () => {
        try {
            // This should contain data of all groups that has same name as searchQuery
            const ownerGroups = await getOwnersGroup({ uid: uid });
            if (ownerGroups == -1) return alert("You don't OWN any groups!")

            nav.navigate("See Groups", { groupsOwned: ownerGroups });


        } catch (err) {
            return alert(err);
        }

    }

    const handleAllGroups = async () => {
        try {
            // This should contain data of all groups that has same name as searchQuery
            const allGroups = await getUserGroups({ uid: uid });
            if (allGroups.length == 0) return alert("You are not in any groups!")
            nav.navigate("See Groups", { groupsOwned: allGroups });


        } catch (err) {
            return alert(err);
        }
    }

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 20, marginBottom: 10 }}>
                Create Study Group
            </Text>

            <TextInput
                style={styles.inputBox}
                placeholder="Group Name"
                value={groupName}
                onChangeText={text => setGroupName(text)}
            />

            <TextInput
                style={styles.inputBox}
                placeholder="Group Description"
                value={groupDescription}
                onChangeText={text => setGroupDescription(text)}
            />

            {/* <Button title="Create Group" onPress={handleCreateGroup} /> */}
            <TouchableHighlight onPress={handleCreateGroup} style={[styles.button, { backgroundColor: colors.secondary }]}>
                <Text style={styles.buttonText}>Create Group</Text>
            </TouchableHighlight>


            <Text style={{ fontSize: 20, marginTop: 20, marginBottom: 10 }}>
                Join Study Group
            </Text>

            <TextInput
                style={styles.inputBox}
                placeholder="Search Group"
                value={searchQuery}
                onChangeText={text => setSearchQuery(text)}
            />

            <TouchableHighlight onPress={handleSearchGroup} style={[styles.button, { backgroundColor: colors.secondary }]}>
                <Text style={styles.buttonText}>Search</Text>
            </TouchableHighlight>

            <View style={styles.buttonContainer}>
                <TouchableHighlight onPress={handleSeeGroups} style={[styles.button, { backgroundColor: colors.secondary }]}>
                    <Text style={styles.buttonText}>Groups You Own</Text>
                </TouchableHighlight>

                <TouchableHighlight onPress={handleAllGroups} style={[styles.button, { backgroundColor: colors.secondary }]}>
                    <Text style={styles.buttonText}>Groups You are In</Text>
                </TouchableHighlight>
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    inputBox: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 10 },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10, justifyContent: 'space-between' },
    button: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 10 },
    buttonText: { color: 'white', textAlign: 'center', fontSize: 16 },
})


import { TextInput, Text, View, TouchableOpacity, Button, StyleSheet, TouchableHighlight, ScrollView, StatusBar, FlatList } from 'react-native';
import React, { useContext, useState, useEffect, Component } from 'react';
import { useNavigation } from '@react-navigation/native';

import { FIRESTORE_DB, FIREBASE_AUTH} from '../../firebase/firebase';
import { addDoc, doc, setDoc, getDocs, collection } from 'firebase/firestore';

import { txt } from '../../styles/style';
import {GroupsComponent} from '../../components/groupsComponent';

export default function GroupDetailScreen({route,navigation}) {
    const [groupID, setGroupID] = useState();
    const nav = useNavigation;
    const [randomStudyGroups, setRandomStudyGroups] = useState([])

    const {searchQuery, studyGroups} = route.params;
    const uid = FIREBASE_AUTH.currentUser.uid
    
    return(
        <View style={{flex:1}}>

            <GroupsComponent studyGroups={studyGroups} renderPin={true}/>

        </View>

    );


}

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
});
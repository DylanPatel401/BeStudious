import { TextInput, Text, View, TouchableOpacity, StyleSheet, TouchableHighlight, Dimensions, StatusBar, FlatList } from 'react-native';
import React, { useContext, useState, useEffect, Component } from 'react';
import { useNavigation } from '@react-navigation/native';

import {GroupsComponent} from '../../components/groupsComponent.js';
export default function SeeGroupScreen({navigation, route}) {

    const { groupsOwned } = route.params;
    
    return(
        <View>

            <GroupsComponent studyGroups={groupsOwned} renderPin={false}/>


        </View>

    );


}
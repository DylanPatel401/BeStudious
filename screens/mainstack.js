import { TextInput, Text, View, ActivityIndicator, TouchableOpacity, Dimensions, Image } from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Font from 'expo-font';

import {colors} from '../styles/style'
const Tab = createBottomTabNavigator();

import FlashcardsScreen from './mainscreens/flashcards';
import GamesScreen from './mainscreens/games';
import GroupsScreen from './mainscreens/groups';
import HomeScreen from './mainscreens/home';
import AccountPage from './mainscreens/accountPage';

import GroupStackScreen from './mainscreens/groupstack'

import { FIREBASE_AUTH } from '../firebase/firebase';
const Home = () => { return (<HomeScreen />) }
const Flashcards = () => { return (<FlashcardsScreen />) }
const Games = () => { return (<GamesScreen />) }
const Groups = () => { return (<GroupsScreen />) }


const Account = () => { return (<AccountPage />) }

var deviceHeight = Dimensions.get('window').height;
var deviceWidth = Dimensions.get('window').width;

export default function MainstackScreen({ navigation }) {
    const [fontLoaded, setFontsLoaded] = useState(false);
    const uid = FIREBASE_AUTH.currentUser.uid

    useEffect(() => {
        async function loadFonts() {
            await Font.loadAsync({
                'lexend-bold': require('../assets/fonts/static/Lexend-Bold.ttf'),
                'lexend-extrabold': require('../assets/fonts/static/Lexend-ExtraBold.ttf'),
                'lexend-regular': require('../assets/fonts/static/Lexend-Regular.ttf'),
            })
            setFontsLoaded(true);
        }
        loadFonts();
    }, []);

    if (!fontLoaded || !uid ) {
        return (
            <View style={{flex:1, justifyContent: 'center'}}>
                <ActivityIndicator size="large" />
            </View>
        )
    } else {
        return (
            <Tab.Navigator
                screenOptions={({ navigation }) => ({
                    headerStyle: { backgroundColor: colors.topBar},
                    tabBarStyle: { backgroundColor: colors.bottomBar },
                    headerTintColor: colors.barText,
                    headerTitleStyle: { fontWeight: 'bold' },
                    headerTitleAlign: 'center',
                    headerRight: () => (
                        <TouchableOpacity style={{margin: 10}} onPress={() => navigation.navigate('Account')}>
                            <MaterialCommunityIcons name="account" color={'white'} size={deviceHeight / 22} />
                        </TouchableOpacity>
                    ),
                })}
            >
                <Tab.Screen name="Home" component={Home}
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ color }) => (
                            <MaterialCommunityIcons name="home" color={color} size={deviceHeight / 30} />
                        ),
                        headerShown: true,
                    }}
                />
                <Tab.Screen name="Flashcards" component={Flashcards}
                    options={{
                        tabBarIcon: ({ color }) => (
                            <MaterialCommunityIcons name="card-bulleted" color={color} size={deviceHeight / 30} />
                        ),
                        headerShown: true,
                    }}
                />

                <Tab.Screen name="Games" component={Games}
                    options={{
                        tabBarIcon: ({ color }) => (
                            <MaterialCommunityIcons name="gamepad-variant" color={color} size={deviceHeight / 30} />
                        ),
                        headerShown: true,
                    }}
                />

                <Tab.Screen name="Groups" component={Groups}
                    options={{
                        tabBarIcon: ({ color }) => (
                            <MaterialCommunityIcons name="account-group-outline" color={color} size={deviceHeight / 30} />
                        ),
                        headerShown: true,
                    }}
                />

            </Tab.Navigator>
        );
    }
}

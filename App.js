// react 
import React, { useState, useEffect } from 'react';

// react navigation
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// firebase
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from './firebase/firebase';

// screens
import FlashcardsScreen from './screens/mainscreens/flashcards';
import GamesScreen from './screens/mainscreens/games';
import GroupsScreen from './screens/mainscreens/groups';
import HomeScreen from './screens/mainscreens/home';
import MainstackScreen from './screens/mainstack';

import AuthScreen from './screens_auth/authstack';
import GamesDetailScreen from './screens/subscreens/games_detail';
import FlashcardsEditScreen from './screens/subscreens/flashcards_edit';
import FlashcardsCreateScreen from './screens/subscreens/flashcards_create';
import FlashcardsViewScreen from './screens/subscreens/flashcards_view';
import AccountPage from './screens/mainscreens/accountPage';
import SeeGroupScreen from './screens/subscreens/see_group';
import GroupDetailScreen from './screens/subscreens/group_detail';
import GroupEdit from './screens/subscreens/group_edit';
import gameCreateScreen from './screens/subscreens/game_create'

import { colors } from './styles/style';

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
      setUser(user);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const AuthFlow = user ? (
    <>
      <Stack.Screen name="Main" component={MainstackScreen} options={{ headerShown: false }} />  
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />  
      <Stack.Screen name="Games" component={GamesScreen} options={{ headerShown: true }} />  
      <Stack.Screen name="Flashcards" component={FlashcardsScreen} options={{ headerShown: false }} />  
      <Stack.Screen name="Groups" component={GroupsScreen} options={{ headerShown: false }} />  
      <Stack.Screen name="Account" component={AccountPage} options={{ headerShown: false }} />

      <Stack.Screen name="Games Detail" component={GamesDetailScreen} options={{ headerShown: true }} />  
      <Stack.Screen name="Flashcards View" component={FlashcardsViewScreen} 
        options={({ route }) => ({ title: route.params.topBarTitle })}
      />
      <Stack.Screen name="Flashcards Create" component={FlashcardsCreateScreen} options={{ headerShown: true }} />
      <Stack.Screen name="Flashcards Edit" component={FlashcardsEditScreen} options={{ headerShown: true }} />

      <Stack.Screen name="See Groups" component={SeeGroupScreen} options={{ headerShown: true }} />
      <Stack.Screen name="Group Detail" component={GroupDetailScreen} options={{ headerShown: true }} />

      <Stack.Screen name="Group Edit" component={GroupEdit} options={{ headerShown: true }} />

      <Stack.Screen name="Game Create" component={gameCreateScreen} options={{ headerShown: true }} />
    </>
  ) : (
    <>
      <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
    </>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ 
          headerStyle: { backgroundColor: colors.topBar },
          headerTintColor: colors.barText,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {AuthFlow}
      </Stack.Navigator>
    </NavigationContainer>      
  );
}

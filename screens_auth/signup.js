import { Text, View, TouchableOpacity, StatusBar, Button, TextInput, Image, Modal, StyleSheet, TouchableHighlight} from 'react-native';
import { useContext, useState, useEffect} from 'react';
import { txt, colors } from '../styles/style';

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile} from 'firebase/auth';
import { FIREBASE_AUTH} from "../firebase/firebase"

import {userSignUp} from '../utils/authUtils'

export default function SignUpScreen({navigation}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('')

  const handleSignUp = async () => {

  
    if(password != confirmPassword) return alert('Passwords do not match!')
    if(password.length < 6 || confirmPassword.length < 6) return alert("Password need to be at least 6 characters long!")
    userSignUp(email, password, displayName)   
  };

  const handleSkipAuth = async() => {
    try{
        const res = await signInWithEmailAndPassword(FIREBASE_AUTH, "test@gmail.com","123456");
    }catch(error){
      alert(error)
      console.log(error);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>


      <TextInput
        style={styles.input}
        placeholder="Display Name"
        autoCapitalize="none"
        value={displayName}
        onChangeText={(text) => setDisplayName(text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={(text) => setConfirmPassword(text)}
      />

      {/* <Button title="Sign Up" onPress={handleSignUp} />
      <Button title="SKIP AUTH" onPress={handleSkipAuth} />  */}

      <TouchableHighlight onPress={handleSignUp} style={[styles.button, { backgroundColor: colors.secondary }]}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableHighlight>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    width: '100%',
  },
  button: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 10 },
  buttonText: { color: 'white', textAlign: 'center', fontSize: 16 },
});
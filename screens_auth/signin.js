import { Text, View, TouchableOpacity, TextInput, Button, TouchableHighlight, ScrollView, Image, Modal, StyleSheet } from 'react-native';
import { useContext, useState, useEffect } from 'react';
import { txt, colors } from '../styles/style';

import { userSignIn } from '../utils/authUtils'


export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const appLogo = require('../assets/splash_logo.png');

  const handleSignIn = async () => {
    userSignIn({ email: email, password: password })
  };


  return (
    <View style={styles.container}>

      <Text style={styles.title}>Sign In</Text>

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

      <TouchableHighlight onPress={() => handleSignIn()} style={[styles.button, { backgroundColor: colors.secondary }]}>
        <Text style={styles.buttonText}>Sign In</Text>
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


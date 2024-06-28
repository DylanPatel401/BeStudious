import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Modal, TextInput, Button, Alert } from 'react-native';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebase/firebase';
import { getAuth, sendPasswordResetEmail, updateEmail, EmailAuthProvider, reauthenticateWithCredential, sendEmailVerification } from "firebase/auth";
import { useState } from 'react';
import { reauthenticate } from '../../utils/authUtils';

const placeholderImage = require('../../assets/profile-icon.png');
const auth = getAuth();
const user = auth.currentUser;


const AccountPage = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isChangeUsernameModalVisible, setIsChangeUsernameModalVisible] = useState(false);


  const handleChangeEmail = async () => {
    try {      
      //const credentials = EmailAuthProvider.credential(email, password);
      const user = auth.currentUser;

      const credentials = EmailAuthProvider.credential(email, password);

      await reauthenticateWithCredential(user, credentials);      
      
      await updateEmail(user, newEmail);

      // Inform the user that the email address has been updated
      Alert.alert('Success', 'Email updated successfully');
      
      // Clear input fields
      setEmail('');
      setPassword('');
      setNewEmail('');
      
      // Close the modal
      setIsChangeUsernameModalVisible(false);
    } catch (error) {
      console.error('Error updating email:', error);
      Alert.alert('Error', 'Failed to update email! Please make sure your email and password are correct, '+ 
      'and you are giving a valid new email address.');
    }
  };
  

  const handleChangePassword = () => {
    sendPasswordResetEmail(auth, auth.currentUser.email);
    console.log('Please check your email!')
    return alert("An email has been sent to: " + auth.currentUser.email+ " to change your password")
  };

  // prompt user to email whatever support email
  const handleSupport = () => {
    alert('This isn\'t a real app, you\'re gonna have to figure it out yourself')
  };


  return (
    <View style={styles.container}>
      {/* X button to go back */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
      <Text style={styles.closeButtonText}>X</Text>
      </TouchableOpacity>

      {/* Circular image and username */}
      <View style={styles.profileContainer}>
        <Image source={placeholderImage} style={styles.profileImage} />
        <Text style={styles.username}>{auth.currentUser.displayName}</Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => setIsChangeUsernameModalVisible(true)}>
          <Text>Change Email</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
          <Text>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleSupport}>
          <Text>Support</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Out button */}
      <TouchableOpacity style={styles.signOutButton} onPress={() => FIREBASE_AUTH.signOut()}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
      
    {/* Modal for changing username */}
    <Modal
        visible={isChangeUsernameModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsChangeUsernameModalVisible(false)}
        onBackdropPress={() => setIsChangeUsernameModalVisible(false) }
      >{/*this isnt working wtf ^^^ i dont know why*/}
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter current email"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter current password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
              <TextInput
              style={styles.input}
              placeholder="Enter new email"
              value={newEmail}
              onChangeText={setNewEmail}
            />
            {/* Add input field for new username here */}
            <View style={styles.buttonGroup}>
              <Button title="Change Email" onPress={handleChangeEmail} />
              {/* New button to close the modal */}
              <Button title="Close" onPress={() => setIsChangeUsernameModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    
  },
  closeButtonText: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  buttonContainer: {
    alignItems: 'center',
    width: '80%',
  },
  button: {
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#DDDDDD',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  signOutButton: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'red',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  signOutButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10, // Add some top margin
  },
});

export default AccountPage;

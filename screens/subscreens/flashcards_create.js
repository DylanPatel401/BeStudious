import React, { useState } from 'react';
import { TextInput, Text, View, StyleSheet, Dimensions, ScrollView, TouchableHighlight, Alert, SafeAreaView } from 'react-native'; // Added Alert
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createFlashcardSet, updateSet } from '../../utils/flashcardUtils';
import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebase/firebase';
import { collection, query, where, limit, getDocs } from 'firebase/firestore'; // Added Firestore imports
import { txt, colors } from '../../styles/style'; // Assuming these are your custom styles


export default function FlashcardsCreateScreen({ navigation }) {
    const { width, height } = Dimensions.get('window');
    const [setTitle, setSetTitle] = useState('');
    const [setDescription, setSetDescription] = useState('');
    const [flashcardsData, setFlashcardsData] = useState([
        {
            term: 'JavaScript',
            definition: 'JavaScript is a high-level, interpreted programming language that conforms to the ECMAScript specification.',
        },
    ]);

    const handleAddFlashcard = () => {
        setFlashcardsData([...flashcardsData, { term: '', definition: '' }]);
    };

    const handleUpdateSet = async () => {
        try {
            const flashcardsArray = flashcardsData.map((flashcard) => ({
                term: flashcard.term,
                definition: flashcard.definition,
            }));

            const setId = setTitle.trim().toLowerCase(); // Assuming setId is based on setTitle

            const flashcardSetsRef = collection(FIRESTORE_DB, 'studySets');
            const q = query(flashcardSetsRef, where('setName', '==', setId), where('creatorUID', '==', FIREBASE_AUTH.currentUser.uid), limit(1));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                // Create new set
                await createFlashcardSet(setId, setDescription, flashcardsArray);

                Alert.alert('Set Created', 'New flashcard set created successfully.');
            } else {
                // Update existing set
                await updateSet(setId, flashcardsArray, setTitle, setDescription);
                Alert.alert('Set Updated', 'Flashcard set updated successfully.');
            }
        } catch (error) {
            console.error('Error updating/creating flashcard set:', error);
            Alert.alert('Error', 'Failed to update/create flashcard set.');
        }
    };

    const handleDeleteCard = (index) => {
        const updatedFlashcards = flashcardsData.filter((_, i) => i !== index);
        setFlashcardsData(updatedFlashcards);
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.titleDescriptionContainer}>
                <TextInput
                    style={[txt.mediumText, { fontSize: 22 }]}
                    onChangeText={setSetTitle}
                    value={setTitle}
                    placeholder='Title...'
                />
                <TextInput
                    style={[txt.mediumText, { fontSize: 22 }]}
                    onChangeText={setSetDescription}
                    value={setDescription}
                    placeholder='Description...'
                />
            </View>

            <ScrollView style={styles.termDefinitionContainer}>
                {flashcardsData.map((flashcard, index) => (
                    <View key={index} style={styles.card}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                            <TextInput
                                style={[txt.mediumText, { borderBottomWidth: 1, flex: 1 }]}
                                onChangeText={(text) => {
                                    const updatedFlashcards = [...flashcardsData];
                                    updatedFlashcards[index].term = text;
                                    setFlashcardsData(updatedFlashcards);
                                }}
                                value={flashcard.term}
                                placeholder='Term...'
                            />
                            <TouchableHighlight
                                onPress={() => handleDeleteCard(index)}
                                underlayColor='transparent'
                                style={{ justifyContent: 'center' }}
                            >
                                <MaterialCommunityIcons name='delete' size={24} color='red' />
                            </TouchableHighlight>
                        </View>
                        <TextInput
                            style={[txt.mediumText, { marginTop: 10 }]}
                            onChangeText={(text) => {
                                const updatedFlashcards = [...flashcardsData];
                                updatedFlashcards[index].definition = text;
                                setFlashcardsData(updatedFlashcards);
                            }}
                            value={flashcard.definition}
                            placeholder='Definition...'
                        />
                    </View>
                ))}
            </ScrollView>

            <SafeAreaView style={styles.buttonContainer}>
                <TouchableHighlight
                    style={styles.button}
                    underlayColor={colors.buttonBgActive}
                    onPress={handleAddFlashcard}
                >
                    <Text style={styles.buttonText}>Add Flashcard</Text>
                </TouchableHighlight>

                <TouchableHighlight
                    style={styles.button}
                    underlayColor={colors.buttonBgActive}
                    onPress={handleUpdateSet}
                >
                    <Text style={styles.buttonText}>Update Set</Text>
                </TouchableHighlight>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    titleDescriptionContainer: {
        margin: 10,
    },
    termDefinitionContainer: {
        flex: 1,
    },
    card: {
        flex: 1,
        margin: 10,
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 10,
    },
    button: {
        backgroundColor: colors.buttonBg,
        paddingVertical: 12,
        width: '48%',
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

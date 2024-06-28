import React, { useState, useEffect } from 'react';
import { TextInput, Text, View, StyleSheet, Dimensions, ScrollView, TouchableHighlight, Alert, SafeAreaView } from 'react-native'; // Added Alert
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { updateSet, deleteFlashcardSet } from '../../utils/flashcardUtils';
import { FIREBASE_AUTH, FIRESTORE_DB} from '../../firebase/firebase';
import { collection, query, where, limit, getDocs } from 'firebase/firestore'; // Added Firestore imports
import { txt, colors } from '../../styles/style'; // Assuming these are your custom styles
import { getFlashcardSet } from '../../utils/flashcardUtils';
import { useNavigation } from '@react-navigation/native';

export default function FlashcardsEditScreen({ route, navigation }) {
    const { width, height } = Dimensions.get('window');
    const { id } = route.params;
    const nav = useNavigation();
    const [setTitle, setSetTitle] = useState('');
    const [setDescription, setSetDescription] = useState('');
    const [flashcardsData, setFlashcardsData] = useState([]);

    useEffect(() => {
        getFlashcardSet(id) 
          .then((flashcardSets) => {
            setSetTitle(flashcardSets.setName); // Set title from fetched data
            setSetDescription(flashcardSets.description); // Set description from fetched data
            setFlashcardsData(flashcardSets.flashcards);
          })
          .catch((error) => {
            alert('Error fetching flashcard sets: ' + error);
            console.error('Error fetching flashcard sets:', error);
          });
    }, []);

    const handleAddFlashcard = () => {
        setFlashcardsData([...flashcardsData, { term: '', definition: '' }]);
    };

    const handleUpdateSet = async () => {
        try {
            // Constructing the flashcard object with the updated data
            const updatedFlashcards = flashcardsData.map(flashcard => ({
                term: flashcard.term,
                definition: flashcard.definition,
            }));

            // Update the set
            await updateSet(id, updatedFlashcards, setTitle, setDescription);
            Alert.alert('Set Updated', 'Flashcard set updated successfully.');
        } catch (error) {
            console.error('Error updating flashcard set:', error);
            Alert.alert('Error', 'Failed to update flashcard set.');
        }
    };

    const handleDeleteCard = (index) => {
        const updatedFlashcards = [...flashcardsData];
        updatedFlashcards.splice(index, 1);
        setFlashcardsData(updatedFlashcards);
    };

    const handleDeleteSet = async () => {
        const deleteStatus = await deleteFlashcardSet(id);
        nav.goBack();
        nav.goBack();

        if (deleteStatus) {
            alert('Deleted Set');
        } else {
            alert('Error deleting set!');
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.titleDescriptionContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput
                        style={[txt.mediumText, { fontSize: 22, flex: 1 }]}
                        onChangeText={setSetTitle}
                        value={setTitle}
                        placeholder='Title...'
                    />
                    <MaterialCommunityIcons
                        name='delete'
                        size={24}
                        color='red'
                        onPress={handleDeleteSet}
                        style={{ marginLeft: 10 }}
                    />
                </View>
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

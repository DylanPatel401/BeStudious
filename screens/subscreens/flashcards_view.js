import React, { useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView} from 'react-native';
import { txt, colors } from '../../styles/style'; // Assuming these are your custom styles

import { getFlashcardSet } from '../../utils/flashcardUtils';


// const TITLE = "Flashcards";
// const DESCRIPTION = "Description of the flashcards";

export default function FlashcardsViewscreen({ route, navigation }) {
    const { id } = route.params; // Extracting doc id from route params

    const [flashcardData, setFlashcardData] = useState([]);
    const [title, setTitle] = useState();
    const [description, setDescription] = useState();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showBack, setShowBack] = useState(false);

    useEffect(() => {
      getFlashcardSet(id) 
        .then((flashcardSets) => {
          setFlashcardData(flashcardSets.flashcards);
          setDescription(flashcardSets.description);
          setTitle(flashcardSets.setName);
        })
        .catch((error) => {
          alert('Error fetching flashcard sets: ' + error)
          console.error('Error fetching flashcard sets:', error);
        });
    }, []);

    // CLICK ON THE CARD TO FLIP IT
    // idk if this is intuitive enough? maybe a little message or alert to let someone know they can flip the card...
    // not sure how to handle but its an actual way to study if u cant see both sides of flashcard LUL
    const handleFlip = () => {
        setShowBack(!showBack);
    };

    const handleNextCard = () => {
        if (currentIndex < flashcardData.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setShowBack(false); // Reset to show front of the next card
        }
    };

    const handlePrevCard = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setShowBack(false); // Reset to show front of the previous card
        }
    };
    
    const handleEdit = () => {
        // Navigate to FlashcardEdit screen
        navigation.navigate('Flashcards Edit', { id: id });
      };

    const currentCard = flashcardData[currentIndex] || {}; // Handle case when flashcardData is empty

    return (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description || 'No Description for this set'}</Text>
          </View>
    
          <TouchableOpacity onPress={handleFlip} style={styles.flashcardContainer}>
            <View style={styles.flashcard}>
              <Text style={styles.flashcardText}>{showBack ? currentCard.definition : currentCard.term}</Text>
            </View>
          </TouchableOpacity>
    
          <SafeAreaView style={styles.buttonContainer}>
            <TouchableOpacity onPress={handlePrevCard} style={styles.button}>
              <Text style={styles.buttonText}>Previous</Text>
            </TouchableOpacity>
    
            <TouchableOpacity onPress={handleEdit} style={styles.button}>
              <Text style={styles.buttonText}>Edit Set</Text>
            </TouchableOpacity>
    
            <TouchableOpacity onPress={handleNextCard} style={styles.button}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      );
    }
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
      },
      header: {
        marginBottom: 20,
        marginTop: 30,
      },
      title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 5,
      },
      description: {
        fontSize: 16,
        color: '#666',
      },
      flashcardContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      flashcard: {
        borderWidth: 2,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 20,
        width: '100%',
        aspectRatio: 1.5, // Aspect ratio for a typical flashcard
        justifyContent: 'center',
        alignItems: 'center',
      },
      flashcardText: {
        fontSize: 20,
        textAlign: 'center',
      },
      buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 10,
      },
      button: {
        backgroundColor: colors.buttonBg,
        paddingVertical: 12,
        width: '34%',
        borderRadius: 5,
        alignItems: 'center',
        marginHorizontal: 7
      },
      buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
      },
    });
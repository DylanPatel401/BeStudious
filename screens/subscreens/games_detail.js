import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import firebase from 'firebase/app';
import 'firebase/firestore';

import { txt, colors, btnView } from '../../styles/style';

import { useNavigation } from '@react-navigation/native';

import { createGame, canPlay, updateLeaderboard } from '../../utils/gameUtils';

import {
  collection,
  getDocs,
  query,
  where,
  limit,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';

import { FIREBASE_AUTH, FIRESTORE_DB } from '../../firebase/firebase';

const GameComponent = ({ route }) => {
  const [flashcardSet, setFlashcardSet] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [score, setScore] = useState(0);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [options, setOptions] = useState([]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(null);
  const [answerShown, setAnswerShown] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const { setName, groupName } = route.params;

  const nav = useNavigation();

  useEffect(() => {
    const fetchFlashcardSet = async () => {
      try {
        const flashcardSetsRef = collection(FIRESTORE_DB, 'studySets');
        const q = query(flashcardSetsRef, where('setName', '==', setName), limit(1));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          if (data.flashcards && Array.isArray(data.flashcards)) {
            setFlashcardSet(data.flashcards);
          } else {
            console.log('Invalid flashcards data format');
          }
        } else {
          console.log('No matching documents');
        }
      } catch (error) {
        console.error('Error fetching flashcard set:', error);
      }
    };

    fetchFlashcardSet();
  }, [setName]);

  useEffect(() => {
    if (flashcardSet.length > 0) {
      startNewRound();
    }
  }, [flashcardSet]);

  const startNewRound = () => {
    const termIndex = Math.floor(Math.random() * flashcardSet.length);
    const term = flashcardSet[termIndex].term;
    const correctDefinition = flashcardSet[termIndex].definition;
    const incorrectDefinitions = flashcardSet
      .filter((card) => card.term !== term)
      .map((card) => card.definition)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const options = [...incorrectDefinitions, correctDefinition].sort(() => Math.random() - 0.5);
    const correctOptionIndex = options.indexOf(correctDefinition);

    setSelectedTerm(term);
    setOptions(options);
    setCorrectOptionIndex(correctOptionIndex);
    setAnswerShown(false);
  };

  const handleOptionSelect = (selectedOption, index) => {
    if (answerShown) return;

    if (selectedOption === flashcardSet.find((card) => card.term === selectedTerm).definition) {
      setScore(score + 1);
    }

    setAnswerShown(true);

    setTimeout(() => {
      if (currentRound < 10) {
        setCurrentRound(currentRound + 1);
        startNewRound();
      } else {
        updateLeaderboard(setName, groupName, score);
        setModalVisible(true);
      }
    }, 2000);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={txt.mediumText}>Round: {currentRound}</Text>
        <Text style={txt.mediumText}>Score: {score}</Text>
        <Text style={txt.mediumText}>Term: {selectedTerm}</Text>
      </View>
      <View style={styles.definitionsContainer}>
      <ScrollView verticle showsVerticleScrollIndicator={false} contentContainerStyle={styles.definitionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              answerShown && correctOptionIndex === index ? styles.correctOption : null,
              answerShown && correctOptionIndex !== index ? styles.incorrectOption : null,
            ]}
            onPress={() => handleOptionSelect(option, index)}
            disabled={answerShown}
          >
            <Text style={txt.regularText}>{option}</Text>
          </TouchableOpacity>
        ))}
        </ScrollView>
      </View>
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={txt.mediumText}>Game Over!</Text>
            <Text style={txt.mediumText}>Your Score: {score}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
              <Text style={txt.mediumText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 20,
  },
  definitionsContainer: {
    marginVertical: 20,
    alignItems: 'center',
    flexDirection: 'column',
    paddingBottom: 55,
  },
  optionButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 100,
    paddingVertical: 40,
    marginVertical: 10,
    borderRadius: 5,
  },
  correctOption: {
    backgroundColor: 'green',
  },
  incorrectOption: {
    backgroundColor: 'red',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
  },
});

export default GameComponent;

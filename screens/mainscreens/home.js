import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, TextInput, Modal, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAllGamesbyUserID } from '../../utils/gameUtils';
import { getOwnersFlashcardSet } from '../../utils/flashcardUtils';
import { FIRESTORE_DB, FIREBASE_AUTH } from '../../firebase/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import LeaderboardComponent from '../../components/leaderboard';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import MaterialCommunityIcons

const placeholderImage = require('../../assets/logo-small.png');

export default function HomeScreen({ navigation }) {
    const nav = useNavigation();
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [mostRecentSets, setMostRecentSets] = useState([]);
    const [showGameDropdown, setShowGameDropdown] = useState(false);

    useEffect(() => {
        const fetchMostRecentGame = async () => {
            const userGames = await getAllGamesbyUserID(FIREBASE_AUTH.currentUser.uid);
            setGames(userGames);
            if (userGames.length > 0) {
                setSelectedGame(userGames[0]);
            }
        };
        fetchMostRecentGame();
    }, []);

    useEffect(() => {
        const fetchMostRecentFlashcards = async () => {
            const flashcardSets = await getOwnersFlashcardSet(FIREBASE_AUTH.currentUser.uid);
            setMostRecentSets(flashcardSets);
        };

        fetchMostRecentFlashcards();
    }, []);

    const handleSetsDetailPress = async (setName, createdAt) => {
        const flashcardSetsRef = collection(FIRESTORE_DB, 'studySets');
        const q = query(flashcardSetsRef, where('setName', '==', setName), where('createdAt', '==', createdAt), where('creatorUID', '==', FIREBASE_AUTH.currentUser.uid), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docId = querySnapshot.docs[0].id;
            nav.push('Flashcards View', {
                id: docId,
            });
        } else {
            console.log('No matching document found.');
        }
    };

    const handleGameSelect = (game) => {
        setSelectedGame(game);
        setShowGameDropdown(false);
    };

    const truncateText = (text, maxLength = 20) => {
        if (text.length > maxLength) {
            return text.substring(0, maxLength - 3) + '...';
        }
        return text;
    };

    const handleRefresh = async () => {
        try {
            const userGames = await getAllGamesbyUserID(FIREBASE_AUTH.currentUser.uid);
            setGames(userGames);
    
            const flashcardSets = await getOwnersFlashcardSet(FIREBASE_AUTH.currentUser.uid);
            setMostRecentSets(flashcardSets);
    
            // Trigger a re-render of LeaderboardComponent by setting a new selectedGame
            if (userGames.length > 0) {
                setSelectedGame(userGames[0]);
            } else {
                setSelectedGame(null);
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
    };
    

    return (
        <View style={styles.container}>
            {/* Existing Content: Banner */}
            <View style={styles.banner}>
                <Text style={styles.bannerText}>Keep Studying?</Text>
            </View>

            {/* Refresh Icon */}
            <TouchableOpacity onPress={handleRefresh} style={styles.refreshIcon}>
                <MaterialCommunityIcons name="refresh" size={24} color="black" />
            </TouchableOpacity>

            {/* Existing Content: Study Sets */}
            {mostRecentSets.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.studySetsContainer}>
                    {mostRecentSets.map((studySet, index) => (
                        <TouchableOpacity key={index} onPress={() => handleSetsDetailPress(studySet.setName, studySet.createdAt)}>
                            <View style={styles.studySetCard}>
                                <Image source={placeholderImage} style={styles.studySetImage} />
                                <Text style={styles.setName}>{studySet.setName}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            ) : (
                <Text>No study sets available</Text>
            )}

            {/* Leaderboard */}
            <View style={styles.leaderboardWrapper}>
                <View style={styles.leaderboardTitleContainer}>
                    <Text style={styles.leaderboardTitle}>Leaderboard for:</Text>
                    <TouchableOpacity onPress={() => setShowGameDropdown(true)} style={styles.gameSelector}>
                        <TextInput
                            style={[styles.inputText, selectedGame && styles.darkText]}
                            placeholder="Select a Group"
                            value={selectedGame ? truncateText(selectedGame.groupName + ': ' + selectedGame.setName) : ''}
                            editable={false}
                        />
                    </TouchableOpacity>
                </View>
                {showGameDropdown && (
                    <Modal visible={true} animationType="slide" transparent={true}>
                        <TouchableWithoutFeedback onPress={() => setShowGameDropdown(false)}>
                            <View style={styles.modalBackground}>
                                <View style={styles.modalContainer}>
                                    <ScrollView>
                                        {games.map((game, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                style={styles.dropdownItem}
                                                onPress={() => handleGameSelect(game)}
                                            >
                                                <Text style={selectedGame === game ? styles.selectedItemText : styles.dropdownText}>{game.groupName + ': ' + game.setName || 'No Group Name'}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                )}
                {selectedGame && (
                    <LeaderboardComponent setName={selectedGame.setName} groupName={selectedGame.groupName} />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    banner: {
        marginTop: 50,
        marginBottom: 20,
    },
    bannerText: {
        fontSize: 30,
        fontWeight: 'bold',
    },
    studySetsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    studySetCard: {
        marginRight: 10,
        width: 150,
        height: 250,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        elevation: 3,
    },
    studySetImage: {
        width: '100%',
        height: '70%',
        resizeMode: 'cover',
    },
    setName: {
        padding: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    leaderboardWrapper: {
        width: '90%',
        marginBottom: 40,
    },
    leaderboardTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    leaderboardTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        marginRight: 5,
    },
    gameSelector: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    inputText: {
        padding: 10,
    },
    darkText: {
        color: '#000',
    },
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        maxHeight: 300,
        width: '80%',
    },
    dropdownItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    dropdownText: {
        color: '#000',
    },
    selectedItemText: {
        color: '#000',
        fontWeight: 'bold',
    },
    refreshIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 999,
    },
});
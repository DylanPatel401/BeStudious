import React, { useState, useEffect } from 'react';
import { View, Text, Button, Modal, StyleSheet, TouchableOpacity, ScrollView, Platform, TextInput } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { createGame } from '../../utils/gameUtils';
import { getOwnersGroup } from '../../utils/groupActions';
import { FIRESTORE_DB, FIREBASE_AUTH } from '../../firebase/firebase';

import moment from 'moment';

import DateTimePicker from '@react-native-community/datetimepicker';

export default function CreateGamesScreen() {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [flashcardSets, setFlashcardSets] = useState([]);
    const [selectedFlashcardSet, setSelectedFlashcardSet] = useState(null);
    let [startDate, setStartDate] = useState(new Date());
    let [endDate, setEndDate] = useState(new Date());
    const [showGroupDropdown, setShowGroupDropdown] = useState(false);
    const [showFlashcardSetDropdown, setShowFlashcardSetDropdown] = useState(false);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const nav = useNavigation();

    useEffect(() => {
        fetchOwnerGroups();
    }, []);

    const fetchOwnerGroups = async () => {
        try {
            const ownerGroups = await getOwnersGroup({uid:FIREBASE_AUTH.currentUser.uid});
            console.log(ownerGroups); // Check the structure of ownerGroups
            setGroups(ownerGroups);
        } catch (error) {
            console.error('Error fetching owner groups:', error);
            // Handle error as needed
        }
    };

    const fetchFlashcardSets = async (group) => {
        const flashcardsSets = [];
        for (const setId of group.flashcardSetsId) {
            try {
                const docRef = doc(FIRESTORE_DB, 'studySets', setId);
                const docSnapshot = await getDoc(docRef);

                if (docSnapshot.exists) {
                    flashcardsSets.push(docSnapshot.data());
                } else {
                    console.log(`Document with ID ${setId} does not exist`);
                }
            } catch (error) {
                console.error(`Error fetching document with ID ${setId}:`, error);
            }
        }
        setFlashcardSets(flashcardsSets);
    };

    const handleCreateGame = async () => {
        try {
            if (selectedFlashcardSet == null) {
                throw new Error('You must fill out all the fields!')
            }
            today = new Date();
            if (startDate < today.setDate(today.getDate() - 1)){
                alert('Your selected start date cannot be in the past!')
                startDate = new Date();
                return;
            }

            if (endDate < startDate){
                alert('Your end date cannot be before your start date!')
                endDate = startDate;
                return;
            }

            // Convert startDate and endDate to moment objects
            const formattedStartDate = moment(startDate).format('YYYY-MM-DD');
            const formattedEndDate = moment(endDate).format('YYYY-MM-DD');
            
            // Call the createGame function with the selected group and flashcard set IDs
            await createGame(selectedFlashcardSet.setName, selectedGroup.name, formattedStartDate, formattedEndDate);
        } catch (error) {
            console.error('Error creating game:', error);
            alert('Error creating game: ' + error)
            // Handle error as needed
        }
    };
    
    const renderGroupDropdown = () => {
        if (showGroupDropdown) {
            return (
                <Modal visible={true} animationType="slide" transparent={true}>
                    <TouchableOpacity style={styles.modalBackground} onPress={() => setShowGroupDropdown(false)}>
                        <View style={styles.modalContainer}>
                            <ScrollView>
                                {groups.length > 0 && groups.map(group => (
                                    <TouchableOpacity
                                        key={group.name}
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            setSelectedGroup(group);
                                            setShowGroupDropdown(false);
                                            fetchFlashcardSets(group);
                                        }}
                                    >
                                        <Text style={selectedGroup === group ? styles.selectedItemText : styles.dropdownText}>{group.name || 'No Group Name'}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </Modal>
            );
        }
        return null;
    };
    
    const renderFlashcardSetDropdown = () => {
        if (showFlashcardSetDropdown) {
            return (
                <Modal visible={true} animationType="slide" transparent={true}>
                    <TouchableOpacity style={styles.modalBackground} onPress={() => setShowFlashcardSetDropdown(false)}>
                        <View style={styles.modalContainer}>
                            <ScrollView>
                                {flashcardSets.map(flashcardSet => (
                                    <TouchableOpacity
                                        key={flashcardSet.createdAt}
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            setSelectedFlashcardSet(flashcardSet);
                                            setShowFlashcardSetDropdown(false);
                                        }}
                                    >
                                        <Text style={selectedFlashcardSet === flashcardSet ? styles.selectedItemText : styles.dropdownText}>{flashcardSet.setName || 'No Set Found'}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </Modal>
            );
        }
        return null;
    };

    const renderDateTimePicker = (isStartDatePicker) => {
        if ((isStartDatePicker && showStartDatePicker) || (!isStartDatePicker && showEndDatePicker)) {
            return (
                <DateTimePicker
                    value={isStartDatePicker ? startDate : endDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        if (isStartDatePicker) {
                            setShowStartDatePicker(false);
                            if (selectedDate) {
                                setStartDate(selectedDate);
                            }
                        } else {
                            setShowEndDatePicker(false);
                            if (selectedDate) {
                                setEndDate(selectedDate);
                            }
                        }
                    }}
                />
            );
        }
        return null;
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => setShowGroupDropdown(true)} style={styles.inputField}>
                <Text style={styles.label}>Select a Group:</Text>
                <TextInput
                    style={[styles.inputText, selectedGroup && styles.darkText]}
                    placeholder="Select a Group"
                    value={selectedGroup ? selectedGroup.name : ''}
                    editable={false}
                />
            </TouchableOpacity>
            {renderGroupDropdown()}

            <TouchableOpacity onPress={() => setShowFlashcardSetDropdown(true)} style={styles.inputField}>
                <Text style={styles.label}>Select a Flashcard Set:</Text>
                <TextInput
                    style={[styles.inputText, selectedFlashcardSet && styles.darkText]}
                    placeholder="Select a Flashcard Set"
                    value={selectedFlashcardSet ? selectedFlashcardSet.setName : ''}
                    editable={false}
                />
            </TouchableOpacity>
            {renderFlashcardSetDropdown()}

            {/* Start Date Picker */}
            <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.inputField}>
                <Text style={styles.label}>Start Date:</Text>
                <TextInput
                    style={[styles.inputText, styles.darkText]}
                    placeholder="Select Start Date"
                    editable={false}
                    value={formatDate(startDate)}
                />
            </TouchableOpacity>
            {renderDateTimePicker(true)}

            {/* End Date Picker */}
            <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.inputField}>
                <Text style={styles.label}>End Date:</Text>
                <TextInput
                    style={[styles.inputText, styles.darkText]}
                    placeholder="Select End Date"
                    editable={false}
                    value={formatDate(endDate)}
                />
            </TouchableOpacity>
            {renderDateTimePicker(false)}

            <Button title="Create Game" onPress={handleCreateGame} style={styles.createButton} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    inputField: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    inputText: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    darkText: {
        color: '#000', // Change to dark color when selected
    },
    selectedItemText: {
        color: '#000', // Dark color for selected item
        fontWeight: 'bold', // Bold style for selected item
    },
    createButton: {
        marginTop: 'auto',
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
        color: '#000', // Default color for dropdown items
    },
});

function formatDate(date) {
    const formattedDate = new Date(date);
    const mm = String(formattedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(formattedDate.getDate()).padStart(2, '0');
    const yyyy = formattedDate.getFullYear();
    return `${mm}-${dd}-${yyyy}`;
}

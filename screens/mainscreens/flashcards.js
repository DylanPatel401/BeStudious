import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, TouchableOpacity, ScrollView} from 'react-native';
import { Collapse, CollapseHeader, CollapseBody } from 'accordion-collapse-react-native';
import { useNavigation } from '@react-navigation/native';
import { userGroupFlashSets, groupWithNestedFlashcards } from '../../utils/groupActions';
import { txt, colors } from '../../styles/style';
import { FIREBASE_AUTH } from '../../firebase/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getOwnersFlashcardSet } from '../../utils/flashcardUtils';

const txtpad = 15;

export default function FlashcardsScreen() {
    const nav = useNavigation();
    const uid = FIREBASE_AUTH.currentUser.uid;

    const [groupFlashcard, setGroupFlashcard] = useState(null);
    const [ownerFlashcards, setOwnerFlashcards] = useState(null);

    async function getData() {
        const flashcardData = await groupWithNestedFlashcards(uid);
        const ownerFlashcards = await getOwnersFlashcardSet(uid);
        setGroupFlashcard(flashcardData);
        setOwnerFlashcards(ownerFlashcards);
    }

    useEffect(() => {
        getData();
    }, []);

    const handleFlashcardsEditPress = (id, data) => {
        nav.push('Flashcards View', {
            id: id,
        });
    };

    const formatTimestampToDate = (timestamp) => {
        const dateObject = timestamp.toDate(); 
        return dateObject.toLocaleDateString(); 
    };

    const RenderCollapsableGroup = () => {
        if (!groupFlashcard) {
            return (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <ActivityIndicator size="large" />
                </View>
            );
        }

        return (
            <View style={styles.scrollview}>
                <View>
                    {groupFlashcard?.map((group, index) => (
                        <Collapse key={index}>
                            <CollapseHeader>
                                <View style={dropStyles.groupNameContainer}>
                                    {
                                        (group.ownerId == uid) ? 
                                        (
                                            <View style={{ flexDirection: 'row' }}>
                                                <View style={{ marginRight: 10 }}>
                                                    <MaterialCommunityIcons name="crown-outline" color={'black'} size={22} />
                                                </View>
                                                <Text style={dropStyles.groupNameText}>
                                                    {group.name}
                                                </Text>
                                            </View>
                                        ) 
                                        :
                                        (
                                            <Text style={dropStyles.groupNameText}>
                                                {group.name}
                                            </Text>
                                        )
                                    }
                                </View>
                            </CollapseHeader>
                            <CollapseBody>
                                <View>
                                    {group.flashcards.length < 1 ? (
                                        <View style={dropStyles.toggleableContent}>
                                            <Text style={[dropStyles.contentText, { color: 'grey', textAlign: 'right' }]}>
                                                Group has no flashcard attached
                                            </Text>
                                        </View>
                                    ) : (
                                        group?.flashcards?.map((flashcard, idx) => (
                                            <TouchableOpacity 
                                                key={idx} 
                                                onPress={() => handleFlashcardsEditPress(flashcard.flashcardId, group.flashcards)}
                                            >
                                                <View key={idx} style={dropStyles.toggleableContent}>
                                                    <Text style={dropStyles.contentText}>
                                                        {flashcard?.setName}
                                                    </Text>
                                                    <Text>
                                                        {`Date created: ${formatTimestampToDate(flashcard?.createdAt)}`}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))
                                    )}
                                </View>
                            </CollapseBody>
                        </Collapse>
                    ))}
                </View>
            </View>
        );
    };

    const RenderCollapsable = () => {
        return (
            <ScrollView style={styles.scrollview}>
                <Collapse>
                    <CollapseHeader>
                        <View style={dropStyles.groupNameContainer}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={dropStyles.groupNameText}>
                                    Groups Flashcard Sets
                                </Text>
                            </View>
                        </View>
                    </CollapseHeader>
                    <CollapseBody>
                        <RenderCollapsableGroup />
                    </CollapseBody>
                </Collapse>

                <Collapse>
                    <CollapseHeader>
                        <View style={dropStyles.groupNameContainer}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={dropStyles.groupNameText}>
                                    Your Flashcard Sets
                                </Text>
                            </View>
                        </View>
                    </CollapseHeader>
                    <CollapseBody>
                        <View>
                            {ownerFlashcards?.map((flashcard, idx) => {
                                return (
                                    <View key={idx}>
                                        <TouchableOpacity 
                                            key={idx} 
                                            onPress={() => handleFlashcardsEditPress(flashcard.flashcardId)}
                                        >
                                            <View key={idx} style={dropStyles.toggleableContent}>
                                                <Text style={dropStyles.contentText}>
                                                    {flashcard?.setName}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                        </View>
                    </CollapseBody>
                </Collapse>
            </ScrollView>
        );
    };

    const handleFlashcardsCreatePress = () => {
        nav.navigate('Flashcards Create');
    };

    return (
        <View style={styles.container}>
            <View style={{ margin: 5, justifyContent: 'center' }}>
                <Text style={[txt.mediumText, { textAlign: 'center', color: 'black' }]}>
                    Group Flashcard Sets
                </Text>
            </View>

            <View style={{ flex: 15 }}>
                <RenderCollapsable />
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleFlashcardsCreatePress} style={[styles.button, { backgroundColor: colors.secondary }]}>
                    <Text style={styles.buttonText}>Create a New Set</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => getData()} style={[styles.button, { backgroundColor: colors.secondary }]}>
                    <Text style={styles.buttonText}>Refresh Screen</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollview: { flex: 10, margin: 20 },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 },
    button: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
    buttonText: { color: 'white', textAlign: 'center', fontSize: 16 },
});

const dropStyles = StyleSheet.create({
    groupNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 5,
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
    },
    groupNameText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 5,
    },
    toggleableContent: {
        marginTop: 10,
        marginLeft: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: '#cccccc',
        borderRadius: 5,
    },
    contentText: {
        fontSize: 16,
    },
});

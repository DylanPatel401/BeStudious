import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, query, where, orderBy, getDocs, getDoc } from 'firebase/firestore';
import { FIRESTORE_DB } from '../firebase/firebase';
import { useNavigation } from '@react-navigation/native';
import { getDisplayName } from '../utils/authUtils';

const LeaderboardComponent = ({ setName, groupName }) => {
    const [loading, setLoading] = useState(true);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const navigation = useNavigation();

    const handleTilePress = () => {
        navigation.navigate('Games Detail', {
            setName: setName,
            groupName: groupName,
        });
    };

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            const gamesCollectionRef = collection(FIRESTORE_DB, 'games');
            const q = query(
                gamesCollectionRef,
                where('setName', '==', setName),
                where('groupName', '==', groupName),
                orderBy('endDate', 'desc')
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const docRef = querySnapshot.docs[0].ref;
                const gameDocRef = await getDoc(docRef);
                const leaderboard = gameDocRef.data().leaderboard || [];
                leaderboard.sort((a, b) => b.score - a.score);
                
                const leaderboardWithDisplayNames = await Promise.all(
                    leaderboard.map(async (entry) => {
                        const displayName = await getDisplayName({ uid: entry.id });
                        return { ...entry, displayName };
                    })
                );

                setLeaderboardData(leaderboardWithDisplayNames);
            } else {
                setLeaderboardData([]);
            }
            setLoading(false);
        };

        fetchLeaderboardData();
    }, [setName, groupName]);

    if (loading) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={styles.container}>
            {/* <Text style={styles.leaderboardTitle}>Group "{groupName}" Leaderboard</Text> */}
            {leaderboardData.length > 0 ? (
                leaderboardData.map((entry, index) => (
                    <TouchableOpacity key={index} onPress={handleTilePress}>
                        <View style={styles.leaderboardEntry}>
                            <Text>{entry.displayName}</Text>
                            <Text>Points: {entry.score}</Text>
                        </View>
                    </TouchableOpacity>
                ))
            ) : (
                <Text style={styles.placeholderText}>You don't have any active games</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    leaderboardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    leaderboardEntry: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 5,
    },
    placeholderText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
    },
});

export default LeaderboardComponent;
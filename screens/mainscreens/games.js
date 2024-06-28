import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableHighlight, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { canPlay, getAllGamesbyUserID, deleteGame } from '../../utils/gameUtils';
import { txt, colors } from '../../styles/style';
import { FIREBASE_AUTH } from '../../firebase/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Added MaterialCommunityIcons

const txtpad = 15;

export default function GamesScreen() {
  const nav = useNavigation();
  const [gameData, setGameData] = useState([]);

  async function fetchGameData() {
    try {
      const games = await getAllGamesbyUserID(FIREBASE_AUTH.currentUser.uid);
      setGameData(games);
    } catch (error) {
      alert('Error fetching games: ' + error);
      console.error('Error fetching games:', error);
    }
  }

  useEffect(() => {
    fetchGameData();
  }, []);

  const handleGamesDetailPress = async (setName, groupName) => {
    const canPlayToday = await canPlay(setName, groupName);
    if (canPlayToday) {
      nav.push('Games Detail', {
        setName: setName,
        groupName: groupName,
      });
    } else {
      alert("You can't play this today!");
    }
  };

  const handleCreateGamePress = () => {
    nav.push('Game Create');
  };

  const handleDeleteGame = async (setName, groupName) => {
    try {
      const deleteStatus = await deleteGame(setName, groupName); // Assuming deleteGame method is available in gameUtils
      if (deleteStatus) {
        const updatedGameData = gameData.filter((game) => game.setName !== setName || game.groupName !== groupName);
        setGameData(updatedGameData);
        alert('Game deleted successfully.');
      } else {
        alert('Error deleting game.');
      }
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Error deleting game.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ margin: 25, justifyContent: 'center' }}>
        <Text style={[txt.mediumText, { textAlign: 'center', color: 'black' }]}>Your Games!</Text>
      </View>

      <View style={{ flex: 7 }}>
        <FlatList
          data={gameData}
          keyExtractor={(item) => `${item.setName}-${item.createdAt}`}
          renderItem={({ item }) => (
            <TouchableHighlight
              key={`${item.setName}-${item.createdAt}`}
              style={styles.gameButton}
              onPress={() => handleGamesDetailPress(item.setName, item.groupName)}
            >
              <View style={styles.gameView}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.gameText}>{item.groupName + ": " + item.setName/*moment(item.date).format('M/D/YYYY')*/}</Text>
                  <MaterialCommunityIcons
                    name='delete'
                    size={24}
                    color='red'
                    style={styles.deleteButton}
                    onPress={() => handleDeleteGame(item.setName, item.groupName)} // Passes setName and groupName to handleDeleteGame
                  />
                </View>
                <Text style={styles.validityText}>
                  Game valid from: {moment(item.startDate).format('M/D/YYYY')} to {moment(item.endDate).format('M/D/YYYY')}
                </Text>
                <Text style={styles.lastPlayedText}>
                  Last played: {moment(item.leaderboard.find((item) => item.id === FIREBASE_AUTH.currentUser.uid)?.date).format('M/D/YYYY') || 'Invalid'}
                </Text>
                <Text style={styles.scoreText}>
                  Score: {item.leaderboard.find((item) => item.id === FIREBASE_AUTH.currentUser.uid)?.score || 0}
                </Text>
              </View>
            </TouchableHighlight>
          )}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableHighlight onPress={fetchGameData} style={[styles.button, { backgroundColor: colors.secondary }]}>
          <Text style={styles.buttonText}>Refresh Game Data</Text>
        </TouchableHighlight>

        <TouchableHighlight onPress={handleCreateGamePress} style={[styles.button, { backgroundColor: colors.secondary }]}>
          <Text style={styles.buttonText}>Create New Game</Text>
        </TouchableHighlight>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  gameButton: { backgroundColor: colors.secondary, marginBottom: 10 },
  gameView: { padding: txtpad },
  gameText: [txt.regularText, { color: 'white' }],
  validityText: { color: 'white', marginTop: 5 },
  lastPlayedText: { color: 'white', marginTop: 5 },
  scoreText: { color: 'white', marginTop: 5 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 },
  button: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  buttonText: { color: 'white', textAlign: 'center', fontSize: 16 },
  deleteButton: {
    padding: 5,
    borderRadius: 15,
    backgroundColor: 'transparent',
    marginRight: 10,
  },
});

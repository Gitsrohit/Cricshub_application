import { StyleSheet, Text, View, FlatList, ImageBackground, StatusBar, TouchableHighlight, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const background = require('../../assets/images/cricsLogo.png');
const cardGradientColors = ['#4A90E2', '#6BB9F0'];

const ScoreCard = ({ route }) => {
  const { matchId } = route.params;
  const [team, setTeam] = useState(null);
  const [matchState, setMatchState] = useState(null);

  const getMatchState = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await axios.get(
        `https://score360-7.onrender.com/api/v1/matches/matchstate/${matchId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMatchState(response.data);
      setTeam(response.data.team1.name);
      console.log(response.data);

    } catch (error) {
      console.error('Error fetching match state:', error);
    }
  };

  useEffect(() => {
    getMatchState();
  }, []);

  if (!matchState) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const renderBattingOrder = (team, battingOrder) => {
    const orderedBatting = [
      ...battingOrder,
      ...team?.playingXI.filter(player => !battingOrder?.some(b => b?.playerId === player?.playerId))
    ];

    return (
      <FlatList
        data={orderedBatting}
        keyExtractor={(item) => item.playerId}
        renderItem={({ item }) => {
          const playerStats = team.playingXI.find(p => p.playerId === item.playerId) || {};
          return (
            <View style={styles.playerRow}>
              <Text style={styles.playerName}>{item.name}</Text>
              <Text style={styles.stats}>Runs: {playerStats.runs || 0}, Balls: {playerStats.ballsFaced || 0}</Text>
              <Text style={styles.stats}>4s: {playerStats.fours || 0}, 6s: {playerStats.sixes || 0}, SR: {playerStats.strikeRate ? playerStats.strikeRate.toFixed(2) : 0}</Text>
              <Text style={styles.stats}>Bowling: Wickets-{playerStats.wicketsTaken || 0}, Runs conceded- {playerStats.runsConceded || 0}</Text>
            </View>
          );
        }}
      />
    );
  };

  return (
    <LinearGradient colors={['#000000', '#0A303B', '#36B0D5']} style={styles.gradient}>
      <ImageBackground source={background} style={styles.background} imageStyle={styles.backgroundImage}>
        <LinearGradient colors={cardGradientColors} style={styles.teamButton}>
          <View style={styles.teamContainer}>
            <Text style={styles.teamName}>{matchState.team1.name}</Text>
            <Text style={styles.runsWicket}>{matchState.team1.score}-{matchState.team1.wickets}</Text>
          </View>
          <View style={styles.teamContainer}>
            <Text style={styles.teamName}>{matchState.team2.name}</Text>
            <Text style={styles.runsWicket}>{matchState.team2.score}-{matchState.team2.wickets}</Text>
          </View>
        </LinearGradient>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => setTeam(matchState.team1.name)}>
            <Text style={styles.buttonText}>{matchState.team1.name}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setTeam(matchState.team2.name)}>
            <Text style={styles.buttonText}>{matchState.team2.name}</Text>
          </TouchableOpacity>
        </View>

        {/* Batting Orders */}
        {team === matchState.team1.name && (
          <View style={styles.orderContainer}>
            <Text style={styles.title}>Batting Order - {matchState.team1.name}</Text>
            {renderBattingOrder(matchState.team1, matchState.team1BattingOrder)}
          </View>
        )}

        {team === matchState.team2.name && (
          <View style={styles.orderContainer}>
            <Text style={styles.title}>Batting Order - {matchState.team2.name}</Text>
            {renderBattingOrder(matchState.team2, matchState.team2BattingOrder)}
          </View>
        )}
      </ImageBackground>
    </LinearGradient>
  );
};

export default ScoreCard;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  background: {
    flex: 1,
    alignItems: 'center',
  },
  backgroundImage: {
    resizeMode: 'cover',
    opacity: 0.8,
  },
  teamButton: {
    width: '100%',
    padding: 10,
    marginTop: StatusBar.currentHeight || 0,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  teamName: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  runsWicket: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  orderContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    width: '90%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  playerRow: {
    paddingVertical: 5,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  stats: {
    fontSize: 14,
    color: 'black',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#6BB9F0',
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

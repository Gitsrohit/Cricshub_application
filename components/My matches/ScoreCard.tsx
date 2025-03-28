import { StyleSheet, Text, View, FlatList, ImageBackground, StatusBar } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const background = require('../../assets/images/cricsLogo.png');
const cardGradientColors = ['#4A90E2', '#6BB9F0'];

const ScoreCard = ({ route }) => {
  const [matchState, setMatchState] = useState(null);
  const { matchId } = route.params;

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
      console.log(response.data);
      setMatchState(response.data);
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

        {/* Batting & Bowling Order */}
        <View style={styles.orderContainer}>
          <Text style={styles.title}>Batting & Bowling Stats</Text>
          <FlatList
            data={matchState.battingTeamPlayingXI}
            keyExtractor={(item) => item.playerId}
            renderItem={({ item }) => (
              <View style={styles.playerRow}>
                <Text style={styles.playerName}>{item.name}</Text>
                <Text style={styles.stats}>Runs: {item.runs}, Balls: {item.ballsFaced}</Text>
                <Text style={styles.stats}>4s: {item.fours}, 6s: {item.sixes}, SR: {item.strikeRate.toFixed(2)}</Text>
              </View>
            )}
          />

          <Text style={styles.title}>Batting & Bowling Stats</Text>
          <FlatList
            data={matchState.bowlingTeamPlayingXI}
            keyExtractor={(item) => item.playerId}
            renderItem={({ item }) => (
              <View style={styles.playerRow}>
                <Text style={styles.playerName}>{item.name}</Text>
                <Text style={styles.stats}>Overs: {item.overs}, Balls: {item.ballsBowled}</Text>
                <Text style={styles.stats}>Wickets: {item.wicketsTaken}, Economy: {item.economyRate.toFixed(2)}</Text>
              </View>
            )}
          />
        </View>
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
    marginTop: StatusBar?.currentHeight,
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
});

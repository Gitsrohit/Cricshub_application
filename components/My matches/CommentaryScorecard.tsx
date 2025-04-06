import { StyleSheet, Text, View, FlatList, ImageBackground, StatusBar, TouchableHighlight, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import EventSource from 'react-native-event-source';

const background = require('../../assets/images/cricsLogo.png');

const CommentaryScorecard = ({ route }) => {
  const [matchId, setMatchId] = useState(route.params.matchId);
  const [team, setTeam] = useState(null);
  const [matchState, setMatchState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [strikerStats, setStrikerStats] = useState(null);
  const [nonStrikerStats, setNonStrikerStats] = useState(null);
  const [bowlerStats, setBowlerStats] = useState(null);

  const getMatchState = async () => {
    try {
      setLoading(true)
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
      setMatchId(response.data.matchId);
      setTeam(response.data.team1.name);
      console.log(response.data);
      console.log(response.data.matchId);
      setStrikerStats(response.data.battingTeam.playingXI.find(player => player.playerId === response.data.currentStriker.playerId));
      setNonStrikerStats(response.data.battingTeam.playingXI.find(player => player.playerId === response.data.currentNonStriker.playerId));
      setBowlerStats(response.data.bowlingTeam.playingXI.find(player => player.playerId === response.data.currentBowler.playerId));

    } catch (error) {
      console.error('Error fetching match state:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMatchState();
  }, []);

  const getLiveMatchUpdates = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const eventSource = new EventSource(
        `https://score360-7.onrender.com/api/v1/matches/${matchId}/subscribe`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      eventSource.addEventListener('ball-update', (event) => {
        const data = JSON.parse(event.data);
        console.log(data);
        setMatchState(data);
      });
      eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    getLiveMatchUpdates();
  }, [matchId]);

  const renderItem = ({ item }) => {
    const cleanedCommentary = item.commentary.replace(/[*\\"/]/g, '');

    return (
      <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#36B0D5' }}>
        <Text style={{ color: 'black', fontSize: 14 }}>{cleanedCommentary}</Text>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#000000', '#0A303B', '#36B0D5']} style={styles.gradient}>
      <ImageBackground source={background} style={styles.background} imageStyle={styles.backgroundImage}>
        <View style={{ marginTop: StatusBar?.currentHeight | 0 }}>
          {loading ? <ActivityIndicator color='#002233' />
            : (
              <View>
                <LinearGradient colors={['#4A90E2', '#6BB9F0']} style={styles.scoreCard}>
                  <View style={styles.teamScore}>
                    <Text style={{ color: '#fff', fontSize: 18, paddingBottom: 4, fontWeight: '800' }}>{matchState.team1.name}</Text>
                    <Text style={{ color: '#fff', fontSize: 18, paddingBottom: 4 }}>{matchState.team1.score}-{matchState.team1.wickets}</Text>
                  </View>
                  <View style={styles.teamScore}>
                    <Text style={{ color: '#fff', fontSize: 18, paddingBottom: 4, fontWeight: '800' }}>{matchState.team2.name}</Text>
                    <Text style={{ color: '#fff', fontSize: 18, paddingBottom: 4 }}>{matchState.team2.score}-{matchState.team2.wickets}</Text>
                  </View>
                  <View style={styles.playerDetails}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={styles.playerStats}>{strikerStats.name}</Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <Text style={styles.playerStats}>{strikerStats.runs}</Text>
                        <Text style={styles.playerStats}>({strikerStats.ballsFaced})</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={styles.playerStats}>{nonStrikerStats.name}</Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <Text style={styles.playerStats}>{nonStrikerStats.runs}</Text>
                        <Text style={styles.playerStats}>({nonStrikerStats.ballsFaced})</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                      <Text style={styles.playerStats}>{bowlerStats.name}</Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <Text style={styles.playerStats}>{bowlerStats.wicketsTaken}-</Text>
                        <Text style={styles.playerStats}>{bowlerStats.runsConceded}</Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
                <View style={styles.commentaryContainer}>
                  <FlatList
                    data={matchState.innings1Overs.flat().reverse()}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItem}
                    ListHeaderComponent={() => (
                      <Text style={{ fontSize: 18, fontWeight: '700', paddingVertical: 8 }}>Live commentary</Text>
                    )}
                  />
                </View>
              </View>
            )
          }
        </View>

      </ImageBackground>
    </LinearGradient>
  )
}

export default CommentaryScorecard

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  background: {
    flex: 1,
    alignItems: 'center',
  },
  backgroundImage: {
    width: '100%',
    resizeMode: 'cover',
    opacity: 0.8,
  },
  scoreCard: {
    width: '100%',
    padding: 14,
    marginTop: 20,
    borderRadius: 12
  },
  teamScore: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  playerDetails: {
    borderTopColor: 'white',
    borderTopWidth: 1,
    // backgroundColor: '#fff',
    // padding: 16,
    // margin: 10,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  playerStats: {
    // color: 'black',
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  commentaryContainer: {
    padding: 12,
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 10,
    flex: 1,
  },
})
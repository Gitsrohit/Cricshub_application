import { StyleSheet, Text, View, TouchableOpacity, FlatList, ImageBackground, ScrollView, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import stadiumBG from '../../assets/images/stadiumBG.jpg';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';

const SelectPlayingXI = ({ route }) => {
  const navigation = useNavigation();
  const { matchDetails, matchId } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [team1Details, setTeam1Details] = useState(null);
  const [team2Details, setTeam2Details] = useState(null);

  const [selectedTeam1, setSelectedTeam1] = useState([]);
  const [selectedTeam2, setSelectedTeam2] = useState([]);

  const fetchTeamsDetails = async () => {
    const token = await AsyncStorage.getItem('jwtToken');
    if (!token) {
      setError('Please login again');
      return;
    }

    try {
      const response1 = await axios.get(`https://score360-7.onrender.com/api/v1/teams/${matchDetails.team1Id}`, {
        headers: { authorization: `Bearer ${token}` }
      });

      const response2 = await axios.get(`https://score360-7.onrender.com/api/v1/teams/${matchDetails.team2Id}`, {
        headers: { authorization: `Bearer ${token}` }
      });

      setTeam1Details(response1.data.data);
      setTeam2Details(response2.data.data);
    } catch (err) {
      setError('Sorry, unable to fetch team details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamsDetails();
  }, []);

  const togglePlayerSelection = (team, playerId) => {
    if (team === 1) {
      setSelectedTeam1((prev) =>
        prev.includes(playerId)
          ? prev.filter((id) => id !== playerId) // Deselect if already selected
          : prev.length < 11
            ? [...prev, playerId] // Add player if less than 11 selected
            : prev
      );
    } else {
      setSelectedTeam2((prev) =>
        prev.includes(playerId)
          ? prev.filter((id) => id !== playerId)
          : prev.length < 11
            ? [...prev, playerId]
            : prev
      );
    }
  };

  const renderPlayer = ({ item, team }) => (
    <TouchableOpacity
      style={[
        styles.playerButton,
        (team === 1 ? selectedTeam1 : selectedTeam2).includes(item.id) && styles.selectedPlayer
      ]}
      onPress={() => togglePlayerSelection(team, item.id)}
    >
      <Text style={styles.playerText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const handleNextButtonClick = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("Please login again");
      const response = await axios.post(`https://score360-7.onrender.com/api/v1/matches/${matchId}/start`,
        {
          tournamentId: null,
          team1PlayingXIIds: selectedTeam1,
          team2PlayingXIIds: selectedTeam2,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigation.navigate('Toss', { matchDetails, matchId });
    } catch (err) {
      console.log(err);
    }
  }

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>{error}</Text>;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#0A303B', '#36B0D5']} style={styles.gradient}>
        <ImageBackground source={stadiumBG} resizeMode='cover' style={styles.background}>
          <ScrollView style={{ width: '100%' }}>
            <Text style={styles.heading}>Select Playing XI</Text>

            {/* Team 1 Players */}
            <BlurView style={styles.teamSelect} intensity={50}>
              <Text style={styles.teamTitle}>{team1Details?.name} Players</Text>
              <FlatList
                data={team1Details?.players}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => renderPlayer({ item, team: 1 })}
                numColumns={2}
              />
            </BlurView>

            {/* Team 2 Players */}
            <BlurView style={styles.teamSelect} intensity={50}>
              <Text style={styles.teamTitle}>{team2Details?.name} Players</Text>
              <FlatList
                data={team2Details?.players}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => renderPlayer({ item, team: 2 })}
                numColumns={2}
              />
            </BlurView>

            <Pressable onPress={handleNextButtonClick}>
              <Text style={styles.nextButton}>{selectedTeam1.length === 11 && selectedTeam2.length === 11 ? `Next` : 'Select 11'}</Text>
            </Pressable>
          </ScrollView>
        </ImageBackground>
      </LinearGradient>
    </View>
  );
};

export default SelectPlayingXI;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
  },
  background: {
    flex: 1,
    // width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gradient: {
    flex: 1,
    width: '100%',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: 'white',
  },
  teamTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: 'white',
  },
  playerButton: {
    flex: 1,
    padding: 10,
    margin: 5,
    backgroundColor: '#ddd',
    borderRadius: 5,
    alignItems: 'center',
  },
  selectedPlayer: {
    backgroundColor: '#4CAF50',
  },
  playerText: {
    fontSize: 16,
  },
  teamSelect: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginTop: 10,
  },
  nextButton: {
    color: 'white',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#d9534f',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 18,
  },
});

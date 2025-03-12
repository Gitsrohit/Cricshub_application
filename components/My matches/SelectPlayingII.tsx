import { StyleSheet, Text, View, TouchableOpacity, FlatList, ImageBackground, ScrollView, Pressable, Modal } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import stadiumBG from '../../assets/images/stadiumBG.jpg';
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

  const [team1ModalVisible, setTeam1ModalVisible] = useState(true);
  const [team2ModalVisible, setTeam2ModalVisible] = useState(false);

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
        prev.includes(playerId) ? prev.filter((id) => id !== playerId) : prev.length < 11 ? [...prev, playerId] : prev
      );
    } else {
      setSelectedTeam2((prev) =>
        prev.includes(playerId) ? prev.filter((id) => id !== playerId) : prev.length < 11 ? [...prev, playerId] : prev
      );
    }
  };

  const renderPlayer = ({ item, team }) => (
    <TouchableOpacity
      style={[styles.playerButton, (team === 1 ? selectedTeam1 : selectedTeam2).includes(item.id) && styles.selectedPlayer]}
      onPress={() => togglePlayerSelection(team, item.id)}
    >
      <Text style={styles.playerText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const handleStartMatch = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("Please login again");
      await axios.post(
        `https://score360-7.onrender.com/api/v1/matches/${matchId}/start`,
        {
          tournamentId: null,
          team1PlayingXIIds: selectedTeam1,
          team2PlayingXIIds: selectedTeam2,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTeam2ModalVisible(false);
      navigation.navigate('Toss', { matchDetails, matchId });
    } catch (err) {
      console.log(err);
    }
  };

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>{error}</Text>;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#0A303B', '#36B0D5']} style={styles.gradient}>
        <ImageBackground source={stadiumBG} resizeMode='cover' style={styles.background} imageStyle={styles.backgroundImage}>
          <Modal visible={team1ModalVisible} transparent>
            <ScrollView style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{team1Details?.name} - Select Playing XI</Text>
                <FlatList data={team1Details?.players} keyExtractor={(item) => item.id} renderItem={({ item }) => renderPlayer({ item, team: 1 })} />
                {selectedTeam1.length === 11 && (
                  <Pressable onPress={() => { setTeam1ModalVisible(false); setTeam2ModalVisible(true); }}>
                    <Text style={styles.nextButton}>Next</Text>
                  </Pressable>
                )}
              </View>
            </ScrollView>
          </Modal>

          <Modal visible={team2ModalVisible} transparent>
            <ScrollView style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{team2Details?.name} - Select Playing XI</Text>
                <FlatList data={team2Details?.players} keyExtractor={(item) => item.id} renderItem={({ item }) => renderPlayer({ item, team: 2 })} />
                {selectedTeam2.length === 11 && (
                  <Pressable onPress={handleStartMatch}>
                    <Text style={styles.nextButton}>Next</Text>
                  </Pressable>
                )}
              </View>
            </ScrollView>
          </Modal>
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
    backgroundColor: '#fff'
  },
  background: {
    flex: 1,
    // width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  backgroundImage: {
    resizeMode: 'cover',
    opacity: 0.8
  },
  gradient: {
    flex: 1,
    width: '100%'
  },
  modalContainer: {
    height: '80%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: '10%',
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10
  },
  playerButton: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#ddd',
    borderRadius: 5,
    alignItems: 'center'
  },
  selectedPlayer: {
    backgroundColor: '#4CAF50'
  },
  playerText: {
    fontSize: 16
  },
  nextButton: {
    textAlign: 'center',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#d9534f',
    color: 'white',
    marginTop: 10,
    fontSize: 18
  },
});

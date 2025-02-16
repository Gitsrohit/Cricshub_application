import { Alert, FlatList, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import stadiumBG from '../../assets/images/stadiumBG.jpg';
import { BlurView } from 'expo-blur';

const SelectRoles = ({ route, navigation }) => {
  const { matchId } = route.params;

  const [battingII, setBattingII] = useState([]);
  const [bowlingII, setBowlingII] = useState([]);

  const [striker, setStriker] = useState(null);
  const [nonStriker, setNonStriker] = useState(null);
  const [bowler, setBowler] = useState(null);
  const [step, setStep] = useState(1); // Step 1: Select Batsmen, Step 2: Select Bowler

  useEffect(() => {
    fetchPlayingII();
  }, []);

  const fetchPlayingII = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) throw new Error("Please login again");

      const responseBatting = await axios.get(`https://score360-7.onrender.com/api/v1/matches/${matchId}/playingXI/batting`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBattingII(responseBatting.data);

      const responseBowling = await axios.get(`https://score360-7.onrender.com/api/v1/matches/${matchId}/playingXI/bowling`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBowlingII(responseBowling.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch playing XI');
    }
  };

  const handleSelectBatsman = (playerId) => {
    if (striker === playerId) {
      setStriker(null);
    } else if (nonStriker === playerId) {
      setNonStriker(null);
    } else if (!striker) {
      setStriker(playerId);
    } else if (!nonStriker) {
      setNonStriker(playerId);
    }
  };

  const handleSelectBowler = (playerId) => {
    if (bowler === playerId) {
      setBowler(null);
    } else {
      setBowler(playerId);
    }
  };

  const handleSubmit = async () => {
    if (!striker || !nonStriker || !bowler) {
      Alert.alert('Error', 'Please select a striker, non-striker, and bowler');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) throw new Error("Please login again");

      await axios.post(
        `https://score360-7.onrender.com/api/v1/matches/${matchId}/players/update`,
        { striker, nonStriker, bowler },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Success', 'Players updated successfully!');
      navigation.navigate(`Scoring`, { matchId, striker, nonStriker, bowler });
    } catch (err) {
      Alert.alert('Error', 'Failed to update players');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#0A303B', '#36B0D5']} style={styles.gradient}>
        <ImageBackground source={stadiumBG} resizeMode="cover" style={styles.background} imageStyle={styles.backgroundImage}>
          <Text style={styles.heading}>Select Roles</Text>
          <BlurView style={styles.selectRolesIIContainer} intensity={50}>

            {step === 1 ? (
              <>
                <Text style={styles.subHeading}>Select Striker & Non-Striker</Text>
                <FlatList
                  data={battingII}
                  keyExtractor={(item) => item.playerId}
                  renderItem={({ item }) => (
                    <Pressable
                      style={[styles.playerCard, striker === item.playerId || nonStriker === item.playerId ? styles.selected : {}]}
                      onPress={() => handleSelectBatsman(item.playerId)}
                    >
                      <Text style={styles.playerText}>{item.name}</Text>
                      {striker === item.playerId && <Text style={styles.roleText}>Striker</Text>}
                      {nonStriker === item.playerId && <Text style={styles.roleText}>Non-Striker</Text>}
                    </Pressable>
                  )}
                />
                {striker && nonStriker && (
                  <Pressable style={styles.nextButton} onPress={() => setStep(2)}>
                    <Text style={styles.submitText}>Next</Text>
                  </Pressable>
                )}
              </>
            ) : (
              <>
                <Text style={styles.subHeading}>Select Bowler</Text>
                <FlatList
                  data={bowlingII}
                  keyExtractor={(item) => item.playerId}
                  renderItem={({ item }) => (
                    <Pressable
                      style={[styles.playerCard, bowler === item.playerId ? styles.selected : {}]}
                      onPress={() => handleSelectBowler(item.playerId)}
                    >
                      <Text style={styles.playerText}>{item.name}</Text>
                      {bowler === item.playerId && <Text style={styles.roleText}>Bowler</Text>}
                    </Pressable>
                  )}
                />
                {bowler && (
                  <Pressable style={styles.nextButton} onPress={handleSubmit}>
                    <Text style={styles.submitText}>Submit</Text>
                  </Pressable>
                )}
              </>
            )}
          </BlurView>
        </ImageBackground>
      </LinearGradient>
    </View>
  );
};

export default SelectRoles;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%'
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  backgroundImage: {
    resizeMode: 'cover',
    opacity: 0.8,
  },
  gradient: {
    flex: 1,
    width: '100%'
  },
  selectRolesIIContainer: {
    width: '90%',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    overflow: 'hidden'
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: 'white'
  },
  subHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
    color: 'white'
  },
  playerCard: {
    flex: 1,
    padding: 10,
    margin: 2,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    alignItems: 'center'
  },
  selected: {
    backgroundColor: '#36B0D5'
  },
  playerText: {
    fontSize: 14,
    fontWeight: '600'
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'red'
  },
  nextButton: {
    backgroundColor: '#0A303B',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center'
  },
  submitText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff'
  },
});

import { Alert, FlatList, ImageBackground, Pressable, StyleSheet, Text, View, Animated } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import stadiumBG from '../../assets/images/cricsLogo.png';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';

const SelectRoles = ({ route, navigation }) => {
  const { matchId } = route.params;

  const [battingII, setBattingII] = useState([]);
  const [bowlingII, setBowlingII] = useState([]);

  const [strikerId, setStrikerId] = useState(null);
  const [strikerName, setStrikerName] = useState(null);
  const [nonStrikerId, setNonStrikerId] = useState(null);
  const [nonStrikerName, setNonStrikerName] = useState(null);
  const [bowler, setBowler] = useState(null);
  const [bowlerName, setBowlerName] = useState(null);
  const [step, setStep] = useState(1); 

  
  const [showNotification, setShowNotification] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current; 

  useEffect(() => {
    fetchPlayingII();
  }, []);

  const showPopupNotification = () => {
    setShowNotification(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300, 
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        hidePopupNotification();
      }, 2000);
    });
  };

 
  const hidePopupNotification = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200, 
      useNativeDriver: true,
    }).start(() => {
      setShowNotification(false);
    });
  };

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

  const handleSelectBatsman = ({ playerId, name }) => {
    if (strikerId === playerId) {
      setStrikerId(null);
      setStrikerName(null);
    } else if (nonStrikerId === playerId) {
      setNonStrikerId(null);
      setNonStrikerName(null);
    } else if (!strikerId) {
      setStrikerId(playerId);
      setStrikerName(name);
    } else if (!nonStrikerId) {
      setNonStrikerId(playerId);
      setNonStrikerName(name);
    }
  };

  const handleSelectBowler = ({ playerId, name }) => {
    if (bowler === playerId) {
      setBowler(null);
      setBowlerName(null);
    } else {
      setBowler(playerId);
      setBowlerName(name);
    }
  };

  const handleSubmit = async () => {
    if (!strikerId || !nonStrikerId || !bowler) {
      Alert.alert('Error', 'Please select a striker, non-striker, and bowler');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) throw new Error("Please login again");

      await axios.post(
        `https://score360-7.onrender.com/api/v1/matches/${matchId}/players/update`,
        { striker: strikerId, nonStriker: nonStrikerId, bowler },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showPopupNotification();
      setTimeout(() => {
        navigation.navigate(`Scoring`, { matchId, strikerId, nonStrikerId, bowler, strikerName, nonStrikerName, bowlerName });
      }, 1000); 
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
            <LinearGradient
              colors={['#0866AA', '#6BB9F0']}
              style={styles.cardBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {step === 1 ? (
                <>
                  <Text style={styles.subHeading}>Select Striker & Non-Striker</Text>
                  <FlatList
                    data={battingII}

                    keyExtractor={(item) => item.playerId}
                    renderItem={({ item }) => (
                      <Pressable
                        style={[styles.playerCard, strikerId === item.playerId || nonStrikerId === item.playerId ? styles.selected : {}]}
                        onPress={() => handleSelectBatsman({ playerId: item.playerId, name: item.name })}
                      >
                        <Text style={styles.playerText}>{item.name}</Text>
                        {strikerId === item.playerId && <Text style={styles.roleText}>Striker</Text>}
                        {nonStrikerId === item.playerId && <Text style={styles.roleText}>Non-Striker</Text>}
                      </Pressable>
                    )}
                  />
                  {strikerId && nonStrikerId && (
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
                        onPress={() => handleSelectBowler({ playerId: item.playerId, name: item.name })}
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
            </LinearGradient>
          </BlurView>
        </ImageBackground>
      </LinearGradient>

      {/* Pop-up Notification */}
      {showNotification && (
        <Animated.View style={[styles.notificationContainer, { opacity: fadeAnim }]}>
          <MaterialIcons name="emoji-events" size={24} color="#fff" />
          <Text style={styles.notificationText}>Let's start scoring the match! 🎉</Text>
        </Animated.View>
      )}
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
    padding: 10,
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
    width: '85%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardBackground: {
    padding: 10,
    borderRadius: 12,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
    color: 'white',
    textAlign: 'center',
  },
  playerCard: {
    flex: 1,
    padding: 12,
    marginVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selected: {
    backgroundColor: '#36B0D5',
    shadowColor: '#36B0D5',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  playerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffff',
    marginTop: 2,
  },
  nextButton: {
    backgroundColor: '#0A303B',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  submitText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  notificationContainer: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  notificationText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
});
import { Alert, FlatList, ImageBackground, Pressable, StyleSheet, Text, View, Animated, Image } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import stadiumBG from '../../assets/images/cricsLogo.png';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';

const SelectRoles = ({ route, navigation }) => {
  const { matchId, isFirstInnings } = route.params;

  const [battingII, setBattingII] = useState([]);
  const [bowlingII, setBowlingII] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [strikerId, setStrikerId] = useState(null);
  const [strikerName, setStrikerName] = useState(null);
  const [nonStrikerId, setNonStrikerId] = useState(null);
  const [nonStrikerName, setNonStrikerName] = useState(null);
  const [bowlerId, setBowlerId] = useState(null);
  const [bowlerName, setBowlerName] = useState(null);
  const [step, setStep] = useState(1);

  const [showNotification, setShowNotification] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchPlayingII();
  }, []);

  useEffect(() => {
    if (strikerId && nonStrikerId) {
      Animated.spring(buttonAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(buttonAnim, {
        toValue: 0,
        friction: 4,
        useNativeDriver: true,
      }).start();
    }
  }, [strikerId, nonStrikerId]);

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
      setIsLoading(true);
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) throw new Error("Please login again");

      const [responseBatting, responseBowling] = await Promise.all([
        axios.get(`https://score360-7.onrender.com/api/v1/matches/${matchId}/playingXI/batting`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`https://score360-7.onrender.com/api/v1/matches/${matchId}/playingXI/bowling`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setBattingII(responseBatting.data);
      setBowlingII(responseBowling.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch playing XI');
    } finally {
      setIsLoading(false);
    }
  };

  const ShimmerEffect = ({ width, height, style }) => {
    return (
      <View style={[styles.shimmerContainer, { width, height }, style]}>
        <LinearGradient
          colors={['#e0e0e0', '#f5f5f5', '#e0e0e0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerGradient}
        />
      </View>
    );
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
    if (bowlerId === playerId) {
      setBowlerId(null);
      setBowlerName(null);
    } else {
      setBowlerId(playerId);
      setBowlerName(name);
    }
  };

  const handleSubmit = async () => {
    if (!strikerId || !nonStrikerId || !bowlerId) {
      Alert.alert('Error', 'Please select a striker, non-striker, and bowler');
      return;
    }

    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) throw new Error("Please login again");

      await axios.post(
        `https://score360-7.onrender.com/api/v1/matches/${matchId}/players/update`,
        { striker: strikerId, nonStriker: nonStrikerId, bowler: bowlerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showPopupNotification();
      setTimeout(() => {
        navigation.navigate(`Scoring`, { 
          matchId, 
          strikerId, 
          nonStrikerId, 
          bowler: bowlerId, 
          selectedStrikerName: strikerName, 
          selectedNonStrikerName: nonStrikerName, 
          selectedBowlerName: bowlerName, 
          isFirstInnings, 
          score: 0, 
          wicket: 0, 
          completedOvers: 0 
        });
      }, 1000);
    } catch (err) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to update players');
    }
  };

  const renderPlayerItem = ({ item }) => (
    <Pressable
      style={[
        styles.playerCard, 
        (step === 1 ? (strikerId === item.playerId || nonStrikerId === item.playerId) : bowlerId === item.playerId) && styles.selected
      ]}
      onPress={() => step === 1 ? 
        handleSelectBatsman({ playerId: item.playerId, name: item.name }) : 
        handleSelectBowler({ playerId: item.playerId, name: item.name })}
    >
      <View style={styles.playerContent}>
        <Image
          source={require("../../assets/defaultLogo.png")}
          style={[
            styles.userImage,
            (step === 1 ? (strikerId === item.playerId || nonStrikerId === item.playerId) : bowlerId === item.playerId) && styles.selectedImage
          ]}
        />
        <Text style={[
          styles.playerText, 
          (step === 1 ? (strikerId === item.playerId || nonStrikerId === item.playerId) : bowlerId === item.playerId) && styles.selectedText
        ]}>
          {item.name}
        </Text>
      </View>
      <View style={styles.roleIndicator}>
        {step === 1 ? (
          <>
            {strikerId === item.playerId && <Text style={styles.roleText}>Striker</Text>}
            {nonStrikerId === item.playerId && <Text style={styles.roleText}>Non-Striker</Text>}
          </>
        ) : (
          bowlerId === item.playerId && <Text style={styles.roleText}>Bowler</Text>
        )}
      </View>
    </Pressable>
  );

  const renderShimmerItem = () => (
    <View style={[styles.playerCard, { backgroundColor: '#f5f5f5' }]}>
      <View style={styles.playerContent}>
        <ShimmerEffect width={36} height={36} style={{ borderRadius: 18, marginRight: 12 }} />
        <ShimmerEffect width="60%" height={20} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#0A303B', '#36B0D5']} style={styles.gradient}>
        <ImageBackground source={stadiumBG} resizeMode="cover" style={styles.background} imageStyle={styles.backgroundImage}>
          <View style={styles.headerContainer}>
            <Text style={styles.heading}>Select Roles</Text>
          </View>
          
          <BlurView style={styles.selectRolesIIContainer} intensity={50}>
            <LinearGradient
              colors={['#0866AA', '#6BB9F0']}
              style={styles.cardBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {step === 1 ? (
                <View style={styles.stepContainer}>
                  <Text style={styles.subHeading}>Select Striker & Non-Striker</Text>
                  <View style={styles.listWrapper}>
                    {isLoading ? (
                      <FlatList
                        data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderShimmerItem}
                        contentContainerStyle={styles.listContent}
                      />
                    ) : (
                      <FlatList
                        data={battingII}
                        keyExtractor={(item) => item.playerId}
                        renderItem={renderPlayerItem}
                        contentContainerStyle={styles.listContent}
                      />
                    )}
                  </View>
                  
                  <Animated.View 
                    style={[
                      styles.nextButtonContainer,
                      {
                        opacity: buttonAnim,
                        transform: [{
                          translateY: buttonAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0]
                          })
                        }]
                      }
                    ]}
                  >
                    <Pressable 
                      style={[styles.nextButton, styles.actionButton]} 
                      onPress={() => setStep(2)}
                    >
                      <Text style={styles.actionButtonText}>Next</Text>
                      <MaterialIcons name="arrow-forward" size={20} color="white" />
                    </Pressable>
                  </Animated.View>
                </View>
              ) : (
                <View style={styles.stepContainer}>
                  <Text style={styles.subHeading}>Select Bowler</Text>
                  <View style={styles.listWrapper}>
                    {isLoading ? (
                      <FlatList
                        data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderShimmerItem}
                        contentContainerStyle={styles.listContent}
                      />
                    ) : (
                      <FlatList
                        data={bowlingII}
                        keyExtractor={(item) => item.playerId}
                        renderItem={renderPlayerItem}
                        contentContainerStyle={styles.listContent}
                      />
                    )}
                  </View>
                  <View style={styles.bottomButtonContainer}>
                    <Pressable 
                      style={[styles.backButton, styles.actionButton]} 
                      onPress={() => setStep(1)}
                    >
                      <MaterialIcons name="arrow-back" size={20} color="white" />
                      <Text style={styles.actionButtonText}>Back</Text>
                    </Pressable>
                    {bowlerId && (
                      <Pressable 
                        style={[styles.submitButton, styles.actionButton]} 
                        onPress={handleSubmit}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Text style={styles.actionButtonText}>Loading...</Text>
                        ) : (
                          <>
                            <Text style={styles.actionButtonText}>Submit</Text>
                            <MaterialIcons name="check" size={20} color="white" />
                          </>
                        )}
                      </Pressable>
                    )}
                  </View>
                </View>
              )}
            </LinearGradient>
          </BlurView>
        </ImageBackground>
      </LinearGradient>

      {showNotification && (
        <Animated.View style={[styles.notificationContainer, { opacity: fadeAnim }]}>
          <MaterialIcons name="emoji-events" size={24} color="#fff" />
          <Text style={styles.notificationText}>Let's start scoring the match! 🎉</Text>
        </Animated.View>
      )}
    </View>
  );
};

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
  headerContainer: {
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  selectRolesIIContainer: {
    width: '90%',
    height: '75%',
    maxHeight: 600,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardBackground: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  listWrapper: {
    flex: 1,
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 80,
  },
  subHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: 'white',
    textAlign: 'center',
  },
  playerCard: {
    padding: 12,
    marginVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 60,
    justifyContent: 'center',
  },
  selected: {
    backgroundColor: '#36B0D5',
    borderWidth: 1,
    borderColor: '#0A303B',
  },
  playerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  userImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedImage: {
    borderColor: '#fff',
    borderWidth: 2,
  },
  playerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  roleIndicator: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffff',
  },
  bottomButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    paddingBottom: 10,
  },
  nextButtonContainer: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    zIndex: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
  },
  nextButton: {
    backgroundColor: '#0A303B',
  },
  backButton: {
    backgroundColor: '#6c757d',
  },
  submitButton: {
    backgroundColor: '#28a745',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 8,
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
  shimmerContainer: {
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  shimmerGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default SelectRoles;
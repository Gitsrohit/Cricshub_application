import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import apiService from '../../APIservices';
const moment = require('moment-timezone');

const InstantMatch = () => {
  const istDateTime = moment().tz("Asia/Kolkata");
  const [overs, setOvers] = useState('');
  const [venue, setVenue] = useState('');
  const [teamModalVisible, setTeamModalVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [teamResults, setTeamResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [team1Name, setTeam1Name] = useState('');
  const [team1Id, setTeam1Id] = useState(null);
  const [team1Logo, setTeam1Logo] = useState(null); // Add team1Logo state
  const [team2Name, setTeam2Name] = useState('');
  const [team2Id, setTeam2Id] = useState(null);
  const [team2Logo, setTeam2Logo] = useState(null); // Add team2Logo state

  const slideAnim = useRef(new Animated.Value(500)).current;
  const navigation = useNavigation();

  useEffect(() => {
    if (teamModalVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [teamModalVisible]);

  const searchTeamsByName = async (name) => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) throw new Error('Please login again');
      setLoading(true);

      const response = await apiService({
        endpoint: 'teams/search/name',
        method: 'GET',
        params: { name },
      });

      if (response.success) {
        setTeamResults(response.data.data);
      } else {
        setTeamResults([]);
        console.error('Search error:', response.error);
      }
    } catch (err) {
      console.error('Failed to search for teams', err);
      setTeamResults([]);
    } finally {
      setLoading(false);
    }
  };

  function debounce(func, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  const debouncedSearch = useCallback(
    debounce((name) => searchTeamsByName(name), 500),
    []
  );

  const handleSearch = (text) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const selectTeam = (team) => {
    if (selectedTeam === 'team1') {
      setTeam1Name(team.name);
      setTeam1Id(team.id);
      setTeam1Logo(team.logoPath); // Store team1 logo URL
    } else {
      setTeam2Name(team.name);
      setTeam2Id(team.id);
      setTeam2Logo(team.logoPath); // Store team2 logo URL
    }
    setTeamResults([]);
    setTeamModalVisible(false);
    setSearchQuery('');
  };

  const handleNextButtonClick = async () => {
    if (!overs || !venue || !team1Id || !team2Id) {
      Alert.alert('Error', 'Please fill all details');
      return;
    }

    const matchDetails = {
      overs: parseInt(overs, 10),
      venue,
      team1Id,
      team1Name,
      team1Logo,
      team2Id,
      team2Name,
      team2Logo,
    };

    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) throw new Error('Please login again');
      setLoading(true);
      const requestBody = {
        tournamentName: null,
        team1Id,
        team2Id,
        overs: matchDetails.overs,
        matchDate: istDateTime.format('YYYY-MM-DD'),
        matchTime: istDateTime.format('HH:mm'),
        venue,
      };

      const response = await apiService({
        endpoint: 'matches/schedule',
        method: 'POST',
        body: requestBody,
      });

      if (response.success) {
        const matchId = response.data.id;
        navigation.navigate('SelectPlayingII', { matchDetails, matchId });
      } else {
        console.error(response.error);
        Alert.alert('Error', 'Failed to schedule match.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to schedule match.');
    } finally {
      setLoading(false);
    }
  };

  const scheduleMatchHandler = () => {
    navigation.navigate('ScheduleMatch');
  }

  const cardGradientColors = ['#4A90E2', '#6BB9F0'];

  return (
    <>
      <ImageBackground
        source={require('../../../assets/images/cricsLogo.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.instantMatchContainer}>
          <View style={styles.centerContainer}>
            <BlurView style={styles.instantMatchForm} intensity={50}>
              <Text style={styles.title}>Instant Match Details</Text>
              <View style={styles.teamSelectionContainer}>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedTeam('team1');
                    setTeamModalVisible(true);
                  }}
                >
                  <LinearGradient colors={cardGradientColors} style={styles.teamButton}>
                    {team1Logo ? (
                      <Image source={{ uri: team1Logo }} style={styles.teamLogo} />
                    ) : (
                      <Icon name="groups" size={40} color="#fff" />
                    )}
                    <Text style={styles.teamText}>{team1Name || 'Select Team 1'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedTeam('team2');
                    setTeamModalVisible(true);
                  }}
                >
                  <LinearGradient colors={cardGradientColors} style={styles.teamButton}>
                    {team2Logo ? (
                      <Image source={{ uri: team2Logo }} style={styles.teamLogo} />
                    ) : (
                      <Icon name="groups" size={40} color="#fff" />
                    )}
                    <Text style={styles.teamText}>{team2Name || 'Select Team 2'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <View style={styles.inputField}>
                  <Text style={styles.inputLabel}>Overs</Text>
                  <View style={styles.inputWrapper}>
                    <Icon name="timer" size={24} color="#888" style={styles.inputIcon} />
                    <TextInput
                      inputMode="numeric"
                      value={overs}
                      onChangeText={setOvers}
                      placeholder="20"
                      placeholderTextColor="#888"
                      style={styles.input}
                    />
                  </View>
                </View>
                <View style={styles.inputField}>
                  <Text style={styles.inputLabel}>Venue</Text>
                  <View style={styles.inputWrapper}>
                    <Icon name="place" size={24} color="#888" style={styles.inputIcon} />
                    <TextInput
                      value={venue}
                      onChangeText={setVenue}
                      placeholder="Eden Gardens"
                      placeholderTextColor="#888"
                      style={styles.input}
                    />
                  </View>
                </View>
              </View>
              <Text
                onPress={scheduleMatchHandler}
                style={styles.upcomingMatch}
              >
                Schedule an upcoming match
              </Text>
              <TouchableOpacity style={styles.nextButton} onPress={handleNextButtonClick}>
                <LinearGradient colors={cardGradientColors} style={styles.nextButtonGradient}>
                  <Text style={styles.nextButtonText}>Next</Text>
                </LinearGradient>
              </TouchableOpacity>
            </BlurView>
          </View>
        </View>

        <Modal visible={teamModalVisible} transparent animationType="none">
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.teamModalContent, { transform: [{ translateY: slideAnim }] }]}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search team..."
                value={searchQuery}
                onChangeText={handleSearch}
              />
              {loading ? (
                <ActivityIndicator size="large" color="#000" />
              ) : (
                <FlatList
                  data={teamResults}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <Pressable onPress={() => selectTeam(item)}>
                      <View style={styles.teamCard}>
                        <Image source={{ uri: item.logoPath }} resizeMode="cover" style={styles.teamLogo} />
                        <View style={styles.teamDetails}>
                          <Text style={styles.teamName}>{item.name}</Text>
                          <Text style={styles.teamCaptain}>Captain: {item.captain.name}</Text>
                        </View>
                      </View>
                    </Pressable>
                  )}
                />
              )}
              <TouchableOpacity style={styles.closeButton} onPress={() => setTeamModalVisible(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>
      </ImageBackground>
    </>
  );
};

export default InstantMatch;

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  instantMatchContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instantMatchForm: {
    width: '90%',
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    marginVertical: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  teamSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: 20,
  },
  teamButton: {
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
    width: 120,
    justifyContent: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  teamLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 5,
  },
  teamText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 5,
    fontSize: 16,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  inputField: {
    width: '100%',
    marginTop: 10,
  },
  inputLabel: {
    color: '#333',
    fontSize: 14,
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#333',
    fontSize: 16,
    paddingVertical: 10,
  },
  upcomingMatch: {
    color: '#4A90E2',
    marginTop: 10,
    fontSize: 16,
  },
  nextButton: {
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  teamModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  searchInput: {
    backgroundColor: '#F0F4F8',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#F0F4F8',
    borderRadius: 10,
  },
  teamLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  teamDetails: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  teamCaptain: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
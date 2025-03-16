import { ActivityIndicator, Alert, Animated, FlatList, Image, ImageBackground, Modal, Pressable, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import stadiumBG from '../../../assets/images/stadiumBG.jpg';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AntDesign } from "@expo/vector-icons";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const InstantMatch = () => {
  const [overs, setOvers] = useState('');
  const [venue, setVenue] = useState("");
  const [teamModalVisible, setTeamModalVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [teamResults, setTeamResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [team1Name, setTeam1Name] = useState("");
  const [team1Id, setTeam1Id] = useState(null);
  const [team2Name, setTeam2Name] = useState("");
  const [team2Id, setTeam2Id] = useState(null);

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
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("Please login again");
      setLoading(true);
      const response = await axios.get(
        `https://score360-7.onrender.com/api/v1/teams/search/name`,
        {
          params: { name },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTeamResults(response.data.data);
    } catch (err) {
      console.error("Failed to search for teams", err);
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
    } else {
      setTeam2Name(team.name);
      setTeam2Id(team.id);
    }
    setTeamResults(null);
    setTeamModalVisible(false);
    setSearchQuery("");
  };

  const handleNextButtonClick = async () => {
    if (!overs || !venue || !team1Id || !team2Id) {
      Alert.alert('Error', 'Please fill all details');
      return;
    }

    const matchDetails = {
      overs: parseInt(overs, 10), // Ensure overs is a number
      venue,
      team1Id,
      team1Name,
      team2Id,
      team2Name,
    };

    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("Please login again");
      setLoading(true);
      const matchDate = new Date().toISOString().split("T")[0];
      const now = new Date();
      const matchTime = now.toTimeString().slice(0, 5);
      const requestBody = {
        tournamentName: null,
        team1Id,
        team2Id,
        overs: matchDetails.overs,
        matchDate,
        matchTime,
        venue,
      };

      const response = await axios.post(
        `https://score360-7.onrender.com/api/v1/matches/schedule`,
        requestBody,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const matchId = response.data.id;
      Alert.alert("Success", "Match scheduled successfully!");
      navigation.navigate("SelectPlayingII", { matchDetails, matchId });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to schedule match.");
    } finally {
      setLoading(false);
    }
  };

  const cardGradientColors = ['#4A90E2', '#6BB9F0'];

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ImageBackground
        source={require('../../../assets/images/cricsLogo.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.instantMatchContainer}>
          <View style={styles.centerContainer}>
            <BlurView style={styles.instantMatchForm} intensity={50}>
              <Text style={styles.title}>Match Details</Text>
              <View style={styles.teamSelectionContainer}>
                <TouchableOpacity onPress={() => { setSelectedTeam('team1'); setTeamModalVisible(true); }}>
                  <LinearGradient colors={cardGradientColors} style={styles.teamButton}>
                    <Icon name="groups" size={40} color="#fff" />
                    <Text style={styles.teamText}>{team1Name || "Select Team 1"}</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setSelectedTeam('team2'); setTeamModalVisible(true); }}>
                  <LinearGradient colors={cardGradientColors} style={styles.teamButton}>
                    <Icon name="groups" size={40} color="#fff" />
                    <Text style={styles.teamText}>{team2Name || "Select Team 2"}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              {/* Match Details */}
              <View style={styles.inputContainer}>
                <View style={styles.inputField}>
                  <Text style={styles.inputLabel}>Overs</Text>
                  <View style={styles.inputWrapper}>
                    <Icon name="timer" size={24} color="#888" style={styles.inputIcon} />
                    <TextInput
                      inputMode='numeric'
                      value={overs}
                      onChangeText={setOvers}
                      placeholder='20'
                      placeholderTextColor='#888'
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
                      placeholder='Eden Gardens'
                      placeholderTextColor='#888'
                      style={styles.input}
                    />
                  </View>
                </View>
              </View>
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
                        <Image source={{ uri: item.logoPath }} resizeMode='cover' style={styles.teamLogo} />
                        <View style={styles.teamOptions}>
                          <Text style={styles.dropdownOptionName}>{item.name}</Text>
                          <Text style={styles.dropdownOptionCaptain}>{item.captain.name}</Text>
                        </View>
                      </View>
                    </Pressable>
                  )}
                />
              )}
              <TouchableOpacity onPress={() => setTeamModalVisible(false)}>
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
    height: '100%',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
  },
  teamModalContent: {
    backgroundColor: '#FFFFFF', // White background
    width: '100%',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 250,
    maxHeight: 400,
    alignItems: 'center',
  },
  searchInput: {
    backgroundColor: '#F0F4F8', // Light gray background
    borderRadius: 10,
    padding: 10,
    width: '90%',
    marginBottom: 20,
    color: '#333',
  },
  dropdownOption: {
    color: '#333',
    marginBottom: 10,
    textAlign: 'left',
    fontSize: 16,
  },
  closeButtonText: {
    color: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#4A90E2',
    fontSize: 16,
  },
  teamOptions: {
    padding: 8,
    width: '100%',
    borderRadius: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  teamLogo: {
    overflow: 'hidden',
    borderRadius: 50,
    justifyContent: 'flex-end',
    height: 50,
    width: 50,
  },
  teamCard: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderBottomColor: 'grey',
    borderBottomWidth: 1
  }
});
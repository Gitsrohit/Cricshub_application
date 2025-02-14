import { ActivityIndicator, Alert, Animated, FlatList, ImageBackground, Modal, Pressable, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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


  return (
    <>
      <StatusBar />
      <View style={styles.instantMatchContainer}>
        <LinearGradient colors={['#000000', '#0A303B', '#36B0D5']} style={styles.gradient}>
          <ImageBackground source={stadiumBG} resizeMode='cover' style={styles.background}>
            <BlurView style={styles.instantMatchForm} intensity={50}>
              <Text style={styles.title}>Match Details</Text>
              <View style={styles.teamSelectionContainer}>
                <TouchableOpacity onPress={() => { setSelectedTeam('team1'); setTeamModalVisible(true); }}>
                  <View style={styles.teamButton}>
                    <Icon name="groups" size={40} color="white" />
                    <Text style={styles.teamText}>{team1Name || "Select Team 1"}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setSelectedTeam('team2'); setTeamModalVisible(true); }}>
                  <View style={styles.teamButton}>
                    <Icon name="groups" size={40} color="white" />
                    <Text style={styles.teamText}>{team2Name || "Select Team 2"}</Text>
                  </View>
                </TouchableOpacity>
              </View>
              {/* Match Details */}
              <View style={{ width: '100%', flexDirection: 'column', alignItems: 'center' }}>
                <View style={{ marginTop: 8, width: '100%' }}>
                  <Text style={{ color: 'white', fontSize: 16, marginTop: 4 }}>Overs</Text>
                  <TextInput
                    inputMode='numeric'
                    value={overs}
                    onChangeText={setOvers}
                    placeholder='20'
                    placeholderTextColor='#e5e5e5'
                    style={{ width: '100%', color: 'black', backgroundColor: 'white', borderRadius: 4 }}
                  />
                </View>
                <View style={{ marginTop: 8, width: '100%' }}>
                  <Text style={{ color: 'white', fontSize: 16, marginTop: 4 }}>Venue</Text>
                  <TextInput
                    value={venue}
                    onChangeText={setVenue}
                    placeholder='Eden Gardens'
                    placeholderTextColor='#e5e5e5'
                    style={{ width: '100%', color: 'black', backgroundColor: 'white', borderRadius: 4 }}
                  />
                </View>
              </View>
              <View style={{ alignItems: 'center', marginVertical: 10 }}>
                <Text style={{ paddingVertical: 8, paddingHorizontal: 10, borderRadius: 6, backgroundColor: '#0c2d3d', color: 'white', fontSize: 16 }} onPress={handleNextButtonClick}>Next</Text>
              </View>
            </BlurView>
          </ImageBackground>
        </LinearGradient>
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
                    <View style={styles.teamOptions}>
                      <Text style={styles.dropdownOption}>{item.name}</Text>
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
    </>
  );
};

export default InstantMatch;

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  gradient: { flex: 1 },
  instantMatchContainer: { flex: 1 },
  instantMatchForm: { width: '90%', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 8, overflow: 'hidden' },
  title: { textAlign: 'center', fontSize: 20, marginVertical: 16, color: 'white' },
  teamSelectionContainer: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' },
  teamButton: { alignItems: 'center', borderColor: 'white', borderRadius: 6, padding: 4, borderWidth: 1, width: 100 },
  teamText: { color: 'white', textAlign: 'center' },
  modalOverlay: { height: '100%', justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  teamModalContent: { backgroundColor: "#fff", width: "100%", padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, minHeight: 250, maxHeight: 400, alignItems: "center" },
  searchInput: { backgroundColor: "#f0f0f0", borderRadius: 10, padding: 10, width: "90%", marginBottom: 20 },
  dropdownOption: { color: 'black', marginBottom: 10, textAlign: 'left' },
  closeButtonText: { color: 'white', paddingVertical: 6, paddingHorizontal: 8, borderRadius: 6, backgroundColor: '#d9534f' },
  teamOptions: { padding: 8, width: '100%', borderRadius: 4 }
});
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Image, Modal, TextInput, Pressable, FlatList, ScrollView, Animated, Button, ImageBackground, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
const backgroundImage = require('../../assets/images/cricsLogo.png');
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';

export default function ManageTournaments({ route }) {
  const [activeTab, setActiveTab] = useState('INFO');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tournamentDetails, setTournamentsDetails] = useState(null);
  const [sanitizedBannerUrl, setSanitizedBannerUrl] = useState('');
  const { id } = route.params;
  const { isCreator } = route.params;

  const fetchTournamentDetails = async (id) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) throw new Error('Please login again');

      const response = await axios.get(
        `https://score360-7.onrender.com/api/v1/tournaments/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTournamentsDetails(response.data);
      setSanitizedBannerUrl(
        response.data.banner.replace(
          'https://score360-7.onrender.com/api/v1/files/http:/',
          'https://'
        )
      );
    } catch (err) {
      setError('Failed to fetch tournament details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournamentDetails(id);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['rgba(0, 0, 0, 0.2)', 'rgba(54, 176, 303, 0.1)']} style={styles.gradientOverlay}>
        <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
          {/* Toggle Buttons */}
          <View style={{ height: 60 }}>
            <ScrollView style={styles.toggleContainer} horizontal={true}>
              {['INFO', 'TEAMS', 'MATCHES', 'POINTS TABLE'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.toggleButton,
                    activeTab === tab && styles.activeToggleButton,
                  ]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      activeTab === tab && styles.activeToggleText,
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={{ marginVertical: 10, width: '100%', flexDirection: 'row', justifyContent: 'center' }}>
            {loading ? <View style={[styles.cardImage, { backgroundColor: 'grey' }]}></View> : <Image source={{ uri: sanitizedBannerUrl }} style={styles.cardImage} resizeMode='contain' />
            }
          </View>
          <View style={{ height: '100%' }}>
            {activeTab === 'INFO' && <Info id={id} isCreator={isCreator} />}
            {activeTab === 'TEAMS' && <Teams id={id} isCreator={isCreator} />}
            {activeTab === 'MATCHES' && <Matches id={id} isCreator={isCreator} />}
            {activeTab === 'POINTS TABLE' && <PointsTable id={id} />}
          </View>
        </ImageBackground>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ManageTournaments
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    opacity: 0.8
  },
  gradientOverlay: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    height: '100%',
  },
  toggleContainer: {
    // marginTop: 10,
    paddingVertical: 6,
    backgroundColor: '#34B8FF',
    // height: 66,
    // borderBottomColor: '#0866AA',
    // borderBottomWidth: 1
  },
  toggleButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeToggleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  toggleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  activeToggleText: {
    color: '#FFF', fontSize: 16, fontWeight: 'bold'
  },

  // Info

  cardImage: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 150,
    width: 150,
    borderRadius: 150,
  },
  tournamentDetails: {
    width: '90%',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 4
  },
  tournamentName: {
    fontSize: 20,
    color: 'white',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  tournamentDetailsRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.25,
    borderBottomColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 14
  },
  tournamentDetailsHeading: {
    color: 'white',
    flex: 1,
    fontSize: 14,
  },
  tournamentDetailsValue: {
    color: 'white',
    flex: 2,
    fontSize: 14,
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  modalContent: {
    backgroundColor: 'white',
    marginHorizontal: 10,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    color: 'black',
    width: '80%'
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    marginTop: 4,
    height: 40,
    fontSize: 16,
  },
  modalInputLabel: {
    marginTop: 10,
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold'
  },
  modalButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10
  },

  //Teams
  tournamentTeams: {
    padding: 15,
    paddingBottom: 10,
    color: 'white',
  },
  addButton: {
    backgroundColor: "#005a7f",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  modalOverlay: {
    height: '100%',
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)"
  },
  teamModalContent: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 250,
    maxHeight: 400,
    alignItems: "center",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    padding: 10,
    width: "90%"
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#333"
  },
  searchIcon: { padding: 5 },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#d9534f",
    padding: 10,
    borderRadius: 5,
    width: "90%",
    alignItems: "center"
  },
  closeButtonText: { color: "#fff", fontWeight: "bold" },
  inputTeamContainer: {},
  inputTeamLabel: {
    marginTop: 10,
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  teamNameInput: {
    borderRadius: 5,
    marginTop: 4,
    marginBottom: 10,
    height: 40,
    fontSize: 16,
    backgroundColor: 'white',
    color: 'black'
  },
  teamCard: {
    backgroundColor: 'white',
    borderRadius: 4,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamOptions: {
    width: 300,
    marginTop: 4,
  },
  teamHeader: {
  },
  teamImage: {
    overflow: 'hidden',
    borderRadius: 50,
    height: 50,
    width: 50,
  },
  teamName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  teamCaptain: {
    color: 'white',
    fontSize: 14,
  },
  teamInvite: {
    color: 'white',
    textDecorationLine: 'underline',
  },
  teamPlayers: {},
  teamPlayerHeading: {
    fontSize: 14,
    fontWeight: 'semibold',
  },
  teamPlayerName: {
    fontSize: 12,
  },
  dropdown: {
    backgroundColor: 'white',
    color: 'black',
    padding: 4,
    borderRadius: 4,
  },
  dropdownOption: {
    borderBottomColor: 'grey',
    borderBottomWidth: 1,
    fontSize: 16,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  addTournamentWarning: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 18,
    fontWeight: '700',
  },

  //Matches
  matchTab: {},
  matchScheduleOptions: {
    marginBottom: 8
  },
  matchScheduleTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#0866AA',
    marginBottom: 8
  },
  matchScheduleOption: {
    color: 'white',
    fontSize: 14,
    fontWeight: 500
  },
  matchScheduleOptionContainer: {
    padding: 20,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10
  },
  matchScheduler: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 1)',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 15,
    padding: 20,
    margin: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontSize: 16
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
    overflow: 'hidden',
    borderRadius: 30,
  },
  matchesContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingBottom: 15,
  },
  matchCard: {
    backgroundColor: '#6BB9F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 15,
    width: '90%',
    borderRadius: 4,
  },
  matchText: {
    color: 'white',
    fontSize: 16
  },
  matchStage: {
    fontSize: 16,
    marginVertical: 6,
    color: 'white',
  },
  noMatchText: {
    color: 'red',
    fontSize: 20,
    marginTop: 16,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  vs: {
    fontSize: 10,
    color: 'white'
  },
  matchTeamName: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#fff',
    marginBottom: 10,
    padding: 8,
    borderRadius: 6,
    color: 'white',
  },
  matchUpdateModalOverlay: {
    height: '100%',
    justifyContent: "flex-end",
  },
  matchUpdateModalContainer: {
    backgroundColor: "#6BB9F0",
    flexDirection: 'column',
    justifyContent: 'center',
    // alignItems: 'center',
    padding: 16,
    overflow: 'hidden',
    borderRadius: 20,
  },
  matchUpdateModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'left',
    color: 'white',
    marginBottom: 10
  },
  inputTextContainer: {

  },
  inputModalText: {
    fontSize: 16,
    fontWeight: 400,
    color: 'white'
  },

  //points table
  pointsTable: {},
  pointsTableContainer: {
    margin: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: 'white'
  },
  headerRow: {
    backgroundColor: '#eee',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
  },
  headerCell: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export const Info = ({ id, isCreator }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tournamentDetails, setTournamentsDetails] = useState(null);
  const [sanitizedBannerUrl, setSanitizedBannerUrl] = useState('');
  const [editingTournament, setEditingTournament] = useState(false);
  const [editedDetails, setEditedDetails] = useState({
    name: '',
    startDate: '',
    endDate: '',
    type: '',
    ballType: '',
    venues: [''],
  });

  const fetchTournamentDetails = async (id) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) throw new Error('Please login again');

      const response = await axios.get(
        `https://score360-7.onrender.com/api/v1/tournaments/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTournamentsDetails(response.data);
      setEditedDetails({
        ...response.data,
        venues: response.data.venues || [],
      }); // Pre-fill modal with current details
      setSanitizedBannerUrl(
        response.data.banner.replace(
          'https://score360-7.onrender.com/api/v1/files/http:/',
          'https://'
        )
      );
    } catch (err) {
      setError('Failed to fetch tournament details');
    } finally {
      setLoading(false);
    }
  };

  const updateTournamentDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) throw new Error('Please login again');

      const dataToSend = {
        name: editedDetails.name,
        startDate: editedDetails.startDate,
        endDate: editedDetails.endDate,
        type: editedDetails.type,
        ballType: editedDetails.ballType,
        venues: editedDetails.venues,
      };

      await axios.put(
        `https://score360-7.onrender.com/api/v1/tournaments/${id}`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setEditingTournament(false);
      await fetchTournamentDetails(id); // Refresh tournament details
    } catch (err) {
      setError('Failed to update tournament details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournamentDetails(id);
  }, [id]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <View style={{ flexDirection: 'column', alignItems: 'center' }}>
      {tournamentDetails ? (
        <>
          <LinearGradient
            colors={['#0866AA', '#6BB9F0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tournamentDetails}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomColor: 'white', borderBottomWidth: 1, paddingVertical: 10, paddingHorizontal: 14 }}>
              <Text style={styles.tournamentName}>{tournamentDetails.name}</Text>
              {isCreator && <Icon name="edit" color="#e3e3e3" size={20} onPress={() => setEditingTournament(true)} />}
            </View>
            <View style={styles.tournamentDetailsRow}>
              <Text style={styles.tournamentDetailsHeading}>Organizer</Text>
              <Text style={styles.tournamentDetailsValue}>: {tournamentDetails.creatorName.name}</Text>
            </View>
            <View style={styles.tournamentDetailsRow}>
              <Text style={styles.tournamentDetailsHeading}>Teams</Text>
              <Text style={styles.tournamentDetailsValue}>: {tournamentDetails.teamNames?.map((team) => team?.name).join(", ")}</Text>
            </View>
            <View style={styles.tournamentDetailsRow}>
              <Text style={styles.tournamentDetailsHeading}>Venues</Text>
              <Text style={styles.tournamentDetailsValue}>: {tournamentDetails.venues?.map((venue) => venue).join(", ")}</Text>
            </View>
            <View style={styles.tournamentDetailsRow}>
              <Text style={styles.tournamentDetailsHeading}><Icon name="calendar-month" color="white" size={18} /> Start</Text>
              <Text style={styles.tournamentDetailsValue}>: {tournamentDetails.startDate[2]}-{tournamentDetails.startDate[1]}-{tournamentDetails.startDate[0]}</Text>
            </View>
            <View style={styles.tournamentDetailsRow}>
              <Text style={styles.tournamentDetailsHeading}><Icon name="calendar-month" color="white" size={18} /> End</Text>
              <Text style={styles.tournamentDetailsValue}>: {tournamentDetails.endDate[2]}-{tournamentDetails.endDate[1]}-{tournamentDetails.endDate[0]}</Text>
            </View>
            <View style={styles.tournamentDetailsRow}>
              <Text style={styles.tournamentDetailsHeading}>Overs</Text>
              <Text style={styles.tournamentDetailsValue}>: {tournamentDetails.type}</Text>
            </View>
            <View style={styles.tournamentDetailsRow}>
              <Text style={styles.tournamentDetailsHeading}>Format</Text>
              <Text style={styles.tournamentDetailsValue}>: {tournamentDetails.format}</Text>
            </View>
            <View style={styles.tournamentDetailsRow}>
              <Text style={styles.tournamentDetailsHeading}>Ball</Text>
              <Text style={styles.tournamentDetailsValue}>: {tournamentDetails.ballType}</Text>
            </View>
          </LinearGradient>

          {/* Modal for Editing Tournament Details */}
          <Modal
            visible={editingTournament}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setEditingTournament(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Edit Tournament Details</Text>

                <Text style={styles.modalInputLabel}>Name</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Tournament Name"
                  value={editedDetails.name || ''}
                  onChangeText={(text) => setEditedDetails({ ...editedDetails, name: text })}
                />

                <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'column' }}>
                    <Text style={styles.modalInputLabel}>Start Date</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Start Date"
                      value={editedDetails.startDate || ''}
                      onChangeText={(text) => setEditedDetails({ ...editedDetails, startDate: text })}
                    />
                  </View>

                  <View style={{ flexDirection: 'column' }}>
                    <Text style={styles.modalInputLabel}>End Date</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="End Date"
                      value={editedDetails.endDate || ''}
                      onChangeText={(text) => setEditedDetails({ ...editedDetails, endDate: text })}
                    />
                  </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'column' }}>
                    <Text style={styles.modalInputLabel}>Overs</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Type"
                      value={editedDetails.type || ''}
                      onChangeText={(text) => setEditedDetails({ ...editedDetails, type: text })}
                    />
                  </View>

                  <View style={{ flexDirection: 'column' }}>
                    <Text style={styles.modalInputLabel}>Ball</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Ball Type"
                      value={editedDetails.ballType || ''}
                      onChangeText={(text) => setEditedDetails({ ...editedDetails, ballType: text })}
                    />
                  </View>
                </View>

                <Text style={styles.modalInputLabel}>Venues <Text style={{ fontSize: 12, fontWeight: 'light' }}>(, separated)</Text></Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Venues (comma-separated)"
                  value={editedDetails.venues ? editedDetails.venues.join(', ') : ''}
                  onChangeText={(text) => {
                    const updatedVenues = text
                      .split(',')
                      .map((venue) => venue.trim())
                      .filter((venue) => venue);
                    setEditedDetails({ ...editedDetails, venues: updatedVenues });
                  }}
                />
                <View style={styles.modalButtonContainer}>
                  <Button title="Save Changes" onPress={updateTournamentDetails} />
                  <Button title="Cancel" color="red" onPress={() => setEditingTournament(false)} />
                </View>
              </View>
            </View>
          </Modal>
        </>
      ) : (
        <Text>No details available</Text>
      )}
    </View>
  );
};

export const Teams = ({ id, isCreator }) => {
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState("");
  const [teamId, setTeamId] = useState("");
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState({ key: '', value: false });
  const [enteredTeamName, setEnteredTeamName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(500)).current;

  const fetchTeams = async (id) => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("Please login again");
      setLoading({ key: 'All', value: true });
      const response = await axios.get(
        `https://score360-7.onrender.com/api/v1/tournaments/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTeams(response.data.teamNames);
    } catch (err) {
      setError("Failed to fetch Team names");
    } finally {
      setLoading({ key: 'All', value: false });
    }
  };

  const searchTeamsByName = async (name) => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("Please login again");
      setLoading({ key: 'Search', value: true });
      const response = await axios.get(
        `https://score360-7.onrender.com/api/v1/teams/search/name`,
        {
          params: { name },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDropdownOptions(response.data.data);
    } catch (err) {
      setError("Failed to search for teams");
    } finally {
      setLoading({ key: 'Search', value: false });
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
    debounce((name: string) => searchTeamsByName(name), 500),
    []
  );

  const handleInputChange = (value: string) => {
    setEnteredTeamName(value);
    debouncedSearch(value);
  };

  const addNewTeam = async (teamid: string, teamname: string) => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("Please login again");
      setLoading({ key: 'Add', value: true });
      await axios.post(
        `https://score360-7.onrender.com/api/v1/tournaments/${id}/add-teams`,
        [teamid.trim()],
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setEnteredTeamName('');
      setTeamId('');
      fetchTeams(id);
      setError("");
    } catch (err) {
      setError("Failed to add team");
    } finally {
      setLoading({ key: 'All', value: false });
    }
  };

  const handleDeleteTeamHandler = async (teamId) => {
    const token = await AsyncStorage.getItem('jwtToken');
    setLoading({ key: 'All', value: true })
    if (!token) {
      throw new Error("Login Again");
      return;
    }
    try {
      await axios.post(
        `https://score360-7.onrender.com/api/v1/tournaments/${id}/remove-teams`,
        [teamId.trim()],
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (err) {
      setError("Couldn't delete team");
    } finally {
      setLoading({ key: 'All', value: false });
      fetchTeams(id);
    }
  }

  useEffect(() => {
    fetchTeams(id);
  }, [id]);

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Handle closing modal
  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 500,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  return (
    <View style={styles.tournamentTeams}>
      <ScrollView>
        {teams?.length !== 0 && (
          teams?.map((team) => (
            <LinearGradient
              key={team.name}
              colors={['#0866AA', '#6BB9F0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.teamCard}>
              <View style={styles.teamHeader}>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: 10, alignItems: 'center' }}>
                  <Image source={{ uri: team.logoPath }} style={styles.teamImage} resizeMode='cover' />
                  <View>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <Text style={styles.teamCaptain}>{team.captain.name}</Text>
                  </View>
                </View>
              </View>
              {isCreator &&
                <Pressable onPress={() => handleDeleteTeamHandler(team.id)}>
                  <Icon name="delete" size={24} color="black" />
                </Pressable>
              }
            </LinearGradient>
          ))
        )}
      </ScrollView>
      {loading.value !== true && teams?.length == 0 && (
        <Text style={styles.addTournamentWarning}>Add teams to the tournament</Text>
      )}
      {loading.value === true && <ActivityIndicator size="large" color="white" />}
      {isCreator && <TouchableOpacity style={styles.addButton} onPress={openModal}>
        <Text style={styles.addButtonText}>Add Teams</Text>
      </TouchableOpacity>}

      {/* Modal for adding a team */}
      <Modal visible={modalVisible} transparent animationType="none">
        <TouchableOpacity onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.teamModalContent, { transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.searchBox}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search team..."
                  value={enteredTeamName}
                  onChangeText={(value) => handleInputChange(value)}
                />
                <AntDesign name="search1" size={20} color="gray" style={styles.searchIcon} />
              </View>
              {loading.value ? (
                <ActivityIndicator size="large" color="#000" />
              ) : (
                <FlatList
                  data={dropdownOptions}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <Pressable
                      style={styles.teamOptions}
                      onPress={() => {
                        setEnteredTeamName(item.name);
                        setTeamId(item.id);
                        addNewTeam(item.id, item.name);
                        setShowDropdown(false);
                        setEnteredTeamName("");
                        setDropdownOptions([]);
                      }}
                    >
                      <LinearGradient
                        key={item.name}
                        colors={['#0866AA', '#6BB9F0']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.teamCard}>
                        <View style={styles.teamHeader}>
                          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: 10, alignItems: 'center' }}>
                            <Image source={{ uri: item.logoPath }} style={styles.teamImage} resizeMode='cover' />
                            <View>
                              <Text style={styles.teamName}>{item.name}</Text>
                              <Text style={styles.teamCaptain}>{item.captain.name}</Text>
                            </View>
                          </View>
                        </View>
                      </LinearGradient>
                    </Pressable>
                  )}
                />
              )}
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export const Matches = ({ id, isCreator }) => {
  const [matchDetails, setMatchDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [venues, setVenues] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchDate, setMatchDate] = useState(new Date());
  const [matchTime, setMatchTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [venue, setVenue] = useState('');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualTeamA, setManualTeamA] = useState('');
  const [manualTeamB, setManualTeamB] = useState('');
  const [manualMatchDate, setManualMatchDate] = useState(new Date());
  const [manualMatchTime, setManualMatchTime] = useState(new Date());
  const [manualVenue, setManualVenue] = useState('');
  const [tournamentData, setTournamentData] = useState(null);
  const [manualMatchTeamA, setManualMatchTeamA] = useState(null);
  const [manualMatchTeamB, setManualMatchTeamB] = useState(null);
  const [manualMatchShowDatePicker, setManualMatchShowDatePicker] = useState(false);
  const [manualMatchShowTimePicker, setManualMatchShowTimePicker] = useState(false);
  const [manualMatchVenue, setManualMatchVenue] = useState('');

  // Fetch Match Details
  const fetchMatchDetails = async (id) => {
    setLoading(true);
    const token = await AsyncStorage.getItem('jwtToken');
    if (!token) {
      setError('Please Login Again');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `https://score360-7.onrender.com/api/v1/tournaments/${id}/matches`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setMatchDetails(response.data);
    } catch (error) {
      console.error('Error fetching matches:', error?.response?.data || error.message);
      setError('Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Venues
  const fetchTournamentDetails = async (id) => {
    const token = await AsyncStorage.getItem('jwtToken');
    if (!token) {
      setError('Please Login Again');
      return;
    }

    try {
      const response = await axios.get(`https://score360-7.onrender.com/api/v1/tournaments/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setTournamentData(response.data);
      setVenues(response.data.venues);
    } catch (error) {
      setError('Failed to fetch tournament details');
    }
  };

  // AI Match Schedule Handler
  const aiMatchScheduleHandler = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('jwtToken');
    if (!token) {
      setError('Please Login Again');
      setLoading(false);
      return;
    }

    try {
      const venuesQuery = venues.join(',');
      await axios.post(`https://score360-7.onrender.com/api/v1/tournaments/${id}/schedule-matches?venues=${venuesQuery}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchMatchDetails(id);
    } catch (error) {
      setError('Failed to schedule matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchDetails(id);
    fetchTournamentDetails(id);
  }, [id]);

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  };

  const handleScheduleSubmit = async () => {
    if (!selectedMatch) return;

    const selectedDateTime = moment(matchDate)
      .set({
        hour: moment(matchTime).hour(),
        minute: moment(matchTime).minute(),
      });

    const payload = {
      matchDate: selectedDateTime.format("YYYY-MM-DD"),
      matchTime: selectedDateTime.format("HH:mm"),
      venue,
    };

    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const response = await axios.put(
        `https://score360-7.onrender.com/api/v1/tournaments/${id}/matches/${selectedMatch.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Match scheduled successfully:', response.data);
      setModalVisible(false);
    } catch (error) {
      console.error('Error scheduling match:', error?.response?.data || error.message);
      Alert.alert('Error', 'Failed to schedule match');
    }
  };

  const manualMatchScheduleHandler = async () => {
    console.log(`${manualMatchTeamB}, ${manualMatchTeamA}, ${manualMatchDate}, ${manualMatchTime}, ${manualMatchVenue}`);

    if (!manualMatchTeamA || !manualMatchTeamB || !manualMatchDate || !manualMatchTime || !manualMatchVenue) {
      alert('Please fill in all fields.');
      return;
    }

    if (manualMatchTeamA === manualMatchTeamB) {
      alert('Team A and Team B cannot be the same.');
      return;
    }

    const selectedDateTime = moment(manualMatchDate)
      .set({
        hour: moment(manualMatchTime).hour(),
        minute: moment(manualMatchTime).minute(),
      });
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        setError('Please Login Again');
        setLoading(false);
        return;
      }

      const response = await axios.post(`https://score360-7.onrender.com/api/v1/matches/schedule`, {
        tournamentId: id,
        team1Id: manualMatchTeamA,
        team2Id: manualMatchTeamB,
        overs: +tournamentData.type,
        venue: manualMatchVenue,
        matchDate: selectedDateTime.format("YYYY-MM-DD"),
        matchTime: selectedDateTime.format("HH:mm"),
      },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

      if (response.status === 201 || response.status === 200) {
        alert('Match scheduled successfully!');
        setIsManualModalOpen(false);
        fetchMatchDetails(id);
      }
    } catch (error) {
      console.error('Manual match schedule error:', error);
      alert('Failed to schedule match manually.');
    }
  };

  return (
    <View style={styles.matchTab}>
      {loading && <ActivityIndicator />}
      {!loading && (
        <>
          {/* Match Details Section */}
          <ScrollView>

            {matchDetails.length > 0 ? (
              <View style={styles.matchesContainer}>
                {matchDetails.map((match, index) => (
                  <LinearGradient
                    key={index}
                    colors={['#0866AA', '#6BB9F0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.matchCard}>
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'space-between', borderBottomColor: 'white', borderBottomWidth: 1, paddingBottom: 4 }}>
                      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', rowGap: 10, paddingBottom: 4 }}>
                        <Image source={{ uri: match.team1.logoPath }} style={styles.logo} />
                        <Text style={styles.matchTeamName}>
                          {getInitials(match.team1?.name)}
                        </Text>
                        <Text style={styles.vs}>VS</Text>
                        <Text style={styles.matchTeamName}>
                          {getInitials(match.team2?.name)}
                        </Text>
                        <Image source={{ uri: match.team2.logoPath }} style={styles.logo} />
                      </View>
                      <Icon
                        name="edit"
                        size={18}
                        color="white"
                        onPress={() => {
                          setSelectedMatch(match);
                          setMatchDate(new Date(match.matchDate[0], match.matchDate[1] - 1, match.matchDate[2]));
                          setMatchTime(new Date());
                          setVenue(match.venue || '');
                          setModalVisible(true);
                        }}
                      />
                    </View>
                    <Text style={styles.matchStage}>{match.stage}</Text>
                    <Text style={[styles.matchText, { textTransform: 'uppercase' }]}>
                      <Icon name="location-on" color="white" size={18} />
                      Venue: {match.venue}
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                      <Text style={styles.matchText}>
                        <Icon name="calendar-today" color="white" size={18} />
                        Date: {match.matchDate !== null ? `${match.matchDate[2]} - ${match.matchDate[1]} - ${match.matchDate[0]}` : 'Date not decided'
                        }</Text>
                      <Text style={styles.matchText}>
                        <Icon name="emoji-events" color="white" size={18} />
                        Winner:
                        {match.winner || 'N/A'}
                      </Text>
                    </View>
                  </LinearGradient>
                ))
                }
              </View>
            ) : (
              <View style={styles.matchScheduler}>
                {isCreator &&
                  <View style={styles.matchScheduleOptions}>
                    <Text style={styles.matchScheduleTitle}>How would you like to schedule the matches?</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
                      <Pressable onPress={() => setIsManualModalOpen(true)}>
                        <LinearGradient style={styles.matchScheduleOptionContainer} colors={['#0866AA', '#6BB9F0']}>
                          <Icon name="person" size={40} color="white" />
                          <Text style={styles.matchScheduleOption} >Manually</Text>
                        </LinearGradient>
                      </Pressable>
                      <Pressable onPress={aiMatchScheduleHandler}>
                        <LinearGradient style={styles.matchScheduleOptionContainer} colors={['#0866AA', '#6BB9F0']}>
                          <Icon name="smart-toy" size={40} color="white" />
                          <Text style={styles.matchScheduleOption}>Using AI</Text>
                        </LinearGradient>
                      </Pressable>
                    </View>
                  </View>
                }
              </View>
            )}
          </ScrollView>
        </>
      )}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Match Update */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.matchUpdateModalOverlay}>
          <View style={styles.matchUpdateModalContainer}>
            <Text style={styles.matchUpdateModalTitle}>Edit Match</Text>
            <View style={styles.inputTextContainer}>
              <Text style={styles.inputModalText}>Venue</Text>
              <TextInput
                placeholder="Venue"
                value={venue}
                onChangeText={setVenue}
                style={styles.input}
              />
            </View>

            <View style={styles.inputTeamContainer}>
              <Text style={styles.inputModalText}>Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} >
                <Text style={styles.input}>{matchDate ? moment(matchDate).format('YYYY-MM-DD') : 'Select Date'}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={matchDate}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setMatchDate(selectedDate);
                  }}
                />
              )}
            </View>

            <View style={styles.inputTextContainer}>
              <Text style={styles.inputModalText}>Time</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.input}>
                <Text style={styles.inputModalText}>{matchTime ? moment(matchTime).format('HH:mm') : 'Select Time'}</Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={matchTime}
                  mode="time"
                  display="default"
                  style={styles.input}
                  onChange={(event, selectedTime) => {
                    setShowTimePicker(false);
                    if (selectedTime) setMatchTime(selectedTime);
                  }}
                />
              )}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 20 }}>
              <TouchableOpacity style={{ marginVertical: 10, backgroundColor: 'white', padding: 10, borderRadius: 10 }} onPress={handleScheduleSubmit} >
                <Text>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginVertical: 10, backgroundColor: 'white', padding: 10, borderRadius: 10 }} >
                <Text>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {isManualModalOpen && (

        // Manual match schedule
        <Modal
          transparent={true}
          visible={isManualModalOpen}
          animationType="slide"
          onRequestClose={() => setIsManualModalOpen(false)}
        >
          <View style={styles.matchUpdateModalOverlay}>
            <View style={styles.matchUpdateModalContainer}>
              <Text style={styles.modalTitle}>Schedule Match Manually</Text>

              {/* Team A Dropdown */}
              <Text style={styles.inputModalText}>Team A</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={manualMatchTeamA}
                  onValueChange={(itemValue) => setManualMatchTeamA(itemValue)}
                >
                  <Picker.Item label="Select Team A" value="" />
                  {tournamentData.teamNames.map((team) => (
                    <Picker.Item key={team.id} label={team.name} value={team.id} />
                  ))}
                </Picker>
              </View>

              {/* Team B Dropdown */}
              <Text style={styles.inputModalText}>Team B</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={manualMatchTeamB}
                  onValueChange={(itemValue) => setManualMatchTeamB(itemValue)}
                >
                  <Picker.Item label="Select Team B" value="" />
                  {tournamentData.teamNames.map((team) => (
                    <Picker.Item key={team.id} label={team.name} value={team.id} />
                  ))}
                </Picker>
              </View>

              {/* Date Picker */}
              <View style={styles.inputTeamContainer}>
                <Text style={styles.inputModalText}>Date</Text>
                <TouchableOpacity onPress={() => setManualMatchShowDatePicker(true)}>
                  <Text style={styles.input}>
                    {manualMatchDate ? moment(manualMatchDate).format('YYYY-MM-DD') : 'Select Date'}
                  </Text>
                </TouchableOpacity>
                {manualMatchShowDatePicker && (
                  <DateTimePicker
                    value={manualMatchDate || new Date()}
                    mode="date"
                    display="default"
                    minimumDate={new Date()}
                    onChange={(event, selectedDate) => {
                      setManualMatchShowDatePicker(false);
                      if (selectedDate) setManualMatchDate(selectedDate);
                    }}
                  />
                )}
              </View>

              {/* Time Picker */}
              <View style={styles.inputTextContainer}>
                <Text style={styles.inputModalText}>Time</Text>
                <TouchableOpacity onPress={() => setManualMatchShowTimePicker(true)} style={styles.input}>
                  <Text style={styles.inputModalText}>
                    {manualMatchTime ? moment(manualMatchTime).format('HH:mm') : 'Select Time'}
                  </Text>
                </TouchableOpacity>
                {manualMatchShowTimePicker && (
                  <DateTimePicker
                    value={manualMatchTime || new Date()}
                    mode="time"
                    display="default"
                    onChange={(event, selectedTime) => {
                      setManualMatchShowTimePicker(false);
                      if (selectedTime) setManualMatchTime(selectedTime);
                    }}
                  />
                )}
              </View>

              {/* Venue Input */}
              <Text style={styles.inputModalText}>Venue</Text>
              <TextInput
                style={styles.input}
                value={manualMatchVenue}
                onChangeText={setManualMatchVenue}
                placeholder="Enter Venue"
              />

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.primaryButton} onPress={manualMatchScheduleHandler}>
                  <Text style={styles.buttonText}>Schedule</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsManualModalOpen(false)} style={styles.cancelButton}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
      <View style={{ flexDirection: 'row', justifyContent: 'center', width: '80%', marginHorizontal: '10%' }}>
        <Pressable onPress={() => setIsManualModalOpen(true)}>
          <LinearGradient style={styles.matchScheduleOptionContainer} colors={['#0866AA', '#6BB9F0']}>
            <Text style={styles.matchScheduleOption} >Schedule More Matches</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
};

export const PointsTable = ({ id }) => {
  const navigation = useNavigation();
  // const [pointsData, setPointsData] = useState(null);
  const pointsData = [
    {
      tournamentId: "t1",
      team: { id: "team1", name: "Mumbai Warriors" },
      matchesPlayed: 5,
      matchesWon: 4,
      matchesLost: 1,
      matchesDrawn: 0,
      points: 8,
      netRunRate: 1.12,
    },
    {
      tournamentId: "t1",
      team: { id: "team2", name: "Delhi Dynamos" },
      matchesPlayed: 5,
      matchesWon: 3,
      matchesLost: 1,
      matchesDrawn: 1,
      points: 7,
      netRunRate: 0.87,
    },
    {
      tournamentId: "t1",
      team: { id: "team3", name: "Chennai Chargers" },
      matchesPlayed: 5,
      matchesWon: 2,
      matchesLost: 2,
      matchesDrawn: 1,
      points: 5,
      netRunRate: -0.14,
    },
    {
      tournamentId: "t1",
      team: { id: "team4", name: "Kolkata Knights" },
      matchesPlayed: 5,
      matchesWon: 1,
      matchesLost: 3,
      matchesDrawn: 1,
      points: 3,
      netRunRate: -0.89,
    },
    {
      tournamentId: "t1",
      team: { id: "team5", name: "Bangalore Blasters" },
      matchesPlayed: 5,
      matchesWon: 0,
      matchesLost: 5,
      matchesDrawn: 0,
      points: 0,
      netRunRate: -1.45,
    },
  ];
  const [loading, setLoading] = useState(false);

  const getPointsTable = async () => {
    const token = await AsyncStorage.getItem('jwtToken');
    if (!token) {
      navigation.navigate('Login');
    }
    try {
      setLoading(true);
      const response = await axios.get(
        `https://score360-7.onrender.com/api/v1/tournaments/points-table/${id}`,
        {
          headers:
          {
            Authorization: `Bearer ${token}`
          }
        }
      )
      // setPointsData(response.data);
      console.log(response.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // getPointsTable();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.team.name}</Text>
      <Text style={styles.cell}>{item.matchesPlayed}</Text>
      <Text style={styles.cell}>{item.matchesWon}</Text>
      <Text style={styles.cell}>{item.matchesLost}</Text>
      <Text style={styles.cell}>{item.matchesDrawn}</Text>
      <Text style={styles.cell}>{item.points}</Text>
      <Text style={styles.cell}>{item.netRunRate.toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={styles.pointsTable}>
      {loading && <ActivityIndicator color='blue' />}
      {!loading &&
        <ScrollView style={styles.pointsTableContainer}>
          <Text style={styles.title}>Points Table</Text>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={styles.headerCell}>Name</Text>
            <Text style={styles.headerCell}>Played</Text>
            <Text style={styles.headerCell}>Won</Text>
            <Text style={styles.headerCell}>Loss</Text>
            <Text style={styles.headerCell}>Draw</Text>
            <Text style={styles.headerCell}>Points</Text>
            <Text style={styles.headerCell}>NRR</Text>
          </View>
          <FlatList
            data={pointsData}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.team.id}-${index}`}
          />
        </ScrollView>
      }
    </View>
  )
}

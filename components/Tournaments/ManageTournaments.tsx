import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Image, Modal, TextInput, Pressable, FlatList, ScrollView, Animated, Button, ImageBackground, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
const backgroundImage = require('../../assets/images/cricsLogo.png');

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
      <StatusBar
        barStyle="light-content"
        backgroundColor="#34B8FF"
        translucent={true}
      />
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
    // paddingHorizontal: 6,
    paddingTop: StatusBar.currentHeight || 0,
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
    marginTop: 10,
    borderBottomWidth: 0.25,
    borderBottomColor: 'white',
  },
  tournamentDetailsHeading: {
    color: 'white',
    flex: 1,
    fontSize: 16,
  },
  tournamentDetailsValue: {
    color: 'white',
    flex: 2,
    fontSize: 16,
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
    flex: 1,
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
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },

  //Matches
  matchTab: {},
  scheduleButtonsHeading: {
    color: 'white',
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  scheduleButtons: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center'
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff0000'
  },
  matchTeamName: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomColor: 'white', borderBottomWidth: 1 }}>
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
        <Text style={styles.addButtonText}>Add Team</Text>
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
                      }}
                    >
                      <Text style={styles.dropdownOption}>{item.name}</Text>
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
      const tournamentData = response.data;
      setVenues(tournamentData.venues);
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

  return (
    <View style={styles.matchTab}>
      {loading && <ActivityIndicator />}
      {!loading && (
        <>
          {/* Match Details Section */}
          <ScrollView>
            <View style={styles.matchesContainer}>
              {matchDetails.length > 0 ? (
                matchDetails.map((match, index) => (
                  <LinearGradient
                    key={index}
                    colors={['#0866AA', '#6BB9F0']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.matchCard}>
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'space-between', borderBottomColor: 'white', borderBottomWidth: 1, paddingBottom: 4 }}>
                      <Image source={{ uri: match.team1.logoPath }} style={styles.logo} />
                      <Text style={styles.matchTeamName}>{match.team1?.name}</Text>
                      <Text style={styles.vs}>VS</Text>
                      <Text style={styles.matchTeamName}>{match.team2?.name}</Text>
                      <Image source={{ uri: match.team2.logoPath }} style={styles.logo} />
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
              ) : (
                <>
                  <Text style={styles.noMatchText}>No matches scheduled yet.</Text>
                  {/* Schedule Buttons */}
                  {isCreator &&
                    <>
                      <Text style={styles.scheduleButtonsHeading}>How would you like to schedule the matches?</Text>
                      <View style={styles.scheduleButtons}>
                        <Pressable onPress={aiMatchScheduleHandler} style={styles.button}>
                          <Text style={styles.buttonText}>USING AI</Text>
                        </Pressable>
                        <Pressable style={styles.button}>
                          <Text style={styles.buttonText}>MANUALLY</Text>
                        </Pressable>
                      </View>
                    </>
                  }
                </>
              )}
            </View>
          </ScrollView>



        </>
      )}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};
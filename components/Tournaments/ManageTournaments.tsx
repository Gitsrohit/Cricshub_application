import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Image, Modal, TextInput, Pressable, FlatList, ScrollView, Animated, Button, ImageBackground, Alert, Dimensions, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
const backgroundImage = require('../../assets/images/cricsLogo.png');
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import apiService from '../APIservices';

export default function ManageTournaments({ route }) {
  const [activeTab, setActiveTab] = useState(route.params.tab);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tournamentDetails, setTournamentsDetails] = useState(null);
  const [sanitizedBannerUrl, setSanitizedBannerUrl] = useState('');
  const { id } = route.params;
  const { isCreator } = route.params;
  const navigation = useNavigation();

  const fetchTournamentDetails = async (id) => {
    try {
      setLoading(true);

      const response = await apiService({
        endpoint: `tournaments/${id}`,
        method: 'GET',
      });

      if (response.success) {
        const data = response.data;
        setTournamentsDetails(data);

        if (data.banner) {
          const sanitizedUrl = data.banner.replace(
            'https://score360-7.onrender.com/api/v1/files/http:/',
            'https://'
          );
          setSanitizedBannerUrl(sanitizedUrl);
        }
      } else {
        console.error('Error fetching tournament:', response.error);
        setError('Failed to fetch tournament details');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
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
          <TouchableOpacity
            style={{ padding: 5 }}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <View style={{ marginBottom: 10, width: '100%', flexDirection: 'row', justifyContent: 'center' }}>
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
    marginTop: StatusBar.currentHeight || 0,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 4,
    color: '#444',
  },
  detailsModalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  inputText: {
    fontSize: 14,
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  column: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
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
  teamsModalOverlay: {
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
  matchUpdateModalText: {
    fontSize: 14,
    textAlign: 'left',
    color: 'white',
    marginTop: 10
  },
  inputModalText: {
    fontSize: 16,
    fontWeight: 400,
    color: 'white'
  },
  pickerContainer: {
    borderBottomColor: '#e5e5e5',
    borderBottomWidth: 1
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
    marginTop: 16
  },
  primaryButton: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  matchUpdateModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500'
  },

  //points table
  pointsTable: {},
  pointsTableContainer: {
    marginVertical: 16,
    marginHorizontal: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  headerRow: {
    backgroundColor: '#eee',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  cell: {
    textAlign: 'center',
    fontSize: 14,
  },
  headerCell: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 15,
  },
  placeholderText: {
    color: '#ccc',
    fontSize: 16,
  },
});

export const Info = ({ id, isCreator }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tournamentDetails, setTournamentsDetails] = useState(null);
  const [sanitizedBannerUrl, setSanitizedBannerUrl] = useState('');
  const [editingTournament, setEditingTournament] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [editedDetails, setEditedDetails] = useState({
    name: '',
    type: '',
    ballType: '',
    venues: [''],
  });

  const fetchTournamentDetails = async (id) => {
    try {
      setLoading(true);
      const response = await apiService({
        endpoint: `tournaments/${id}`,
        method: 'GET',
      });

      if (response.success) {
        const data = response.data;
        setTournamentsDetails(data);
        setEditedDetails({
          ...data,
          venues: data.venues || [],
        });

        if (data.banner) {
          setSanitizedBannerUrl(
            data.banner.replace(
              'https://score360-7.onrender.com/api/v1/files/http:/',
              'https://'
            )
          );
        }
      } else {
        console.error('Fetch error:', response.error);
        setError('Failed to fetch tournament details');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to fetch tournament details');
    } finally {
      setLoading(false);
    }
  };

  const updateTournamentDetails = async () => {
    try {
      setLoading(true);

      const dataToSend = {
        name: editedDetails.name,
        startDate,
        endDate,
        type: editedDetails.type,
        ballType: editedDetails.ballType,
        venues: editedDetails.venues,
      };

      const response = await apiService({
        endpoint: `tournaments/${id}`,
        method: 'PUT',
        body: dataToSend,
      });

      if (response.success) {
        setEditingTournament(false);
        await fetchTournamentDetails(id); // Refresh tournament details
      } else {
        console.error('Update error:', response.error);
        setError(response.error?.message || 'Failed to update tournament details');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
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
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Edit Tournament</Text>

                {/* Name */}
                <Text style={styles.label}>Tournament Name</Text>
                <TextInput
                  style={styles.detailsModalInput}
                  placeholder="Enter name"
                  value={editedDetails.name || ''}
                  onChangeText={(text) => setEditedDetails({ ...editedDetails, name: text })}
                />

                {/* Dates */}
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.label}>Start Date</Text>
                    <TouchableOpacity style={styles.detailsModalInput} onPress={() => setShowStartDatePicker(true)}>
                      <Text style={styles.inputText}>
                        {startDate ? startDate.toDateString() : 'Select start date'}
                      </Text>
                    </TouchableOpacity>
                    {showStartDatePicker && (
                      <DateTimePicker
                        minimumDate={moment().toDate()}
                        value={startDate}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                          setShowStartDatePicker(false);
                          if (selectedDate) setStartDate(selectedDate);
                        }}
                      />
                    )}
                  </View>

                  <View style={styles.column}>
                    <Text style={styles.label}>End Date</Text>
                    <TouchableOpacity style={styles.detailsModalInput} onPress={() => setShowEndDatePicker(true)}>
                      <Text style={styles.inputText}>
                        {endDate ? endDate.toDateString() : 'Select end date'}
                      </Text>
                    </TouchableOpacity>
                    {showEndDatePicker && (
                      <DateTimePicker
                        value={endDate}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                          setShowEndDatePicker(false);
                          if (selectedDate) setEndDate(selectedDate);
                        }}
                      />
                    )}
                  </View>
                </View>

                {/* Overs & Ball */}
                <View style={styles.row}>
                  <View style={styles.column}>
                    <Text style={styles.label}>Overs</Text>
                    <TextInput
                      style={styles.detailsModalInput}
                      placeholder="e.g. 20"
                      keyboardType="numeric"
                      value={editedDetails.type || ''}
                      onChangeText={(text) => setEditedDetails({ ...editedDetails, type: text })}
                    />
                  </View>

                  <View style={styles.column}>
                    <Text style={styles.label}>Ball Type</Text>
                    <TextInput
                      style={styles.detailsModalInput}
                      placeholder="e.g. Leather"
                      value={editedDetails.ballType || ''}
                      onChangeText={(text) => setEditedDetails({ ...editedDetails, ballType: text })}
                    />
                  </View>
                </View>

                {/* Venues */}
                <Text style={styles.label}>Venues <Text style={{ fontSize: 12, fontWeight: '300' }}>(comma-separated)</Text></Text>
                <TextInput
                  style={styles.detailsModalInput}
                  placeholder="Enter venues separated by commas"
                  value={editedDetails.venues?.join(', ') || ''}
                  onChangeText={(text) => {
                    const updatedVenues = text.split(',').map(v => v.trim()).filter(Boolean);
                    setEditedDetails({ ...editedDetails, venues: updatedVenues });
                  }}
                />

                {/* Buttons */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#4CAF50' }]} onPress={updateTournamentDetails}>
                    <Text style={styles.modalButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#f44336' }]} onPress={() => setEditingTournament(false)}>
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
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
      setLoading({ key: 'All', value: true });

      const response = await apiService({
        endpoint: `tournaments/${id}`,
        method: 'GET',
      });

      if (response.success) {
        setTeams(response.data.teamNames || []);
      } else {
        console.error('API Error:', response.error);
        setError(response.error?.message || 'Failed to fetch Team names');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to fetch Team names');
    } finally {
      setLoading({ key: 'All', value: false });
    }
  };

  const searchTeamsByName = async (name) => {
    try {
      setLoading({ key: 'Search', value: true });

      const response = await apiService({
        endpoint: 'teams/search/name',
        method: 'GET',
        params: { name },
      });

      if (response.success) {
        setDropdownOptions(response.data.data || []);
      } else {
        console.error('API Error:', response.error);
        setError(response.error?.message || 'Failed to search for teams');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Failed to search for teams');
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
      setLoading({ key: 'Add', value: true });

      const response = await apiService({
        endpoint: `tournaments/${id}/add-teams`,
        method: 'POST',
        body: [teamid.trim()],
      });

      if (response.success) {
        setEnteredTeamName('');
        setTeamId('');
        await fetchTeams(id);
        setError('');
      } else {
        console.error('API Error:', response.error);
        setError(response.error?.message || 'Failed to add team');
      }
    } catch (err) {
      console.error('Unexpected Error:', err);
      setError('Failed to add team');
    } finally {
      setLoading({ key: 'All', value: false });
    }
  };

  const deleteTeamHandler = async (teamId) => {
    setLoading({ key: 'All', value: true });

    try {
      const response = await apiService({
        endpoint: `tournaments/${id}/remove-teams`,
        method: 'POST',
        body: [teamId.trim()],
      });

      if (!response.success) {
        console.error('API Error:', response.error);
        setError(response.error?.message || "Couldn't delete team");
      } else {
        setError('');
      }
    } catch (err) {
      console.error('Unexpected Error:', err);
      setError("Couldn't delete team");
    } finally {
      setLoading({ key: 'All', value: false });
      fetchTeams(id);
    }
  };

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
                <Pressable onPress={() => deleteTeamHandler(team.id)}>
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
          <View style={styles.teamsModalOverlay}>
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
  const navigation = useNavigation();

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
      const response = await apiService({
        endpoint: `tournaments/${id}/matches`,
        method: 'GET',
      });

      if (response.success) {
        setMatchDetails(response.data);
      } else {
        setError('Failed to fetch matches');
        console.error('Error fetching matches:', response.error);
      }
    } catch (error) {
      console.error('Unexpected error fetching matches:', error);
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
      const response = await apiService({
        endpoint: `tournaments/${id}`,
        method: 'GET',
      });

      if (response.success) {
        setTournamentData(response.data);
        setVenues(response.data.venues);
      } else {
        setError('Failed to fetch tournament details');
      }
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
      const response = await apiService({
        endpoint: `tournaments/${id}/schedule-matches`,
        method: 'POST',
        params: { venues: venuesQuery },
        body: {},
      });

      if (response.success) {
        fetchMatchDetails(id);
      } else {
        setError('Failed to schedule matches');
        console.error('Schedule API error:', response.error);
      }
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

    const selectedDateTime = moment(matchDate).set({
      hour: moment(matchTime).hour(),
      minute: moment(matchTime).minute(),
    });

    const payload = {
      matchDate: selectedDateTime.format("YYYY-MM-DD"),
      matchTime: selectedDateTime.format("HH:mm"),
      venue,
    };

    const { success, data, error } = await apiService({
      endpoint: `tournaments/${id}/matches/${selectedMatch.id}`,
      method: 'PUT',
      body: payload,
    });

    if (success) {
      console.log("Match scheduled successfully:", data);
      setModalVisible(false);
      fetchMatchDetails(id);
    } else {
      console.error("Error scheduling match:", error);
      Alert.alert("Error", "Failed to schedule match.");
    }
  };

  // Handle Manual Match Scheduling
  const manualMatchScheduleHandler = async () => {
    console.log(`${manualMatchTeamB}, ${manualMatchTeamA}, ${manualMatchDate}, ${manualMatchTime}, ${manualMatchVenue}`);

    if (!manualMatchTeamA || !manualMatchTeamB || !manualMatchDate || !manualMatchTime || !manualMatchVenue) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (manualMatchTeamA === manualMatchTeamB) {
      Alert.alert("Error", "Team A and Team B cannot be the same.");
      return;
    }

    const selectedDateTime = moment(manualMatchDate).set({
      hour: moment(manualMatchTime).hour(),
      minute: moment(manualMatchTime).minute(),
    });

    const payload = {
      tournamentId: id,
      team1Id: manualMatchTeamA,
      team2Id: manualMatchTeamB,
      overs: +tournamentData.type,
      venue: manualMatchVenue,
      matchDate: selectedDateTime.format("YYYY-MM-DD"),
      matchTime: selectedDateTime.format("HH:mm"),
    };

    const { success, data, error } = await apiService({
      endpoint: 'matches/schedule',
      method: 'POST',
      body: payload,
    });

    if (success) {
      Alert.alert("Success", "Match scheduled successfully!");
      setIsManualModalOpen(false);
      fetchMatchDetails(id);
    } else {
      console.error("Manual match schedule error:", error);
      Alert.alert("Error", "Failed to schedule match manually.");
    }
  };

  const matchPressHandler = (match) => {
    const matchDetails = {
      overs: null,
      venue: match.venue,
      team1Id: match.team1.id,
      team1Name: match.team1.name,
      team1Logo: match.team1.logoPath,
      team2Id: match.team2.id,
      team2Name: match.team2.name,
      team2Logo: match.team2.logoPath,
    };
    if (isCreator)
      navigation.navigate('SelectPlayingII', { matchDetails, matchId: match.id });
    else
      navigation.navigate('CommentaryScorecard', { matchId: match.id });
  }

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
                    <Pressable onPress={() => matchPressHandler(match)} >
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
                    </Pressable>
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
              <Text style={styles.matchUpdateModalTitle}>Schedule Match Manually</Text>

              {/* Team A Dropdown */}
              <Text style={styles.matchUpdateModalText}>Team A</Text>
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
              <Text style={styles.matchUpdateModalText}>Team B</Text>
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
                <Text style={styles.matchUpdateModalText}>Date</Text>
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
                <Text style={styles.matchUpdateModalText}>Time</Text>
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
              <Text style={styles.matchUpdateModalText}>Venue</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={manualMatchVenue}
                  onValueChange={(itemValue) => setManualMatchVenue(itemValue)}
                >
                  <Picker.Item label="Select Venue" value="" />
                  {tournamentData.venues.map((venue, index) => (
                    <Picker.Item key={index} label={venue} value={venue} />
                  ))}
                </Picker>
              </View>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.primaryButton} onPress={manualMatchScheduleHandler}>
                  <Text style={styles.matchUpdateModalButtonText}>Schedule</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsManualModalOpen(false)} style={styles.cancelButton}>
                  <Text style={styles.matchUpdateModalButtonText}>Cancel</Text>
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
  const screenWidth = Dimensions.get('window').width;

  const columnStyles = {
    name: screenWidth * 0.33,
    others: screenWidth * 0.6 / 6, // divide remaining width into 6 columns
  };
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
      return;
    }
    try {
      setLoading(true);
      const { success, data, error } = await apiService({
        endpoint: `tournaments/points-table/${id}`,
        method: 'GET',
      });

      if (success) {
        console.log('Points Table:', data);
        // setPointsData(data);
      } else {
        console.error('Failed to fetch points table:', error);
      }

    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // getPointsTable();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, { width: columnStyles.name }]}>{item.team.name}</Text>
      <Text style={[styles.cell, { width: columnStyles.others }]}>{item.matchesPlayed}</Text>
      <Text style={[styles.cell, { width: columnStyles.others }]}>{item.matchesWon}</Text>
      <Text style={[styles.cell, { width: columnStyles.others }]}>{item.matchesLost}</Text>
      <Text style={[styles.cell, { width: columnStyles.others }]}>{item.matchesDrawn}</Text>
      <Text style={[styles.cell, { width: columnStyles.others }]}>{item.points}</Text>
      <Text style={[styles.cell, { width: columnStyles.others }]}>{item.netRunRate.toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={styles.pointsTable}>
      {loading && <ActivityIndicator color='blue' />}
      {!loading &&
        <ScrollView style={styles.pointsTableContainer}>
          <Text style={styles.title}>Points Table</Text>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.headerCell, { width: columnStyles.name }]}>Name</Text>
            <Text style={[styles.headerCell, { width: columnStyles.others }]}>P</Text>
            <Text style={[styles.headerCell, { width: columnStyles.others }]}>W</Text>
            <Text style={[styles.headerCell, { width: columnStyles.others }]}>L</Text>
            <Text style={[styles.headerCell, { width: columnStyles.others }]}>D</Text>
            <Text style={[styles.headerCell, { width: columnStyles.others }]}>Pt</Text>
            <Text style={[styles.headerCell, { width: columnStyles.others }]}>NRR</Text>
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

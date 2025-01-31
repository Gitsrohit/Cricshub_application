import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Image, Button, Modal, TextInput, Pressable, FlatList, TouchableHighlight } from 'react-native';

export default function ManageTournaments({ route }) {
  const [activeTab, setActiveTab] = useState('INFO');
  const { id } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      {/* Toggle Buttons */}
      <View style={styles.toggleContainer}>
        {['INFO', 'TEAMS', 'MATCHES'].map((tab) => (
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
      </View>
      {activeTab === 'INFO' && <Info id={id} />}
      {activeTab === 'TEAMS' && <Teams id={id} />}
      {activeTab === 'MATCHES' && <Matches id={id} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ManageTournaments
  container: {
    flex: 1,
    backgroundColor: '#002B3D',
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingTop: 40,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 6,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    backgroundColor: '#003344',
    borderRadius: 10,
  },
  activeToggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    backgroundColor: '#004E62',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  toggleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  activeToggleText: {
    color: '#FFF', fontSize: 16, fontWeight: 'bold'
  },

  // Info
  cardContainer: {
    width: '100%',
    padding: 10,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#013A50',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    paddingBottom: 10,
  },
  cardImage: {
    width: '100%',
    justifyContent: 'flex-end',
    height: 100,
  },
  cardContent: {
    paddingHorizontal: 6,
  },
  tournamentName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'semibold',
  },
  tournamentContent: {
    color: '#c6effe',
    fontSize: 16,
    marginVertical: 2,
  },
  contentSubHeading: {
    color: 'white',
  },
  contentCols: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  maintainPadding: {
    paddingHorizontal: 6
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
  teamHeader: {
  },
  teamName: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  teamCaptain: {
    color: 'grey',
    fontSize: 14,
  },
  teamInvite: {
    color: 'grey',
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
    backgroundColor: '#e5e5e5',
    paddingHorizontal: 4,
    paddingVertical: 4,
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
  },
  matchCard: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 15,
    width: '90%',
    borderRadius: 4,
  },
  matchText: {
    color: 'grey',
    fontWeight: 'bold',
  },
  matchStage: {
    fontSize: 16,
    marginVertical: 6,
    color: 'grey',
    fontWeight: 'bold',
  },
  noMatchText: {
    color: 'red',
    fontSize: 20,
    marginTop: 16,
  },
  matchTeamName: {
    fontSize: 18,
    color: 'grey',
    fontWeight: 'bold',
  },
});

export const Info = ({ id }) => {
  const [tournamentDetails, setTournamentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      setTournamentDetails(response.data);
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
    <SafeAreaView>
      {tournamentDetails ? (
        <>
          <View key={tournamentDetails.id} style={styles.card}>
            <Image source={{ uri: sanitizedBannerUrl }} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={styles.tournamentName}>{tournamentDetails.name}</Text>
              <Text style={styles.tournamentContent}>
                🗓 {tournamentDetails.startDate} to {tournamentDetails.endDate}
              </Text>
            </View>
            <View style={styles.contentCols}>
              <Text style={styles.tournamentContent}>⚾ {tournamentDetails.ballType}</Text>
              <Text style={styles.tournamentContent}>{tournamentDetails.type}</Text>
            </View>
            <Text style={[styles.tournamentContent, styles.maintainPadding]}>
              <Text style={styles.contentSubHeading}>Venues:</Text>
              {tournamentDetails.venues.join(', ')}
            </Text>
            <Button color="#013A50" title="✏️ Edit" onPress={() => setEditingTournament(true)} />
          </View>

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
    </SafeAreaView>
  );
};

export const Teams = ({ id }) => {
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState("");
  const [teamId, setTeamId] = useState("");
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState({ key: '', value: false });
  const [enteredTeamName, setEnteredTeamName] = useState('');

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

  const fetchAllTeams = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("Please login again");
      setLoading({ key: 'Search', value: true });
      const response = await axios.get(
        "https://score360-7.onrender.com/api/v1/teams",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDropdownOptions(response.data.data);
      setShowDropdown(true);
    } catch (err) {
      setError("Failed to fetch all teams");
    } finally {
      setLoading({ key: 'Search', value: false });
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
    if (value.trim() === "") {
      fetchAllTeams();
    } else {
      debouncedSearch(value);
    }
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

  useEffect(() => {
    fetchTeams(id);
  }, [id]);

  return (
    <SafeAreaView style={styles.tournamentTeams}>
      <View style={styles.inputTeamContainer}>
        <Text style={styles.inputTeamLabel}>Add Team</Text>
        <TextInput
          style={styles.teamNameInput}
          placeholder="Enter Team Name"
          value={enteredTeamName}
          onChangeText={(value) => handleInputChange(value)}
          onFocus={fetchAllTeams}
        />
        {showDropdown && (
          <View style={styles.dropdown}>
            {dropdownOptions.length === 0 && <Text>No results</Text>}
            <FlatList
              data={dropdownOptions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
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
          </View>
        )}
        {loading.value === true && <ActivityIndicator />}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
      {teams?.length !== 0 && (
        teams?.map((team) => (
          <View key={team.name} style={styles.teamCard}>
            <View style={styles.teamHeader}>
              <Text style={styles.teamName}>{team.name}</Text>
              {team.captain ? (
                <Text style={styles.teamCaptain}>{team.captain.name}</Text>
              ) : (
                <Pressable>
                  <Text style={styles.teamInvite}>Invite captain</Text>
                </Pressable>
              )}
            </View>
            <View>
              <Text></Text>
            </View>
          </View>
        ))
      )}
      {loading.value !== true && teams?.length == 0 && (
        <Text style={styles.addTournamentWarning}>Add teams to the tournament</Text>
      )}
    </SafeAreaView>
  );
};

export const Matches = ({ id }) => {
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
          <View style={styles.matchesContainer}>
            {matchDetails.length > 0 ? (
              matchDetails.map((match, index) => (
                <View key={index} style={styles.matchCard}>
                  <View style={{ flexDirection: 'row', gap: 10, alignItems: 'baseline', borderBottomColor: 'grey', borderBottomWidth: 1 }}>
                    <Text style={styles.matchTeamName}>{match.team1?.name}</Text>
                    <Text style={{ color: 'black' }}>v/s</Text>
                    <Text style={styles.matchTeamName}>{match.team2?.name}</Text>
                  </View>
                  <Text style={styles.matchStage}>{match.stage}</Text>
                  <Text style={[styles.matchText, { textTransform: 'uppercase' }]}>📍 {match.venue}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.matchText}>📅 {match.matchDate ? new Date(match.matchDate).toLocaleString() : 'Date not decided'}</Text>
                    <Text style={styles.matchText}>🏆 {match.winner || 'N/A'}</Text>
                  </View>
                </View>
              ))
            ) : (
              <>
                <Text style={styles.noMatchText}>No matches scheduled yet.</Text>
                {/* Schedule Buttons */}
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
            )}
          </View>



        </>
      )}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};
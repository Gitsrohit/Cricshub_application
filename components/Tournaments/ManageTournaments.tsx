import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Image, Button, Modal, TextInput, Pressable } from 'react-native';

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
    backgroundColor: 'white',
    marginHorizontal: 15,
    borderRadius: 4
  },
  modalContent: {
    padding: 10,
    color: 'black',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    marginTop: 4,
    height: 40,
    fontSize: 16
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
    backgroundColor: '#013A50',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'semibold',
  },
  teamCaptain: {
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

});

export const Info = ({ id }) => {
  const [tournamentDetails, setTournamentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sanitizedBannerUrl, setSanitizedBannerUrl] = useState('');
  const [editingTournament, setEditingTournament] = useState(false);
  const [editedDetails, setEditedDetails] = useState({});

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

                <Text style={styles.modalInputLabel}>Start Date</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Start Date"
                  value={editedDetails.startDate || ''}
                  onChangeText={(text) => setEditedDetails({ ...editedDetails, startDate: text })}
                />

                <Text style={styles.modalInputLabel}>End Date</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="End Date"
                  value={editedDetails.endDate || ''}
                  onChangeText={(text) => setEditedDetails({ ...editedDetails, endDate: text })}
                />

                <Text style={styles.modalInputLabel}>Type</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Type"
                  value={editedDetails.type || ''}
                  onChangeText={(text) => setEditedDetails({ ...editedDetails, type: text })}
                />

                <Text style={styles.modalInputLabel}>Ball</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Ball Type"
                  value={editedDetails.ballType || ''}
                  onChangeText={(text) => setEditedDetails({ ...editedDetails, ballType: text })}
                />

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
  const [error, setError] = useState('');
  const [teamName, setTeamName] = useState('');

  const fetchTeams = async (id) => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) throw new Error('Please login again');
      const response = await axios.get(
        `https://score360-7.onrender.com/api/v1/tournaments/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTeams(response.data.teamNames);
      console.log(response.data.teamNames);
    } catch (err) {
      setError('Failed to fetch Team names');
    }
  };

  const addNewTeam = async () => {
    if (!teamName.trim()) {
      setError('Team name cannot be empty');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) throw new Error('Please login again');

      const response = await axios.post(
        `https://score360-7.onrender.com/api/v1/tournaments/${id}/add-teams`,
        [teamName.trim()], // Sending teamName as an array
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // If successful, refresh the team list and clear the input
      setTeams((prevTeams) => [...prevTeams, { name: teamName.trim() }]);
      setTeamName('');
      setError('');
      console.log('Team added successfully:', response.data);
    } catch (err) {
      setError('Failed to add team');
      console.error(err);
    }
  };

  const inviteCaptainHandler = () => {
    // Implementation for inviting the captain can go here
  };

  useEffect(() => {
    fetchTeams(id);
  }, [id]);

  return (
    <SafeAreaView style={styles.tournamentTeams}>
      <View style={styles.inputTeamContainer}>
        <Text style={styles.inputTeamLabel}>Enter Team Name</Text>
        <TextInput
          style={styles.teamNameInput}
          placeholder="Team Name"
          value={teamName}
          onChangeText={(value) => setTeamName(value)}
        />
        <Button onPress={addNewTeam} title="Add Team" />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
      {teams?.length !== 0 ? (
        teams?.map((team) => (
          <View key={team.name} style={styles.teamCard}>
            <View style={styles.teamHeader}>
              <Text style={styles.teamName}>{team.name}</Text>
              {team.captain ? (
                <Text style={styles.teamCaptain}>{team.captain.name}</Text>
              ) : (
                <Pressable onPress={inviteCaptainHandler}>
                  <Text style={styles.teamInvite}>Invite captain</Text>
                </Pressable>
              )}
            </View>
            <View style={styles.teamPlayers}>
              <Text style={styles.teamPlayerHeading}>
                Players:
                {team.players?.map((player, index) => (
                  <Text key={index} style={styles.teamPlayerName}>
                    {player}
                  </Text>
                ))}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <Text>Add teams to the tournament</Text>
      )}
    </SafeAreaView>
  );
};


export const Matches = ({ id }) => {
  return (
    <Text>Matches</Text>
  )
}
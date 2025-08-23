import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Modal, Pressable, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import apiService from '../../APIservices';

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
        setMatchDetails(response.data.data);
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
        setTournamentData(response.data.data);
        setVenues(response.data.data.venues);
      } else {
        setError('Failed to fetch tournament details');
      }
    } catch (error) {
      setError('Failed to fetch tournament details');
    }
  };

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
          {matchDetails.length > 0 ? (
            <View style={styles.matchesContainer}>
              {matchDetails.map((match, index) => (
                <View
                  key={index}
                  style={styles.matchCard}>
                  <Pressable onPress={() => matchPressHandler(match)} >
                    <View style={styles.cardHeader}>
                      <View style={styles.teamContainer}>
                        <Image source={{ uri: match.team1.logoPath }} style={styles.logo} />
                        <Text style={styles.matchTeamName}>{getInitials(match.team1?.name)}</Text>
                      </View>
                      <Text style={styles.vs}>VS</Text>
                      <View style={styles.teamContainer}>
                        <Text style={styles.matchTeamName}>{getInitials(match.team2?.name)}</Text>
                        <Image source={{ uri: match.team2.logoPath }} style={styles.logo} />
                      </View>
                      <Icon
                        name="edit"
                        size={20}
                        color="#007bff"
                        onPress={() => {
                          setSelectedMatch(match);
                          setMatchDate(new Date(match.matchDate[0], match.matchDate[1] - 1, match.matchDate[2]));
                          setMatchTime(new Date());
                          setVenue(match.venue || '');
                          setModalVisible(true);
                        }}
                        style={styles.editIcon}
                      />
                    </View>
                    <View style={styles.cardBody}>
                      <Text style={styles.matchStage}>{match.stage}</Text>
                      <View style={styles.detailRow}>
                        <Icon name="location-on" color="#007bff" size={18} />
                        <Text style={styles.matchText}>Venue: {match.venue}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Icon name="calendar-today" color="#007bff" size={18} />
                        <Text style={styles.matchText}>
                          Date: {match.matchDate !== null ? `${match.matchDate[2]} - ${match.matchDate[1]} - ${match.matchDate[0]}` : 'Date not decided'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Icon name="emoji-events" color="#007bff" size={18} />
                        <Text style={styles.matchText}>Winner: {match.winner || 'N/A'}</Text>
                      </View>
                    </View>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              {isCreator && (
                <>
                  <Text style={styles.emptyText}>No matches scheduled yet.</Text>
                  <Text style={styles.emptyText}>How would you like to schedule the matches?</Text>
                  <View style={styles.scheduleOptions}>
                    <TouchableOpacity style={styles.scheduleButton} onPress={() => setIsManualModalOpen(true)}>
                      <Icon name="person" size={50} color="#007bff" />
                      <Text style={styles.scheduleButtonText}>Manually</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.scheduleButton} onPress={aiMatchScheduleHandler}>
                      <Icon name="smart-toy" size={50} color="#007bff" />
                      <Text style={styles.scheduleButtonText}>Using AI</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          )}
        </>
      )}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Match</Text>

            <Text style={styles.label}>Venue</Text>
            <TextInput
              placeholder="Venue"
              value={venue}
              onChangeText={setVenue}
              style={styles.input}
            />

            <Text style={styles.label}>Date</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
              <Text>{matchDate ? moment(matchDate).format('YYYY-MM-DD') : 'Select Date'}</Text>
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

            <Text style={styles.label}>Time</Text>
            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.input}>
              <Text>{matchTime ? moment(matchTime).format('HH:mm') : 'Select Time'}</Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={matchTime}
                mode="time"
                display="default"
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) setMatchTime(selectedTime);
                }}
              />
            )}

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleScheduleSubmit}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {isManualModalOpen && (
        <Modal
          transparent={true}
          visible={isManualModalOpen}
          animationType="slide"
          onRequestClose={() => setIsManualModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.manualModalContent}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Schedule Match Manually</Text>

                <Text style={styles.label}>Team A</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={manualMatchTeamA}
                    onValueChange={(itemValue) => setManualMatchTeamA(itemValue)}
                  >
                    <Picker.Item label="Select Team A" value="" />
                    {tournamentData?.teamNames.map((team) => (
                      <Picker.Item key={team.id} label={team.name} value={team.id} />
                    ))}
                  </Picker>
                </View>

                <Text style={styles.label}>Team B</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={manualMatchTeamB}
                    onValueChange={(itemValue) => setManualMatchTeamB(itemValue)}
                  >
                    <Picker.Item label="Select Team B" value="" />
                    {tournamentData?.teamNames.map((team) => (
                      <Picker.Item key={team.id} label={team.name} value={team.id} />
                    ))}
                  </Picker>
                </View>

                <Text style={styles.label}>Date</Text>
                <TouchableOpacity onPress={() => setManualMatchShowDatePicker(true)} style={styles.input}>
                  <Text>
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

                <Text style={styles.label}>Time</Text>
                <TouchableOpacity onPress={() => setManualMatchShowTimePicker(true)} style={styles.input}>
                  <Text>
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

                <Text style={styles.label}>Venue</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={manualMatchVenue}
                    onValueChange={(itemValue) => setManualMatchVenue(itemValue)}
                  >
                    <Picker.Item label="Select Venue" value="" />
                    {tournamentData?.venues.map((venue, index) => (
                      <Picker.Item key={index} label={venue} value={venue} />
                    ))}
                  </Picker>
                </View>

                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity style={styles.primaryBtn} onPress={manualMatchScheduleHandler}>
                    <Text style={styles.buttonText}>Schedule</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsManualModalOpen(false)} style={styles.cancelBtn}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
      )}

      {matchDetails.length > 0 && isCreator && (
        <TouchableOpacity style={styles.bottomButton} onPress={() => setIsManualModalOpen(true)}>
          <Text style={styles.bottomButtonText}>Schedule More Matches</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  matchTab: {
    flex: 1,
    // backgroundColor: '#f5f5f5',
  },
  matchesContainer: {
    padding: 16,
  },
  matchCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    marginBottom: 10,
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  matchTeamName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  vs: {
    fontSize: 14,
    color: '#999',
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  editIcon: {
    padding: 5,
  },
  cardBody: {
    paddingTop: 10,
  },
  matchStage: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  matchText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  
  // Empty State and Scheduling Options
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: '30%',
  },
  emptyText: {
    fontSize: 18,
    color: '#777',
    textAlign: 'center',
    marginBottom: 10,
  },
  scheduleOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  scheduleButton: {
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  scheduleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007bff',
    marginTop: 8,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  primaryBtn: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  manualModalContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  bottomButton: {
    backgroundColor: '#007bff',
    padding: 15,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Matches;
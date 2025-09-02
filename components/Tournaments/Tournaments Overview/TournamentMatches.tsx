
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Modal, Pressable, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import apiService from '../../APIservices';
import { AppColors } from '../../../assets/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

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
  const [showPlayOffMatchScheduler, setShowPlayOffMatchScheduler] = useState(false);
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
      .join('')
      .substring(0, 3); // Limit to 3 characters max
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

  const playoffMatchScheduleHandler = async () => {
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
      endpoint: 'matches/schedule-playoff',
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
  }

  const getMatchStatusColor = (match) => {
    if (match.winner) return '#4CAF50'; // Green for completed matches
    if (match.matchDate) {
      const matchDateTime = moment(`${match.matchDate[0]}-${match.matchDate[1]}-${match.matchDate[2]}`);
      if (moment().isAfter(matchDateTime)) return '#FF9800'; // Orange for ongoing matches
      return '#2196F3'; // Blue for upcoming matches
    }
    return '#9E9E9E'; // Gray for unscheduled matches
  };

  const getMatchStatusText = (match) => {
    if (match.winner) return 'Completed';
    if (match.matchDate) {
      const matchDateTime = moment(`${match.matchDate[0]}-${match.matchDate[1]}-${match.matchDate[2]}`);
      if (moment().isAfter(matchDateTime)) return 'Live';
      return 'Upcoming';
    }
    return 'Unscheduled';
  };

  return (
    <View style={styles.matchTab}>
      {loading && <ActivityIndicator size="large" color={AppColors.primary} />}
      {!loading && (
        <>
          {matchDetails.length > 0 ? (
            <ScrollView style={styles.matchesContainer}>
              {matchDetails.map((match, index) => (
                <Pressable 
                  key={index} 
                  onPress={() => matchPressHandler(match)}
                  style={({ pressed }) => [
                    styles.matchCard,
                    pressed && styles.pressedEffect
                  ]}
                >
                  <LinearGradient
                    colors={['#ffffff', '#f8f9fa']}
                    style={styles.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.teamContainer}>
                        <Image source={{ uri: match.team1.logoPath }} style={styles.logo} />
                        <Text style={styles.matchTeamName}>
                          {getInitials(match.team1?.name)}
                        </Text>
                      </View>
                      
                      <View style={styles.vsContainer}>
                        <Text style={styles.vs}>VS</Text>
                        <View style={[styles.statusBadge, { backgroundColor: getMatchStatusColor(match) }]}>
                          <Text style={styles.statusText}>{getMatchStatusText(match)}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.teamContainer}>
                        <Text style={styles.matchTeamName}>
                          {getInitials(match.team2?.name)}
                        </Text>
                        <Image source={{ uri: match.team2.logoPath }} style={styles.logo} />
                      </View>
                      
                      {isCreator && (
                        <Icon
                          name="edit"
                          size={20}
                          color={AppColors.primary}
                          onPress={() => {
                            setSelectedMatch(match);
                            setMatchDate(new Date(match.matchDate[0], match.matchDate[1] - 1, match.matchDate[2]));
                            setMatchTime(new Date());
                            setVenue(match.venue || '');
                            setModalVisible(true);
                          }}
                          style={styles.editIcon}
                        />
                      )}
                    </View>
                    
                    <View style={styles.cardBody}>
                      <Text style={styles.matchStage}>{match.stage}</Text>
                      
                      <View style={styles.detailRow}>
                        <Icon name="location-on" color={AppColors.primary} size={18} />
                        <Text style={styles.matchText}>Venue: {match.venue || 'TBD'}</Text>
                      </View>
                      
                      <View style={styles.detailRow}>
                        <Icon name="calendar-today" color={AppColors.primary} size={18} />
                        <Text style={styles.matchText}>
                          Date: {match.matchDate ? `${match.matchDate[2]}-${match.matchDate[1]}-${match.matchDate[0]}` : 'TBD'}
                        </Text>
                      </View>
                      
                      {match.winner && (
                        <View style={styles.detailRow}>
                          <Icon name="emoji-events" color="#FFD700" size={18} />
                          <Text style={styles.winnerText}>Winner: {match.winner}</Text>
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              {isCreator && (
                <>
                  <Text style={styles.emptyText}>No matches scheduled yet.</Text>
                  <Text style={styles.emptySubText}>How would you like to schedule the matches?</Text>
                  <View style={styles.scheduleOptions}>
                    <TouchableOpacity 
                      style={[styles.scheduleButton, styles.manualButton]} 
                      onPress={() => setIsManualModalOpen(true)}
                    >
                      <LinearGradient
                        colors={[AppColors.primary, '#0056b3']}
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Icon name="person" size={40} color="#fff" />
                        <Text style={styles.scheduleButtonText}>Manually</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.scheduleButton, styles.aiButton]} 
                      onPress={aiMatchScheduleHandler}
                    >
                      <LinearGradient
                        colors={['#6c5ce7', '#a29bfe']}
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Icon name="smart-toy" size={40} color="#fff" />
                        <Text style={styles.scheduleButtonText}>Using AI</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          )}
        </>
      )}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      {isCreator && (
        <>
          <TouchableOpacity
            onPress={() => setShowPlayOffMatchScheduler(true)}
            style={[styles.bottomButton, styles.playoffButton]}
          >
            <LinearGradient
              colors={['#ff7e5f', '#feb47b']}
              style={styles.buttonGradientFull}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Icon name="play-arrow" size={20} color="#fff" />
              <Text style={styles.bottomButtonText}>Schedule Playoffs</Text>
            </LinearGradient>
          </TouchableOpacity>

          {matchDetails.length > 0 && (
            <TouchableOpacity 
              style={[styles.bottomButton, styles.scheduleMoreButton]} 
              onPress={() => setIsManualModalOpen(true)}
            >
              <LinearGradient
                colors={[AppColors.primary, '#0056b3']}
                style={styles.buttonGradientFull}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Icon name="add" size={20} color="#fff" />
                <Text style={styles.bottomButtonText}>Schedule More Matches</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Edit Match Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={[AppColors.primary, '#0056b3']}
              style={styles.modalHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.modalTitle}>Edit Match</Text>
              <Icon 
                name="close" 
                size={24} 
                color="#fff" 
                style={styles.closeIcon} 
                onPress={() => setModalVisible(false)} 
              />
            </LinearGradient>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.label}>Venue</Text>
              <View style={styles.inputContainer}>
                <Icon name="location-on" size={20} color={AppColors.primary} style={styles.inputIcon} />
                <TextInput
                  placeholder="Enter venue"
                  placeholderTextColor="#999"
                  value={venue}
                  onChangeText={setVenue}
                  style={styles.input}
                />
              </View>

              <Text style={styles.label}>Date</Text>
              <TouchableOpacity 
                onPress={() => setShowDatePicker(true)} 
                style={styles.inputContainer}
              >
                <Icon name="calendar-today" size={20} color={AppColors.primary} style={styles.inputIcon} />
                <Text style={styles.dateTimeText}>
                  {matchDate ? moment(matchDate).format('MMMM Do, YYYY') : 'Select Date'}
                </Text>
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
              <TouchableOpacity 
                onPress={() => setShowTimePicker(true)} 
                style={styles.inputContainer}
              >
                <Icon name="access-time" size={20} color={AppColors.primary} style={styles.inputIcon} />
                <Text style={styles.dateTimeText}>
                  {matchTime ? moment(matchTime).format('h:mm A') : 'Select Time'}
                </Text>
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
                  <Text style={styles.buttonText}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Manual Match Scheduling Modal */}
      {isManualModalOpen && (
        <Modal
          transparent={true}
          visible={isManualModalOpen}
          animationType="slide"
          onRequestClose={() => setIsManualModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainerLarge}>
              <LinearGradient
                colors={[AppColors.primary, '#0056b3']}
                style={styles.modalHeader}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.modalTitle}>Schedule Match Manually</Text>
                <Icon 
                  name="close" 
                  size={24} 
                  color="#fff" 
                  style={styles.closeIcon} 
                  onPress={() => setIsManualModalOpen(false)} 
                />
              </LinearGradient>

              <ScrollView style={styles.modalContent}>
                <Text style={styles.label}>Team A</Text>
                <View style={styles.pickerContainer}>
                  <Icon name="people" size={20} color={AppColors.primary} style={styles.pickerIcon} />
                  <Picker
                    selectedValue={manualMatchTeamA}
                    onValueChange={(itemValue) => setManualMatchTeamA(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Team A" value="" />
                    {tournamentData?.teamNames.map((team) => (
                      <Picker.Item key={team.id} label={team.name} value={team.id} />
                    ))}
                  </Picker>
                </View>

                <Text style={styles.label}>Team B</Text>
                <View style={styles.pickerContainer}>
                  <Icon name="people" size={20} color={AppColors.primary} style={styles.pickerIcon} />
                  <Picker
                    selectedValue={manualMatchTeamB}
                    onValueChange={(itemValue) => setManualMatchTeamB(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Team B" value="" />
                    {tournamentData?.teamNames.map((team) => (
                      <Picker.Item key={team.id} label={team.name} value={team.id} />
                    ))}
                  </Picker>
                </View>

                <Text style={styles.label}>Date</Text>
                <TouchableOpacity 
                  onPress={() => setManualMatchShowDatePicker(true)} 
                  style={styles.inputContainer}
                >
                  <Icon name="calendar-today" size={20} color={AppColors.primary} style={styles.inputIcon} />
                  <Text style={styles.dateTimeText}>
                    {manualMatchDate ? moment(manualMatchDate).format('MMMM Do, YYYY') : 'Select Date'}
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
                <TouchableOpacity 
                  onPress={() => setManualMatchShowTimePicker(true)} 
                  style={styles.inputContainer}
                >
                  <Icon name="access-time" size={20} color={AppColors.primary} style={styles.inputIcon} />
                  <Text style={styles.dateTimeText}>
                    {manualMatchTime ? moment(manualMatchTime).format('h:mm A') : 'Select Time'}
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
                  <Icon name="location-on" size={20} color={AppColors.primary} style={styles.pickerIcon} />
                  <Picker
                    selectedValue={manualMatchVenue}
                    onValueChange={(itemValue) => setManualMatchVenue(itemValue)}
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Venue" value="" />
                    {tournamentData?.venues.map((venue, index) => (
                      <Picker.Item key={index} label={venue} value={venue} />
                    ))}
                  </Picker>
                </View>

                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity style={styles.primaryBtn} onPress={manualMatchScheduleHandler}>
                    <Text style={styles.buttonText}>Schedule Match</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsManualModalOpen(false)} style={styles.cancelBtn}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Playoff Match Scheduling Modal */}
      <Modal
        visible={showPlayOffMatchScheduler}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPlayOffMatchScheduler(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainerLarge}>
            <LinearGradient
              colors={['#ff7e5f', '#feb47b']}
              style={styles.modalHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.modalTitle}>Schedule Playoff Match</Text>
              <Icon 
                name="close" 
                size={24} 
                color="#fff" 
                style={styles.closeIcon} 
                onPress={() => setShowPlayOffMatchScheduler(false)} 
              />
            </LinearGradient>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.label}>Team A</Text>
              <View style={styles.pickerContainer}>
                <Icon name="people" size={20} color="#ff7e5f" style={styles.pickerIcon} />
                <Picker
                  selectedValue={manualMatchTeamA}
                  onValueChange={(itemValue) => setManualMatchTeamA(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Team A" value="" />
                  {tournamentData?.teamNames.map((team) => (
                    <Picker.Item key={team.id} label={team.name} value={team.id} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Team B</Text>
              <View style={styles.pickerContainer}>
                <Icon name="people" size={20} color="#ff7e5f" style={styles.pickerIcon} />
                <Picker
                  selectedValue={manualMatchTeamB}
                  onValueChange={(itemValue) => setManualMatchTeamB(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Team B" value="" />
                  {tournamentData?.teamNames.map((team) => (
                    <Picker.Item key={team.id} label={team.name} value={team.id} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Date</Text>
              <TouchableOpacity 
                onPress={() => setManualMatchShowDatePicker(true)} 
                style={styles.inputContainer}
              >
                <Icon name="calendar-today" size={20} color="#ff7e5f" style={styles.inputIcon} />
                <Text style={styles.dateTimeText}>
                  {manualMatchDate ? moment(manualMatchDate).format('MMMM Do, YYYY') : 'Select Date'}
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
              <TouchableOpacity 
                onPress={() => setManualMatchShowTimePicker(true)} 
                style={styles.inputContainer}
              >
                <Icon name="access-time" size={20} color="#ff7e5f" style={styles.inputIcon} />
                <Text style={styles.dateTimeText}>
                  {manualMatchTime ? moment(manualMatchTime).format('h:mm A') : 'Select Time'}
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
                <Icon name="location-on" size={20} color="#ff7e5f" style={styles.pickerIcon} />
                <Picker
                  selectedValue={manualMatchVenue}
                  onValueChange={(itemValue) => setManualMatchVenue(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Venue" value="" />
                  {tournamentData?.venues.map((venue, index) => (
                    <Picker.Item key={index} label={venue} value={venue} />
                  ))}
                </Picker>
              </View>

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity 
                  style={[styles.primaryBtn, { backgroundColor: '#ff7e5f' }]} 
                  onPress={playoffMatchScheduleHandler}
                >
                  <Text style={styles.buttonText}>Schedule Playoff</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setShowPlayOffMatchScheduler(false)} 
                  style={styles.cancelBtn}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  matchTab: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  matchesContainer: {
    padding: 16,
  },
  matchCard: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 16,
  },
  pressedEffect: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
    marginBottom: 12,
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
    borderWidth: 1,
    borderColor: '#ddd',
  },
  matchTeamName: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.darkText,
    minWidth: 40,
    textAlign: 'center',
  },
  vsContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  vs: {
    fontSize: 14,
    color: AppColors.secondary,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  editIcon: {
    padding: 5,
    marginLeft: 8,
  },
  cardBody: {
    paddingTop: 8,
  },
  matchStage: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  matchText: {
    fontSize: 14,
    color: AppColors.text,
    marginLeft: 8,
  },
  winnerText: {
    fontSize: 14,
    color: '#FFD700',
    marginLeft: 8,
    fontWeight: '600',
  },
  errorText: {
    color: AppColors.error,
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
    marginTop: '20%',
  },
  emptyText: {
    fontSize: 20,
    color: AppColors.darkText,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  emptySubText: {
    fontSize: 16,
    color: AppColors.text,
    textAlign: 'center',
    marginBottom: 30,
  },
  scheduleOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  scheduleButton: {
    width: 140,
    height: 140,
    marginHorizontal: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  manualButton: {
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  aiButton: {
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scheduleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 12,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalContainerLarge: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeIcon: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    color: AppColors.darkText,
    marginBottom: 8,
    fontWeight: '600',
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
   
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: AppColors.darkText,
  },
  dateTimeText: {
    fontSize: 16,
    color: AppColors.darkText,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  pickerIcon: {
    marginRight: 10,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 10,
  },
  primaryBtn: {
    backgroundColor: AppColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    minWidth: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelBtn: {
    backgroundColor: AppColors.error,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    minWidth: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomButton: {
    borderRadius: 12,
    margin: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  playoffButton: {
    marginBottom: 8,
  },
  scheduleMoreButton: {
    marginTop: 8,
  },
  buttonGradientFull: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  bottomButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default Matches;
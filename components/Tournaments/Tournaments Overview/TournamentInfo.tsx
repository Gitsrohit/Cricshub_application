import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import apiService from '../../APIservices';

const Info = ({ id, isCreator }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tournamentDetails, setTournamentDetails] = useState(null);
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
    format: '',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchTournamentDetails = async (id) => {
    try {
      setLoading(true);
      const response = await apiService({
        endpoint: `tournaments/${id}`,
        method: 'GET',
      });

      if (response.success) {
        const data = response.data.data;
        setTournamentDetails(data);
        setEditedDetails({
          name: data.name || '',
          type: String(data.type) || '',
          ballType: data.ballType || '',
          venues: data.venues || [],
          format: data.format || '',
        });

        const fetchedStartDate = data.startDate
          ? new Date(data.startDate[0], data.startDate[1] - 1, data.startDate[2])
          : new Date();
        const fetchedEndDate = data.endDate
          ? new Date(data.endDate[0], data.endDate[1] - 1, data.endDate[2])
          : new Date();

        setStartDate(fetchedStartDate);
        setEndDate(fetchedEndDate);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      } else {
        setError('Failed to fetch tournament details');
      }
    } catch (err) {
      setError('Failed to fetch tournament details');
    } finally {
      setLoading(false);
    }
  };

  const updateTournamentDetails = async () => {
    try {
      setLoading(true);

      if (endDate < startDate) {
        setError('End date cannot be before start date.');
        setLoading(false);
        return;
      }

      const formattedStartDate = [startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate()];
      const formattedEndDate = [endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate()];

      const dataToSend = {
        name: editedDetails.name,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        type: Number(editedDetails.type),
        ballType: editedDetails.ballType,
        venues: editedDetails.venues,
        format: editedDetails.format,
      };

      const response = await apiService({
        endpoint: `tournaments/${id}`,
        method: 'PUT',
        body: dataToSend,
      });

      if (response.success) {
        setEditingTournament(false);
        await fetchTournamentDetails(id);
      } else {
        setError(response.error?.message || 'Failed to update tournament details');
      }
    } catch (err) {
      setError('Failed to update tournament details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournamentDetails(id);
  }, [id]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4A90E2" style={styles.loader} />
          <Text style={styles.loadingText}>Loading tournament details...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={40} color="#E74C3C" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => fetchTournamentDetails(id)}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : tournamentDetails ? (
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header without background image */}
          <View style={styles.headerContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>{tournamentDetails.name}</Text>
              {isCreator && (
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => setEditingTournament(true)}
                >
                  <Icon name="edit" size={24} color="#4A90E2" />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.headerDetails}>
              <View style={styles.headerDetailItem}>
                <Icon name="calendar-today" size={16} color="#7F8C8D" />
                <Text style={styles.headerDetailText}>
                  {tournamentDetails.startDate 
                    ? moment(new Date(tournamentDetails.startDate[0], tournamentDetails.startDate[1] - 1, tournamentDetails.startDate[2])).format('DD MMM YYYY')
                    : 'N/A'}
                  {' - '}
                  {tournamentDetails.endDate 
                    ? moment(new Date(tournamentDetails.endDate[0], tournamentDetails.endDate[1] - 1, tournamentDetails.endDate[2])).format('DD MMM YYYY')
                    : 'N/A'}
                </Text>
              </View>
              <View style={styles.headerDetailItem}>
                <Icon name="location-on" size={16} color="#7F8C8D" />
                <Text style={styles.headerDetailText}>
                  {tournamentDetails.venues?.join(", ") || 'Multiple Venues'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Icon name="person" size={20} color="#4A90E2" />
                <Text style={styles.cardTitle}>Organizer</Text>
              </View>
              <Text style={styles.cardContent}>
                {tournamentDetails.creatorName?.name || 'N/A'}
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Icon name="group" size={20} color="#4A90E2" />
                <Text style={styles.cardTitle}>Teams</Text>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.teamsContainer}
              >
                {tournamentDetails.teamNames?.map((team, index) => (
                  <View key={index} style={styles.teamPill}>
                    <Text style={styles.teamName}>{team?.name || 'Unknown'}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Tournament Details</Text>
              
              <View style={styles.detailGrid}>
                <View style={styles.detailItem}>
                  <View style={styles.detailIconContainer}>
                    <Icon name="timer" size={20} color="#4A90E2" />
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>Overs</Text>
                    <Text style={styles.detailValue}>{tournamentDetails.type || 'N/A'}</Text>
                  </View>
                </View>
                
                <View style={styles.detailItem}>
                  <View style={styles.detailIconContainer}>
                    <Icon name="sports-baseball" size={20} color="#4A90E2" />
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>Ball Type</Text>
                    <Text style={styles.detailValue}>{tournamentDetails.ballType || 'N/A'}</Text>
                  </View>
                </View>
                
                <View style={styles.detailItem}>
                  <View style={styles.detailIconContainer}>
                    <Icon name="description" size={20} color="#4A90E2" />
                  </View>
                  <View>
                    <Text style={styles.detailLabel}>Format</Text>
                    <Text style={styles.detailValue}>{tournamentDetails.format || 'N/A'}</Text>
                  </View>
                </View>
              </View>
            </View>

            <Modal
              visible={editingTournament}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setEditingTournament(false)}
            >
              <View style={styles.modalOverlay}>
                <ScrollView contentContainerStyle={styles.modalScrollContent}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Edit Tournament</Text>

                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Tournament Name</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter name"
                        value={editedDetails.name}
                        onChangeText={(text) => setEditedDetails({ ...editedDetails, name: text })}
                      />
                    </View>

                    <View style={styles.row}>
                      <View style={styles.column}>
                        <Text style={styles.label}>Start Date</Text>
                        <TouchableOpacity 
                          style={styles.dateInput} 
                          onPress={() => setShowStartDatePicker(true)}
                        >
                          <Text style={styles.dateText}>
                            {moment(startDate).format('DD MMM YYYY')}
                          </Text>
                        </TouchableOpacity>
                        {showStartDatePicker && (
                          <DateTimePicker
                            minimumDate={new Date()}
                            value={startDate}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                              setShowStartDatePicker(false);
                              if (selectedDate) setStartDate(selectedDate);
                              if (selectedDate && selectedDate > endDate) {
                                setEndDate(selectedDate);
                              }
                            }}
                          />
                        )}
                      </View>

                      <View style={styles.column}>
                        <Text style={styles.label}>End Date</Text>
                        <TouchableOpacity 
                          style={styles.dateInput} 
                          onPress={() => setShowEndDatePicker(true)}
                        >
                          <Text style={styles.dateText}>
                            {moment(endDate).format('DD MMM YYYY')}
                          </Text>
                        </TouchableOpacity>
                        {showEndDatePicker && (
                          <DateTimePicker
                            minimumDate={startDate}
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

                    <View style={styles.row}>
                      <View style={styles.column}>
                        <Text style={styles.label}>Overs</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="e.g. 20"
                          keyboardType="numeric"
                          value={editedDetails.type}
                          onChangeText={(text) => setEditedDetails({ ...editedDetails, type: text.replace(/[^0-9]/g, '') })}
                        />
                      </View>
                      <View style={styles.column}>
                        <Text style={styles.label}>Ball Type</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="e.g. Leather"
                          value={editedDetails.ballType}
                          onChangeText={(text) => setEditedDetails({ ...editedDetails, ballType: text })}
                        />
                      </View>
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Format</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. T20, ODI"
                        value={editedDetails.format}
                        onChangeText={(text) => setEditedDetails({ ...editedDetails, format: text })}
                      />
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Venues (comma-separated)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter venues separated by commas"
                        value={editedDetails.venues?.join(', ')}
                        onChangeText={(text) => {
                          const updatedVenues = text.split(',').map(v => v.trim()).filter(Boolean);
                          setEditedDetails({ ...editedDetails, venues: updatedVenues });
                        }}
                      />
                    </View>

                    <View style={styles.buttonRow}>
                      <TouchableOpacity 
                        style={[styles.button, styles.cancelButton]} 
                        onPress={() => setEditingTournament(false)}
                      >
                        <Text style={styles.buttonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.button, styles.saveButton]} 
                        onPress={updateTournamentDetails}
                      >
                        <Text style={styles.buttonText}>Save Changes</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </Modal>
          </View>
        </Animated.View>
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="info-outline" size={40} color="#95A5A6" />
          <Text style={styles.emptyText}>No tournament details available</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    // backgroundColor: '#f8f9fa',
    paddingBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loader: {
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 16,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'System',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: '#dc3545',
    marginVertical: 16,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'System',
  },
  retryButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  headerContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    width: '100%', // Use full width
    alignSelf: 'center', // Center it
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#212529',
    fontFamily: 'System',
    flex: 1,
  },
  editButton: {
    padding: 8,
    marginLeft: 12,
  },
  headerDetails: {
    marginTop: 4,
  },
  headerDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerDetailText: {
    color: '#6c757d',
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'System',
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    width: '100%', // Match header width
    alignSelf: 'center', // Center it
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginLeft: 12,
    fontFamily: 'System',
  },
  cardContent: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 22,
    fontFamily: 'System',
  },
  teamsContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  teamPill: {
    backgroundColor: '#e9ecef',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  teamName: {
    color: '#495057',
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'System',
  },
  detailsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
    fontFamily: 'System',
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  detailIconContainer: {
    backgroundColor: '#f1f3f5',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
    fontWeight: '500',
    fontFamily: 'System',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#212529',
    fontFamily: 'System',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#adb5bd',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'System',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
  },
  modalScrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#212529',
    fontFamily: 'System',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 8,
    fontWeight: '500',
    fontFamily: 'System',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: '#f8f9fa',
    fontFamily: 'System',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  column: {
    width: '48%',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
  },
  dateText: {
    fontSize: 15,
    color: '#495057',
    fontFamily: 'System',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f3f5',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#1976d2',
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'System',
  },
});

export default Info;
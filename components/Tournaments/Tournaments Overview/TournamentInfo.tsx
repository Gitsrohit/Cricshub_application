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
import { LinearGradient } from 'expo-linear-gradient';
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

      const cleanVenues = editedDetails.venues.map(v => v.trim()).filter(v => v.length > 0);

      const dataToSend = {
        name: editedDetails.name,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        type: Number(editedDetails.type),
        ballType: editedDetails.ballType,
        venues: cleanVenues,
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
          <LinearGradient
            colors={['#4A90E2', '#1976d2']}
            start={[0, 0]}
            end={[1, 1]}
            style={styles.headerContainer}
          >
            <View style={styles.header}>
              <Text style={styles.title}>{tournamentDetails.name}</Text>
              {isCreator && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setEditingTournament(true)}
                >
                  <Icon name="edit" size={24} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.headerDetails}>
              <View style={styles.headerDetailItem}>
                <Icon name="calendar-today" size={16} color="#E0E0E0" />
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
                <Icon name="location-on" size={16} color="#E0E0E0" />
                <Text style={styles.headerDetailText}>
                  {tournamentDetails.venues?.join(", ") || 'Multiple Venues'}
                </Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.contentContainer}>
            {/* Organizer Card */}
            <View style={[styles.card, styles.shadowCard]}>
              <View style={styles.cardHeader}>
                <Icon name="person" size={20} color="#4A90E2" />
                <Text style={styles.cardTitle}>Organizer</Text>
              </View>
              <Text style={styles.cardContent}>
                {tournamentDetails.creatorName?.name || 'N/A'}
              </Text>
            </View>

            {/* Teams Card */}
            <View style={[styles.card, styles.shadowCard]}>
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

            {/* Details Grid */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Tournament Details</Text>
              <View style={styles.detailGrid}>
                {[
                  { label: 'Overs', value: tournamentDetails.type, icon: 'timer' },
                  { label: 'Ball Type', value: tournamentDetails.ballType, icon: 'sports-baseball' },
                  { label: 'Format', value: tournamentDetails.format, icon: 'description' },
                ].map((item, idx) => (
                  <View key={idx} style={[styles.detailItem, styles.shadowCard]}>
                    <View style={styles.detailIconContainer}>
                      <Icon name={item.icon} size={20} color="#4A90E2" />
                    </View>
                    <View>
                      <Text style={styles.detailLabel}>{item.label}</Text>
                      <Text style={styles.detailValue}>{item.value || 'N/A'}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Animated.View>
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="info-outline" size={40} color="#95A5A6" />
          <Text style={styles.emptyText}>No tournament details available</Text>
        </View>
      )}
      {/* Editing tournament modal */}
      <Modal
        visible={editingTournament}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingTournament(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Tournament</Text>

            {/* Date Pickers */}
            <View style={styles.dateRow}>
              <TouchableOpacity
                style={[styles.input, styles.dateInput]}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.placeholderText}>
                  {moment(startDate).format('MMM D, YYYY')}
                </Text>
                <Icon name="calendar-today" size={20} color="#4A90E2" />
              </TouchableOpacity>

              <Text style={styles.dateSeparator}>to</Text>

              <TouchableOpacity
                style={[styles.input, styles.dateInput]}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={styles.placeholderText}>
                  {moment(endDate).format('MMM D, YYYY')}
                </Text>
                <Icon name="calendar-today" size={20} color="#4A90E2" />
              </TouchableOpacity>
            </View>

            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowStartDatePicker(false);
                  if (selectedDate) {
                    setStartDate(selectedDate);
                    if (selectedDate > endDate) {
                      setEndDate(selectedDate);
                    }
                  }
                }}
              />
            )}

            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                minimumDate={startDate}
                onChange={(event, selectedDate) => {
                  setShowEndDatePicker(false);
                  if (selectedDate) setEndDate(selectedDate);
                }}
              />
            )}

            {/* Venues */}
            <Text style={styles.modalSubtitle}>Venues</Text>
            {editedDetails.venues.map((venue, index) => (
              <TextInput
                key={index}
                style={styles.input}
                placeholder={`Venue ${index + 1}`}
                value={venue}
                onChangeText={(text) => {
                  const newVenues = [...editedDetails.venues];
                  newVenues[index] = text;
                  setEditedDetails({ ...editedDetails, venues: newVenues });
                }}
              />
            ))}

            <TouchableOpacity
              style={styles.addButton}
              onPress={() =>
                setEditedDetails({
                  ...editedDetails,
                  venues: [...editedDetails.venues, ""],
                })
              }
            >
              <Icon name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add Venue</Text>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => setEditingTournament(false)}
              >
                <Text style={styles.actionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={updateTournamentDetails}
              >
                <Text style={[styles.actionText, { color: "#fff" }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingBottom: 20, backgroundColor: '#f1f3f5' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loader: { marginBottom: 16 },
  loadingText: { marginTop: 16, color: '#4A90E2', fontSize: 16, fontWeight: '500' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { color: '#dc3545', marginVertical: 16, fontSize: 16, textAlign: 'center' },
  retryButton: { backgroundColor: '#dc3545', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  headerContainer: {
    padding: 20, borderRadius: 12, marginHorizontal: 16, marginTop: 16
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#fff', flex: 1 },
  editButton: { padding: 8, marginLeft: 12 },
  headerDetails: { marginTop: 4 },
  headerDetailItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  headerDetailText: { color: '#E0E0E0', marginLeft: 6, fontSize: 14 },
  contentContainer: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 18, marginBottom: 16 },
  shadowCard: {
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#212529', marginLeft: 12 },
  cardContent: { fontSize: 15, color: '#495057', lineHeight: 22 },
  teamsContainer: { flexDirection: 'row', paddingVertical: 4 },
  teamPill: { backgroundColor: '#e9ecef', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  teamName: { color: '#495057', fontSize: 13, fontWeight: '500' },
  detailsSection: { marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#212529', marginBottom: 16 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  detailItem: { width: '100%', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  detailIconContainer: { backgroundColor: '#f1f3f5', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  detailLabel: { fontSize: 12, color: '#6c757d', marginBottom: 4, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { fontSize: 15, fontWeight: '500', color: '#212529' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { color: '#95A5A6', fontSize: 16, marginTop: 16 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#212529",
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 12,
    color: "#495057",
  },
  input: {
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: "#f8f9fa",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  dateSeparator: {
    marginHorizontal: 8,
    fontWeight: "600",
    color: "#495057",
  },
  placeholderText: {
    fontSize: 14,
    color: "#212529",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4A90E2",
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  addButtonText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: "#f1f3f5",
  },
  saveButton: {
    backgroundColor: "#4A90E2",
  },
  actionText: {
    fontWeight: "600",
    fontSize: 14,
    color: "#212529",
  },
});

export default Info;

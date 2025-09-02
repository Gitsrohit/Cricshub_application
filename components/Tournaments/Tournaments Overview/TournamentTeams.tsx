import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  Pressable,
  Image,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TouchableWithoutFeedback
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import apiService from '../../APIservices';

const { width, height } = Dimensions.get('window');

function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

const Teams = ({ id, isCreator }) => {
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState("");
  const [teamId, setTeamId] = useState("");
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [loading, setLoading] = useState({ key: '', value: false });
  const [enteredTeamName, setEnteredTeamName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isAddingTeam, setIsAddingTeam] = useState(false);

  const slideAnim = useRef(new Animated.Value(500)).current;

  const fetchTeams = async (id) => {
    try {
      setLoading({ key: 'All', value: true });
      setError("");
      const response = await apiService({
        endpoint: `tournaments/${id}`,
        method: 'GET',
      });
      if (response.success) {
        setTeams(response.data.data.teamNames || []);
      } else {
        setError(response.error?.message || 'Failed to fetch teams');
      }
    } catch (err) {
      setError('Failed to fetch teams. Please try again.');
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
        setDropdownOptions(response?.data?.data || []);
      } else {
        setError(response.error?.message || 'Failed to search teams');
      }
    } catch (err) {
      setError('Failed to search teams');
    } finally {
      setLoading({ key: 'Search', value: false });
    }
  };

  const debouncedSearch = useCallback(
    debounce((name) => searchTeamsByName(name), 500),
    []
  );

  const handleInputChange = (value) => {
    setEnteredTeamName(value);
    if (value.length > 2) {
      debouncedSearch(value);
    } else {
      setDropdownOptions([]);
    }
  };

  const addNewTeam = async (teamid, teamname) => {
    try {
      setIsAddingTeam(true);
      setLoading({ key: 'Add', value: true });
      const response = await apiService({
        endpoint: `tournaments/${id}/add-teams`,
        method: 'POST',
        body: [teamid.trim()],
      });
      if (response.success) {
        setEnteredTeamName('');
        setTeamId('');
        setDropdownOptions([]);
        await fetchTeams(id);
        closeModal();
      } else {
        setError(response.error?.message || 'Failed to add team');
      }
    } catch (err) {
      setError('Failed to add team');
    } finally {
      setLoading({ key: 'Add', value: false });
      setIsAddingTeam(false);
    }
  };

  const deleteTeamHandler = async (teamId) => {
    try {
      setLoading({ key: 'Delete', value: true });
      const response = await apiService({
        endpoint: `tournaments/${id}/remove-teams`,
        method: 'POST',
        body: [teamId.trim()],
      });
      if (!response.success) {
        setError(response.error?.message || "Couldn't delete team");
      }
    } catch (err) {
      setError("Couldn't delete team");
    } finally {
      await fetchTeams(id);
      setLoading({ key: 'Delete', value: false });
    }
  };

  useEffect(() => {
    fetchTeams(id);
  }, [id]);

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    Animated.timing(slideAnim, {
      toValue: 500,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setDropdownOptions([]);
      setEnteredTeamName('');
    });
  };

  useEffect(() => {
    if (modalVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible, slideAnim]);

  const renderTeamItem = ({ item }) => (
    <View style={styles.teamCard}>
      <View style={styles.teamHeader}>
        <View style={styles.teamInfo}>
          <Image
            source={{ uri: item.logoPath || 'https://via.placeholder.com/50' }}
            style={styles.teamImage}
          />
          <View style={styles.teamTextContainer}>
            <Text style={styles.teamName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.teamCaptain} numberOfLines={1}>
              {item.captain?.name || 'No captain assigned'}
            </Text>
          </View>
        </View>
      </View>
      {isCreator && (
        <Pressable
          onPress={() => deleteTeamHandler(item.id)}
          style={styles.deleteButton}
          disabled={loading.key === 'Delete' && loading.value}
        >
          {loading.key === 'Delete' && loading.value ? (
            <ActivityIndicator size="small" color="#FF5252" />
          ) : (
            <Icon name="delete" size={24} color="#FF5252" />
          )}
        </Pressable>
      )}
    </View>
  );

  const renderSearchItem = ({ item }) => (
    <Pressable
      style={styles.teamOptionItem}
      onPress={() => {
        setEnteredTeamName(item.name);
        setTeamId(item.id);
        addNewTeam(item.id, item.name);
      }}
      disabled={isAddingTeam}
    >
      <View style={styles.teamOptionContent}>
        <Image
          source={{ uri: item.logoPath || 'https://via.placeholder.com/50' }}
          style={styles.teamOptionImage}
        />
        <View style={styles.teamOptionText}>
          <Text style={styles.teamOptionName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.teamOptionCaptain} numberOfLines={1}>
            {item.captain?.name || 'No captain'}
          </Text>
        </View>
        {isAddingTeam && teamId === item.id ? (
          <ActivityIndicator size="small" color="#34B8FF" style={styles.addingIndicator} />
        ) : (
          <Icon name="add" size={24} color="#34B8FF" />
        )}
      </View>
    </Pressable>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="account-group"
        size={60}
        color="#34B8FF"
        style={styles.emptyIcon}
      />
      <Text style={styles.emptyTitle}>No Teams Added Yet</Text>
      <Text style={styles.emptyText}>
        {isCreator
          ? "Get started by adding teams to your tournament"
          : "The tournament organizer hasn't added any teams yet"}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {loading.value && loading.key === 'All' ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#34B8FF" />
            <Text style={styles.loadingText}>Loading teams...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={50}
              color="#FF5252"
            />
            <Text style={styles.errorTitle}>Error Loading Teams</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchTeams(id)}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {teams.length > 0 ? (
              <FlatList
                data={teams}
                renderItem={renderTeamItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                  <Text style={styles.sectionHeader}>Tournament Teams</Text>
                }
                ListFooterComponent={<View style={styles.listFooter} />}
              />
            ) : (
              renderEmptyState()
            )}
          </>
        )}

        {isCreator && (
          <TouchableOpacity
            style={styles.floatingAddButton}
            onPress={openModal}
            activeOpacity={0.85}
            disabled={loading.value && loading.key === 'All'}
          >
            <Icon name="add" size={28} color="#FFF" />
          </TouchableOpacity>
        )}

        <Modal visible={modalVisible} transparent animationType="none">
          <TouchableWithoutFeedback onPress={closeModal}>
            <View style={styles.modalOverlay} pointerEvents="box-none">
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1, justifyContent: 'flex-end' }}
              >
                <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Add Teams to Tournament</Text>
                    <TouchableOpacity onPress={closeModal}>
                      <Icon name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.searchContainer}>
                    <AntDesign
                      name="search1"
                      size={20}
                      color="#888"
                      style={styles.searchIcon}
                    />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search team by name..."
                      placeholderTextColor="#888"
                      value={enteredTeamName}
                      onChangeText={handleInputChange}
                      autoFocus={true}
                      returnKeyType="search"
                    />
                  </View>
                  <View style={styles.dropdownContainer}>
                    {loading.value && loading.key === 'Search' ? (
                      <View style={styles.modalLoader}>
                        <ActivityIndicator size="large" color="#34B8FF" />
                      </View>
                    ) : dropdownOptions.length > 0 ? (
                      <FlatList
                        data={dropdownOptions}
                        renderItem={renderSearchItem}
                        keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
                        contentContainerStyle={styles.dropdownContent}
                        keyboardShouldPersistTaps="handled"
                      />
                    ) : enteredTeamName.length > 2 ? (
                      <View style={styles.noResults}>
                        <Text style={styles.noResultsText}>No teams found for "{enteredTeamName}"</Text>
                      </View>
                    ) : (
                      <View style={styles.noResults}>
                        <Text style={styles.noResultsText}>
                          Search for teams to add
                        </Text>
                        <Text style={styles.searchHintText}>Type at least 3 characters to search</Text>
                      </View>
                    )}
                  </View>
                  {/* Removed the close button from the bottom */}
                </Animated.View>
              </KeyboardAvoidingView>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F5F7FA',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#34B8FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFF',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingVertical: 16,
    paddingBottom: 80,
  },
  listFooter: {
    height: 80,
  },
  teamCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamHeader: {
    flex: 1,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  teamImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EEE',
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  teamCaptain: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#34B8FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(240,240,240,0.9)",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#003b5c",
  },
  searchIcon: {
    marginLeft: 8,
  },
  modalLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
  dropdownContainer: {
    maxHeight: height * 0.5,
  },
  dropdownContent: {
    paddingHorizontal: 0,
  },
  teamOptionItem: {
    marginBottom: 8,
  },
  teamOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
  },
  teamOptionImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEE',
  },
  teamOptionText: {
    flex: 1,
    marginLeft: 12,
  },
  teamOptionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  teamOptionCaptain: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  addingIndicator: {
    marginLeft: 8,
  },
  noResults: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  searchHintText: {
    color: '#CCC',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  // Removed closeButton and closeButtonText styles
});

export default Teams;
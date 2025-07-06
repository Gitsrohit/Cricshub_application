import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
  Easing
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import apiService from '../APIservices';

const AddPlayersToTeam = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [playerId, setPlayerId] = useState([]);
  const [captainId, setCaptainId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { teamName, logoUri } = route.params;

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  useEffect(() => {
    // Animation on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardOpen(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardOpen(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    const debounceSearch = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        fetchPlayers(searchQuery);
      } else {
        setFilteredPlayers([]);
      }
    }, 500);

    return () => clearTimeout(debounceSearch);
  }, [searchQuery]);
  const getToken = async () => {
    try {
      return await AsyncStorage.getItem('jwtToken');
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  };

  const getUserUUID = async () => {
    try {
      const userId = await AsyncStorage.getItem('userUUID');
      if (userId) {
        return userId;
      } else {
        console.log('No User UUID found');
        return null;
      }
    } catch (error) {
      console.error('Error retrieving User UUID:', error);
      return null;
    }
  };

  const fetchPlayers = async (query) => {
    try {
      setLoading(true);

      const [nameRes, phoneRes] = await Promise.all([
        apiService({
          endpoint: `teams/players/search/name`,
          method: 'GET',
          params: { name: query },
        }),
        apiService({
          endpoint: `teams/players/search/phone`,
          method: 'GET',
          params: { phone: query },
        }),
      ]);

      const nameData = nameRes.success ? nameRes.data.data || [] : [];
      const phoneData = phoneRes.success ? phoneRes.data.data || [] : [];

      setFilteredPlayers([...nameData, ...phoneData]);
    } catch (error) {
      console.error('Error fetching players:', error);
      setFilteredPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  const addPlayerToTeam = (player) => {
    if (!playerId.includes(player.id)) {
      setPlayerId((prev) => [...prev, player.id]);
      setTeamPlayers((prev) => [...prev, player]);
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
    setSearchQuery('');
    setFilteredPlayers([]);
    Keyboard.dismiss();
  };

  const removePlayerFromTeam = (playerId) => {
    setPlayerId((prev) => prev.filter((id) => id !== playerId));
    setTeamPlayers((prev) => prev.filter((player) => player.id !== playerId));
    if (captainId === playerId) {
      setCaptainId(null);
    }
  };

  const makeCaptain = (playerId) => {
    setCaptainId(playerId);
    Alert.alert(
      "Captain Assigned",
      `This player is now the team captain.`,
      [{ text: "OK" }],
      { cancelable: true }
    );
  };

  const createTeam = async () => {
    if (teamPlayers.length === 0) {
      Alert.alert('Error', 'Please add at least one player to the team.');
      return;
    }

    setCreatingTeam(true);
    setErrorMessage('');

    try {
      const token = await getToken();
      const userId = await getUserUUID();

      if (!captainId) {
        setErrorMessage('Please assign a captain before creating the team.');
        return;
      }

      if (!userId) {
        setErrorMessage('Unable to retrieve the creator’s user ID.');
        return;
      }

      const formData = new FormData();
      formData.append('name', teamName);
      formData.append('captainId', captainId);
      formData.append('playerIds', playerId.join(','));

      if (logoUri) {
        const fileName = logoUri.split('/').pop();
        const fileType = fileName.split('.').pop();
        formData.append('logo', {
          uri: logoUri,
          name: fileName,
          type: `image/${fileType}`,
        });
      }

      // Make request using apiService
      const response = await apiService({
        endpoint: `teams/${userId}`,
        method: 'POST',
        body: formData,
        isMultipart: true,
      });

      if (response.success) {
        setTeamPlayers([]);
        setPlayerId([]);
        setCaptainId(null);
        Alert.alert('Success', 'Team created successfully!');
        navigation.navigate('Teams');
      } else {
        const message = response.error?.message || 'Failed to create team.';
        setErrorMessage(message);
        Alert.alert('Error', message);
      }
    } catch (error) {
      console.error('Error creating team:', error);
      setErrorMessage('Error creating team.');
      Alert.alert('Error', 'Error creating team.');
    } finally {
      setCreatingTeam(false);
    }
  };

  const renderPlayerItem = ({ item, index }) => (
    <Animatable.View
      animation="fadeIn"
      duration={500}
      delay={index * 50}
      style={styles.dropdownItem}
    >
      <Image
        source={{ uri: item.profilePic || 'https://via.placeholder.com/50' }}
        style={styles.dropdownPlayerProfilePic}
      />
      <View style={styles.dropdownPlayerInfo}>
        <Text style={styles.dropdownPlayerName}>{item.name}</Text>
        <Text style={styles.dropdownPlayerRole}>{item.role || 'All-rounder'}</Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => addPlayerToTeam(item)}
      >
        <Ionicons name="add-circle" size={28} color="#fff" />
      </TouchableOpacity>
    </Animatable.View>
  );

  const renderTeamPlayer = ({ item }) => (
    <Animatable.View
      animation="slideInRight"
      duration={300}
      style={[
        styles.teamPlayerCard,
        captainId === item.id && styles.captainCard
      ]}
    >
      <View style={styles.playerMainInfo}>
        <Image
          source={{ uri: item.profilePic || 'https://via.placeholder.com/50' }}
          style={styles.playerProfilePic}
        />
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{item.name}</Text>
          <Text style={styles.playerRole}>{item.role || 'All-rounder'}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[
            styles.captainButton,
            captainId === item.id && styles.activeCaptainButton
          ]}
          onPress={() => makeCaptain(item.id)}
        >
          <FontAwesome
            name="star"
            size={16}
            color={captainId === item.id ? "#FFD700" : "#fff"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => removePlayerFromTeam(item.id)}
          style={styles.deleteButton}
        >
          <MaterialIcons name="delete" size={22} color="#F44336" />
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ImageBackground
          source={require('../../assets/images/cricsLogo.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
          blurRadius={2}
        >
          <SafeAreaView style={styles.safeArea}>
            <Animated.View
              style={[
                styles.contentContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.goBack()}
                >
                  <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Add Players</Text>
                <View style={styles.teamNameContainer}>
                  <Text style={styles.teamName}>{teamName}</Text>
                </View>
              </View>

              <View style={styles.searchContainer}>
                <Ionicons
                  name="search"
                  size={20}
                  color="#4A90E2"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Search by name or phone..."
                  placeholderTextColor="#90CAF9"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                {searchQuery !== '' && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => setSearchQuery('')}
                  >
                    <Ionicons name="close-circle" size={20} color="#4A90E2" />
                  </TouchableOpacity>
                )}
              </View>

              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4A90E2" />
                </View>
              )}

              {filteredPlayers.length > 0 && (
                <Animatable.View
                  animation="fadeInUp"
                  style={styles.dropdownContainer}
                >
                  <FlatList
                    data={filteredPlayers}
                    keyExtractor={(item) => item.id}
                    renderItem={renderPlayerItem}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.filteredPlayersList}
                  />
                </Animatable.View>
              )}

              <View style={styles.teamPlayersContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Team Players ({teamPlayers.length})</Text>
                  {captainId && (
                    <View style={styles.captainIndicator}>
                      <FontAwesome name="star" size={14} color="#FFD700" />
                      <Text style={styles.captainText}>Captain selected</Text>
                    </View>
                  )}
                </View>

                {teamPlayers.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="people" size={50} color="#4A90E2" />
                    <Text style={styles.emptyStateText}>No players added yet</Text>
                    <Text style={styles.emptyStateSubtext}>
                      Search and add players to build your team
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={teamPlayers}
                    keyExtractor={(item) => item.id}
                    renderItem={renderTeamPlayer}
                    contentContainerStyle={styles.selectedPlayersList}
                    showsVerticalScrollIndicator={false}
                  />
                )}
              </View>

              {!keyboardOpen && (
                <Animatable.View
                  animation="fadeInUp"
                  duration={500}
                  style={styles.footer}
                >
                  {errorMessage && (
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                  )}
                  <TouchableOpacity
                    onPress={createTeam}
                    style={[
                      styles.createButton,
                      teamPlayers.length === 0 && styles.disabledButton
                    ]}
                    disabled={creatingTeam || teamPlayers.length === 0}
                  >
                    {creatingTeam ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.createButtonText}>
                        Create Team {teamPlayers.length > 0 && `(${teamPlayers.length})`}
                      </Text>
                    )}
                  </TouchableOpacity>
                </Animatable.View>
              )}
            </Animated.View>
          </SafeAreaView>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1F3A',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(10, 31, 58, 0.16)',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 5,
    padding: 5,
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  teamNameContainer: {
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  teamName: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A365D',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    height: '100%',
  },
  clearButton: {
    padding: 5,
  },
  loadingContainer: {
    paddingVertical: 10,
  },
  dropdownContainer: {
    backgroundColor: '#6BB9F0',
    borderRadius: 10,
    maxHeight: 250,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  dropdownPlayerProfilePic: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  dropdownPlayerInfo: {
    flex: 1,
  },
  dropdownPlayerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownPlayerRole: {
    color: '#90CAF9',
    fontSize: 14,
  },
  addButton: {
    padding: 5,
  },
  teamPlayersContainer: {
    flex: 1,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  captainIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  captainText: {
    color: '#FFD700',
    fontSize: 12,
    marginLeft: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
  },
  emptyStateSubtext: {
    color: '#90CAF9',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  teamPlayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#6BB9F0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  captainCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  playerMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playerProfilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  playerRole: {
    color: '#fff',
    fontSize: 14,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  captainButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  activeCaptainButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderColor: '#FFD700',
  },
  deleteButton: {
    padding: 5,
  },
  footer: {
    paddingTop: 15,
    paddingBottom: 5,
  },
  createButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#1A365D',
    shadowOpacity: 0,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorMessage: {
    color: '#F44336',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  filteredPlayersList: {
    paddingBottom: 5,
  },
  selectedPlayersList: {
    paddingBottom: 20,
  },
});

export default AddPlayersToTeam;

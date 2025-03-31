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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

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
  const navigation = useNavigation();
  const route = useRoute();
  const { teamName, logoUri } = route.params;

  useEffect(() => {
    const debounceSearch = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        fetchPlayers(searchQuery);
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
      const token = await getToken();
      const responses = await Promise.all([
        fetch(
          `https://score360-7.onrender.com/api/v1/teams/players/search/name?name=${query}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        fetch(
          `https://score360-7.onrender.com/api/v1/teams/players/search/phone?phone=${query}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);

      const [nameData, phoneData] = await Promise.all(
        responses.map((res) => (res.ok ? res.json() : { data: [] }))
      );

      setFilteredPlayers([...nameData.data, ...phoneData.data]);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPlayerToTeam = (player) => {
    if (!playerId.includes(player.id)) {
      setPlayerId((prev) => [...prev, player.id]);
      setTeamPlayers((prev) => [...prev, player]);
    }
    setSearchQuery('');
    setFilteredPlayers([]);
  };

  const removePlayerFromTeam = (playerId) => {
    setPlayerId((prev) => prev.filter((id) => id !== playerId));
    setTeamPlayers((prev) => prev.filter((player) => player.id !== playerId));
  };

  const makeCaptain = async (playerId) => {
    setCaptainId(playerId);
    Alert.alert(
      "Captain Assigned",
      `Player has been successfully assigned as the captain.`,
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
      const storedCaptainId = captainId;
      const userId = await getUserUUID();

      if (!storedCaptainId) {
        setErrorMessage('Please assign a captain before creating the team.');
        setCreatingTeam(false);
        return;
      }

      if (!userId) {
        setErrorMessage('Unable to retrieve the creator’s user ID.');
        setCreatingTeam(false);
        return;
      }

      const formData = new FormData();
      formData.append('name', teamName);
      formData.append('captainId', storedCaptainId);
      formData.append('playerIds', Array.isArray(playerId) ? playerId.join(',') : '');
      if (logoUri) {
        const fileName = logoUri.split('/').pop();
        const fileType = fileName.split('.').pop();
        formData.append('logo', {
          uri: logoUri,
          name: fileName,
          type: `image/${fileType}`,
        });
      }

      const response = await fetch(`https://score360-7.onrender.com/api/v1/teams/${userId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (response.ok) {
        setTeamPlayers([]);
        setPlayerId([]);
        setCaptainId(null);
        Alert.alert('Success', 'Team created successfully!');
        navigation.navigate('CreateTeamSuccess', {
          teamName,
          logoUri,
          teamPlayers,
          captainId,
        });
      } else {
        const data = await response.json();
        console.error('API Error:', data);
        setErrorMessage(data.message || 'Failed to create team.');
        Alert.alert('Error', data.message || 'Failed to create team.');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      setErrorMessage('Error creating team.');
      Alert.alert('Error', 'Error creating team.');
    } finally {
      setCreatingTeam(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar />
      <ImageBackground
        source={require('../../assets/images/cricsLogo.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Add Players to {teamName}</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Search players"
            placeholderTextColor="#4A90E2"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {loading && <ActivityIndicator size="small" color="#4A90E2" />}
          {filteredPlayers.length > 0 && (
            <View style={styles.dropdownContainer}>
              <FlatList
                data={filteredPlayers}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem,
                      activeIndex === index && styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      addPlayerToTeam(item);
                      setActiveIndex(index);
                    }}
                  >
                    <Image
                      source={{ uri: item.profilePic || 'https://via.placeholder.com/50' }}
                      style={styles.dropdownPlayerProfilePic}
                    />
                    <View style={styles.dropdownPlayerInfo}>
                      <Text style={styles.dropdownPlayerName}>{item.name}</Text>
                      <Text style={styles.dropdownPlayerRole}>{item.role || 'Unknown Role'}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.filteredPlayersList}
              />
            </View>
          )}
          <FlatList
            data={teamPlayers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.teamPlayerCard}>
                <Image
                  source={{ uri: item.profilePic || 'https://via.placeholder.com/50' }}
                  style={styles.playerProfilePic}
                />
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{item.name}</Text>
                  <Text style={styles.playerRole}>{item.role || 'Unknown Role'}</Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.captainButton}
                    onPress={() => makeCaptain(item.id)}
                  >
                    <Text style={styles.captainButtonText}>C</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removePlayerFromTeam(item.id)}>
                    <MaterialIcons name="delete" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={styles.selectedPlayersList}
          />

          <TouchableOpacity onPress={createTeam} style={styles.createButton} disabled={creatingTeam}>
            <Text style={styles.createButtonText}>
              {creatingTeam ? 'Creating Team...' : 'Create Team'}
            </Text>
          </TouchableOpacity>
          {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    marginTop: StatusBar?.currentHeight || 0,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    color: '#4A90E2',
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    borderColor: '#4A90E2',
    borderWidth: 1,
    padding: 10,
    color: '#4A90E2',
    borderRadius: 5,
    marginBottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedPlayersList: {
    marginTop: 10,
    marginBottom: 20,
  },
  dropdownContainer: {
    backgroundColor: '#4A90E2',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    maxHeight: 200,
    overflow: 'hidden',
    marginBottom: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dropdownPlayerProfilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  dropdownPlayerInfo: {
    flex: 1,
  },
  dropdownPlayerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownPlayerRole: {
    color: '#ccc',
    fontSize: 14,
  },
  teamPlayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  playerProfilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerRole: {
    color: '#ccc',
    fontSize: 14,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  captainButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  captainButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  errorMessage: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  filteredPlayersList: {
    marginBottom: 20,
  }
});

export default AddPlayersToTeam;
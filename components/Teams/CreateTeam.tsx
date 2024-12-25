import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons'; // For trash icon
import * as ImagePicker from 'expo-image-picker'; // Import ImagePicker

const background = require('/Users/iceberg/score/Frontend/assets/images/bg.png');

const CreateTeam = () => {
  const [teamName, setTeamName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [logoUri, setLogoUri] = useState(null); // State for storing the logo URI

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        handleSearch(searchQuery);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      return token;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  };

  const getUserId = async () => {
    try {
      const token = await getToken();
      const response = await fetch('https://score360-7.onrender.com/api/v1/user', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        return userData.id; // Assuming the response has user info
      } else {
        throw new Error('Failed to fetch user ID');
      }
    } catch (error) {
      console.error('Error retrieving user ID:', error);
      return null;
    }
  };

  const fetchPlayers = async (query) => {
    try {
      setLoading(true);
      const token = await getToken();

      const nameResponse = await fetch(
        `https://score360-7.onrender.com/api/v1/teams/players/search/name?name=${query}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const phoneResponse = await fetch(
        `https://score360-7.onrender.com/api/v1/teams/players/search/phone?phone=${query}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const nameData = nameResponse.ok ? await nameResponse.json() : { data: [] };
      const phoneData = phoneResponse.ok ? await phoneResponse.json() : { data: [] };

      setLoading(false);

      const combinedPlayers = [...nameData.data, ...phoneData.data];

      return combinedPlayers;
    } catch (error) {
      setLoading(false);
      console.error('Error fetching players:', error);
      return [];
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) return;
    const playersData = await fetchPlayers(query);
    setFilteredPlayers(playersData);
  };

  const addPlayerToTeam = (player) => {
    if (!teamPlayers.find((p) => p.id === player.id)) {
      setTeamPlayers([...teamPlayers, player]);
    }
    setSearchQuery('');
    setFilteredPlayers([]);
  };

  const removePlayerFromTeam = (playerId) => {
    setTeamPlayers(teamPlayers.filter((player) => player.id !== playerId));
  };

  const createTeam = async () => {
    if (!teamName.trim() || teamPlayers.length === 0) {
      setErrorMessage('Please enter a team name and add players.');
      return;
    }

    setCreatingTeam(true);
    setErrorMessage('');

    try {
      const token = await getToken();
      const userId = await getUserId();
      if (!userId) {
        setErrorMessage('User not found');
        return;
      }

      const formData = new FormData();
      formData.append('name', teamName);
      formData.append('players', JSON.stringify(teamPlayers.map((player) => player.id)));

      // If logo exists, append the logo to FormData
      if (logoUri) {
        const localUri = logoUri;
        const filename = localUri.split('/').pop();
        const type = `image/${filename.split('.').pop()}`;
        formData.append('logo', {
          uri: localUri,
          name: filename,
          type,
        });
      }

      const response = await fetch(`https://score360-7.onrender.com/api/v1/teams/${userId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        // Reset form after successful team creation
        setTeamName('');
        setTeamPlayers([]);
        setLogoUri(null); // Reset the logo
        alert('Team created successfully!');
      } else {
        const data = await response.json();
        setErrorMessage(data.message || 'Failed to create team');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      setErrorMessage('Error creating team');
    } finally {
      setCreatingTeam(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status === 'granted') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1,
      });

      if (!result.canceled) {
        setLogoUri(result.assets[0].uri); // Set the logo URI
      }
    } else {
      alert('Permission to access media library is required!');
    }
  };

  return (
    <ImageBackground source={background} style={styles.background} resizeMode="cover">
      <LinearGradient colors={['rgba(0, 0, 0, 0.8)', 'rgba(10, 48, 59, 0.7)', 'rgba(54, 176, 213, 0.5)']} style={styles.gradient}>
        <View style={styles.container}>
          {/* Team Logo Section */}
          <View style={styles.logoContainer}>
            {logoUri ? (
              <Image source={{ uri: logoUri }} style={styles.logo} />
            ) : (
              <Text style={styles.logoText}>No logo selected</Text>
            )}
            <TouchableOpacity style={styles.uploadLogoButton} onPress={pickImage}>
              <Text style={styles.uploadLogoText}>Upload Logo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>TEAM NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter team name"
              placeholderTextColor="#ccc"
              value={teamName}
              onChangeText={setTeamName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>ADD PLAYERS</Text>
            <TextInput
              style={styles.input}
              placeholder="Search by name or phone number"
              placeholderTextColor="#ccc"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {loading && <ActivityIndicator size="small" color="#fff" />}
            {filteredPlayers.length > 0 && (
              <View style={styles.dropdown}>
                {filteredPlayers.map((player, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => addPlayerToTeam(player)}
                  >
                    <Text style={styles.dropdownText}>{`${player.name} (${player.phone})`}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.teamListContainer}>
            <Text style={styles.label}>TEAM PLAYERS</Text>
            <FlatList
              data={teamPlayers}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.teamPlayerItem}>
                  <Text style={styles.teamPlayerText}>{`${item.name} (${item.phone})`}</Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => removePlayerFromTeam(item.id)}
                  >
                    <MaterialIcons name="delete" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>

          {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}

          <TouchableOpacity
            style={styles.createButton}
            onPress={createTeam}
            disabled={creatingTeam}
          >
            {creatingTeam ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Create Team</Text>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop:90
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  logoText: {
    color: '#fff',
    fontSize: 16,
  },
  uploadLogoButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#0c2d3d',  // Darker background color
    borderRadius: 5,
    elevation: 5, // Android shadow effect
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow offset
    shadowOpacity: 0.3, // Shadow opacity
    shadowRadius: 4, // Shadow blur radius
  },
  uploadLogoText: {
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    borderColor: '#fff',
    borderWidth: 1,
    padding: 10,
    color: '#fff',
    borderRadius: 5,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 5,
    maxHeight: 200,
    marginTop: 5,
  },
  dropdownItem: {
    padding: 10,
  },
  dropdownText: {
    fontSize: 16,
  },
  teamListContainer: {
    marginTop: 20,
  },
  teamPlayerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  teamPlayerText: {
    color: '#fff',
  },
  deleteButton: {
    padding: 5,
  },
  createButton: {
    backgroundColor: '#0c2d3d',  // Darker background color
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    elevation: 5, // Android shadow effect
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow offset
    shadowOpacity: 0.3, // Shadow opacity
    shadowRadius: 4, // Shadow blur radius
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  errorMessage: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
});


export default CreateTeam;

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
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const background = require('/Users/iceberg/score/Frontend/assets/images/bg.png');

const CreateTeam = () => {
  const [teamName, setTeamName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [logoUri, setLogoUri] = useState(null);
  const [userId, setUserId] = useState([]); // List to store selected player ids

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
    if (!userId.includes(player.id)) {
      setUserId((prev) => [...prev, player.id]); // Add player id to userId list
      setTeamPlayers((prev) => [...prev, player]);
    }
    setSearchQuery('');
    setFilteredPlayers([]);
  };

  const removePlayerFromTeam = (playerId) => {
    setUserId((prev) => prev.filter((id) => id !== playerId)); // Remove player id from userId list
    setTeamPlayers((prev) => prev.filter((player) => player.id !== playerId));
  };

  const createTeam = async () => {
    if (!teamName.trim() || userId.length === 0) {
      setErrorMessage('Please enter a team name and add players.');
      return;
    }

    setCreatingTeam(true);
    setErrorMessage('');

    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('name', teamName);
      formData.append('players', JSON.stringify(userId)); 

      if (logoUri) {
        const fileName = logoUri.split('/').pop();
        const fileType = `image/${fileName.split('.').pop()}`;
        formData.append('logo', { uri: logoUri, name: fileName, type: fileType });
      }

      const response = await fetch(`https://score360-7.onrender.com/api/v1/teams/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        setTeamName('');
        setTeamPlayers([]);
        setUserId([]); 
        setLogoUri(null);
        alert('Team created successfully!');
      } else {
        const data = await response.json();
        setErrorMessage(data.message || 'Failed to create team.');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      setErrorMessage('Error creating team.');
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
        setLogoUri(result.assets[0].uri);
      }
    } else {
      alert('Permission to access media library is required!');
    }
  };

  return (
    <ImageBackground source={background} style={styles.background}>
      <LinearGradient colors={['rgba(0, 0, 0, 0.8)', 'rgba(54, 176, 213, 0.5)']} style={styles.gradient}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            {logoUri ? <Image source={{ uri: logoUri }} style={styles.logo} /> : <Text>No logo selected</Text>}
            <TouchableOpacity onPress={pickImage} style={styles.uploadLogoButton}>
              <Text style={styles.uploadLogoText}>Upload Logo</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Team Name"
            placeholderTextColor="#ccc"
            value={teamName}
            onChangeText={setTeamName}
          />

          <TextInput
            style={styles.input}
            placeholder="Search players"
            placeholderTextColor="#ccc"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {loading && <ActivityIndicator size="small" color="#fff" />}
          {filteredPlayers.map((player, index) => (
  <TouchableOpacity
    key={player.id}
    onPress={() => {
      addPlayerToTeam(player);
      setActiveIndex(index); // Set the currently active index
    }}
    style={[
      styles.dropdownItem,
      activeIndex === index && styles.dropdownItemActive, // Apply active style
    ]}
  >
    <Text style={styles.dropdownText}>{player.name}</Text>
  </TouchableOpacity>
))}



<FlatList
  data={teamPlayers}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => (
    <View style={styles.teamPlayerCard}>
      <View>
        <Text style={styles.playerName}>{item.name}</Text>
        <Text style={styles.playerRole}>{item.role || 'Unknown Role'}</Text>
      </View>
      <TouchableOpacity onPress={() => removePlayerFromTeam(item.id)}>
        <MaterialIcons name="delete" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  )}
/>


          <TouchableOpacity onPress={createTeam} style={styles.createButton} disabled={creatingTeam}>
            <Text style={styles.createButtonText}>Create Team</Text>
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
    paddingTop: 90,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dropdown: {
    backgroundColor: '#1c3a47', 
    borderRadius: 8, 
    marginTop: 10,
    maxHeight: 200,
    overflow: 'hidden', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 4, 
    elevation: 5,
  },
  dropdownItem: {
    padding: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#0a2a34', 
    backgroundColor: '#1c3a47',
  },
  dropdownItemActive: {
    backgroundColor: '#296f86', 
  },
  dropdownText: {
    fontSize: 16, 
    color: '#fff', 
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000', // Shadow color
    shadowOffset: { width: 0, height: 2 }, // Shadow offset
    shadowOpacity: 0.3, // Shadow transparency
    shadowRadius: 4, // Shadow blur radius
    elevation: 5, // Shadow effect for Android
  },
  
  uploadLogoButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#0c2d3d',
    borderRadius: 5,
  },
  uploadLogoText: {
    color: '#fff',
  },
  input: {
    borderColor: '#fff',
    borderWidth: 1,
    padding: 10,
    color: '#fff',
    borderRadius: 5,
    marginBottom: 20,
  },
  playerItem: {
    padding: 10,
    backgroundColor: '#333',
    marginBottom: 5,
  },
  teamPlayerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  teamPlayerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0c2d3d', 
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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
  createButton: {
    backgroundColor: '#0c2d3d',
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
  },
});

export default CreateTeam;

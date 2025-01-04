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
  Alert,
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
  const [playerId, setPlayerId] = useState([]); 
  const [captainId, setCaptainId] = useState(null);
  const [userID,setUserID] = useState('');

  useEffect(() => {
    const debounceSearch = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        fetchPlayers(searchQuery);
      }
    }, 500);

    return () => clearTimeout(debounceSearch);
  }, [searchQuery]);
  const getUserUUID = async () => {
    try {
      const userId = await AsyncStorage.getItem('userUUID');
      if (userId) {
        console.log('User UUID retrieved:', userId);
        setUserID(userId);
      } else {
        console.log('No User UUID found');
      }
      return userId;
    } catch (error) {
      console.error('Error retrieving User UUID:', error);
      return null;
    }
  };
  
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
  const makeCaptain = async (playerId) => {
    setCaptainId(playerId); 
    Alert.alert(
      "Captain Assigned",
      `Player has been successfully assigned as the captain.`,
      [{ text: "OK" }],
      { cancelable: true }
    );
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

  const createTeam = async () => {
    if (!teamName.trim() || playerId.length === 0) {
      setErrorMessage('Please enter a team name and add players.');
      return;
    }
  
    setCreatingTeam(true);
    setErrorMessage('');
  
    try {
      const token = await getToken();
      const storedCaptainId = captainId; // Use the local `captainId` state
      const userId = await getUserUUID(); // Ensure `userUUID` is retrieved
  
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
    formData.append('playerIds', Array.isArray(playerId) ? playerId.join(',') : ''); // Safeguard
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
        setTeamName('');
        setTeamPlayers([]);
        setPlayerId([]);
        setCaptainId(null);
        setLogoUri(null);
        alert('Team created successfully!');
      } else {
        const data = await response.json();
        console.error('API Error:', data); // Log the full error response
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
      setActiveIndex(index); 
    }}
    style={[
      styles.dropdownItem,
      activeIndex === index && styles.dropdownItemActive, 
    ]}
  >
    <Text style={styles.dropdownText}>{player.name}</Text>
  </TouchableOpacity>
 
))}



<FlatList
  data={teamPlayers}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <View style={styles.teamPlayerCard}>
      <Image
        source={{
          uri: item.profilePic || 'https://via.placeholder.com/50', // Dummy profile pic URL
        }}
        style={styles.playerProfilePic}
      />
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.name}</Text>
        <Text style={styles.playerRole}>{item.role || 'Unknown Role'}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.captainButton}
          onPress={() =>
            Alert.alert(
              "Confirm Captain",
              `Are you sure you want to make ${item.name} the captain?`,
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Confirm",
                  onPress: () => makeCaptain(item.id),
                },
              ],
              { cancelable: true }
            )
          }
        >
          <Text style={styles.captainButtonText}>C</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => removePlayerFromTeam(item.id)}>
          <MaterialIcons name="delete" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
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
    teamPlayerCard: {
      flexDirection: 'row',
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
    playerProfilePic: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 10, // Space between picture and text
      backgroundColor: '#ccc', // Fallback background for dummy image
    },
    playerInfo: {
      flex: 1, // Take available space for name and role
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
  


  
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 4, 
    elevation: 5, 
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

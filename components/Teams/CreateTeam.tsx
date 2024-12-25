import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CreateTeam = () => {
  const [teamName, setTeamName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const fetchPlayers = async (query) => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await fetch(
        `https://score360-7.onrender.com/api/v1/teams/players/search/name`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      setLoading(false);
      return data.players || []; 
    } catch (error) {
      setLoading(false);
      console.error('Error fetching players:', error);
      return [];
    }
  };

  const handleSearch = async (query) => {
    const playersData = await fetchPlayers(query);
    setFilteredPlayers(
      playersData.filter(
        (player) =>
          player.name.toLowerCase().includes(query.toLowerCase()) ||
          player.phone.includes(query)
      )
    );
  };

  const addPlayerToTeam = (player) => {
    if (!teamPlayers.find((p) => p.phone === player.phone)) {
      setTeamPlayers([...teamPlayers, player]);
    }
    setSearchQuery('');
    setFilteredPlayers([]);
  };

  return (
    <View style={styles.container}>
      {/* Team Name Input */}
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

      {/* Add Player Search */}
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

      {/* Team Players List */}
      <View style={styles.teamListContainer}>
        <Text style={styles.label}>TEAM PLAYERS</Text>
        <FlatList
          data={teamPlayers}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.teamPlayerItem}>
              <Text style={styles.teamPlayerText}>{`${item.name} (${item.phone})`}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#002B46',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#004466',
    color: '#fff',
    padding: 10,
    borderRadius: 6,
    fontSize: 16,
  },
  dropdown: {
    backgroundColor: '#004466',
    marginTop: 5,
    borderRadius: 6,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#00334d',
  },
  dropdownText: {
    color: '#fff',
  },
  teamListContainer: {
    width: '100%',
    flex: 1,
  },
  teamPlayerItem: {
    backgroundColor: '#006080',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  teamPlayerText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default CreateTeam;

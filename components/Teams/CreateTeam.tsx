import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const CreateTeam = () => {
  const [teamName, setTeamName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState(['John Doe', 'Jane Smith', 'Chris Evans', 'Emma Watson']);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [teamPlayers, setTeamPlayers] = useState([]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredPlayers([]);
    } else {
      const filtered = players.filter((player) =>
        player.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPlayers(filtered);
    }
  };

  const addPlayerToTeam = (player) => {
    if (!teamPlayers.includes(player)) {
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
          placeholder="Search by name"
          placeholderTextColor="#ccc"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {filteredPlayers.length > 0 && (
          <View style={styles.dropdown}>
            {filteredPlayers.map((player, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dropdownItem}
                onPress={() => addPlayerToTeam(player)}
              >
                <Text style={styles.dropdownText}>{player}</Text>
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
              <Text style={styles.teamPlayerText}>{item}</Text>
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

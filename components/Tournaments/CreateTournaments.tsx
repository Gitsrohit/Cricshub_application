import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ImageBackground,
  Image,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const background = require('/Users/iceberg/score/Frontend/assets/images/bg.png'); 

const CreateTournament = () => {
  const [tournamentName, setTournamentName] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [format, setFormat] = useState('');
  const [ballType, setBallType] = useState('');
  const [numTeams, setNumTeams] = useState('');
  const [teamQuery, setTeamQuery] = useState('');
  const [teams, setTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState('');
  const [overs, setOvers] = useState(''); 

  const fetchTeams = async (query) => {
    try {
      const response = await fetch(`https://score360-7.onrender.com/api/teams?search=${query}`);
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      } else {
        setTeams([]);
      }
    } catch (error) {
      console.error(error);
      setTeams([]);
    }
  };

  const handleAddTeam = (team) => {
    if (!selectedTeams.includes(team)) {
      setSelectedTeams([...selectedTeams, team]);
    } else {
      Alert.alert('Error', 'Team already added.');
    }
  };

  const handleCreateTournament = async () => {
    if (!tournamentName || !format || !ballType || !numTeams || selectedTeams.length === 0) {
      Alert.alert('Error', 'Please fill all fields and add at least one team.');
      return;
    }

    try {
      const payload = {
        tournamentName,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        format,
        ballType,
        numTeams,
        selectedTeams,
        overs, 
      };

      const response = await fetch(`https://score360-7.onrender.com/api/v1/tournaments/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Alert.alert('Success', 'Tournament created successfully!');
      } else {
        Alert.alert('Error', 'Failed to create the tournament.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <View style={styles.background}>
      <ImageBackground source={background} style={styles.logo} resizeMode="contain">
        <View style={styles.container}>
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Tournament name"
              placeholderTextColor="#fff"
              value={tournamentName}
              onChangeText={setTournamentName}
            />
            <View style={styles.dateInputContainer}>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.placeholderText}>
                  {startDate ? startDate.toDateString() : 'Start Date'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={() => setShowStartDatePicker(true)}
              >
                <MaterialCommunityIcons name="calendar" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowStartDatePicker(false);
                  if (selectedDate) setStartDate(selectedDate);
                }}
              />
            )}
            <View style={styles.dateInputContainer}>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={styles.placeholderText}>
                  {endDate ? endDate.toDateString() : 'End Date'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={() => setShowEndDatePicker(true)}
              >
                <MaterialCommunityIcons name="calendar" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowEndDatePicker(false);
                  if (selectedDate) setEndDate(selectedDate);
                }}
              />
            )}
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={format}
                onValueChange={(itemValue) => setFormat(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Select Format" value="" />
                <Picker.Item label="Test" value="Test" />
                <Picker.Item label="T20" value="T20" />
                <Picker.Item label="50-50" value="50-50" />
                <Picker.Item label="Custom" value="Custom" />
              </Picker>
            </View>
            {format === 'Custom' && (
              <TextInput
                style={styles.input}
                placeholder="Enter no. of overs"
                placeholderTextColor="#aaa" 
                value={overs}
                onChangeText={setOvers}
                keyboardType="numeric"
              />
            )}
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={ballType}
                onValueChange={(itemValue) => setBallType(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Select Ball Type" value="" />
                <Picker.Item label="Tennis Ball" value="Tennis Ball" />
                <Picker.Item label="Season Ball" value="Season Ball" />
              </Picker>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Number of Teams"
              placeholderTextColor="#aaa" 
              keyboardType="numeric"
              value={numTeams}
              onChangeText={setNumTeams}
            />
            <TextInput
              style={styles.input}
              placeholder="Search Teams"
              placeholderTextColor="#aaa"
              value={teamQuery}
              onChangeText={(text) => {
                setTeamQuery(text);
                fetchTeams(text);
              }}
            />
            <FlatList
              data={teams}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.teamItem}
                  onPress={() => handleAddTeam(item)}
                >
                  <Text style={styles.teamName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />

            {/* Create Tournament Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleCreateTournament}
            >
              <Text style={styles.buttonText}>Create Tournament</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#003d99',
  },
  logo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    padding: 20,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    padding: 10,
    color: '#fff',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  placeholderText: {
    color: '#aaa',
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  picker: {
    color: '#fff',
    height: 50,
    paddingHorizontal: 10,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    position: 'absolute',
    right: 10,
    zIndex: 1,
  },
  teamItem: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 5,
    marginBottom: 5,
  },
  teamName: {
    color: '#fff',
    fontSize: 16,
  },
});

export default CreateTournament;

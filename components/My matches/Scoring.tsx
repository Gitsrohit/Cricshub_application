import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ImageBackground,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import EventSource from 'react-native-event-source';
import bg from '../../assets/images/bg.png';
import { Picker } from '@react-native-picker/picker';

const ScoringScreen = ({ route, navigation }) => {
  const { matchId, striker, nonStriker, bowler } = route.params;

  const [score, setScore] = useState({ runs: 0, wickets: 0, overs: '0.0' });
  const [selectedRun, setSelectedRun] = useState(null);
  const [wideExtra, setWideExtra] = useState('');
  const [byeExtra, setByeExtra] = useState('');
  const [wicketType, setWicketType] = useState('');
  const [modals, setModals] = useState({
    bye: false,
    wide: false,
    wicket: false,
  });

  const SSEhandler = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const eventSource = new EventSource(
        `https://score360-7.onrender.com/api/v1/matches/${matchId}/subscribe`, { headers: { Authorization: `Bearer ${token}` } }
      );

      eventSource.addEventListener('scoreUpdate', (event) => {
        const data = JSON.parse(event.data);
        setScore(data);
      });

      eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        eventSource.close();
      };

      return () => {
        eventSource.close();
      };
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    SSEhandler();
  }, [matchId]);

  const scoringOptions = ['0', '1', '2', '3', '4', '6'];

  const extrasOptions = [
    {
      key: 'Wd',
      value: 'Wide',
    },
    {
      key: 'B',
      value: 'Bye',
    },
    {
      key: 'LB',
      value: 'Leg Bye',
    },
    {
      key: 'NB',
      value: 'No Ball',
    },
    {
      key: 'W',
      value: 'Wicket',
    }
  ];

  const handleRunSelection = (run) => {
    if (run === 'Wide') {
      setModals({ ...modals, wide: true });
    } else if (run === 'Bye' || run === 'Leg Bye') {
      setModals({ ...modals, bye: true });
    } else if (run === 'Wicket') {
      setModals({ ...modals, wicket: true });
    } else {
      setSelectedRun(run);
      submitScore({ runs: parseInt(run), wide: false, noBall: false, bye: false, legBye: false, wicket: false });
    }
  };

  const handleExtrasWicketSelection = (value) => {
    if (value === 'Wide') {
      setModals({ ...modals, wide: true });
    } else if (value === 'Bye' || value === 'Leg Bye') {
      setModals({ ...modals, bye: true });
    } else if (value === 'Wicket') {
      setModals({ ...modals, wicket: true });
    } else {
      setSelectedRun(value);
      submitScore({ runs: parseInt(value), wide: false, noBall: false, bye: false, legBye: false, wicket: false });
    }
  }

  const submitScore = async (data) => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) throw new Error('Please login again');

      await axios.post(
        `https://score360-7.onrender.com/api/v1/matches/${matchId}/ball`,
        {
          matchId,
          tournamentId: null,
          strikerId: striker,
          bowlerId: bowler,
          wicketType: data.wicketType || '',
          shotType: '',
          direction: '',
          runs: data.runs || 0,
          battingFirst: true,
          wide: data.wide || false,
          noBall: data.noBall || false,
          bye: data.bye || false,
          legBye: data.legBye || false,
          wicket: data.wicket || false,
          freeHit: false,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Success', 'Score updated successfully!');
    } catch (err) {
      Alert.alert('Error', 'Failed to update score');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#0A303B', '#36B0D5']} style={styles.gradient}>
        <ImageBackground source={bg} resizeMode="cover" style={styles.background} imageStyle={styles.backgroundImage}>
          <View style={styles.scoreContainer}>
            <Text style={styles.teamName}>Team Name</Text>
            <Text style={styles.scoreText}>
              {score.runs}/{score.wickets} ({score.overs})
            </Text>
          </View>
        </ImageBackground>
      </LinearGradient>
      <View style={styles.scoringOptions}>
        <FlatList
          data={scoringOptions}
          numColumns={3}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Pressable style={styles.runButton} onPress={() => handleRunSelection(item)}>
              <Text style={styles.runText}>{item}</Text>
            </Pressable>
          )}
        />
        <FlatList
          data={extrasOptions}
          numColumns={3}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <Pressable style={styles.runButton} onPress={() => handleExtrasWicketSelection(item.value)}>
              <Text style={styles.runText}>{item.key}</Text>
            </Pressable>
          )}
        />
      </View>

      {/* Wide Modal */}
      <Modal visible={modals.wide} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Wide Runs:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={wideExtra}
              onChangeText={setWideExtra}
            />
            <Pressable
              style={styles.submitButton}
              onPress={() => {
                setModals({ ...modals, wide: false });
                submitScore({ runs: 1 + parseInt(wideExtra || 0), wide: true });
              }}
            >
              <Text style={styles.submitText}>Submit</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Bye/Leg Bye Modal */}
      <Modal visible={modals.bye} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Bye/Leg Bye Runs:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={byeExtra}
              onChangeText={setByeExtra}
            />
            <Pressable
              style={styles.submitButton}
              onPress={() => {
                setModals({ ...modals, bye: false });
                submitScore({ runs: parseInt(byeExtra || 0), bye: true });
              }}
            >
              <Text style={styles.submitText}>Submit</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Wicket Modal */}
      <Modal visible={modals.wicket} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Select Wicket Type:</Text>

            <Picker
              selectedValue={wicketType}
              onValueChange={(itemValue) => setWicketType(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Wicket Type" value="" />
              <Picker.Item label="Bowled" value="Bowled" />
              <Picker.Item label="Catch" value="Catch" />
              <Picker.Item label="Run Out" value="Run Out" />
              <Picker.Item label="Stump" value="Stump" />
              <Picker.Item label="LBW" value="LBW" />
            </Picker>

            <Pressable
              style={styles.submitButton}
              onPress={() => {
                if (!wicketType) {
                  Alert.alert('Error', 'Please select a wicket type.');
                  return;
                }
                setModals({ ...modals, wicket: false });
                submitScore({ runs: 0, wicket: true, wicketType });
              }}
            >
              <Text style={styles.submitText}>Submit</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ScoringScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  gradient: {
    flex: 1
  },
  background: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  backgroundImage: {
    resizeMode: 'cover',
    opacity: 0.8,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  picker: {
    width: '100%',
    backgroundColor: '#e9e9e9',
    marginTop: 10,
    borderRadius: 5,
  },
  teamName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white'
  },
  scoreText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white'
  },
  scoringOptions: {
    width: '100%',
    height: '30%',
    flexDirection: 'column',
    backgroundColor: '#002233',
  },
  runButton: {
    flex: 1,
    margin: 1,
    backgroundColor: '#e3e3e3',
    borderRadius: 2,
    height: 50,
    justifyContent: 'center'
  },
  runText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '50%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10
  },
  input: {
    backgroundColor: '#e7e7e7',
    borderRadius: 4,
  },
  submitButton: {
    backgroundColor: '#36B0D5',
    padding: 10,
    marginTop: 10,
    borderRadius: 5
  },
  submitText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold'
  },
});

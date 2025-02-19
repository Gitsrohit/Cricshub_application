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
  View,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import EventSource from 'react-native-event-source';
import bg from '../../assets/images/bg.png';
import { Picker } from '@react-native-picker/picker';

const ScoringScreen = ({ route, navigation }) => {
  const [matchId, setMatchId] = useState(route.params.matchId);
  const [strikerId, setStrikerId] = useState(route.params.strikerId);
  const [nonStrikerId, setNonStrikerId] = useState(route.params.nonStrikerId);
  const [bowler, setBowler] = useState(route.params.bowler);
  const [selectedStrikerName, setSelectedStrikerName] = useState(route.params.strikerName);
  const [selectedNonStrikerName, setSelectedNonStrikerName] = useState(route.params.nonStrikerName);
  const [selectedBowlerName, setSelectedBowlerName] = useState(route.params.bowlerName);

  const [selectedRun, setSelectedRun] = useState(null);
  const [wideExtra, setWideExtra] = useState('');
  const [byeExtra, setByeExtra] = useState('');
  const [wicketType, setWicketType] = useState('');
  const [modals, setModals] = useState({
    bye: false,
    wide: false,
    wicket: false,
    nextBatsman: false,
    nextBowler: false
  });
  const [battingTeamName, setBattingTeamName] = useState('');
  const [score, setScore] = useState(0);
  const [extras, setExtras] = useState(0);
  const [bowlingTeamName, setBowlingTeamName] = useState('');
  const [wicket, setWicket] = useState(0);
  const [battingTeamII, setBattingTeamII] = useState([]);
  const [bowlingTeamII, setBowlingTeamII] = useState([]);
  const [completedOvers, setCompletedOvers] = useState(0);
  const [currentBowlerName, setCurrentBowlerName] = useState(selectedBowlerName);
  const [strikerName, setStrikerName] = useState(selectedStrikerName);
  const [nonStrikerName, setNonStrikerName] = useState(selectedNonStrikerName);
  const [currentOver, setCurrentOver] = useState([]);
  const [nonStrikerStats, setNonStrikerStats] = useState({ runs: 0, ballsFaced: 0 });
  const [strikerStats, setStrikerStats] = useState({ runs: 0, ballsFaced: 0 });
  const [bowlerStats, setBowlerStats] = useState({ ballsBowled: 0, wicketsTaken: 0, runsConceded: 0 });
  const [overDetails, setOverDetails] = useState(null);
  const [availableBatsmen, setAvailableBatsmen] = useState([]);
  const [selectedBatsman, setSelectedBatsman] = useState({ playerId: null, name: null });

  const SSEhandler = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const eventSource = new EventSource(
        `https://score360-7.onrender.com/api/v1/matches/${matchId}/subscribe`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      eventSource.addEventListener('ball-update', (event) => {
        const data = JSON.parse(event.data);
        console.log(data);
        setBattingTeamName(data.battingTeam?.name);
        setBowlingTeamName(data.bowlingTeam?.name);
        setScore(data.battingTeam.score);
        setExtras(data.battingTeam.extras);
        setWicket(data.battingTeam.wickets);
        setBattingTeamII(data.battingTeamPlayingXI);
        setBowlingTeamII(data.bowlingTeamPlayingXI);
        setCompletedOvers(data.completedOvers);
        setCurrentBowlerName(data.currentBowler?.name);
        setStrikerName(data.currentStriker?.name);
        setNonStrikerName(data.currentNonStriker?.name);
        setCurrentOver(data.currentOver);
        // Extract striker details
        const strikerStats = data.battingTeamPlayingXI.find(
          (player) => player.name === data.currentStriker.name
        );

        // Extract non-striker details
        const nonStrikerStats = data.battingTeamPlayingXI.find(
          (player) => player.name === data.currentNonStriker.name
        );

        // Extract bowler details
        const bowlerStats = data.bowlingTeamPlayingXI.find(
          (player) => player.name === data.currentBowler.name
        );

        // Format over details
        const formattedOverDetails = data.currentOver.map((ball) => {
          let event = ball.runs.toString(); // Store runs (even if 0)

          if (ball.wicket) event += 'W';
          if (ball.noBall) event += 'NB';
          if (ball.wide) event += 'Wd';
          if (ball.bye) event += 'B';
          if (ball.legBye) event += 'LB';

          return event;
        });

        setOverDetails(formattedOverDetails);

        setStrikerStats(strikerStats || { runs: 0, ballsFaced: 0 });
        setNonStrikerStats(nonStrikerStats || { runs: 0, ballsFaced: 0 });
        setBowlerStats(bowlerStats || { ballsBowled: 0, wicketsTaken: 0, runsConceded: 0 });

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
  };

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

      // Fetch available batsmen
      const available = battingTeamII.filter(
        (player) => player.ballsFaced === 0 && player.playerId !== strikerId && player.playerId !== nonStrikerId
      ).map(({ playerId, name }) => ({ playerId, name }));

      setAvailableBatsmen(available);
    } else {
      setSelectedRun(value);
      submitScore({ runs: parseInt(value), wide: false, noBall: false, bye: false, legBye: false, wicket: false });
    }
  };

  const handleNextBatsmanSelection = async () => {
    if (!selectedBatsman) {
      Alert.alert('Error', 'Please select a batsman first');
      return;
    }

    setStrikerId(selectedBatsman.playerId);
    setStrikerName(selectedBatsman?.name);
    setModals({ ...modals, nextBatsman: false });
    submitScore({
      runs: 0,
      wicket: true,
      wicketType: wicketType,
    });
  };

  const wicketHandler = (value) => {
    setWicketType(value);
    setModals({ ...modals, wicket: false, nextBatsman: true }); // Open next batsman modal instead of submitting
  };

  const submitScore = async (data) => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) throw new Error('Please login again');

      await axios.post(
        `https://score360-7.onrender.com/api/v1/matches/${matchId}/ball`,
        {
          matchId,
          tournamentId: null,
          strikerId: strikerId,
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
          <View style={styles.scoreCard}>
            <View style={styles.scoreContainer}>
              <Text style={styles.teamName}>{battingTeamName}</Text>
              <Text style={styles.scoreText}>
                {score}/{wicket} ({completedOvers}.{currentOver.length})
              </Text>
            </View>
          </View>
        </ImageBackground>
      </LinearGradient>
      <View style={styles.scoringOptions}>
        <View style={styles.scoringCard}>
          <View>
            <Text style={styles.playerText}>{strikerName}*-<Text>{strikerStats.runs}({strikerStats.ballsFaced})</Text></Text>
            <Text style={styles.playerText}>{nonStrikerName}-<Text>{nonStrikerStats.runs}({nonStrikerStats.ballsFaced})</Text></Text>
          </View>
          <View>
            <Text style={styles.playerText}>Over: {overDetails?.join(" ")}</Text>
            <Text style={styles.playerText}>{currentBowlerName}-{bowlerStats.wicketsTaken}/{bowlerStats.runsConceded}</Text>
          </View>
        </View>
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
                submitScore({ runs: parseInt(wideExtra || 0), wide: true });
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
              onValueChange={(itemValue) => wicketHandler(itemValue)}
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

                setModals({ ...modals, wicket: false, nextBatsman: true }); // Open Next Batsman Modal

                // Fetch available batsmen
                const available = battingTeamII.filter(
                  (player) => player.ballsFaced === 0 && player.playerId !== strikerId && player.playerId !== nonStrikerId
                ).map(({ playerId, name }) => ({ playerId, name }));

                setAvailableBatsmen(available);
              }}
            >
              <Text style={styles.submitText}>Submit</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* New batsman selection modal */}
      <Modal visible={modals.nextBatsman} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Next Batsman</Text>

            <Picker
              selectedValue={selectedBatsman?.playerId}
              onValueChange={(itemValue) => {
                const selectedPlayer = availableBatsmen.find(player => player.playerId === itemValue);
                setSelectedBatsman(selectedPlayer);
              }}
              style={styles.picker}
            >
              <Picker.Item label="Select Batsman" value="" />
              {availableBatsmen.map((batsman) => (
                <Picker.Item key={batsman.playerId} label={batsman?.name} value={batsman?.playerId} />
              ))}
            </Picker>

            <Pressable
              style={styles.submitButton}
              onPress={async () => {
                if (!selectedBatsman) {
                  Alert.alert('Error', 'Please select a batsman.');
                  return;
                }

                setStrikerId(selectedBatsman.playerId);
                setStrikerName(selectedBatsman?.name);
                setModals({ ...modals, nextBatsman: false });

                // API call after batsman selection
                await submitScore({ runs: 0, wicket: true, wicketType });
              }}
            >
              <Text style={styles.submitText}>Confirm Batsman</Text>
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
    height: '40%',
    flexDirection: 'column',
    backgroundColor: '#002233',
  },
  scoringCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
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
  batsmanOption: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 5,
    backgroundColor: '#f2f2f2',
    borderRadius: 5,
    alignItems: 'center',
  },
  selectedBatsman: {
    backgroundColor: '#4CAF50', // Green for selected batsman
  },
  batsmanText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  selectButton: {
    marginTop: 15,
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  selectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
  playerText: {
    fontSize: 14,
    color: 'white',
  },
  oversContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#002233',
    borderRadius: 10,
    flexDirection: 'row',
  },
  heading: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  overText: {
    fontSize: 12,
    color: 'white',
    flexDirection: 'row'
  },
  scoreCard: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    width: '100%',
  },
  playerInfo: {
    width: '100%',
    flexDirection: 'row'
  },
});

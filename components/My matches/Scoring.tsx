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
  Image,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
// import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';

import EventSource from 'react-native-event-source';
import bg from '../../assets/images/cricsLogo.png';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
const driveImage = require('../../assets/images/DriveShot.png');
const cutImage = require('../../assets/images/squareShot.png');
const pullImage = require('../../assets/images/HookShot.png');
const hookImage = require('../../assets/images/HookShot.png');
const sweepImage = require('../../assets/images/Sweep.png');
const reverseSweepImage = require('../../assets/images/Sweep.png');
const flickImage = require('../../assets/images/FlickShot.png');
const defensiveImage = require('../../assets/images/Defence.png');
const loftedImage = require('../../assets/images/LoaftedShot.png');


const ScoringScreen = ({ route }) => {
  const navigation = useNavigation();
  const [matchId, setMatchId] = useState(route.params.matchId);
  const [strikerId, setStrikerId] = useState(route.params.strikerId);
  const [nonStrikerId, setNonStrikerId] = useState(route.params.nonStrikerId);
  const [bowler, setBowler] = useState(route.params.bowler);
  const [selectedStrikerName, setSelectedStrikerName] = useState(route.params.selectedStrikerName);
  const [selectedNonStrikerName, setSelectedNonStrikerName] = useState(route.params.selectedNonStrikerName);
  const [selectedBowlerName, setSelectedBowlerName] = useState(route.params.selectedBowlerName);
  const [selectedRun, setSelectedRun] = useState(null);
  const [wideExtra, setWideExtra] = useState('');
  const [noBallExtra, setNoBallExtra] = useState('');
  const [byeExtra, setByeExtra] = useState('');
  const [wicketType, setWicketType] = useState('');
  const [modals, setModals] = useState({
    bye: false,
    wide: false,
    wicket: false,
    nextBatsman: false,
    nextBowler: false,
    noBall: false,
    startNextInnings: false,
  });
  const [battingTeamName, setBattingTeamName] = useState(route.params.battingTeamName);
  const [score, setScore] = useState(route.params.score || 0);
  const [extras, setExtras] = useState(0);
  const [bowlingTeamName, setBowlingTeamName] = useState(route.params.bowlingTeamName);
  const [wicket, setWicket] = useState(route.params.wicket || 0);
  const [battingTeamII, setBattingTeamII] = useState(route.params.battingTeamII || []);
  const [bowlingTeamII, setBowlingTeamII] = useState(route.params.bowlingTeamII || []);
  const [completedOvers, setCompletedOvers] = useState(route.params.completedOvers || 0);
  const [currentBowlerName, setCurrentBowlerName] = useState(selectedBowlerName);
  const [strikerName, setStrikerName] = useState(selectedStrikerName);
  const [nonStrikerName, setNonStrikerName] = useState(selectedNonStrikerName);
  const [currentOver, setCurrentOver] = useState([]);
  const [nonStrikerStats, setNonStrikerStats] = useState({ runs: 0, ballsFaced: 0 });
  const [strikerStats, setStrikerStats] = useState({ runs: 0, ballsFaced: 0 });
  const [bowlerStats, setBowlerStats] = useState({ ballsBowled: 0, wicketsTaken: 0, runsConceded: 0 });
  const [overDetails, setOverDetails] = useState(null);
  const [availableBatsmen, setAvailableBatsmen] = useState(battingTeamII?.filter(
    (player) => player?.ballsFaced === 0 && player?.playerId !== strikerId && player?.playerId !== nonStrikerId
  ).map(({ playerId, name }) => ({ playerId, name })));
  const [selectedBatsman, setSelectedBatsman] = useState({ playerId: null, name: null });
  const [legalDeliveries, setLegalDeliveries] = useState(0);
  const [availableBowlers, setAvailableBowlers] = useState([]);
  const [selectedBowler, setSelectedBowler] = useState({
    playerId: '',
    name: ''
  });
  const [directionModalVisible, setDirectionModalVisible] = useState(false);
  const [selectedDirection, setSelectedDirection] = useState(null);
  const [selectedShot, setSelectedShot] = useState(null);
  const [shotModalVisible, setShotModalVisible] = useState(false);
  const [selectedRunForShot, setSelectedRunForShot] = useState(null);
  const cricketShots = [
    'Drive',
    'Cut',
    'Pull',
    'Hook',
    'Sweep',
    'Reverse Sweep',
    'Flick',
    'Defensive',
    'Lofted',
  ];
  const shotImages = {
    'Drive': driveImage,
    'Cut': cutImage,
    'Pull': pullImage,
    'Hook': hookImage,
    'Sweep': sweepImage,
    'Reverse Sweep': reverseSweepImage,
    'Flick': flickImage,
    'Defensive': defensiveImage,
    'Lofted': loftedImage,
  };
  const directions = [
    { name: 'Mid Wicket', angle: 0 },
    { name: 'Cover', angle: 180 },
    { name: 'Long on', angle: 45 },
    { name: 'Mid off', angle: 135 },
    { name: 'Square leg', angle: 315 },
    { name: 'Point', angle: 225 },
    { name: 'Straight', angle: 90 },
    { name: 'Fine Leg', angle: 270 },
  ];


  const radius = 120;
  const center = 150;

  const handleRunSelection = (run) => {
    setSelectedRunForShot(run);
    setShotModalVisible(true);
  };


  const handleShotSelection = (shot) => {
    setSelectedShot(shot);
    setShotModalVisible(false);
    setDirectionModalVisible(true);

  };
  const handleDirectionSelection = (direction) => {
    setSelectedDirection(direction);
    setDirectionModalVisible(false);
    submitScore({
      runs: parseInt(selectedRunForShot),
      wide: false,
      noBall: false,
      bye: false,
      legBye: false,
      wicket: false,
      shotType: selectedShot,
      direction: direction,
    });
  };

  const SSEhandler = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const eventSource = new EventSource(
        `https://score360-7.onrender.com/api/v1/matches/${matchId}/subscribe`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      eventSource.addEventListener('ball-update', (event) => {
        const data = JSON.parse(event.data);
        console.log("Ball update");
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

        // Fetch available bowlers
        const filteredBowlers = data.bowlingTeamPlayingXI.filter((player) => player.playerId !== bowler).map(({ playerId, name }) => ({ playerId, name }));
        setAvailableBowlers(filteredBowlers);

        // Fetch available batsmen
        const available = data.battingTeamPlayingXI.filter(
          (player) => player.ballsFaced === 0 && player.playerId !== strikerId && player.playerId !== nonStrikerId
        ).map(({ playerId, name }) => ({ playerId, name }));
        setAvailableBatsmen(available);

        // Extract striker details
        const strikerStats = data.battingTeamPlayingXI.find(
          (player) => player?.name === data.currentStriker?.name
        );

        // Extract non-striker details
        const nonStrikerStats = data.battingTeamPlayingXI.find(
          (player) => player?.name === data.currentNonStriker?.name
        );
        const bowlerStats = data.bowlingTeamPlayingXI.find(
          (player) => player?.name === data.currentBowler?.name
        );
        const formattedOverDetails = data.currentOver.map((ball) => {
          let event = ball.runs.toString();

          if (ball.wicket) event += 'W';
          if (ball.noBall) event += 'NB';
          if (ball.wide) event += 'Wd';
          if (ball.bye) event += 'B';
          if (ball.legBye) event += 'LB';

          return event;
        });

        setOverDetails(formattedOverDetails);
        const deliveryCount = data.currentOver.reduce((count, ball) => {
          return count + (ball.noBall || ball.wide ? 0 : 1);
        }, 0);
        setLegalDeliveries(deliveryCount);
        if (data.completedOvers !== 0 && deliveryCount === 0 && (data.completedOvers !== (data.totalOvers))) {
          setModals((prev) => ({ ...prev, nextBowler: true }));
        }

        setStrikerStats(strikerStats || { runs: 0, ballsFaced: 0 });
        setNonStrikerStats(nonStrikerStats || { runs: 0, ballsFaced: 0 });
        setBowlerStats(bowlerStats || { ballsBowled: 0, wicketsTaken: 0, runsConceded: 0 });

      });

      eventSource.addEventListener('match-complete', (event) => {
        const data = event.data;
        console.log("Match complete");
        console.log(JSON.parse(data));
        eventSource.close();
        navigation.navigate('MatchScoreCard', { matchId })
      })

      eventSource.addEventListener('innings-complete', (event) => {
        console.log("Innings over!");
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

        // Fetch available bowlers
        const filteredBowlers = data.bowlingTeamPlayingXI.filter((player) => player.playerId !== bowler).map(({ playerId, name }) => ({ playerId, name }));
        setAvailableBowlers(filteredBowlers);

        // Fetch available batsmen
        const available = data.battingTeamPlayingXI.filter(
          (player) => player.ballsFaced === 0 && player.playerId !== strikerId && player.playerId !== nonStrikerId
        ).map(({ playerId, name }) => ({ playerId, name }));
        setAvailableBatsmen(available);

        // Extract striker details
        const strikerStats = data.battingTeamPlayingXI.find(
          (player) => player?.name === data.currentStriker?.name
        );

        // Extract non-striker details
        const nonStrikerStats = data.battingTeamPlayingXI.find(
          (player) => player?.name === data.currentNonStriker?.name
        );
        const bowlerStats = data.bowlingTeamPlayingXI.find(
          (player) => player?.name === data.currentBowler?.name
        );
        const formattedOverDetails = data.currentOver.map((ball) => {
          let event = ball.runs.toString();

          if (ball.wicket) event += 'W';
          if (ball.noBall) event += 'NB';
          if (ball.wide) event += 'Wd';
          if (ball.bye) event += 'B';
          if (ball.legBye) event += 'LB';

          return event;
        });

        setOverDetails(formattedOverDetails);
        const deliveryCount = data.currentOver.reduce((count, ball) => {
          return count + (ball.noBall || ball.wide ? 0 : 1);
        }, 0);
        setLegalDeliveries(deliveryCount);
        if (data.completedOvers !== 0 && deliveryCount === 0 && (data.completedOvers !== (data.totalOvers))) {
          setModals((prev) => ({ ...prev, nextBowler: true }));
        }

        setStrikerStats(strikerStats || { runs: 0, ballsFaced: 0 });
        setNonStrikerStats(nonStrikerStats || { runs: 0, ballsFaced: 0 });
        setBowlerStats(bowlerStats || { ballsBowled: 0, wicketsTaken: 0, runsConceded: 0 });

        setModals({ ...modals, startNextInnings: true });
      });

      eventSource.addEventListener('second-innings-started', (event) => {
        console.log("2nd innings event listening");
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

        // Fetch available bowlers
        const filteredBowlers = data.bowlingTeamPlayingXI.filter((player) => player.playerId !== bowler).map(({ playerId, name }) => ({ playerId, name }));
        setAvailableBowlers(filteredBowlers);

        // Fetch available batsmen
        const available = data.battingTeamPlayingXI.filter(
          (player) => player.ballsFaced === 0 && player.playerId !== strikerId && player.playerId !== nonStrikerId
        ).map(({ playerId, name }) => ({ playerId, name }));
        setAvailableBatsmen(available);

        // Extract striker details
        const strikerStats = data.battingTeamPlayingXI.find(
          (player) => player?.name === data.currentStriker?.name
        );

        // Extract non-striker details
        const nonStrikerStats = data.battingTeamPlayingXI.find(
          (player) => player?.name === data.currentNonStriker?.name
        );
        const bowlerStats = data.bowlingTeamPlayingXI.find(
          (player) => player?.name === data.currentBowler?.name
        );
        const formattedOverDetails = data.currentOver.map((ball) => {
          let event = ball.runs.toString();

          if (ball.wicket) event += 'W';
          if (ball.noBall) event += 'NB';
          if (ball.wide) event += 'Wd';
          if (ball.bye) event += 'B';
          if (ball.legBye) event += 'LB';

          return event;
        });

        setOverDetails(formattedOverDetails);
        const deliveryCount = data.currentOver.reduce((count, ball) => {
          return count + (ball.noBall || ball.wide ? 0 : 1);
        }, 0);
        setLegalDeliveries(deliveryCount);
        if (data.completedOvers !== 0 && deliveryCount === 0 && (data.completedOvers !== (data.totalOvers))) {
          setModals((prev) => ({ ...prev, nextBowler: true }));
        }

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

  const getMatchState = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const response = await axios.get(
        `https://score360-7.onrender.com/api/v1/matches/matchstate/${matchId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Match State Data:", response.data);
      const data = response.data;

      setMatchId(data.matchId);
      setStrikerId(data.currentStriker?.playerId || null);
      setNonStrikerId(data.currentNonStriker?.playerId || null);
      setBowler(data.currentBowler?.playerId || null);
      setSelectedStrikerName(data.currentStriker?.name || "Unknown");
      setSelectedNonStrikerName(data.currentNonStriker?.name || "Unknown");
      setSelectedBowlerName(data.currentBowler?.name || "Unknown");
      setBattingTeamName(data.battingTeam?.name || "Unknown");
      setScore(data.battingTeam?.score || 0);
      setBowlingTeamName(data.bowlingTeam?.name || "Unknown");
      setWicket(data.battingTeam?.wickets || 0);
      setExtras(data.battingTeam?.extras || 0);
      setBattingTeamII(data.battingTeamPlayingXI || []);
      setBowlingTeamII(data.bowlingTeamPlayingXI || []);
      setCompletedOvers(data.completedOvers || 0);
      setCurrentOver(data.currentOver || []);

      const filteredBowlers = data.bowlingTeamPlayingXI?.filter((player) => player.playerId !== data.currentBowler?.playerId)
        .map(({ playerId, name }) => ({ playerId, name })) || [];
      setAvailableBowlers(filteredBowlers);

      const available = data.battingTeamPlayingXI?.filter(
        (player) => player.ballsFaced === 0 && player.playerId !== data.currentStriker?.playerId && player.playerId !== data.currentNonStriker?.playerId
      ).map(({ playerId, name }) => ({ playerId, name })) || [];
      setAvailableBatsmen(available);

      const strikerStats = data.battingTeamPlayingXI?.find(player => player?.name === data.currentStriker?.name) || { runs: 0, ballsFaced: 0 };
      const nonStrikerStats = data.battingTeamPlayingXI?.find(player => player?.name === data.currentNonStriker?.name) || { runs: 0, ballsFaced: 0 };
      const bowlerStats = data.bowlingTeamPlayingXI?.find(player => player?.name === data.currentBowler?.name) || { ballsBowled: 0, wicketsTaken: 0, runsConceded: 0 };

      setStrikerStats(strikerStats);
      setNonStrikerStats(nonStrikerStats);
      setBowlerStats(bowlerStats);

      const formattedOverDetails = data.currentOver?.map((ball) => {
        let event = ball.runs.toString();
        if (ball.wicket) event += 'W';
        if (ball.noBall) event += 'NB';
        if (ball.wide) event += 'Wd';
        if (ball.bye) event += 'B';
        if (ball.legBye) event += 'LB';
        return event;
      }) || [];

      setOverDetails(formattedOverDetails);

      const deliveryCount = data.currentOver?.reduce((count, ball) => {
        return count + (ball.noBall || ball.wide ? 0 : 1);
      }, 0) || 0;
      setLegalDeliveries(deliveryCount);

      if (data.completedOvers !== 0 && deliveryCount === 0 && (data.completedOvers !== (data.totalOvers))) {
        setModals((prev) => ({ ...prev, nextBowler: true }));
      }
      console.log("Logging set values");
      console.log("Match ID:", matchId);
      console.log("Striker:", strikerId);
      console.log("Non-Striker:", nonStrikerId);
      console.log("Bowler:", bowler);
      console.log("Selected Striker Name:", selectedStrikerName);
      console.log("Selected Non-Striker Name:", selectedNonStrikerName);
      console.log("Selected Bowler Name:", selectedBowlerName);
      console.log("Batting Team Name:", battingTeamName);
      console.log("Score:", score);
      console.log("Wickets:", wicket);
      console.log("Extras:", extras);
      console.log("Completed Overs:", completedOvers);


    } catch (error) {
      console.log("Error fetching match state:", error);
    }
  };

  useEffect(() => {
    // getMatchState();
  }, []);

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

  // const handleRunSelection = (run) => {
  //   if (run === 'Wide') {
  //     setModals({ ...modals, wide: true });
  //   } else if (run === 'Bye' || run === 'Leg Bye') {
  //     setModals({ ...modals, bye: true });
  //   } else if (run === 'Wicket') {
  //     setModals({ ...modals, wicket: true });
  //   } else {
  //     setSelectedRun(run);
  //     submitScore({ runs: parseInt(run), wide: false, noBall: false, bye: false, legBye: false, wicket: false });
  //   }
  // };

  const handleExtrasWicketSelection = (value) => {
    if (value === 'Wide') {
      setModals({ ...modals, wide: true });
    } else if (value === 'Bye' || value === 'Leg Bye') {
      setModals({ ...modals, bye: true });
    } else if (value === 'No Ball' || value === 'No Ball') {
      setModals({ ...modals, noBall: true });
    } else if (value === 'Wicket') {
      setModals({ ...modals, wicket: true });
    } else {
      setSelectedRun(value);
      submitScore({ runs: parseInt(value), wide: false, noBall: false, bye: false, legBye: false, wicket: false });
    }
  };

  const handleNextBatsmanSelection = async (selectedPlayer) => {
    if (!selectedPlayer) {
      Alert.alert('Error', 'Please select a batsman first');
      return;
    }
    setStrikerStats({ runs: 0, ballsFaced: 0 });

    setStrikerId(selectedPlayer.playerId);
    setStrikerName(selectedPlayer.name);
    setModals({ ...modals, nextBatsman: false });

    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) throw new Error('Please login again');

      const response = await axios.post(
        `https://score360-7.onrender.com/api/v1/matches/${matchId}/next-batsman/${selectedPlayer.playerId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

    } catch (error) {
      console.error("Error updating next batsman:", error);
      Alert.alert("Error", "Failed to update next batsman.");
    }
  };

  const selectNextBowler = async (playerId, playerName) => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) throw new Error('Please login again');
      const response = await axios.post(`https://score360-7.onrender.com/api/v1/matches/${matchId}/next-bowler/${playerId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Reset the new bowler's stats
      setBowlerStats({ ballsBowled: 0, wicketsTaken: 0, runsConceded: 0 });

      setBowler(playerId);
      setCurrentBowlerName(playerName);
      setLegalDeliveries(0);
      setModals((prev) => ({ ...prev, nextBowler: false }));
    } catch (error) {
      console.error("Error selecting next bowler:", error);
    }
  };

  const wicketHandler = (value) => {
    setWicketType(value);
    submitScore({
      runs: 0,
      wicket: true,
      wicketType: value,
    });
    const available = battingTeamII.filter(
      (player) => player.ballsFaced === 0 && player.playerId !== strikerId && player.playerId !== nonStrikerId
    ).map(({ playerId, name }) => ({ playerId, name }));
    setAvailableBatsmen(available);
    setWicketType('');

    setModals((prev) => ({ ...prev, wicket: false }));
    setTimeout(() => {
      if (wicket < 9) {
        setModals((prev) => ({ ...prev, nextBatsman: true }));
      }
    }, 10000);
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
          shotType: data.shotType || '',
          direction: data.direction || '',
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

  const handleStartSecondInnings = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const response = await axios.post(`https://score360-7.onrender.com/api/v1/matches/matches/${matchId}/start-second-innings`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setModals({ ...modals, startNextInnings: false });
      navigation.navigate('SelectRoles', { matchId, isFirstInnings: false });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#0A303B', '#36B0D5']} style={styles.gradient}>
        <ImageBackground source={bg} resizeMode="cover" style={styles.background} imageStyle={styles.backgroundImage}>
          <View style={styles.scoreCard}>
            <View style={styles.scoreContainer}>
              <Text style={styles.teamName}>{battingTeamName}</Text>
              <Text style={styles.scoreText}>
                {score}/{wicket} ({completedOvers}.{legalDeliveries})
              </Text>
            </View>
          </View>
        </ImageBackground>
      </LinearGradient>

      {/* Player Info Section */}
      <View style={styles.playerInfoContainer}>
        <View style={styles.playerInfo}>
          <Text style={styles.playerText}>{strikerName}* - <Text style={styles.playerStats}>{strikerStats.runs}({strikerStats.ballsFaced})</Text></Text>
          <Text style={styles.playerText}>{nonStrikerName} - <Text style={styles.playerStats}>{nonStrikerStats.runs}({nonStrikerStats.ballsFaced})</Text></Text>
        </View>
        <View style={styles.bowlerInfo}>
          <Text style={styles.playerText}>Over: {overDetails?.join(" ")}</Text>
          <Text style={styles.playerText}>{currentBowlerName} - {bowlerStats.wicketsTaken}/{bowlerStats.runsConceded}</Text>
        </View>
      </View>
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

      <Modal visible={shotModalVisible} transparent animationType="slide">
        <Modal visible={shotModalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Shot Type</Text>
              <FlatList
                data={cricketShots}
                numColumns={3}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.shotOption}
                    onPress={() => handleShotSelection(item)}
                  >
                    <Image
                      source={shotImages[item]}
                      style={styles.shotImage}
                      resizeMode="contain"
                    />

                    <Text style={styles.shotText}>{item}</Text>
                  </Pressable>
                )}
              />
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShotModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </Modal>
      <Modal visible={directionModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Shot Direction</Text>
            <View style={styles.wagonWheelContainer}>
              <View style={styles.circleBackground} />
              {directions.map((direction, index) => {
                const angleInRadians = (direction.angle * Math.PI) / 180;
                const x = center + radius * Math.cos(angleInRadians) - 40;
                const y = center + radius * Math.sin(angleInRadians) - 20;

                return (
                  <Pressable
                    key={index}
                    style={[
                      styles.directionButton,
                      { top: y, left: x },
                    ]}
                    onPress={() => handleDirectionSelection(direction.name)}
                  >
                    <Text style={styles.directionText}>{direction.name}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable
              style={styles.cancelButton}
              onPress={() => setDirectionModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
                submitScore({ runs: parseInt(wideExtra || '0'), wide: true });
                setWideExtra('0');
              }}
            >
              <Text style={styles.submitText}>Submit</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* No-ball Modal */}
      <Modal visible={modals.noBall} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>No ball runs:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={noBallExtra}
              onChangeText={setNoBallExtra}
            />
            <Pressable
              style={styles.submitButton}
              onPress={() => {
                setModals({ ...modals, noBall: false });
                submitScore({ runs: parseInt(noBallExtra || '0'), noBallExtra: true });
                setNoBallExtra('0');
              }}
            >
              <Text style={styles.submitText}>Submit</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
                submitScore({ runs: parseInt(byeExtra || '0'), bye: true });
              }}
            >
              <Text style={styles.submitText}>Submit</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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

                setModals({ ...modals, wicket: false, nextBatsman: true });
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
      <Modal visible={modals.nextBatsman} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Next Batsman</Text>

            <Picker
              selectedValue={selectedBatsman?.playerId}
              onValueChange={(itemValue) => {
                const selectedPlayer = availableBatsmen.find(player => player.playerId === itemValue);
                setSelectedBatsman(selectedPlayer);
                handleNextBatsmanSelection(selectedPlayer);
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
              }}
            >
              <Text style={styles.submitText}>Confirm Batsman</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal visible={modals.nextBowler} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Next Bowler</Text>

            <Picker
              selectedValue={selectedBowler?.playerId}
              onValueChange={(itemValue) => {
                const selectedPlayer = availableBowlers.find(player => player.playerId === itemValue);
                setSelectedBowler(selectedPlayer);
              }}
              style={styles.picker}
            >
              <Picker.Item label="Select Bowler" value="" />
              {availableBowlers.map((bowler) => (
                <Picker.Item key={bowler.playerId} label={bowler?.name} value={bowler?.playerId} />
              ))}
            </Picker>

            <Pressable
              style={styles.submitButton}
              onPress={() => {
                if (!selectedBowler?.playerId) {
                  Alert.alert('Error', 'Please select a bowler.');
                  return;
                }
                selectNextBowler(selectedBowler.playerId, selectedBowler.name);
              }}
            >
              <Text style={styles.submitText}>Confirm Bowler</Text>
            </Pressable>

          </View>
        </View>
      </Modal>

      {/* No-ball Modal */}
      <Modal visible={modals.startNextInnings} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Start second innings?</Text>
            <Pressable
              style={styles.submitButton}
              onPress={() => handleStartSecondInnings()}
            >
              <Text style={styles.submitText}>Yes</Text>
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
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  gradient: {
    flex: 1,
  },
  background: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    resizeMode: 'cover',
    opacity: 0.8,
  },
  scoreCard: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    width: '100%',
    padding: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  teamName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  playerInfoContainer: {
    backgroundColor: '#002233',
    padding: 15,
    borderRadius: 10,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  playerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  bowlerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  playerText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  playerStats: {
    fontSize: 14,
    color: '#FFD700',
  },
  scoringOptions: {
    backgroundColor: '#002233',
    padding: 10,
    borderRadius: 10,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  runButton: {
    flex: 1,
    margin: 5,
    backgroundColor: '#36B0D5',
    borderRadius: 8,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  runText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },

  input: {
    backgroundColor: '#e7e7e7',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },
  submitButton: {
    backgroundColor: '#36B0D5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  picker: {
    width: '100%',
    backgroundColor: '#e9e9e9',
    borderRadius: 8,
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  shotOption: {
    flex: 1,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  shotImage: {
    width: 60,
    height: 60,
    marginBottom: 5,
    backgroundColor: 'transparent',
  },
  shotText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#FF4757',
    fontWeight: 'bold',
  },
  wagonWheelContainer: {
    width: 300,
    height: 300,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleBackground: {
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#4CAF50',
    position: 'absolute',
  },
  directionButton: {
    position: 'absolute',
    width: 80,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
  },
  directionText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
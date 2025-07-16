import React, { useEffect, useRef, useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

import EventSource from 'react-native-event-source';


import bg from '../../assets/images/cricsLogo.png';
import { Picker } from '@react-native-picker/picker';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useNavigation } from '@react-navigation/native';
import apiService from '../APIservices';
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

const isLiveConnectedRef = useRef(false);
const reconnectAttemptsRef = useRef(0);
const MAX_RECONNECT_ATTEMPTS = 5;
  const [strikerId, setStrikerId] = useState(route.params.strikerId);
  const [nonStrikerId, setNonStrikerId] = useState(route.params.nonStrikerId);
  const [bowler, setBowler] = useState(route.params.bowler);
  const [selectedStrikerName, setSelectedStrikerName] = useState(route.params.selectedStrikerName);
  const [selectedNonStrikerName, setSelectedNonStrikerName] = useState(route.params.selectedNonStrikerName);
  const [selectedBowlerName, setSelectedBowlerName] = useState(route.params.selectedBowlerName);
  const isSubmitConnectedRef = useRef(false);
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
    catch: false,
    runout: false,
    fielderSelect: false,
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
  const [selectedCatcher, setSelectedCatcher] = useState();
  const [runOutGetterId, setRunOutGetterId] = useState(null);
  const [runOutFielderId, setRunOutFielderId] = useState(null);
  const [directionModalVisible, setDirectionModalVisible] = useState(false);
  const [selectedDirection, setSelectedDirection] = useState(null);
  const [selectedShot, setSelectedShot] = useState(null);
  const [shotModalVisible, setShotModalVisible] = useState(false);
  const [selectedRunForShot, setSelectedRunForShot] = useState(null);
  const liveSocketRef = useRef(null);
  const submitSocketRef = useRef(null);
  const livePingIntervalRef = useRef(null);
  const livePongTimeoutRef = useRef(null);
  const submitPingIntervalRef = useRef(null);
  const submitPongTimeoutRef = useRef(null);
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
    handleSubmit({
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

  const matchStateUpdateHandler = (data) => {
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
    
  }


//  const setupSubmitSocket = async () => {
//   try {
//     const submitSocketUrl = `ws://34.47.150.57:8081/app/match/${matchId}`;
//     submitSocketRef.current = new WebSocket(submitSocketUrl);

//     submitSocketRef.current.onopen = () => {
//       console.log('[Submit] WebSocket connected');

//       submitPingIntervalRef.current = setInterval(() => {
//         if (submitSocketRef.current?.readyState === WebSocket.OPEN) {
//           console.log('[Submit] Sending ping...');
//           submitSocketRef.current.send(JSON.stringify({ type: 'ping' }));

//           submitPongTimeoutRef.current = setTimeout(() => {
//             console.warn('[Submit] Pong not received, closing socket');
//             submitSocketRef.current?.close();
//           }, 5000);
//         }
//       }, 20000);
//     };

//     submitSocketRef.current.onmessage = (message) => {
//       try {
//         const parsed = JSON.parse(message.data);

//         if (parsed.type === 'pong') {
//           clearTimeout(submitPongTimeoutRef.current);
//           console.log('[Submit] Received pong');
//           return;
//         }

//         console.log('[Submit] Message:', parsed); // Log anything else for now

//       } catch (err) {
//         console.error('[Submit] WebSocket message error:', err);
//       }
//     };

//     submitSocketRef.current.onerror = (error) => {
//       console.error('[Submit] WebSocket error:', error.message || error);
//     };

//     submitSocketRef.current.onclose = () => {
//       console.warn('[Submit] WebSocket closed');
//       clearInterval(submitPingIntervalRef.current);
//       clearTimeout(submitPongTimeoutRef.current);
//     };
//   } catch (err) {
//     console.error('[Submit] WebSocket setup error:', err);
//   }
// };

//   // const SSEhandler = async () => {
//   //   try {
//   //     const token = await AsyncStorage.getItem('jwtToken');
//   //     //test
//   //     const eventSource = new EventSource(
//   //       `http://34.47.150.57:8081/api/v1/matches/${matchId}/subscribe`,
//   //       { headers: { Authorization: `Bearer ${token}` } }
//   //     );

//   //     //prod
//   //     // const eventSource = new EventSource(
//   //     //   `http://34.47.150.57:8080/api/v1/matches/${matchId}/subscribe`,
//   //     //   { headers: { Authorization: `Bearer ${token}` } }
//   //     // );

//   //     eventSource.addEventListener('ball-update', (event) => {
//   //       const data = JSON.parse(event.data);
//   //       console.log("Ball update");
//   //       console.log(data);
//   //       matchStateUpdateHandler(data);
//   //     });

//   //     eventSource.addEventListener('match-complete', (event) => {
//   //       const data = event.data;
//   //       console.log("Match complete");
//   //       console.log(JSON.parse(data));
//   //       eventSource.close();
//   //       navigation.navigate('MatchScoreCard', { matchId })
//   //     })

//   //     eventSource.addEventListener('innings-complete', (event) => {
//   //       console.log("Innings over!");
//   //       const data = JSON.parse(event.data);
//   //       console.log(data);
//   //       matchStateUpdateHandler(data);
//   //       setModals({ ...modals, startNextInnings: true });
//   //     });

//   //     eventSource.addEventListener('second-innings-started', (event) => {
//   //       console.log("2nd innings event listening");
//   //       const data = JSON.parse(event.data);
//   //       console.log(data);
//   //       matchStateUpdateHandler(data);
//   //     });

//   //     eventSource.onerror = (error) => {
//   //       console.error('SSE Error:', error);
//   //       eventSource.close();
//   //     };

//   //     return () => {
//   //       eventSource.close();
//   //     };
//   //   } catch (err) {
//   //     console.log(err);
//   //   }
//   // };

//   const webSocketConnectionHandler = async () => {
//     try {
//       const liveSocketUrl = `ws://34.47.150.57:8081/api/v1/topic/match/${matchId}`;
//       liveSocketRef.current = new WebSocket(liveSocketUrl);

//       liveSocketRef.current.onopen = () => {
//         console.log('[Live] WebSocket connected');

//         livePingIntervalRef.current = setInterval(() => {
//           if (liveSocketRef.current?.readyState === WebSocket.OPEN) {
//             console.log('[Live] Sending ping...');
//             liveSocketRef.current.send(JSON.stringify({ type: 'ping' }));

//             livePongTimeoutRef.current = setTimeout(() => {
//               console.warn('[Live] Pong not received, closing socket');
//               liveSocketRef.current?.close();
//             }, 5000);
//           }
//         }, 20000);
//       };

//       liveSocketRef.current.onmessage = (message) => {
//         try {
//           const parsed = JSON.parse(message.data);

//           if (parsed.type === 'pong') {
//             clearTimeout(livePongTimeoutRef.current);
//             console.log('[Live] Received pong');
//             return;
//           }

//           const { type, data } = parsed;
//           switch (type) {
//             case 'ball-update':
//               console.log('Ball update');
//               matchStateUpdateHandler(data);
//               break;
//             case 'match-complete':
//               console.log('Match complete');
//               liveSocketRef.current?.close();
//               navigation.navigate('MatchScoreCard', { matchId });
//               break;
//             case 'innings-complete':
//               console.log('Innings over');
//               matchStateUpdateHandler(data);
//               setModals((prev) => ({ ...prev, startNextInnings: true }));
//               break;
//             case 'second-innings-started':
//               console.log('Second innings started');
//               matchStateUpdateHandler(data);
//               break;
//             default:
//               console.log('Unknown message type:', type);
//           }
//         } catch (err) {
//           console.error('[Live] WebSocket message error:', err);
//         }
//       };

//       liveSocketRef.current.onerror = (error) => {
//         console.error('[Live] WebSocket error:', error.message || error);
//       };

//       liveSocketRef.current.onclose = () => {
//         console.warn('[Live] WebSocket closed');
//         clearInterval(livePingIntervalRef.current);
//         clearTimeout(livePongTimeoutRef.current);
//       };
//     } catch (err) {
//       console.error('[Live] WebSocket setup error:', err);
//     }
//   };

//   useEffect(() => {
//     // SSEhandler();
//     webSocketConnectionHandler();
//     setupSubmitSocket();
//   }, [matchId]);



const stompSubmitClient = new Client();
const stompLiveClient = new Client();
// Connection state refs


// Common configuration for both clients
// Connection Manager Hook




const useStompConnection = () => {
  const [submitConnected, setSubmitConnected] = useState(false);
  const [liveConnected, setLiveConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 3;

  const updateConnectionState = (type, isConnected) => {
    if (type === 'submit') {
      setSubmitConnected(isConnected);
    } else {
      setLiveConnected(isConnected);
    }

    if (!isConnected) {
      console.warn(`[${type}] Connection state updated to disconnected`);
    }
  };

  const setupClient = (client, type, matchId = null) => {
    console.log(`[${type}] Initializing STOMP client...`);

    client.configure({
      webSocketFactory: () => {
        console.log(`[${type}] Creating native WebSocket connection...`);
        return new WebSocket('ws://34.47.150.57:8081/ws'); // change to wss:// in prod/
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (str) => console.log(`[${type}] DEBUG: ${str}`),
    });

    client.onConnect = (frame) => {
      console.log(`[${type}] STOMP connected ✅`, frame);
      updateConnectionState(type, true);
      reconnectAttempts.current = 0;

      if (type === 'live' && matchId) {
        client.subscribe(`/topic/match/${matchId}`, (message) => {
          console.log(`[${type}] Live message:`, message.body);
          // You can add logic to handle live updates here
        });
      }
    };

    client.onStompError = (frame) => {
      console.error(`[${type}] STOMP error:`, frame.headers?.message || frame);
      updateConnectionState(type, false);
    };

    client.onWebSocketClose = (event) => {
      console.warn(`[${type}] WebSocket closed:`, event);
      updateConnectionState(type, false);

      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts.current++;
        console.log(`[${type}] Attempting reconnect (${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS})`);
        setTimeout(() => client.activate(), 5000);
      }
    };

    client.onDisconnect = () => {
      console.log(`[${type}] STOMP disconnected`);
      updateConnectionState(type, false);
    };

    client.activate();
  };

  return { submitConnected, liveConnected, setupClient };
};







  const getMatchState = async () => {
    try {
      const { success, data, error } = await apiService({
        endpoint: `matches/matchstate/${matchId}`,
        method: 'GET',
      });

      if (!success) {
        console.log("Error fetching match state:", error);
        return;
      }

      // console.log("Match State Data:", data);

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

      const filteredBowlers =
        data.bowlingTeamPlayingXI?.filter(
          (player) => player.playerId !== data.currentBowler?.playerId
        ).map(({ playerId, name }) => ({ playerId, name })) || [];
      setAvailableBowlers(filteredBowlers);

      const available =
        data.battingTeamPlayingXI?.filter(
          (player) =>
            player.ballsFaced === 0 &&
            player.playerId !== data.currentStriker?.playerId &&
            player.playerId !== data.currentNonStriker?.playerId
        ).map(({ playerId, name }) => ({ playerId, name })) || [];
      setAvailableBatsmen(available);

      const strikerStats =
        data.battingTeamPlayingXI?.find(
          (player) => player?.name === data.currentStriker?.name
        ) || { runs: 0, ballsFaced: 0 };
      const nonStrikerStats =
        data.battingTeamPlayingXI?.find(
          (player) => player?.name === data.currentNonStriker?.name
        ) || { runs: 0, ballsFaced: 0 };
      const bowlerStats =
        data.bowlingTeamPlayingXI?.find(
          (player) => player?.name === data.currentBowler?.name
        ) || { ballsBowled: 0, wicketsTaken: 0, runsConceded: 0 };

      setStrikerStats(strikerStats);
      setNonStrikerStats(nonStrikerStats);
      setBowlerStats(bowlerStats);

      const formattedOverDetails =
        data.currentOver?.map((ball) => {
          let event = ball.runs.toString();
          if (ball.wicket) event += 'W';
          if (ball.noBall) event += 'NB';
          if (ball.wide) event += 'Wd';
          if (ball.bye) event += 'B';
          if (ball.legBye) event += 'LB';
          return event;
        }) || [];

      setOverDetails(formattedOverDetails);

      const deliveryCount =
        data.currentOver?.reduce((count, ball) => {
          return count + (ball.noBall || ball.wide ? 0 : 1);
        }, 0) || 0;
      setLegalDeliveries(deliveryCount);

      if (
        data.completedOvers !== 0 &&
        deliveryCount === 0 &&
        data.completedOvers !== data.totalOvers
      ) {
        setModals((prev) => ({ ...prev, nextBowler: true }));
      }
      // console.log("Logging set values");
      // console.log("Match ID:", matchId);
      // console.log("Striker:", strikerId);
      // console.log("Non-Striker:", nonStrikerId);
      // console.log("Bowler:", bowler);
      // console.log("Selected Striker Name:", selectedStrikerName);
      // console.log("Selected Non-Striker Name:", selectedNonStrikerName);
      // console.log("Selected Bowler Name:", selectedBowlerName);
      // console.log("Batting Team Name:", battingTeamName);
      // console.log("Score:", score);
      // console.log("Wickets:", wicket);
      // console.log("Extras:", extras);;;
      // console.log("Completed Overs:", completedOvers);

    } catch (error) {
      console.log("Error fetching match state:", error);
    }
  };

  useEffect(() => {
    getMatchState();
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
    },
    {
      key: 'Undo',
      value: 'Undo',
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

  const undoHandler = async () => {
    try {
      const { success, data, error } = await apiService({
        endpoint: `matches/${matchId}/undo-last-ball`,
        method: 'POST',
        body: {},
      });

      if (!success) {
        console.log("Undo failed:", error);
        return;
      }

      console.log("Undo successful:", data);
    } catch (err) {
      console.log("Unexpected error during undo:", err);
    }
    getMatchState();
  };

  const handleExtrasWicketSelection = (value) => {
    if (value === 'Wide') {
      setModals({ ...modals, wide: true });
    } else if (value === 'Bye' || value === 'Leg Bye') {
      setModals({ ...modals, bye: true });
    } else if (value === 'No Ball' || value === 'No Ball') {
      setModals({ ...modals, noBall: true });
    } else if (value === 'Wicket') {
      setModals({ ...modals, wicket: true });
    } else if (value === 'Undo') {
      undoHandler();
    } else {
      setSelectedRun(value);
      handleSubmit({ runs: parseInt(value), wide: false, noBall: false, bye: false, legBye: false, wicket: false });
    }
  };

  const handleNextBatsmanSelection = async (selectedPlayer) => {
    if (!selectedPlayer) {
      Alert.alert('Error', 'Please select a batsman first');
      return;
    }

    if (strikerId === null) {
      setStrikerStats({ runs: 0, ballsFaced: 0 });
      setStrikerId(selectedPlayer.playerId);
      setStrikerName(selectedPlayer.name);
    } else {
      setNonStrikerStats({ runs: 0, ballsFaced: 0 });
      setNonStrikerId(selectedPlayer.playerId);
      setNonStrikerName(selectedPlayer.name);
    }
    setModals({ ...modals, nextBatsman: false });

    const { success, error } = await apiService({
      endpoint: `matches/${matchId}/next-batsman/${selectedPlayer.playerId}`,
      method: 'POST',
      body: {},
    });

    if (!success) {
      console.error("Error updating next batsman:", error);
      Alert.alert("Error", "Failed to update next batsman.");
    }
  };

  const selectNextBowler = async (playerId, playerName) => {
    const { success, error } = await apiService({
      endpoint: `matches/${matchId}/next-bowler/${playerId}`,
      method: 'POST',
      body: {},
    });

    if (!success) {
      console.error("Error selecting next bowler:", error);
      Alert.alert("Error", "Failed to update next bowler.");
      return;
    }

    // Reset the new bowler's stats
    setBowlerStats({ ballsBowled: 0, wicketsTaken: 0, runsConceded: 0 });
    setBowler(playerId);
    setCurrentBowlerName(playerName);
    setLegalDeliveries(0);
    setModals((prev) => ({ ...prev, nextBowler: false }));
  };

  const catchHandler = () => {
    console.log('Selected Catcher:', selectedCatcher);

    handleSubmit({
      runs: 0,
      wicket: true,
      wicketType: 'Caught',
      catcherId: selectedCatcher, // just pass the string ID
    });

    const available = battingTeamII.filter(
      (player) =>
        player.ballsFaced === 0 &&
        player.playerId !== strikerId &&
        player.playerId !== nonStrikerId
    ).map(({ playerId, name }) => ({ playerId, name }));

    setAvailableBatsmen(available);
    setWicketType('');
    setSelectedCatcher(null);

    setModals((prev) => ({ ...prev, catch: false }));

    setTimeout(() => {
      if (wicket < 9) {
        setModals((prev) => ({ ...prev, nextBatsman: true }));
      }
    }, 10000);
  };

  const wicketHandler = (value) => {
    console.log("Wicket giraa");

    setWicketType(value);
   handleSubmit({
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
  const waitForStomp = (client, timeout = 3000) =>
  new Promise((resolve, reject) => {
    const interval = 100;
    let waited = 0;
    const check = () => {
      if (client.connected) return resolve(true);
      waited += interval;
      if (waited >= timeout) return reject('STOMP connection timeout');
      setTimeout(check, interval);
    };
    check();
  });

const waitForSubmitConnection = async (checkConnectedState, timeout = 5000) => {
  const interval = 100;
  let waited = 0;

  return new Promise((resolve, reject) => {
    const check = () => {
      if (checkConnectedState()) {
        resolve(true);
      } else if (waited >= timeout) {
        reject(new Error('STOMP submit connection timeout'));
      } else {
        waited += interval;
        setTimeout(check, interval);
      }
    };
    check();
  });
};


const submitScore = async (data, isConnectedFn) => {
  const payload = {
    matchId,
    tournamentId: null,
    strikerId,
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
    catcherId: selectedCatcher || null,
    runOutMakerId: data.runOutMakerId || null,
    runOutGetterId: data.runOutGetterId || null,
  };

  try {
    await waitForSubmitConnection(isConnectedFn);

    stompSubmitClient.publish({
      destination: `/app/match/${matchId}/ball`,
      body: JSON.stringify(payload),
      headers: { 'content-type': 'application/json' },
    });

    setTimeout(() => {
      console.log('[Submit] Score published successfully');
    }, 100);

    return true;
  } catch (error) {
    console.error('[Submit] Publish error:', error);
    Alert.alert('Submission Error', 'Failed to submit score. Please wait for connection.');
    return false;
  }
};

const checkConnectionHealth = async (client, type) => {
  console.log(`[${type}] Checking connection health...`);
  
  // If client thinks it's connected but WebSocket isn't ready
  if (client.connected && (!client.webSocket || client.webSocket.readyState !== WebSocket.OPEN)) {
    console.warn(`[${type}] Connection state mismatch - forcing reconnect`);
    try {
      await client.deactivate();
      await new Promise(resolve => setTimeout(resolve, 500));
      client.activate();
      return false;
    } catch (err) {
      console.error(`[${type}] Reconnect failed:`, err);
      return false;
    }
  }
  
  return client.connected;
};





  const handleStartSecondInnings = async () => {
    const { success, error } = await apiService({
      endpoint: `matches/matches/${matchId}/start-second-innings`,
      method: 'POST',
      body: {},
    });

    if (success) {
      setModals({ ...modals, startNextInnings: false });
      navigation.navigate('SelectRoles', { matchId, isFirstInnings: false });
    } else {
      console.error('Start second innings error:', error);
      Alert.alert('Error', 'Failed to start second innings');
    }
  };
  const { submitConnected, setupClient } = useStompConnection();

  useEffect(() => {
    console.log('[WS] Setting up sockets for match:', matchId);
    setupClient(stompLiveClient, 'live', matchId);
    setupClient(stompSubmitClient, 'submit');

    return () => {
      console.log('[WS] Cleaning up connections...');
      stompLiveClient.deactivate();
      stompSubmitClient.deactivate();
    };
  }, [matchId]);
const handleSubmit = async (data) => {
  await submitScore(data, () => submitConnected); // 🔥 pass state as a function
};

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
                handleSubmit({ runs: parseInt(wideExtra || '0'), wide: true });
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
                handleSubmit({ runs: parseInt(noBallExtra || '0'), noBall: true });
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
              handleSubmit({ runs: parseInt(byeExtra || '0'), bye: true });
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
              onValueChange={(itemValue) => {
                if (itemValue === 'Catch') {
                  setWicketType('Catch');
                  setModals((prev) => ({ ...prev, wicket: false, catch: true }));
                } else if (itemValue === 'Run Out') {
                  setWicketType('Run Out');
                  setModals((prev) => ({ ...prev, wicket: false, runout: true }));
                } else {
                  wicketHandler(itemValue);
                }
              }}

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
      {/* Catcher Modal */}
      <Modal visible={modals.catch} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Catcher</Text>

            <Picker
              selectedValue={selectedCatcher}
              onValueChange={(itemValue) => {
                console.log(itemValue);
                setSelectedCatcher(itemValue);
              }}
              style={styles.picker}
            >
              <Picker.Item label="Select Catcher" value="" />
              {bowlingTeamII.map((fielder) => (
                <Picker.Item key={fielder.playerId} label={fielder?.name} value={fielder.playerId} />
              ))}
            </Picker>

            <Pressable
              style={styles.submitButton}
              onPress={() => {
                if (!selectedCatcher) {
                  Alert.alert('Error', 'Please select the catcher.');
                  return;
                }
                catchHandler();
              }}
            >
              <Text style={styles.submitText}>Confirm Catcher</Text>
            </Pressable>

          </View>
        </View>
      </Modal>

      {/* Run Out - Step 1: Who got out */}
      <Modal visible={modals.runout} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Who got run out?</Text>
            <Pressable
              style={styles.submitButton}
              onPress={() => {
                setRunOutGetterId(strikerId);
                setModals((prev) => ({ ...prev, runout: false, fielderSelect: true }));
              }}
            >
              <Text>{strikerName} (Striker)</Text>
            </Pressable>

            <Pressable
              style={styles.submitButton}
              onPress={() => {
                setRunOutGetterId(nonStrikerId);
                setModals((prev) => ({ ...prev, runout: false, fielderSelect: true }));
              }}
            >
              <Text>{nonStrikerName} (Non-Striker)</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Run Out - Step 2: Fielder Involved */}
      <Modal visible={modals.fielderSelect} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Fielder</Text>
            <Picker
              selectedValue={runOutFielderId}
              onValueChange={(itemValue) => setRunOutFielderId(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Fielder" value="" />
              {bowlingTeamII.map((fielder) => (
                <Picker.Item key={fielder.playerId} label={fielder.name} value={fielder.playerId} />
              ))}
            </Picker>

            <Pressable
              style={styles.submitButton}
              onPress={() => {
                if (!runOutFielderId) {
                  Alert.alert('Error', 'Please select a fielder.');
                  return;
                }

                // Call score handler
                handleSubmit({
                  runs: 0,
                  wicket: true,
                  wicketType: 'Run Out',
                  runOutGetterId: runOutGetterId,
                  runOutMakerId: runOutFielderId,
                });

                const available = battingTeamII.filter(
                  (player) =>
                    player.ballsFaced === 0 &&
                    player.playerId !== strikerId &&
                    player.playerId !== nonStrikerId
                ).map(({ playerId, name }) => ({ playerId, name }));

                setAvailableBatsmen(available);
                setModals((prev) => ({ ...prev, fielderSelect: false }));
                setTimeout(() => {
                  if (wicket < 9) {
                    setModals((prev) => ({ ...prev, nextBatsman: true }));
                  }
                }, 10000);
              }}
            >
              <Text style={styles.submitText}>Confirm Run Out</Text>
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
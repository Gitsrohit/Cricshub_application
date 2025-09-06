import {
  StyleSheet, Text, View, FlatList,
  ImageBackground, ActivityIndicator, RefreshControl,
  TouchableOpacity, Animated, ScrollView, Dimensions,
  SafeAreaView, StatusBar, Platform
} from 'react-native';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import apiService from '../APIservices';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const background = require('../../assets/images/cricsLogo.png');

// Color theme matching the Performance component
const AppColors = {
  white: "#FFFFFF",
  black: "#000000",
  blue: "#3498DB",
  background: "#F8F9FA",
  cardBorder: "rgba(255, 255, 255, 0.2)",
  error: "#E74C3C",
  darkBlue: "#1F2A44",
  lightText: "#AAB0C6",
  green: "#2ecc71",
  yellow: "#f39c12",
  red: "#e74c3c"
};

const AppGradients = {
  primaryCard: ["#34B8FF", "#0575E6"],
  secondaryCard: ["#6C5CE7", "#3498DB"],
  header: ["#1F2A44", "#162036"],
  tabActive: ["#3498DB", "#2c3e50"]
};

const CommentaryScorecard = ({ route, navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [matchId, setMatchId] = useState(route.params.matchId);
  const [bowler, setBowler] = useState({ id: null, name: null, overs: 0, runsConceded: 0, wickets: 0, economyRate: 0.0 });
  const [striker, setStriker] = useState({ id: null, name: null, runs: 0, ballsFaced: 0, strikeRate: 0.0 });
  const [nonStriker, setNonStriker] = useState({ id: null, name: null, runs: 0, ballsFaced: 0, strikeRate: 0.0 });
  const [score, setScore] = useState(null);
  const [bowlingTeamName, setBowlingTeamName] = useState(null);
  const [battingTeamName, setBattingTeamName] = useState(null);
  const [bowlingTeamScore, setBowlingTeamScore] = useState(null);
  const [bowlingTeamWickets, setBowlingTeamWickets] = useState(null);
  const [totalOvers, setTotalOvers] = useState(null);
  const [wicket, setWicket] = useState(null);
  const [completedOvers, setCompletedOvers] = useState(null);
  const [overDetails, setOverDetails] = useState("");
  const legalDeliveriesRef = useRef(0);
  const [legalDeliveries, setLegalDeliveries] = useState(0);
  const [team1BattingOrder, setTeam1BattingOrder] = useState([]);
  const [team2BattingOrder, setTeam2BattingOrder] = useState([]);
  const [team1BowlingOrder, setTeam1BowlingOrder] = useState([]);
  const [team2BowlingOrder, setTeam2BowlingOrder] = useState([]);

  const [activeTab, setActiveTab] = useState('commentary');
  const [scoreTab, setScoreTab] = useState('T1B');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const stompLiveClientRef = useRef<Client | null>(null);
  const stompSubmitClientRef = useRef<Client | null>(null);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });

  const dedupeByPlayer = (arr = []) => {
    const map = new Map();
    for (const item of arr) {
      const key = item?.playerId || item?.id || item?.name;
      map.set(key, item);
    }
    return Array.from(map.values());
  };

  const safeNumber = (n, d = 0) => (Number.isFinite(n) ? n : d);

  const ballsToOvers = (balls) => {
    const b = safeNumber(balls, 0);
    const ov = Math.floor(b / 6);
    const r = b % 6;
    return `${ov}.${r}`;
  };

  const economy = (runsConceded, ballsBowled) => {
    const r = safeNumber(runsConceded, 0);
    const b = safeNumber(ballsBowled, 0);
    if (b === 0) return '0.0';
    const ov = b / 6;
    return (r / ov).toFixed(1);
  };

  const strikeRateCalc = (runs, balls) => {
    const r = safeNumber(runs, 0);
    const b = safeNumber(balls, 0);
    if (b === 0) return '0.0';
    return ((r * 100) / b).toFixed(1);
  };

  const dismissalText = (wicketDetails) => {
    if (!wicketDetails) return 'not out';
    const { dismissalType, bowlerId, catcherId, runOutMakerId } = wicketDetails || {};
    if (!dismissalType) return 'not out';
    switch ((dismissalType || '').toLowerCase()) {
      case 'bowled':
        return 'b';
      case 'caught':
        return catcherId ? `c ${catcherId} b` : 'c & b';
      case 'lbw':
        return 'lbw';
      case 'stumped':
        return 'st';
      case 'run out':
      case 'runout':
        return `run out`;
      case 'hit wicket':
        return 'hit wicket';
      default:
        return dismissalType;
    }
  };

  const getMatchState = async () => {
    try {
      setLoading(true);
      const { success, data, error } = await apiService({
        endpoint: `matches/matchstate/${matchId}`,
        method: 'GET',
      });

      if (!success) {
        console.log("Error fetching match state:", error);
        return;
      }

      setMatchId(data?.matchId);

      setBowler({
        id: data?.currentBowler?.playerId,
        name: data?.currentBowler?.name,
        overs: data?.bowlingTeam?.playingXI?.find(
          (p) => p.playerId === data?.currentBowler?.playerId
        )?.overs || 0,
        runsConceded: data?.bowlingTeam?.playingXI?.find(
          (p) => p.playerId === data?.currentBowler?.playerId
        )?.runsConceded || 0,
        wickets: data?.bowlingTeam?.playingXI?.find(
          (p) => p.playerId === data?.currentBowler?.playerId
        )?.wicketsTaken || 0,
        economyRate: data?.bowlingTeam?.playingXI?.find(
          (p) => p.playerId === data?.currentBowler?.playerId
        )?.economyRate || 0.0,
      });

      setStriker({
        id: data?.currentStriker?.playerId,
        name: data?.currentStriker?.name,
        runs: data?.battingTeam?.playingXI?.find(
          (p) => p.playerId === data?.currentStriker?.playerId
        )?.runs || 0,
        ballsFaced: data?.battingTeam?.playingXI?.find(
          (p) => p.playerId === data?.currentStriker?.playerId
        )?.ballsFaced || 0,
        strikeRate: data?.battingTeam?.playingXI?.find(
          (p) => p.playerId === data?.currentStriker?.playerId
        )?.strikeRate || 0.0,
      });

      setNonStriker({
        id: data?.currentNonStriker?.playerId,
        name: data?.currentNonStriker?.name,
        runs: data?.battingTeam?.playingXI?.find(
          (p) => p.playerId === data?.currentNonStriker?.playerId
        )?.runs || 0,
        ballsFaced: data?.battingTeam?.playingXI?.find(
          (p) => p.playerId === data?.currentNonStriker?.playerId
        )?.ballsFaced || 0,
        strikeRate: data?.battingTeam?.playingXI?.find(
          (p) => p.playerId === data?.currentNonStriker?.playerId
        )?.strikeRate || 0.0,
      });

      setCompletedOvers(data?.completedOvers || 0);
      setScore(data?.battingTeam?.score || 0);
      setWicket(data?.battingTeam?.wickets || 0);
      setBattingTeamName(data?.battingTeam?.name || "");
      setTotalOvers(data.totalOvers);

      setBowlingTeamName(data?.bowlingTeam?.name || "");
      setBowlingTeamScore(data?.bowlingTeam?.score || 0);
      setBowlingTeamWickets(data?.bowlingTeam?.wickets || 0);

      const formattedOverDetails =
        data?.currentOver?.map((ball) => {
          let event = ball.runs?.toString() || "0";
          if (ball.wicket) event += " W";
          if (ball.noBall) event += " NB";
          if (ball.wide) event += " Wd";
          if (ball.bye) event += " B";
          if (ball.legBye) event += " LB";
          return event.trim();
        }) || [];

      setOverDetails(formattedOverDetails.join(" "));

      const deliveryCount =
        data?.currentOver?.reduce((count, ball) => {
          return count + (ball.noBall || ball.wide ? 0 : 1);
        }, 0) || 0;

      legalDeliveriesRef.current = deliveryCount;
      setLegalDeliveries(deliveryCount);

      if (
        data?.completedOvers !== 0 &&
        deliveryCount === 0 &&
        data?.completedOvers !== data?.totalOvers
      ) {
        setOverDetails("");
      }

      setTeam1BattingOrder(dedupeByPlayer(data?.team1BattingOrder || []));
      setTeam2BattingOrder(dedupeByPlayer(data?.team2BattingOrder || []));
      setTeam1BowlingOrder(dedupeByPlayer(data?.team1BowlingOrder || []));
      setTeam2BowlingOrder(dedupeByPlayer(data?.team2BowlingOrder || []));

    } catch (error) {
      console.log("Error fetching match state:", error);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // 2. Live updates handler
  // ----------------------------
  const matchScoreUpdateHandler = (data) => {
    setBattingTeamName(data?.battingTeam?.name);
    setBowlingTeamName(data?.bowlingTeam?.name);
    setOverDetails((prev) => prev + " " + (data?.ballString || ""));
    setBowler({
      id: data?.currentBowler?.id,
      name: data?.currentBowler?.name,
      overs: data?.currentBowler?.overs,
      runsConceded: data?.currentBowler?.runsConceded,
      wickets: data?.currentBowler?.wickets,
      economyRate: data?.currentBowler?.economyRate,
    });

    setStriker({
      id: data?.striker?.id,
      name: data?.striker?.name,
      runs: data?.striker?.runs,
      ballsFaced: data?.striker?.ballsFaced,
      strikeRate: data?.striker?.strikeRate,
    });

    setNonStriker({
      id: data?.nonStriker?.id,
      name: data?.nonStriker?.name,
      runs: data?.nonStriker?.runs,
      ballsFaced: data?.nonStriker?.ballsFaced,
      strikeRate: data?.nonStriker?.strikeRate,
    });

    setCompletedOvers(data?.overNumber);
    setScore(data?.totalRuns);
    setWicket(data?.wicketsLost);

    if (data?.overComplete === true) {
      setOverDetails("");
      legalDeliveriesRef.current = 0;
      setLegalDeliveries(0);

      if (data?.overNumber !== data?.totalOvers) {
        console.log("next bowler modal open");
      }
    }

    if (data?.overComplete === false) {
      const ballStr = data?.ballString?.toUpperCase() || "";
      const isWide = ballStr.includes("WD");
      const isNoBall = ballStr.includes("NB");
      const isLegalDelivery = !isWide && !isNoBall;

      if (isLegalDelivery) {
        const updatedLegalDeliveries = (legalDeliveriesRef.current + 1) % 6;
        legalDeliveriesRef.current = updatedLegalDeliveries;
        setLegalDeliveries(updatedLegalDeliveries);
      }
    }
  };

  // ----------------------------
  // 3. STOMP connection
  // ----------------------------
  const matchScoreCardUpdateHandler = (data) => {
    if (Array.isArray(data?.team1BattingOrder)) setTeam1BattingOrder(dedupeByPlayer(data.team1BattingOrder));
    if (Array.isArray(data?.team2BattingOrder)) setTeam2BattingOrder(dedupeByPlayer(data.team2BattingOrder));
    if (Array.isArray(data?.team1BowlingOrder)) setTeam1BowlingOrder(dedupeByPlayer(data.team1BowlingOrder));
    if (Array.isArray(data?.team2BowlingOrder)) setTeam2BowlingOrder(dedupeByPlayer(data.team2BowlingOrder));
  };

  const useStompConnection = () => {
    const [liveConnected, setLiveConnected] = useState(false);

    const updateConnectionState = (type: 'live', isConnected: boolean) => {
      if (type === 'live') setLiveConnected(isConnected);
    };

    const setupClient = (
      clientRef: React.MutableRefObject<Client | null>,
      type: 'submit' | 'live',
      matchId: string | null = null
    ) => {
      if (clientRef.current && clientRef.current.active) {
        return;
      }

      clientRef.current = new Client();
      clientRef.current.configure({
        webSocketFactory: () => new SockJS('http://34.47.150.57:8081/ws'),
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
      });

      clientRef.current.onConnect = () => {
        updateConnectionState('live', true);

        if (type === 'live' && matchId) {
          clientRef.current?.subscribe(`/topic/match/${matchId}`, (message: IMessage) => {
            try {
              const parsed = JSON.parse(message.body);
              if (!parsed.eventName || !parsed.payload) return;
              const { eventName, payload } = parsed;

              switch (eventName) {
                case 'ball-update':
                  matchScoreUpdateHandler(payload);
                  break;
                case 'match-complete':
                  navigation.navigate('MatchScoreCard', { matchId: payload.matchId });
                  break;
                case 'innings-complete':
                  matchScoreUpdateHandler(payload);
                  break;
                case 'second-innings-started':
                  matchScoreUpdateHandler(payload);
                  break;
                default:
                  console.warn('Unknown event type:', eventName, payload);
              }

              if (eventName === 'live-score-board') {
                matchScoreCardUpdateHandler(payload);
                console.log("Ball by ball");
                console.log(payload);
              }
            } catch (error) {
              console.error('Error processing live message:', error, message.body);
            }
          });
        }
      };

      clientRef.current.onStompError = () => {
        updateConnectionState('live', false);
      };

      clientRef.current.onDisconnect = () => {
        updateConnectionState('live', false);
      };

      clientRef.current.activate();
    };

    return { liveConnected, setupClient };
  };

  const { setupClient } = useStompConnection();

  useEffect(() => {
    getMatchState();
    setupClient(stompLiveClientRef, 'live', matchId);

    return () => {
      stompLiveClientRef.current?.deactivate();
      stompSubmitClientRef.current?.deactivate();
    };
  }, [matchId]);

  const renderCommentary = ({ item }) => {
    const cleanedCommentary = item?.commentary?.replace(/[*\\"/]/g, '');
    const isWicket = /out|wicket|bowled|caught|lbw|stumped|run out/i.test(cleanedCommentary);
    const isBoundary = /six|four|boundary/i.test(cleanedCommentary);

    return (
      <View style={[
        styles.commentaryItem,
        isWicket && styles.wicketItem,
        isBoundary && styles.boundaryItem
      ]}>
        <View style={styles.commentaryHeader}>
          <Text style={styles.overText}>{item.overNumber}.{item.ballNumber}</Text>
          {isWicket && <MaterialCommunityIcons name="cricket" size={18} color={AppColors.red} />}
          {isBoundary && <MaterialCommunityIcons name="run-fast" size={18} color={AppColors.yellow} />}
        </View>
        <Text style={styles.commentaryText}>{cleanedCommentary}</Text>
      </View>
    );
  };

  const getAllCommentary = () => {
    return [];
  };

  const renderScorecard = () => (
    <LinearGradient
      colors={AppGradients.primaryCard}
      style={styles.scorecardContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.teamScoreContainer}>
        <View style={styles.teamScore}>
          <Text style={styles.teamName}>{battingTeamName}</Text>
          <Text style={styles.teamRuns}>
            {score}/{wicket} ({completedOvers}.{legalDeliveries} ov)
          </Text>
        </View>

        <View style={styles.versusContainer}>
          <Text style={styles.versusText}>vs</Text>
        </View>

        <View style={styles.teamScore}>
          <Text style={styles.teamName}>{bowlingTeamName}</Text>
          <Text style={styles.teamRuns}>
            {bowlingTeamScore}/{bowlingTeamWickets} ({totalOvers}.0 ov)
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.playerContainer}>
        <View style={styles.playerRow}>
          <View style={styles.playerInfo}>
            <View style={[styles.playerIcon, styles.strikerIcon]} />
            <Text style={styles.playerName}>{striker?.name}*</Text>
          </View>
          <Text style={styles.playerStats}>{striker?.runs} ({striker?.ballsFaced})</Text>
          <Text style={styles.playerExtra}>SR: {striker.ballsFaced != 0 ? (striker?.runs * 100) / striker.ballsFaced : 0.0}</Text>
        </View>

        <View style={styles.playerRow}>
          <View style={styles.playerInfo}>
            <View style={[styles.playerIcon, styles.nonStrikerIcon]} />
            <Text style={styles.playerName}>{nonStriker?.name}</Text>
          </View>
          <Text style={styles.playerStats}>{nonStriker?.runs} ({nonStriker?.ballsFaced})</Text>
          <Text style={styles.playerExtra}>SR: {nonStriker.ballsFaced != 0 ? (nonStriker?.runs * 100) / nonStriker.ballsFaced : 0.0}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.playerRow}>
          <View style={styles.playerInfo}>
            <View style={[styles.playerIcon, styles.bowlerIcon]} />
            <Text style={styles.playerName}>{bowler?.name}</Text>
          </View>
          <Text style={styles.playerStats}>{bowler?.wickets}/{bowler?.runsConceded}</Text>
        </View>
      </View>

      <View style={styles.matchInfoContainer}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Current Over</Text>
          <Text style={styles.infoValue}>{overDetails || '-'}</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const BattingRow = ({ item }) => {
    const name = item?.name || '-';
    const runs = safeNumber(item?.runs, 0);
    const balls = safeNumber(item?.ballsFaced, 0);
    const fours = safeNumber(item?.fours, 0);
    const sixes = safeNumber(item?.sixes, 0);
    const sr = strikeRateCalc(runs, balls);
    const outText = dismissalText(item?.wicketDetails);

    return (
      <View style={styles.tableRow}>
        <View style={[styles.cellName, styles.cell]}>
          <Text style={styles.playerCellName} numberOfLines={1}>{name}</Text>
          <Text style={styles.dismissalText} numberOfLines={1}>{outText}</Text>
        </View>
        <Text style={[styles.cell, styles.cellNum]}>{runs}</Text>
        <Text style={[styles.cell, styles.cellNum]}>{balls}</Text>
        <Text style={[styles.cell, styles.cellNum]}>{fours}</Text>
        <Text style={[styles.cell, styles.cellNum]}>{sixes}</Text>
        <Text style={[styles.cell, styles.cellNum]}>{sr}</Text>
      </View>
    );
  };

  const BowlingRow = ({ item }) => {
    const name = item?.name || '-';
    const balls = safeNumber(item?.ballsBowled, 0);
    const oversDisp = ballsToOvers(balls);
    const maidens = safeNumber(item?.maidens, 0);
    const runs = safeNumber(item?.runsConceded, 0);
    const wkts = safeNumber(item?.wicketsTaken, 0);
    const eco = economy(runs, balls);

    return (
      <View style={styles.tableRow}>
        <View style={[styles.cellName, styles.cell]}>
          <Text style={styles.playerCellName} numberOfLines={1}>{name}</Text>
        </View>
        <Text style={[styles.cell, styles.cellNum]}>{oversDisp}</Text>
        <Text style={[styles.cell, styles.cellNum]}>{maidens}</Text>
        <Text style={[styles.cell, styles.cellNum]}>{runs}</Text>
        <Text style={[styles.cell, styles.cellNum]}>{wkts}</Text>
        <Text style={[styles.cell, styles.cellNum]}>{eco}</Text>
      </View>
    );
  };

  const BattingTable = ({ data }) => (
    <View style={styles.tableContainer}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.cell, styles.cellName, styles.headerText]}>Batsman</Text>
        <Text style={[styles.cell, styles.cellNum, styles.headerText]}>R</Text>
        <Text style={[styles.cell, styles.cellNum, styles.headerText]}>B</Text>
        <Text style={[styles.cell, styles.cellNum, styles.headerText]}>4s</Text>
        <Text style={[styles.cell, styles.cellNum, styles.headerText]}>6s</Text>
        <Text style={[styles.cell, styles.cellNum, styles.headerText]}>SR</Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item, idx) => (item?.playerId || item?.id || item?.name || '') + '_' + idx}
        renderItem={({ item }) => <BattingRow item={item} />}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.emptyRow}>No batting data</Text>}
      />
    </View>
  );

  const BowlingTable = ({ data }) => (
    <View style={styles.tableContainer}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={[styles.cell, styles.cellName, styles.headerText]}>Bowler</Text>
        <Text style={[styles.cell, styles.cellNum, styles.headerText]}>O</Text>
        <Text style={[styles.cell, styles.cellNum, styles.headerText]}>M</Text>
        <Text style={[styles.cell, styles.cellNum, styles.headerText]}>R</Text>
        <Text style={[styles.cell, styles.cellNum, styles.headerText]}>W</Text>
        <Text style={[styles.cell, styles.cellNum, styles.headerText]}>Econ</Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item, idx) => (item?.playerId || item?.id || item?.name || '') + '_' + idx}
        renderItem={({ item }) => <BowlingRow item={item} />}
        scrollEnabled={false}
        ListEmptyComponent={<Text style={styles.emptyRow}>No bowling data</Text>}
      />
    </View>
  );

  const ScoreTabs = () => (
    <View style={styles.scoreTabsRow}>
      <TouchableOpacity
        style={[styles.scoreTabBtn, scoreTab === 'T1B' && styles.scoreTabActive]}
        onPress={() => setScoreTab('T1B')}
      >
        <Text style={[styles.scoreTabText, scoreTab === 'T1B' && styles.scoreTabTextActive]}>Batting T1</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.scoreTabBtn, scoreTab === 'T1Bo' && styles.scoreTabActive]}
        onPress={() => setScoreTab('T1Bo')}
      >
        <Text style={[styles.scoreTabText, scoreTab === 'T1Bo' && styles.scoreTabTextActive]}>Bowling T1</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.scoreTabBtn, scoreTab === 'T2B' && styles.scoreTabActive]}
        onPress={() => setScoreTab('T2B')}
      >
        <Text style={[styles.scoreTabText, scoreTab === 'T2B' && styles.scoreTabTextActive]}>Batting T2</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.scoreTabBtn, scoreTab === 'T2Bo' && styles.scoreTabActive]}
        onPress={() => setScoreTab('T2Bo')}
      >
        <Text style={[styles.scoreTabText, scoreTab === 'T2Bo' && styles.scoreTabTextActive]}>Bowling T2</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.darkBlue} />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.blue} />
        </View>
      ) : (
        <>
          {/* Header matching Performance component style */}
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color={AppColors.darkBlue} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Match Details</Text>
              <View style={styles.headerRight} />
            </View>
          </SafeAreaView>

          <ImageBackground source={background} style={styles.background} imageStyle={styles.backgroundImage}>
            <Animated.ScrollView
              style={styles.contentContainer}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: true }
              )}
              scrollEventThrottle={16}
            >
              <View style={styles.topSpacer} />

              {renderScorecard()}

              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'commentary' && styles.activeTab]}
                  onPress={() => setActiveTab('commentary')}
                >
                  <Text style={[styles.tabText, activeTab === 'commentary' && styles.activeTabText]}>
                    Commentary
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'scorecard' && styles.activeTab]}
                  onPress={() => setActiveTab('scorecard')}
                >
                  <Text style={[styles.tabText, activeTab === 'scorecard' && styles.activeTabText]}>
                    Scorecard
                  </Text>
                </TouchableOpacity>
              </View>

              {activeTab === 'commentary' ? (
                <FlatList
                  data={getAllCommentary()}
                  renderItem={renderCommentary}
                  keyExtractor={(_, index) => index.toString()}
                  scrollEnabled={false}
                  contentContainerStyle={styles.commentaryList}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      tintColor={AppColors.blue}
                      onRefresh={getMatchState}
                    />
                  }
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>No commentary available yet</Text>
                    </View>
                  }
                />
              ) : (
                <View style={styles.detailedScorecard}>
                  <ScoreTabs />

                  {scoreTab === 'T1B' && <BattingTable data={team1BattingOrder} />}
                  {scoreTab === 'T1Bo' && <BowlingTable data={team1BowlingOrder} />}
                  {scoreTab === 'T2B' && <BattingTable data={team2BattingOrder} />}
                  {scoreTab === 'T2Bo' && <BowlingTable data={team2BowlingOrder} />}
                </View>
              )}
            </Animated.ScrollView>
          </ImageBackground>
        </>
      )}
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background
  },
  safeArea: {
    backgroundColor: AppColors.darkBlue,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: AppColors.white,
  },
  backButton: {
    padding: 8,
    // color: AppColors.darkBlue,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: AppColors.darkBlue,
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: AppColors.background,
  },
  background: {
    flex: 1
  },
  backgroundImage: {
    opacity: 0.08,
    resizeMode: 'contain'
  },
  contentContainer: {
    paddingHorizontal: 12
  },
  topSpacer: {
    height: 10
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: AppColors.white,
    borderRadius: 12,
    padding: 5,
    marginTop: 15,
    marginBottom: 10,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  stickyTabsContainer: {
    zIndex: 10, // Ensure tabs stay above content
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8
  },
  activeTab: {
    backgroundColor: AppColors.blue,
  },
  tabText: {
    color: AppColors.black,
    fontWeight: '600'
  },
  activeTabText: {
    color: AppColors.white
  },
  scorecardContainer: {
    borderRadius: 15,
    padding: 15,
    marginTop: 8,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  teamScore: {
    flex: 1,
    alignItems: 'center'
  },
  teamName: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '700'
  },
  teamRuns: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4
  },
  versusContainer: {
    width: 50,
    alignItems: 'center'
  },
  versusText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '700'
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginVertical: 10
  },
  playerContainer: {
    marginTop: 6
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  playerIcon: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8
  },
  strikerIcon: {
    backgroundColor: AppColors.green
  },
  nonStrikerIcon: {
    backgroundColor: AppColors.lightText
  },
  bowlerIcon: {
    backgroundColor: AppColors.yellow
  },
  playerName: {
    color: AppColors.white,
    fontWeight: '600'
  },
  playerStats: {
    color: AppColors.white,
    fontWeight: '600'
  },
  playerExtra: {
    color: AppColors.white,
    fontSize: 12,
    opacity: 0.8
  },
  matchInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  infoItem: {
    flex: 1
  },
  infoLabel: {
    color: AppColors.white,
    fontSize: 12,
    opacity: 0.8
  },
  infoValue: {
    color: AppColors.white,
    fontWeight: '700',
    marginTop: 2
  },
  commentaryItem: {
    backgroundColor: AppColors.white,
    borderRadius: 10,
    padding: 15,
    marginBottom: 8,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  wicketItem: {
    borderLeftWidth: 3,
    borderLeftColor: AppColors.red
  },
  boundaryItem: {
    borderLeftWidth: 3,
    borderLeftColor: AppColors.yellow
  },
  commentaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  overText: {
    color: AppColors.blue,
    marginRight: 6,
    fontWeight: '600'
  },
  commentaryText: {
    color: AppColors.black
  },
  commentaryList: {
    paddingVertical: 12
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center'
  },
  emptyText: {
    color: AppColors.lightText
  },
  scoreTabsRow: {
    flexDirection: 'row',
    backgroundColor: AppColors.white,
    borderRadius: 10,
    padding: 4,
    marginBottom: 12,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  scoreTabBtn: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 2,
    backgroundColor: AppColors.background,
    borderRadius: 8,
    alignItems: 'center',
  },
  scoreTabActive: {
    backgroundColor: AppColors.blue
  },
  scoreTabText: {
    color: AppColors.black,
    fontWeight: '600',
    fontSize: 12
  },
  scoreTabTextActive: {
    color: AppColors.white
  },
  detailedScorecard: {
    backgroundColor: AppColors.white,
    borderRadius: 15,
    // padding: 15,
    marginBottom: 20,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tableContainer: {
    marginTop: 8
  },
  tableHeader: {
    backgroundColor: AppColors.blue,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#EEE'
  },
  headerText: {
    color: AppColors.white,
    fontWeight: '700'
  },
  cell: {
    paddingHorizontal: 8
  },
  cellName: {
    flex: 1.6
  },
  cellNum: {
    flex: 0.6,
    textAlign: 'right',
    color: AppColors.black,
    fontWeight: '600'
  },
  playerCellName: {
    color: AppColors.black,
    fontWeight: '700'
  },
  dismissalText: {
    color: AppColors.lightText,
    fontSize: 12,
    marginTop: 2
  },
  emptyRow: {
    color: AppColors.lightText,
    padding: 10,
    textAlign: 'center'
  },
});

export default CommentaryScorecard;
import {
  StyleSheet, Text, View, FlatList,
  ImageBackground, ActivityIndicator, RefreshControl,
  TouchableOpacity, Animated, ScrollView, Dimensions
} from 'react-native';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import apiService from '../APIservices';

const { width } = Dimensions.get('window');
const background = require('../../assets/images/cricsLogo.png');

const CommentaryScorecard = ({ route, navigation }) => {
  // const { matchId } = route.params;
  // const [matchState, setMatchState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // const [strikerStats, setStrikerStats] = useState(null);
  // const [nonStrikerStats, setNonStrikerStats] = useState(null);
  // const [bowlerStats, setBowlerStats] = useState(null);
  const [matchId, setMatchId] = useState(route.params.matchId);
  const [bowler, setBowler] = useState({ id: null, name: null, overs: 0, runsConceded: 0, wickets: 0 });
  const [striker, setStriker] = useState({ id: null, name: null, runs: 0, ballsFaced: 0 });
  const [nonStriker, setNonStriker] = useState({ id: null, name: null, runs: 0, ballsFaced: 0 });
  const [score, setScore] = useState(null);
  const [bowlingTeamName, setBowlingTeamName] = useState(null);
  const [battingTeamName, setBattingTeamName] = useState(null);
  const [wicket, setWicket] = useState(null);
  const [completedOvers, setCompletedOvers] = useState(null);
  const [overDetails, setOverDetails] = useState("");
  const legalDeliveriesRef = useRef(0);
  const [legalDeliveries, setLegalDeliveries] = useState(0);

  const [activeTab, setActiveTab] = useState('commentary');
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

  // ----------------------------
  // 1. Initial match state fetch
  // ----------------------------
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

      console.log(data);

      setMatchId(data.matchId);

      setBowler({
        id: data?.currentBowler?.playerId,
        name: data?.currentBowler?.name,
        overs: data?.bowlingTeam?.playingXI?.find(p => p.playerId === data?.currentBowler?.playerId)?.overs || 0,
        runsConceded: data?.bowlingTeam?.playingXI?.find(p => p.playerId === data?.currentBowler?.playerId)?.runsConceded || 0,
        wickets: data?.bowlingTeam?.playingXI?.find(p => p.playerId === data?.currentBowler?.playerId)?.wicketsTaken || 0
      });

      setStriker({
        id: data?.currentStriker?.playerId,
        name: data?.currentStriker?.name,
        runs: data?.battingTeam?.playingXI?.find(p => p.playerId === data?.currentStriker?.playerId)?.runs || 0,
        ballsFaced: data?.battingTeam?.playingXI?.find(p => p.playerId === data?.currentStriker?.playerId)?.ballsFaced || 0
      });

      setNonStriker({
        id: data?.currentNonStriker?.playerId,
        name: data?.currentNonStriker?.name,
        runs: data?.battingTeam?.playingXI?.find(p => p.playerId === data?.currentNonStriker?.playerId)?.runs || 0,
        ballsFaced: data?.battingTeam?.playingXI?.find(p => p.playerId === data?.currentNonStriker?.playerId)?.ballsFaced || 0
      });

      setCompletedOvers(data?.completedOvers || 0);
      setScore(data?.battingTeam?.score || 0);
      setWicket(data?.battingTeam?.wickets || 0);
      setBattingTeamName(data.battingTeam.name);

      const formattedOverDetails =
        data?.currentOver?.map((ball) => {
          let event = ball.runs?.toString() || "0";
          if (ball.wicket) event += ' W';
          if (ball.noBall) event += ' NB';
          if (ball.wide) event += ' Wd';
          if (ball.bye) event += ' B';
          if (ball.legBye) event += ' LB';
          return event.trim();
        }) || [];

      setOverDetails(formattedOverDetails.join(" ")); // remove commas

      const deliveryCount =
        data.currentOver?.reduce((count, ball) => {
          return count + (ball.noBall || ball.wide ? 0 : 1);
        }, 0) || 0;

      legalDeliveriesRef.current = deliveryCount;
      setLegalDeliveries(deliveryCount);

      if (
        data.completedOvers !== 0 &&
        deliveryCount === 0 &&
        data.completedOvers !== data.totalOvers
      ) {
        setOverDetails("");
      };
    } catch (error) {
      console.log("Error fetching match state:", error);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // 2. Live updates handler
  // ----------------------------
  const matchStateUpdateHandler = (data) => {
    setOverDetails((prev) => prev + " " + data?.ballString);
    setBowler({ id: data.currentBowler?.id, name: data.currentBowler?.name, overs: data.currentBowler?.overs, runsConceded: data.currentBowler?.runsConceded, wickets: data.currentBowler?.wickets });
    setStriker({ id: data.striker?.id, name: data.striker?.name, runs: data.striker?.runs, ballsFaced: data.striker?.ballsFaced });
    setNonStriker({ id: data.nonStriker?.id, name: data.nonStriker?.name, runs: data.nonStriker?.runs, ballsFaced: data.nonStriker?.ballsFaced });
    setCompletedOvers(data?.overNumber);
    setScore(data?.totalRuns);
    setWicket(data?.wicketsLost);
    setBattingTeamName(data.battingTeam.name);
    setBowlingTeamName(data.bowlingTeam.name);

    if (data.overComplete === true) {
      const newOver = true;
      setOverDetails("");
      legalDeliveriesRef.current = 0;
      setLegalDeliveries(0);
      if (data.overNumber !== data.totalOvers) {
        console.log("next bowler modal open");
      }
    }
    if (data.overComplete === false) {
      const ballStr = data?.ballString?.toUpperCase();
      const isWide = ballStr?.includes("WD");
      const isNoBall = ballStr?.includes("NB");
      const isLegalDelivery = !isWide && !isNoBall;

      if (isLegalDelivery) {
        const updatedLegalDeliveries = (legalDeliveriesRef.current + 1) % 6;
        legalDeliveriesRef.current = updatedLegalDeliveries;
        setLegalDeliveries(updatedLegalDeliveries);
      }
    }
  }

  // ----------------------------
  // 3. STOMP connection
  // ----------------------------
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

      console.log("Before connecting");

      clientRef.current = new Client();
      clientRef.current.configure({
        webSocketFactory: () => new SockJS('http://34.47.150.57:8081/ws'),
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
      });

      clientRef.current.onConnect = () => {
        console.log("Connected");

        updateConnectionState('live', true);

        if (type === 'live' && matchId) {
          clientRef.current?.subscribe(`/topic/match/${matchId}`, (message: IMessage) => {
            try {
              const parsed = JSON.parse(message.body);
              console.log("getting data", parsed);
              if (!parsed.eventName || !parsed.payload) return;
              const { eventName, payload } = parsed;

              switch (eventName) {
                case 'ball-update':
                  matchStateUpdateHandler(payload);
                  break;
                case 'match-complete':
                  navigation.navigate('MatchScoreCard', { matchId: payload.matchId });
                  break;
                case 'innings-complete':
                  matchStateUpdateHandler(payload);
                  break;
                case 'second-innings-started':
                  matchStateUpdateHandler(payload);
                  break;
                default:
                  console.warn('Unknown event type:', eventName, payload);
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

  // ----------------------------
  // 4. Lifecycle
  // ----------------------------
  useEffect(() => {
    getMatchState(); // Fetch initial match state
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
          {isWicket && <MaterialCommunityIcons name="cricket" size={18} color="#e74c3c" />}
          {isBoundary && <MaterialCommunityIcons name="run-fast" size={18} color="#f39c12" />}
        </View>
        <Text style={styles.commentaryText}>{cleanedCommentary}</Text>
      </View>
    );
  };

  const getAllCommentary = () => {
    // if (!matchState) return [];
    // const overs = matchState.firstInnings
    //   ? [...(matchState?.currentOver ?? []), ...(matchState?.innings1Overs?.flat() ?? [])]
    //   : [...(matchState?.currentOver ?? []), ...(matchState?.innings2Overs?.flat() ?? []), ...(matchState?.innings1Overs?.flat() ?? [])];
    // return overs.reverse();
  };

  const getMatchStatus = () => {
    // if (!matchState) return 'Live';
    // if (matchState.status === 'COMPLETED') {
    //   return `${matchState.winner} won by ${matchState.resultMargin}`;
    // }
    // return matchState.status || 'Live';
  };

  const renderScorecard = () => (
    <View style={styles.scorecardContainer}>
      <View style={styles.teamScoreContainer}>
        <View style={styles.teamScore}>
          <Text style={styles.teamName}>{battingTeamName}</Text>
          <Text style={styles.teamRuns}>
            {score}/{wicket} ({completedOvers} ov)
          </Text>
          {/* <Text style={styles.runRate}>RR: {matchState?.team1?.runRate || '-'}</Text> */}
        </View>

        <View style={styles.versusContainer}>
          <Text style={styles.versusText}>vs</Text>
        </View>

        <View style={styles.teamScore}>
          <Text style={styles.teamName}>{bowlingTeamName}</Text>
          <Text style={styles.teamRuns}>
            {score}/{wicket} ({completedOvers} ov)
          </Text>
          {/* <Text style={styles.runRate}>RR: {matchState?.team2?.runRate || '-'}</Text> */}
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
          <Text style={styles.playerExtra}>SR: {striker.ballsFaced == 0 ? (striker?.runs * 100) / striker.ballsFaced : 0.0}</Text>
        </View>

        <View style={styles.playerRow}>
          <View style={styles.playerInfo}>
            <View style={[styles.playerIcon, styles.nonStrikerIcon]} />
            <Text style={styles.playerName}>{nonStriker?.name}</Text>
          </View>
          <Text style={styles.playerStats}>{nonStriker?.runs} ({nonStriker?.ballsFaced})</Text>
          <Text style={styles.playerExtra}>SR: {nonStriker.ballsFaced == 0 ? (nonStriker?.runs * 100) / nonStriker.ballsFaced : 0.0}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.playerRow}>
          <View style={styles.playerInfo}>
            <View style={[styles.playerIcon, styles.bowlerIcon]} />
            <Text style={styles.playerName}>{bowler?.name}</Text>
          </View>
          <Text style={styles.playerStats}>{bowler?.wickets}/{bowler?.runsConceded}</Text>
          {/* <Text style={styles.playerExtra}>Econ: {bowlerStats?.economy || '-'}</Text> */}
        </View>
      </View>

      <View style={styles.matchInfoContainer}>
        {/* <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Partnership</Text>
          <Text style={styles.infoValue}>
            {(strikerStats?.runsInPartnership || 0) + (nonStrikerStats?.runsInPartnership || 0)}
          </Text>
        </View> */}

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Current Over</Text>
          <Text style={styles.infoValue}>{overDetails || '-'}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {
        loading ?
          <ActivityIndicator color="blue" size={32} />
          :
          <>
            <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }]}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>

              <View style={styles.headerContent}>
                <Text style={styles.matchTitle} numberOfLines={1} ellipsizeMode="tail">
                  {battingTeamName} vs {bowlingTeamName}
                </Text>
                {/* <Text style={styles.matchStatus}>{getMatchStatus()}</Text> */}
              </View>
            </Animated.View>

            <ImageBackground source={background} style={styles.background} imageStyle={styles.backgroundImage}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#2ecc71" />
                  <Text style={styles.loadingText}>Loading match details...</Text>
                </View>
              ) : (
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

                  {/* {activeTab === 'commentary' ? (
              <FlatList
                data={getAllCommentary()}
                renderItem={renderCommentary}
                keyExtractor={(_, index) => index.toString()}
                scrollEnabled={false}
                contentContainerStyle={styles.commentaryList}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    tintColor="#2ecc71"
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
                <Text style={styles.comingSoon}>Detailed scorecard coming soon</Text>
              </View>
            )} */}
                </Animated.ScrollView>
              )}
            </ImageBackground>
          </>
      }
    </View>
  );
};

export default CommentaryScorecard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1b2a',
  },
  background: {
    flex: 1,
    width: '100%',
  },
  backgroundImage: {
    opacity: 0.1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(13, 27, 42, 0.9)',
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  matchTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  matchStatus: {
    fontSize: 14,
    color: '#90e0ef',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    marginTop: 16,
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    paddingTop: 120,
  },
  topSpacer: {
    height: 20,
  },
  scorecardContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  teamScoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamScore: {
    flex: 1,
    alignItems: 'center',
  },
  versusContainer: {
    paddingHorizontal: 10,
  },
  versusText: {
    color: '#90e0ef',
    fontWeight: 'bold',
    fontSize: 12,
  },
  teamName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  teamRuns: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  runRate: {
    color: '#90e0ef',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  playerContainer: {
    marginBottom: 8,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
  },
  playerIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  strikerIcon: {
    backgroundColor: '#2ecc71',
  },
  nonStrikerIcon: {
    backgroundColor: '#95a5a6',
  },
  bowlerIcon: {
    backgroundColor: '#e74c3c',
  },
  playerName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  playerStats: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
  },
  playerExtra: {
    color: '#90e0ef',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  matchInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    color: '#90e0ef',
    fontSize: 12,
    fontWeight: '500',
  },
  infoValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#2ecc71',
  },
  tabText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#0d1b2a',
  },
  commentaryList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  commentaryItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  wicketItem: {
    borderLeftColor: '#e74c3c',
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  boundaryItem: {
    borderLeftColor: '#f39c12',
    backgroundColor: 'rgba(243, 156, 18, 0.1)',
  },
  commentaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  overText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#90e0ef',
  },
  commentaryText: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#90e0ef',
    fontSize: 16,
  },
  detailedScorecard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  comingSoon: {
    color: '#90e0ef',
    fontSize: 16,
  },
});
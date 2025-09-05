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

const { width } = Dimensions.get('window');
const background = require('../../assets/images/cricsLogo.png');

const CommentaryScorecard = ({ route, navigation }) => {
  const { matchId } = route.params;
  const [matchState, setMatchState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [strikerStats, setStrikerStats] = useState(null);
  const [nonStrikerStats, setNonStrikerStats] = useState(null);
  const [bowlerStats, setBowlerStats] = useState(null);
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

  // handle incoming updates
  const matchStateUpdateHandler = (data) => {
    setMatchState(data);
    console.log(data);

    setStrikerStats(
      data?.battingTeam?.playingXI?.find(
        (p) => p.playerId === data?.currentStriker?.playerId
      )
    );

    setNonStrikerStats(
      data?.battingTeam?.playingXI?.find(
        (p) => p.playerId === data?.currentNonStriker?.playerId
      )
    );

    setBowlerStats(
      data?.bowlingTeam?.playingXI?.find(
        (p) => p.playerId === data?.currentBowler?.playerId
      )
    );
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
              console.log("getting data");
              console.log(parsed);
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
              console.log(error);
              console.log("Oops error");
              console.error('Error processing live message:', error, message.body);
            }
            console.log("Done");
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
    setupClient(stompLiveClientRef, 'live', matchId);
    // setupClient(stompSubmitClientRef, 'submit');

    return () => {
      stompLiveClientRef.current?.deactivate();
      stompSubmitClientRef.current?.deactivate();
    };
  }, [matchId]);

  // const onRefresh = useCallback(() => {
  //   setRefreshing(true);
  //   // just reset refresh, data comes from WS now
  //   setRefreshing(false);
  // }, []);

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
    if (!matchState) return [];
    const overs = matchState.firstInnings
      ? [...(matchState?.currentOver ?? []), ...(matchState?.innings1Overs?.flat() ?? [])]
      : [...(matchState?.currentOver ?? []), ...(matchState?.innings2Overs?.flat() ?? []), ...(matchState?.innings1Overs?.flat() ?? [])];
    return overs.reverse();
  };

  const getMatchStatus = () => {
    if (!matchState) return 'Live';
    if (matchState.status === 'COMPLETED') {
      return `${matchState.winner} won by ${matchState.resultMargin}`;
    }
    return matchState.status || 'Live';
  };

  const renderScorecard = () => (
    <View style={styles.scorecardContainer}>
      <View style={styles.teamScoreContainer}>
        <View style={styles.teamScore}>
          <Text style={styles.teamName}>{matchState?.team1?.name}</Text>
          <Text style={styles.teamRuns}>
            {matchState?.team1?.score}/{matchState?.team1?.wickets} ({matchState?.team1?.overs} ov)
          </Text>
          <Text style={styles.runRate}>RR: {matchState?.team1?.runRate || '-'}</Text>
        </View>

        <View style={styles.versusContainer}>
          <Text style={styles.versusText}>vs</Text>
        </View>

        <View style={styles.teamScore}>
          <Text style={styles.teamName}>{matchState?.team2?.name}</Text>
          <Text style={styles.teamRuns}>
            {matchState?.team2?.score}/{matchState?.team2?.wickets} ({matchState?.team2?.overs} ov)
          </Text>
          <Text style={styles.runRate}>RR: {matchState?.team2?.runRate || '-'}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.playerContainer}>
        <View style={styles.playerRow}>
          <View style={styles.playerInfo}>
            <View style={[styles.playerIcon, styles.strikerIcon]} />
            <Text style={styles.playerName}>{strikerStats?.name}*</Text>
          </View>
          <Text style={styles.playerStats}>{strikerStats?.runs} ({strikerStats?.ballsFaced})</Text>
          <Text style={styles.playerExtra}>SR: {strikerStats?.strikeRate || '-'}</Text>
        </View>

        <View style={styles.playerRow}>
          <View style={styles.playerInfo}>
            <View style={[styles.playerIcon, styles.nonStrikerIcon]} />
            <Text style={styles.playerName}>{nonStrikerStats?.name}</Text>
          </View>
          <Text style={styles.playerStats}>{nonStrikerStats?.runs} ({nonStrikerStats?.ballsFaced})</Text>
          <Text style={styles.playerExtra}>SR: {nonStrikerStats?.strikeRate || '-'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.playerRow}>
          <View style={styles.playerInfo}>
            <View style={[styles.playerIcon, styles.bowlerIcon]} />
            <Text style={styles.playerName}>{bowlerStats?.name}</Text>
          </View>
          <Text style={styles.playerStats}>{bowlerStats?.wicketsTaken}/{bowlerStats?.runsConceded}</Text>
          <Text style={styles.playerExtra}>Econ: {bowlerStats?.economy || '-'}</Text>
        </View>
      </View>

      <View style={styles.matchInfoContainer}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Partnership</Text>
          <Text style={styles.infoValue}>
            {(strikerStats?.runsInPartnership || 0) + (nonStrikerStats?.runsInPartnership || 0)}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Last 5 Overs</Text>
          <Text style={styles.infoValue}>{matchState?.recentOvers?.join(' ') || '-'}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.matchTitle} numberOfLines={1} ellipsizeMode="tail">
            {matchState?.team1?.name} vs {matchState?.team2?.name}
          </Text>
          <Text style={styles.matchStatus}>{getMatchStatus()}</Text>
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
                    // onRefresh={onRefresh}
                    tintColor="#2ecc71"
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
            )}
          </Animated.ScrollView>
        )}
      </ImageBackground>
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
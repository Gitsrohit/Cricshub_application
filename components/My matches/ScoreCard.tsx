import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import apiService from '../APIservices';
// Import SafeAreaView and useSafeAreaInsets
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const background = require('../../assets/images/cricsLogo.png');

// Assuming you have AppGradients defined in a separate file or within this one
const AppGradients = {
  primaryCard: ['#34B8FF', '#1E88E5'],
};

// Reusable PlayerRow component for better readability and maintenance
const PlayerRow = ({ player, index, type, isBatted }) => {
  const isEvenRow = index % 2 === 0;

  if (type === 'batting') {
    const isDismissed = isBatted && player?.dismissalInfo;
    const dismissalText = isBatted ? (player?.wicketDetails ? player?.wicketDetails.dismissalType : 'Not out') : 'Yet to bat';
    const runs = player?.runs || 0;
    const ballsFaced = player?.ballsFaced || 0;
    const fours = player?.fours || 0;
    const sixes = player?.sixes || 0;
    const strikeRate = player?.strikeRate ? player.strikeRate.toFixed(1) : '0.0';

    return (
      <View style={[styles.statsRow, isEvenRow && styles.evenRow]}>
        <View style={styles.nameCol}>
          <View style={styles.playerInfo}>
            <Text style={styles.playerName}>{player?.name || 'Unknown Player'}</Text>
            {isBatted && (
              <Ionicons
                name={isDismissed ? 'close-circle' : 'checkmark-circle'}
                size={14}
                color={isDismissed ? '#F44336' : '#4CAF50'}
                style={styles.playerStatusIcon}
              />
            )}
          </View>
          <Text style={styles.dismissal}>{dismissalText}</Text>
        </View>
        <Text style={[styles.statCol, styles.statText]}>{runs}</Text>
        <Text style={[styles.statCol, styles.statText]}>{ballsFaced}</Text>
        <Text style={[styles.statCol, styles.statText]}>{fours}</Text>
        <Text style={[styles.statCol, styles.statText]}>{sixes}</Text>
        <Text style={[styles.statCol, styles.statText]}>{strikeRate}</Text>
      </View>
    );
  }

  // Bowling
  const overs = `${Math.floor(player.ballsBowled / 6)}.${player.ballsBowled % 6}`;
  const runsConceded = player.runsConceded || 0;
  const wicketsTaken = player.wicketsTaken || 0;
  const economyRate = player.economyRate ? player.economyRate.toFixed(1) : '0.0';

  return (
    <View style={[styles.statsRow, isEvenRow && styles.evenRow]}>
      <Text style={[styles.nameCol, styles.playerName]}>{player.name || 'Unknown Bowler'}</Text>
      <Text style={[styles.statCol, styles.statText]}>{overs}</Text>
      <Text style={[styles.statCol, styles.statText]}>{runsConceded}</Text>
      <Text style={[styles.statCol, styles.statText]}>{wicketsTaken}</Text>
      <Text style={[styles.statCol, styles.statText]}>{economyRate}</Text>
    </View>
  );
};

const ScoreCard = ({ route, navigation }) => {
  const { matchId } = route.params;
  const [team, setTeam] = useState(null);
  const [matchState, setMatchState] = useState(null);
  const [activeTab, setActiveTab] = useState('batting');
  const [loadingError, setLoadingError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get the safe area insets
  const insets = useSafeAreaInsets();

  const getMatchState = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setLoadingError(null);

      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        setLoadingError('Authentication required. Please login again.');
        return;
      }

      const response = await apiService({
        endpoint: `matches/matchstate/${matchId}`,
        method: 'GET',
        headers: { timeout: 15000 },
      });

      if (response.success && response.data) {
        setMatchState(response.data);
        setTeam(response.data.team1.name);
      } else {
        setLoadingError('No match data received');
        setMatchState(null);
      }
    } catch (error) {
      console.error('API Error:', error);
      let errorMessage = 'Failed to load match data. ';

      if (error.response) {
        errorMessage += `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage += 'No response from server. Check your connection.';
      } else {
        errorMessage += error.message || '';
      }
      setLoadingError(errorMessage);
      setMatchState(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [matchId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getMatchState();
    });
    return unsubscribe;
  }, [navigation, getMatchState]);

  const onRefresh = () => {
    getMatchState(true);
  };

  const getMatchStatusText = (status) => {
    if (!status) {
      return 'Status Unknown';
    }
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case 'completed':
        return 'Completed';
      case 'live':
        return 'Live';
      case 'upcoming':
        return 'Upcoming';
      case 'abandoned':
        return 'Abandoned';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'In Progress';
    }
  };

  const renderBattingTable = (teamData, battingOrder) => {
    if (!teamData || !teamData.playingXI) {
      return (
        <View style={styles.card}>
          <Text style={styles.noDataText}>No batting data available for this team.</Text>
        </View>
      );
    }

    const orderedBatting = [
      ...(battingOrder || []),
      ...teamData.playingXI.filter(
        (player) => !battingOrder?.some((b) => b?.playerId === player?.playerId)
      ),
    ];

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>Batting</Text>
          <View style={styles.teamIndicator}>
            <Text style={styles.teamIndicatorText}>{teamData.name}</Text>
          </View>
        </View>
        <View style={styles.statsHeader}>
          <Text style={[styles.nameCol, styles.headerText]}>Batsman</Text>
          <Text style={[styles.statCol, styles.headerText]}>R</Text>
          <Text style={[styles.statCol, styles.headerText]}>B</Text>
          <Text style={[styles.statCol, styles.headerText]}>4s</Text>
          <Text style={[styles.statCol, styles.headerText]}>6s</Text>
          <Text style={[styles.statCol, styles.headerText]}>SR</Text>
        </View>
        {orderedBatting.map((item, index) => {
          const playerStats = teamData.playingXI.find((p) => p.playerId === item.playerId) || {};
          const isBatted = battingOrder?.some((b) => b.playerId === item.playerId);
          const finalPlayer = { ...playerStats, ...item };
          const playerKey = finalPlayer.playerId || `${finalPlayer.name}-${index}`;

          return (
            <PlayerRow
              key={playerKey}
              player={finalPlayer}
              index={index}
              type="batting"
              isBatted={isBatted}
            />
          );
        })}
      </View>
    );
  };

  const renderBowlingTable = (bowlingTeamData) => {
    if (!bowlingTeamData || !bowlingTeamData.playingXI) {
      return (
        <View style={styles.card}>
          <Text style={styles.noDataText}>No bowling data available for this team.</Text>
        </View>
      );
    }

    const bowlers = bowlingTeamData.playingXI.filter(bowler => bowler.ballsBowled > 0);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>Bowling</Text>
          <View style={styles.teamIndicator}>
            <Text style={styles.teamIndicatorText}>{bowlingTeamData.name}</Text>
          </View>
        </View>
        <View style={styles.statsHeader}>
          <Text style={[styles.nameCol, styles.headerText]}>Bowler</Text>
          <Text style={[styles.statCol, styles.headerText]}>O</Text>
          <Text style={[styles.statCol, styles.headerText]}>R</Text>
          <Text style={[styles.statCol, styles.headerText]}>W</Text>
          <Text style={[styles.statCol, styles.headerText]}>Econ</Text>
        </View>
        {bowlers.length > 0 ? (
          bowlers.map((bowler, index) => (
            <PlayerRow
              key={bowler.playerId || index}
              player={bowler}
              index={index}
              type="bowling"
            />
          ))
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No bowling data available yet.</Text>
          </View>
        )}
      </View>
    );
  };

  const isInitialLoading = isLoading && !matchState;
  const isDataError = !matchState && loadingError;

  if (isInitialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={AppGradients.primaryCard}
          style={styles.fullScreenGradient}
        >
          <MaterialCommunityIcons name="cricket" size={40} color="#fff" />
          <Text style={styles.loadingText}>Loading match details...</Text>
          <ActivityIndicator size="large" color="#fff" style={styles.spinner} />
        </LinearGradient>
      </View>
    );
  }

  if (isDataError) {
    return (
      <View style={styles.errorContainer}>
        <LinearGradient
          colors={['#F44336', '#E53935']}
          style={styles.fullScreenGradient}
        >
          <MaterialCommunityIcons name="alert-circle" size={40} color="#fff" />
          <Text style={styles.errorTitle}>Oops! Failed to Load</Text>
          <Text style={styles.errorMessage}>{loadingError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => getMatchState()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  return (
    <ImageBackground
      source={background}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0A5A9C" />
      {/* Use SafeAreaView to wrap the main content */}
      <SafeAreaView style={styles.safeArea}>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={['#0A5A9C']}
              tintColor="#0A5A9C"
            />
          }
        >
          {/* Match Header with dynamic top padding */}
          <LinearGradient
            colors={AppGradients.primaryCard}
            style={[styles.matchHeader, { paddingTop: insets.top + 20 }]} // Adjust top padding
          >
            <View style={styles.matchTitleContainer}>
              <Text style={styles.matchTitle} numberOfLines={1} ellipsizeMode="tail">
                {matchState.team1?.name || 'Team 1'} vs {matchState.team2?.name || 'Team 2'}
              </Text>
            </View>
          </LinearGradient>

          {/* Team Scores */}
          <View style={styles.scoreContainer}>
            <View style={styles.teamScoreCard}>
              <Text style={styles.teamName}>{matchState.team1?.name || 'Team 1'}</Text>
              <Text style={styles.teamRuns}>
                {matchState.team1?.score || 0}/{matchState.team1?.wickets || 0}
              </Text>
              {matchState.team1?.overs && (
                <Text style={styles.teamOvers}>{matchState.team1.overs} overs</Text>
              )}
            </View>

            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>vs</Text>
            </View>

            <View style={styles.teamScoreCard}>
              <Text style={styles.teamName}>{matchState.team2?.name || 'Team 2'}</Text>
              <Text style={styles.teamRuns}>
                {matchState.team2?.score || 0}/{matchState.team2?.wickets || 0}
              </Text>
              {matchState.team2?.overs && (
                <Text style={styles.teamOvers}>{matchState.team2.overs} overs</Text>
              )}
            </View>
          </View>
          <Text style={styles.matchResultText}>{matchState?.result || 'Scoreboard'}</Text>

          {/* Team Selector */}
          <View style={styles.teamSelector}>
            {[matchState.team1, matchState.team2].map((t) => (
              <TouchableOpacity
                key={t?.name}
                style={[
                  styles.teamButton,
                  team === t?.name && styles.activeButton,
                ]}
                onPress={() => setTeam(t?.name)}
              >
                <Text style={[
                  styles.buttonText,
                  team === t?.name && styles.activeButtonText
                ]}>
                  {t?.name || 'Team'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Stats Tabs */}
          <View style={styles.statsTabs}>
            <TouchableOpacity
              style={[
                styles.statsTab,
                activeTab === 'batting' && styles.activeStatsTab
              ]}
              onPress={() => setActiveTab('batting')}
            >
              <MaterialCommunityIcons
                name="cricket"
                size={20}
                color={activeTab === 'batting' ? '#fff' : '#0A5A9C'}
              />
              <Text
                style={[
                  styles.statsTabText,
                  activeTab === 'batting' && styles.activeStatsTabText
                ]}
              >
                Batting
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.statsTab,
                activeTab === 'bowling' && styles.activeStatsTab
              ]}
              onPress={() => setActiveTab('bowling')}
            >
              <MaterialCommunityIcons
                name="bowling"
                size={20}
                color={activeTab === 'bowling' ? '#fff' : '#0A5A9C'}
              />
              <Text
                style={[
                  styles.statsTabText,
                  activeTab === 'bowling' && styles.activeStatsTabText
                ]}
              >
                Bowling
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stats Content */}
          {activeTab === 'batting' && team === matchState.team1?.name &&
            renderBattingTable(matchState.team1, matchState.team1BattingOrder)}
          {activeTab === 'batting' && team === matchState.team2?.name &&
            renderBattingTable(matchState.team2, matchState.team2BattingOrder)}

          {activeTab === 'bowling' && team === matchState.team1?.name &&
            renderBowlingTable(matchState.team2)}
          {activeTab === 'bowling' && team === matchState.team2?.name &&
            renderBowlingTable(matchState.team1)}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: '#f4f8fc',
  },
  backgroundImage: {
    resizeMode: 'cover',
    opacity: 0.05,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 20,
    color: '#fff',
    marginTop: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 10,
    textAlign: 'center',
    marginBottom: 20,
  },
  spinner: {
    marginTop: 20,
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  matchHeader: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  matchTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cricketIcon: {
    marginRight: 10,
  },
  matchTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    flexShrink: 1,
    flexWrap: 'nowrap',
  },
  matchSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 5,
  },
  matchStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  matchStatusText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 5,
    fontWeight: '500'
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  teamScoreCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  teamRuns: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0A5A9C',
  },
  teamOvers: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  vsContainer: {
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  vsText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#999',
  },
  matchResultText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    marginHorizontal: 15,
  },
  teamSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 25,
    backgroundColor: '#e3f2fd',
    padding: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  teamButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: '#0A5A9C',
    ...Platform.select({
      ios: {
        shadowColor: '#0A5A9C',
        shadowOpacity: 0.3,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonText: {
    color: '#0A5A9C',
    fontWeight: '600',
    fontSize: 14,
  },
  activeButtonText: {
    color: '#fff',
  },
  statsTabs: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: '#e3f2fd',
    padding: 5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statsTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeStatsTab: {
    backgroundColor: '#0A5A9C',
  },
  statsTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A5A9C',
    marginLeft: 8,
  },
  activeStatsTabText: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
      },
      android: {
        elevation: 3,
      },
    }),
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#f8fbff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0A5A9C',
  },
  teamIndicator: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  teamIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0A5A9C',
  },
  statsHeader: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#f5f9ff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  headerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0A5A9C',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 50,
  },
  evenRow: {
    backgroundColor: '#fafcff',
  },
  nameCol: {
    flex: 2.2,
    paddingRight: 4,
  },
  statCol: {
    flex: 0.8,
    textAlign: 'center',
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerName: {
    fontWeight: '600',
    fontSize: 14,
    color: '#1a1a1a',
    marginRight: 5,
  },
  playerStatusIcon: {
    marginLeft: 5,
  },
  statText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  dismissal: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default ScoreCard;
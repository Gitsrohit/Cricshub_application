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
  RefreshControl
} from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import apiService from '../APIservices';

const { width } = Dimensions.get('window');
const background = require('../../assets/images/cricsLogo.png');

const ScoreCard = ({ route, navigation }) => {
  const { matchId } = route.params;
  const [team, setTeam] = useState(null);
  const [matchState, setMatchState] = useState(null);
  const [activeTab, setActiveTab] = useState('batting');
  const [loadingError, setLoadingError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getMatchState = async () => {
    try {
      setIsLoading(true);
      setRefreshing(true);
      setLoadingError(null);
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        setLoadingError('Authentication required. Please login again.');
        setIsLoading(false);
        setRefreshing(false);
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
        setMatchState({ error: true });
      }
    } catch (error) {
      let errorMessage = 'Failed to load match data';

      if (error.response) {
        errorMessage = `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'No response from server. Check your connection.';
      } else {
        errorMessage = error.message || errorMessage;
      }

      setLoadingError(errorMessage);
      setMatchState({ error: true });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    getMatchState();
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getMatchState();
    });

    return unsubscribe;
  }, [navigation]);

  const renderBattingTable = (teamData, battingOrder) => {
    if (!teamData || !teamData.playingXI) return null;
    
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

          return (
            <View
              key={item.playerId || index}
              style={[
                styles.statsRow,
                index % 2 === 0 && styles.evenRow
              ]}
            >
              <View style={styles.nameCol}>
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{item.name || 'Unknown Player'}</Text>
                  {isBatted && (
                    <Ionicons
                      name={item.dismissalInfo ? 'close-circle' : 'checkmark-circle'}
                      size={16}
                      color={item.dismissalInfo ? '#ff4444' : '#4CAF50'}
                    />
                  )}
                </View>
                <Text style={styles.dismissal}>
                  {isBatted ? (item.dismissalInfo || 'Not out') : 'Yet to bat'}
                </Text>
              </View>
              <Text style={[styles.statCol, styles.statText]}>{playerStats.runs || 0}</Text>
              <Text style={[styles.statCol, styles.statText]}>{playerStats.ballsFaced || 0}</Text>
              <Text style={[styles.statCol, styles.statText]}>{playerStats.fours || 0}</Text>
              <Text style={[styles.statCol, styles.statText]}>{playerStats.sixes || 0}</Text>
              <Text style={[styles.statCol, styles.statText]}>
                {playerStats.strikeRate ? playerStats.strikeRate.toFixed(1) : '0.0'}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderBowlingTable = (bowlingTeamData) => {
    if (!bowlingTeamData || !bowlingTeamData.playingXI) return null;
    
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
            <View
              key={bowler.playerId || index}
              style={[
                styles.statsRow,
                index % 2 === 0 && styles.evenRow
              ]}
            >
              <Text style={[styles.nameCol, styles.playerName]}>
                {bowler.name || 'Unknown Bowler'}
              </Text>
              <Text style={[styles.statCol, styles.statText]}>
                {Math.floor(bowler.ballsBowled / 6)}.{bowler.ballsBowled % 6}
              </Text>
              <Text style={[styles.statCol, styles.statText]}>{bowler.runsConceded || 0}</Text>
              <Text style={[styles.statCol, styles.statText]}>{bowler.wicketsTaken || 0}</Text>
              <Text style={[styles.statCol, styles.statText]}>
                {bowler.economyRate ? bowler.economyRate.toFixed(1) : '0.0'}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No bowling data available</Text>
          </View>
        )}
      </View>
    );
  };

  if (isLoading || !matchState) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#0A5A9C', '#1a73e8']}
          style={styles.loadingGradient}
        >
          <MaterialCommunityIcons name="cricket" size={40} color="#fff" />
          {loadingError ? (
            <>
              <Text style={styles.loadingText}>Failed to load match data</Text>
              <Text style={styles.errorText}>{loadingError}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={getMatchState}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.retryButtonText}>Try Again</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.loadingText}>Loading match details...</Text>
              <ActivityIndicator size="large" color="#fff" style={styles.spinner} />
            </>
          )}
        </LinearGradient>
      </View>
    );
  }

  if (matchState.error) {
    return (
      <View style={styles.errorContainer}>
        <LinearGradient
          colors={['#ff6b6b', '#ee5a52']}
          style={styles.errorGradient}
        >
          <MaterialCommunityIcons name="alert-circle" size={40} color="#fff" />
          <Text style={styles.errorTitle}>Failed to Load Match</Text>
          <Text style={styles.errorMessage}>{loadingError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={getMatchState}
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

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0A5A9C']}
            tintColor="#0A5A9C"
          />
        }
      >
        {/* Match Header */}
        <LinearGradient
          colors={['#0A5A9C', '#1a73e8']}
          style={styles.matchHeader}
        >
          <View style={styles.matchTitleContainer}>
            <MaterialCommunityIcons name="cricket" size={24} color="#fff" style={styles.cricketIcon} />
            <Text style={styles.matchTitle}>
              {matchState.team1?.name || 'Team 1'} vs {matchState.team2?.name || 'Team 2'}
            </Text>
          </View>
          <Text style={styles.matchSubtitle}>{matchState.tournament || 'Cricket Match'}</Text>
          <View style={styles.matchStatusContainer}>
            <Ionicons name="time" size={16} color="#fff" />
            <Text style={styles.matchStatusText}>{matchState.status || 'In Progress'}</Text>
          </View>
        </LinearGradient>

        {/* Team Scores */}
        <View style={styles.scoreContainer}>
          <View style={styles.teamScore}>
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

          <View style={styles.teamScore}>
            <Text style={styles.teamName}>{matchState.team2?.name || 'Team 2'}</Text>
            <Text style={styles.teamRuns}>
              {matchState.team2?.score || 0}/{matchState.team2?.wickets || 0}
            </Text>
            {matchState.team2?.overs && (
              <Text style={styles.teamOvers}>{matchState.team2.overs} overs</Text>
            )}
          </View>
        </View>

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
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
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
  loadingGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorGradient: {
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
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
    marginBottom: 20,
  },
  spinner: {
    marginTop: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#ffdddd',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
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
    padding: 20,
    paddingTop: StatusBar.currentHeight + 20 || 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  cricketIcon: {
    marginRight: 10,
  },
  matchTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
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
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  teamScore: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  teamRuns: {
    fontSize: 24,
    fontWeight: '700',
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
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
  },
  teamSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 25,
    backgroundColor: '#e3f2fd',
    padding: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
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
    elevation: 3,
    shadowColor: '#0A5A9C',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
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
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: '#e3f2fd',
    padding: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
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
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
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
    marginBottom: 3,
  },
  playerName: {
    fontWeight: '600',
    fontSize: 14,
    color: '#1a1a1a',
    marginRight: 5,
  },
  statText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  dismissal: {
    fontSize: 12,
    color: '#777',
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
  },
});

export default ScoreCard;
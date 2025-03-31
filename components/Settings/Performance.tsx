import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  ImageBackground
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Performance = () => {
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    fetchPlayerData();
  }, []);

  const fetchPlayerData = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) throw new Error('Authentication required');

      const response = await axios.get(
        'https://score360-7.onrender.com/api/v1/profile/current',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setPlayerData(response.data);
      animateContent();
    } catch (err) {
      setError(err.message || 'Failed to load player data');
    } finally {
      setLoading(false);
    }
  };

  const animateContent = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  const renderStatCard = (value, label) => (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderTabContent = () => {
    if (!playerData) return null;

    const careerStats = playerData.careerStats || {};

    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            <View style={styles.statsRow}>
              {renderStatCard(playerData.totalMatchesPlayed || '0', 'Matches')}
              {renderStatCard(playerData.total100s || '0', 'Centuries')}
              {renderStatCard(playerData.total50s || '0', 'Half-Centuries')}
            </View>
            <View style={styles.statsRow}>
              {renderStatCard(playerData.totalRuns || '0', 'Runs')}
              {renderStatCard(playerData.totalSixes || '0', 'Sixes')}
              {renderStatCard(playerData.totalFours || '0', 'Fours')}
            </View>
          </View>
        );
      case 'detailed':
        return (
          <View style={styles.tabContent}>
            <View style={styles.detailCard}>
              <Text style={styles.detailTitle}>Batting Statistics</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Highest Score:</Text>
                <Text style={styles.detailValue}>{careerStats.highestScore || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Batting Average:</Text>
                <Text style={styles.detailValue}>{careerStats.battingAverage || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Strike Rate:</Text>
                <Text style={styles.detailValue}>{careerStats.strikeRate || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Balls Faced:</Text>
                <Text style={styles.detailValue}>{careerStats.ballsFaced || '0'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fifties:</Text>
                <Text style={styles.detailValue}>{careerStats.fifties || '0'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Hundreds:</Text>
                <Text style={styles.detailValue}>{careerStats.hundreds || '0'}</Text>
              </View>
            </View>
            
            <View style={styles.detailCard}>
              <Text style={styles.detailTitle}>Bowling Statistics</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Wickets:</Text>
                <Text style={styles.detailValue}>{playerData.totalWickets || '0'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Bowling Average:</Text>
                <Text style={styles.detailValue}>{careerStats.bowlingAverage || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Economy Rate:</Text>
                <Text style={styles.detailValue}>{careerStats.economyRate || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Overs Bowled:</Text>
                <Text style={styles.detailValue}>{careerStats.overs || '0'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Balls Bowled:</Text>
                <Text style={styles.detailValue}>{careerStats.ballsBowled || '0'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Best Bowling:</Text>
                <Text style={styles.detailValue}>{careerStats.bestBowlingFigures || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.detailCard}>
              <Text style={styles.detailTitle}>Fielding Statistics</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Catches Taken:</Text>
                <Text style={styles.detailValue}>{careerStats.catchesTaken || '0'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Outs:</Text>
                <Text style={styles.detailValue}>{careerStats.totalOuts || '0'}</Text>
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="exclamation-circle" size={40} color="#e74c3c" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPlayerData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ImageBackground 
      source={require('../../assets/images/cricsLogo.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <LinearGradient 
        colors={['rgba(173, 216, 230, 0.05)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.overlay}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <View style={styles.playerHeader}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatarWrapper}>
                  {playerData?.logoPath ? (
                    <Image
                      source={{ uri: playerData.logoPath }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Icon name="user" size={50} color="#fff" />
                    </View>
                  )}
                </View>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{playerData?.role || 'Player'}</Text>
                </View>
              </View>
              <Text style={styles.playerName}>{playerData?.name || 'Player Name'}</Text>
              <Text style={styles.playerEmail}>{playerData?.email || 'player@example.com'}</Text>
            </View>
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'overview' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('overview')}>
                <Text style={[
                  styles.tabText,
                  activeTab === 'overview' && styles.activeTabText,
                ]}>
                  Overview
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'detailed' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('detailed')}>
                <Text style={[
                  styles.tabText,
                  activeTab === 'detailed' && styles.activeTabText,
                ]}>
                  Detailed
                </Text>
              </TouchableOpacity>
            </View>
            {renderTabContent()}
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(173, 216, 230, 0.2)',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
  playerHeader: {
    alignItems: 'center',
    marginBottom: 25,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(52, 152, 219, 0.3)',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e6f2ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#3498db',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3498db',
  },
  roleBadge: {
    position: 'absolute',
    bottom: 0,
    right: 10,
    backgroundColor: '#3498db',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  playerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 5,
  },
  playerEmail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 5,
    elevation: 2,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#3498db',
  },
  tabText: {
    color: '#7f8c8d',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: 'white',
  },
  tabContent: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    width: '30%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  detailCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 12,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 25,
    backgroundColor: '#3498db',
    borderRadius: 8,
    elevation: 2,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default Performance;
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  TextInput,
  Pressable,
  Platform,
  StatusBar,
  Dimensions,
  Animated,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

// These are correctly imported from colors.js, so they should NOT be re-declared here.
import { AppGradients, AppButtons, AppColors } from '../../assets/constants/colors.js';
import apiService from '../APIservices';

const { width } = Dimensions.get('window');
const CARD_PADDING = 16;
const CARD_WIDTH = width - (CARD_PADDING * 2);

const TournamentCardOthers = ({ tournament, tournamentTimeStatus, index }) => {
  const navigation = useNavigation();
  const [scaleValue] = useState(new Animated.Value(1));
  const [opacityValue] = useState(new Animated.Value(0));

  useEffect(() => {
    // Staggered animation for cards
    Animated.sequence([
      Animated.delay(index * 100),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const checkIsCreator = useCallback(async (currentTournament) => {
    try {
      const creatorId = currentTournament.creatorName?.id;
      const userId = await AsyncStorage.getItem('userUUID');
      return creatorId === userId;
    } catch (error) {
      console.error("Error in checkIsCreator:", error);
      return false;
    }
  }, []);

  const handleNavigation = useCallback(async (tournamentData, tab) => {
    const isCreator = await checkIsCreator(tournamentData);
    navigation.navigate('ManageTournaments', { id: tournamentData.id, isCreator, tab });
  }, [checkIsCreator, navigation]);

  const sanitizedBannerUrl = tournament.banner.replace(
    'https://score360-7.onrender.com/api/v1/files/http:/',
    'https://'
  );

  // Determine status and corresponding color
  const getStatusInfo = () => {
    switch (tournamentTimeStatus) {
      case 'LIVE':
        return { text: 'LIVE', color: AppColors.liveGreen, icon: 'live-tv' };
      case 'UPCOMING':
        return { text: 'UPCOMING', color: AppColors.upcomingOrange, icon: 'schedule' };
      case 'PAST':
        return { text: 'COMPLETED', color: AppColors.pastGray, icon: 'check-circle' };
      default:
        return { text: tournamentTimeStatus, color: AppColors.primaryBlue, icon: 'info' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <SafeAreaView>
      <Animated.View
        style={[
          styles.cardContainerWrapper,
          {
            opacity: opacityValue,
            transform: [{ scale: scaleValue }]
          }
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => handleNavigation(tournament, 'INFO')}
        >
          <View style={styles.cardElevation}>
            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
              <Icon name={statusInfo.icon} size={14} color={AppColors.white} />
              <Text style={styles.statusText}>{statusInfo.text}</Text>
            </View>

            {/* Tournament Image */}
            <Image
              source={{ uri: sanitizedBannerUrl }}
              style={styles.cardImage}
              resizeMode='cover'
            />

            {/* Gradient Overlay on Image */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.imageOverlay}
            />

            {/* Card Content */}
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.tournamentNameCard} numberOfLines={1}>{tournament.name}</Text>
                <Text style={styles.tournamentOversText}>{tournament.type} Overs</Text>
              </View>

              <View style={styles.cardDetails}>
                <View style={styles.detailItem}>
                  <Icon name="sports-baseball" color={AppColors.primaryBlue} size={16} />
                  <Text style={styles.detailText} numberOfLines={1}>{tournament.ballType}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Icon name="location-on" color={AppColors.primaryBlue} size={16} />
                  <Text style={styles.detailText} numberOfLines={1}>{tournament.location || 'Location not specified'}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Icon name="calendar-today" color={AppColors.primaryBlue} size={16} />
                  <Text style={styles.detailText} numberOfLines={2}>
                    {`${tournament.startDate[2]}/${tournament.startDate[1]}/${tournament.startDate[0]} - ${tournament.endDate[2]}/${tournament.endDate[1]}/${tournament.endDate[0]}`}
                  </Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                {(tournamentTimeStatus === 'LIVE' || tournamentTimeStatus === 'UPCOMING') && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.scheduleButton]}
                    activeOpacity={0.8}
                    onPress={() => handleNavigation(tournament, 'MATCHES')}
                  >
                    <Icon name="event" size={18} color={AppColors.white} />
                    <Text style={styles.actionButtonText}>Schedule</Text>
                  </TouchableOpacity>
                )}

                {(tournamentTimeStatus === 'LIVE' || tournamentTimeStatus === 'PAST') && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.pointsButton]}
                    activeOpacity={0.8}
                    onPress={() => handleNavigation(tournament, 'POINTS TABLE')}
                  >
                    <Icon name="leaderboard" size={18} color={AppColors.white} />
                    <Text style={styles.actionButtonText}>Standings</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const TournamentCardMy = ({ tournament, onTournamentDeleted, index }) => {
  const navigation = useNavigation();
  const [scaleValue] = useState(new Animated.Value(1));
  const [opacityValue] = useState(new Animated.Value(0));

  useEffect(() => {
    // Staggered animation for cards
    Animated.sequence([
      Animated.delay(index * 100),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const checkIsCreator = useCallback(async (currentTournament) => {
    try {
      const creatorId = currentTournament.creatorName?.id;
      const userId = await AsyncStorage.getItem('userUUID');
      return creatorId === userId;
    } catch (error) {
      console.error("Error in checkIsCreator:", error);
      return false;
    }
  }, []);

  const manageTournamentHandler = useCallback(async (id, currentTournament) => {
    const isCreator = await checkIsCreator(currentTournament);
    const tab = 'INFO';
    navigation.navigate('ManageTournaments', { id, isCreator, tab });
  }, [checkIsCreator, navigation]);

  const deleteTournamentHandler = useCallback(async (id) => {
    Alert.alert(
      'Delete Tournament',
      'Are you sure you want to delete this tournament? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('jwtToken');
              if (!token) throw new Error('Authentication required.');

              const { success, error } = await apiService({
                endpoint: `tournaments/${id}`,
                method: 'DELETE',
                token: token,
              });

              if (success) {
                Alert.alert('Success', 'Tournament deleted successfully.');
                onTournamentDeleted();
              } else {
                console.error('Delete error:', error);
                Alert.alert('Error', error?.message || 'Failed to delete the tournament. Please try again.');
              }
            } catch (err) {
              console.error('Unexpected error during delete:', err.message);
              Alert.alert('Error', err.message || 'Something went wrong while deleting.');
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  }, [onTournamentDeleted]);

  const sanitizedBannerUrl = tournament.banner.replace(
    'https://score360-7.onrender.com/api/v1/files/http:/',
    'https://'
  );

  return (
    <Animated.View
      style={[
        styles.myCardContainer,
        {
          opacity: opacityValue,
          transform: [{ scale: scaleValue }]
        }
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => manageTournamentHandler(tournament.id, tournament)}
        style={styles.myCardPressable}
      >
        <View style={styles.myCardElevation}>
          <Image
            source={{ uri: sanitizedBannerUrl }}
            style={styles.myTournamentImage}
            resizeMode='cover'
          />

          {/* Gradient Overlay on Image */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.myImageOverlay}
          />

          <View style={styles.myCardContent}>
            <View style={styles.myCardHeader}>
              <Text style={styles.myTournamentName} numberOfLines={2}>{tournament.name}</Text>
              <TouchableOpacity
                onPress={() => deleteTournamentHandler(tournament.id)}
                style={styles.deleteButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="delete-outline" size={24} color={AppColors.errorRed} />
              </TouchableOpacity>
            </View>

            <View style={styles.myCardDetails}>
              <View style={styles.myDetailItem}>
                <Icon name="calendar-today" size={14} color={AppColors.primaryBlue} />
                <Text style={styles.myDetailText} numberOfLines={1}>
                  {`${tournament.startDate[2]}/${tournament.startDate[1]}/${tournament.startDate[0]} - ${tournament.endDate[2]}/${tournament.endDate[1]}/${tournament.endDate[0]}`}
                </Text>
              </View>

              <View style={styles.myDetailItem}>
                <Icon name="sports-cricket" size={14} color={AppColors.primaryBlue} />
                <Text style={styles.myDetailText} numberOfLines={1}>
                  {tournament.type} overs • {tournament.ballType}
                </Text>
              </View>

              <View style={styles.myDetailItem}>
                <Icon name="location-on" size={14} color={AppColors.primaryBlue} />
                <Text style={styles.myDetailText} numberOfLines={1}>
                  {tournament.venues?.join(', ') || 'Location not specified'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.manageButton}
              onPress={() => manageTournamentHandler(tournament.id, tournament)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={AppGradients.primaryButton}
                style={styles.manageButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Icon name="settings" size={18} color={AppColors.white} style={styles.manageIcon} />
                <Text style={styles.manageButtonText}>MANAGE TOURNAMENT</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const Tournaments = () => {
  const [activeTab, setActiveTab] = useState('LIVE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();
  const debounce = (func, delay) => {
    let timer;
    return function (...args) {
      const context = this;
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(context, args), delay);
    };
  };

  const fetchTournaments = useCallback(async (status, query = '') => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      const endpoint =
        status === 'MY'
          ? `tournaments/tournaments-play`
          : `tournaments/status`;

      const params = {
        ...(status !== 'MY' && { status }),
        ...(query && { name: query }),
      };

      const response = await apiService({
        endpoint,
        method: 'GET',
        params: params,
        token: token,
      });

      if (response.success) {
        setTournaments(response.data.data || []);
      } else {
        console.error('Fetch tournaments API error:', response.error);
        setError(response.error?.message || 'Failed to load tournaments.');
        setTournaments([]);
      }
    } catch (err) {
      console.error('Fetch tournaments unexpected error:', err);
      setError(err.message || 'An unexpected error occurred while loading tournaments.');
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetchTournaments = useCallback(
    debounce((status, query) => fetchTournaments(status, query), 500),
    [fetchTournaments]
  );

  useFocusEffect(
    useCallback(() => {
      fetchTournaments(activeTab.toUpperCase(), searchQuery);
    }, [activeTab, searchQuery, fetchTournaments])
  );

  const handleMyTournamentDeleted = useCallback(() => {
    fetchTournaments('MY', searchQuery);
  }, [fetchTournaments, searchQuery]);

  const onSearchTextChange = (text) => {
    setSearchQuery(text);
    debouncedFetchTournaments(activeTab.toUpperCase(), text);
  };

  useEffect(() => {
    StatusBar.setBackgroundColor(AppGradients.primaryCard[0], true);
    StatusBar.setBarStyle('light-content', true); // Use 'light-content' for dark backgrounds
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(false); // Ensure it's not translucent for solid color
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
    {/* Header - Modified to extend into status bar */}
    <LinearGradient
      colors={AppGradients.primaryCard}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerContentRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={28} color={AppColors.white} />
        </TouchableOpacity>

        <View style={styles.searchBarContainer}>
          <Icon name="search" size={20} color={AppColors.white} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tournaments..."
            placeholderTextColor="rgba(255,255,255,0.8)"
            onChangeText={onSearchTextChange}
            value={searchQuery}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabContainer}
      >
        {['MY', 'LIVE', 'UPCOMING', 'PAST'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && styles.activeTabButton,
            ]}
            onPress={() => {
              setActiveTab(tab);
              setSearchQuery(''); // Clear search on tab change
              fetchTournaments(tab.toUpperCase(), ''); // Refetch for new tab
            }}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText,
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <LottieView
              source={require('../../assets/animations/loader.gif')}
              autoPlay
              loop
              style={styles.lottieLoader}
            />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={40} color={AppColors.errorRed} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.tournamentsContainer}>
            {tournaments.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="emoji-events" size={60} color={AppColors.infoGrey} />
                <Text style={styles.emptyText}>
                  {activeTab === 'MY'
                    ? <Text>You haven't joined any tournaments yet.</Text>
                    : searchQuery
                      ? <Text>No results found for "<Text style={{ fontWeight: 'bold' }}>{searchQuery}</Text>" in <Text style={{ textTransform: 'lowercase' }}>{activeTab}</Text> tournaments.</Text>
                      : <Text>No <Text style={{ textTransform: 'lowercase' }}>{activeTab}</Text> tournaments available.</Text>
                  }
                </Text>
                {activeTab === 'MY' && (
                  <TouchableOpacity style={styles.exploreButton} onPress={() => setActiveTab('LIVE')}>
                    <Text style={styles.exploreButtonText}>EXPLORE TOURNAMENTS</Text>
                  </TouchableOpacity>
                )}
                {searchQuery && (
                  <TouchableOpacity style={styles.clearSearchButton} onPress={() => setSearchQuery('')}>
                    <Text style={styles.clearSearchButtonText}>CLEAR SEARCH</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              tournaments.map((tournament, index) => (
                activeTab === 'MY' ?
                  <TournamentCardMy
                    key={tournament.id}
                    tournament={tournament}
                    onTournamentDeleted={handleMyTournamentDeleted}
                    index={index}
                  /> :
                  <TournamentCardOthers
                    key={tournament.id}
                    tournament={tournament}
                    tournamentTimeStatus={activeTab}
                    index={index}
                  />
              ))
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Tournaments;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.lightBackground,
  },

  header: {
    paddingBottom: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 40,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
  },
  headerContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 10,
  },
  backButton: {
    marginRight: 15,
    padding: 8,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    paddingVertical: Platform.OS === 'ios' ? 10 : 0,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: AppColors.white,
    fontSize: 16,
  },
  tabContainer: {
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTabButton: {
    backgroundColor: AppColors.white,
    borderColor: AppColors.white,
  },
  tabText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: AppColors.primaryBlue,
    fontWeight: 'bold',
  },

  content: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.lightBackground, // Match content background
  },
  lottieLoader: {
    width: 150, // Adjust size as needed
    height: 150,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: AppColors.errorRed,
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  tournamentsContainer: {
    padding: 15,
    paddingBottom: 80,
  },

  // === Enhanced Tournament Card Styles ===
  cardContainerWrapper: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardElevation: {
    backgroundColor: AppColors.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  statusBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    color: AppColors.white,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    marginBottom: 15,
  },
  tournamentNameCard: {
    fontSize: 22,
    fontWeight: '800',
    color: AppColors.darkText,
    marginBottom: 5,
  },
  tournamentOversText: {
    fontSize: 15,
    color: AppColors.primaryBlue,
    fontWeight: '600',
  },
  cardDetails: {
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 12,
    fontSize: 14,
    color: AppColors.mediumText,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleButton: {
    backgroundColor: AppColors.primaryBlue,
  },
  pointsButton: {
    backgroundColor: AppColors.secondaryBlue,
  },
  actionButtonText: {
    color: AppColors.white,
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },

  // === Enhanced My Tournament Card Styles ===
  myCardContainer: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  myCardPressable: {
    borderRadius: 20,
  },
  myCardElevation: {
    backgroundColor: AppColors.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  myTournamentImage: {
    width: '100%',
    height: 180,
  },
  myImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  myCardContent: {
    padding: 20,
  },
  myCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  myTournamentName: {
    fontSize: 22,
    fontWeight: '800',
    color: AppColors.darkText,
    flex: 1,
    marginRight: 15,
  },
  deleteButton: {
    padding: 4,
  },
  myCardDetails: {
    marginBottom: 20,
  },
  myDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  myDetailText: {
    marginLeft: 10,
    color: AppColors.mediumText,
    fontSize: 14,
    flex: 1,
  },
  manageButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  manageButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  manageIcon: {
    marginRight: 8,
  },
  manageButtonText: {
    color: AppColors.white,
    fontWeight: 'bold',
    fontSize: 15,
  },

  // === Empty State Styles ===
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 250, // Ensure it takes enough space
  },
  emptyText: {
    color: AppColors.infoGrey,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 25,
  },
  exploreButton: {
    backgroundColor: AppColors.primaryBlue,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10,
  },
  exploreButtonText: {
    color: AppColors.white,
    fontWeight: 'bold',
  },
  clearSearchButton: {
    backgroundColor: AppColors.gray,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  clearSearchButtonText: {
    color: AppColors.white,
    fontWeight: 'bold',
  },
});
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  Image,
  Pressable,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Animated,
  Easing,
  StatusBar
} from 'react-native';
import backgroundImage from '../../../assets/images/cricsLogo.png';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import apiService from '../../APIservices';
import { AppColors } from '../../../assets/constants/colors';

const { width } = Dimensions.get('window');

const AllMatches = () => {
  const [activeTab, setActiveTab] = useState('MY');
  const [fadeAnim] = useState(new Animated.Value(0));
  const navigation = useNavigation();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage} resizeMode="cover">
      <StatusBar
        barStyle="dark-content"
        backgroundColor={AppColors.background}
        translucent={false}
      />
      <LinearGradient colors={['rgba(0, 0, 0, 0.5)', 'rgba(54, 176, 303, 0.2)']} style={styles.gradientOverlay}>
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <LinearGradient
            colors={['rgba(52, 184, 255, 0.9)', 'rgba(52, 184, 255, 0.95)']}
            style={styles.glassHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                style={{ padding: 5 }}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <Icon name="arrow-back" size={32} color="#fff" />
              </TouchableOpacity>
              <View style={styles.searchBarContainer}>
                <Icon name="search" size={24} color="#fff" style={styles.searchIcon} />
                <Text style={styles.searchBar}>Search for matches...</Text>
              </View>
            </View>
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              style={styles.toggleContainer}
              contentContainerStyle={styles.toggleContentContainer}
            >
              {['MY', 'LIVE', 'UPCOMING', 'PAST'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.toggleButton,
                    activeTab === tab && styles.activeToggleButton,
                  ]}
                  onPress={() => {
                    Animated.spring(new Animated.Value(0), {
                      toValue: 1,
                      friction: 3,
                      useNativeDriver: true,
                    }).start(() => setActiveTab(tab));
                  }}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      activeTab === tab && styles.activeToggleText,
                    ]}
                  >
                    {tab}
                  </Text>
                  {activeTab === tab && <View style={styles.activeIndicator} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </LinearGradient>
        </Animated.View>
        <View style={styles.contentContainer}>
          {activeTab === 'MY' && <MyMatch />}
          {activeTab === 'LIVE' && <LiveMatch />}
          {activeTab === 'UPCOMING' && <UpcomingMatch />}
          {activeTab === 'PAST' && <PastMatch />}
        </View>
      </LinearGradient>
    </ImageBackground>
  )
}

export default AllMatches

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    // width: '100%',
    // height: '100%',
  },
  gradientOverlay: {
    // paddingTop: 10,
    flex: 1,
    // width: '100%',
    // height: '100%',
  },
  header: {
    // position: 'absolute',
    // top: 0,
    // left: 0,
    // right: 0,
    // zIndex: 1,
    // height: 140,
    backgroundColor: 'transparent',
  },
  glassHeader: {
    padding: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(52, 184, 255, 0.9)',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  searchBarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBar: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
  toggleContainer: {
    flexDirection: 'row',
    // marginTop: 5,
  },
  toggleContentContainer: {
    paddingHorizontal: 5,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 22,
    marginHorizontal: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  activeToggleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    position: 'relative',
  },
  toggleText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  activeToggleText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    height: 3,
    width: '60%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  contentContainer: {
    flex: 1,
    // marginTop: 140,
    paddingHorizontal: 15,
  },
  cardContainer: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    padding: 0,
  },
  tournamentDetails: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 10,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    borderBottomWidth: 1,
  },
  cardImage: {
    overflow: 'hidden',
    borderRadius: 50,
    justifyContent: 'flex-end',
    height: 50,
    width: 50,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tournamentName: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tournamentContent: {
    color: '#555',
    fontSize: 14,
    marginVertical: 2,
  },
  contentSubHeading: {
    color: '#333',
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  winnerText: {
    color: '#34B8FF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
  },
  noMatchText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  cardHeader: {
    backgroundColor: 'rgba(52, 184, 255, 0.1)',
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cardBody: {
    padding: 15,
  },
  cardFooter: {
    backgroundColor: 'rgba(52, 184, 255, 0.05)',
    padding: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
  },
});

const MyMatch = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    getMyMatches();
  }, []);

  const getMyMatches = async () => {
    try {
      const playerId = await AsyncStorage.getItem('userUUID');
      if (!playerId) throw new Error('User ID not found. Please login again.');

      setLoading(true);

      const response = await apiService({
        endpoint: `matches/player/${playerId}`,
        method: 'GET',
      });

      if (response.success) {
        setMatches(response.data.data);
        setError(null);
      } else {
        setError('Failed to load your matches. Pull down to refresh.');
      }
    } catch (err) {
      setError('Failed to load your matches. Pull down to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    getMyMatches();
  };

  const matchCardClickHandler = (item) => {
    const matchId = item?.id;
    navigation.navigate('MatchScoreCard', { matchId });
  };

  const renderMatchItem = ({ item }) => {
    const matchDate = item?.matchDate ? `${item?.matchDate[2]}-${item?.matchDate[1]}-${item?.matchDate[0]}` : 'N/A';
    const isWinnerDeclared = item?.winner;

    return (
      <Pressable
        key={item?.id}
        onPress={() => matchCardClickHandler(item)}
        style={({ pressed }) => [
          styles.card,
          { transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
      >
        <LinearGradient
          colors={['rgba(52, 184, 255, 0.1)', 'rgba(52, 184, 255, 0.05)']}
          style={styles.cardHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={[styles.tournamentName, { textAlign: 'center' }]}>
            {item?.tournamentResponse?.name || 'Tournament Match'}
          </Text>
        </LinearGradient>

        <View style={styles.cardBody}>
          <View style={liveMatchStyles.teamRow}>
            <View style={{ alignItems: 'center' }}>
              <Image source={{ uri: item?.team1?.logoPath }} style={liveMatchStyles.logo} />
              <Text style={liveMatchStyles.teamName}>{item?.team1?.name}</Text>
              <Text style={liveMatchStyles.teamScore}>{item?.team1Score || 'N/A'}</Text>
            </View>

            <View style={liveMatchStyles.vsContainer}>
              <Text style={liveMatchStyles.vs}>VS</Text>
              <Text style={liveMatchStyles.matchStatus}>{item?.status}</Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Image source={{ uri: item?.team2?.logoPath }} style={liveMatchStyles.logo} />
              <Text style={liveMatchStyles.teamName}>{item?.team2?.name}</Text>
              <Text style={liveMatchStyles.teamScore}>{item?.team2Score || 'N/A'}</Text>
            </View>
          </View>

          <View style={{ marginTop: 15 }}>
            <View style={styles.tournamentDetails}>
              <Icon name="calendar-month" size={18} color="#555" />
              <Text style={styles.tournamentContent}> {matchDate}</Text>
            </View>
            <View style={styles.tournamentDetails}>
              <Icon name="location-on" size={18} color="#555" />
              <Text style={styles.tournamentContent}> {item?.venue || 'Venue not specified'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          {isWinnerDeclared ? (
            <Text style={styles.winnerText}>🏆 {item?.winner} won the match!</Text>
          ) : (
            <Text style={styles.tournamentContent}>Match in progress...</Text>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {loading && !refreshing && (
        <ActivityIndicator size="large" color="#34B8FF" style={styles.activityIndicator} />
      )}

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {!loading && matches?.length === 0 && (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <View style={{ alignItems: 'center', backgroundColor: 'white', margin: 4, borderRadius: 2, paddingVertical: 4 }}>
            <Icon name="info-outline" size={40} color="#888" />
            <Text style={styles.noMatchText}>No matches found</Text>
            <TouchableOpacity
              onPress={getMyMatches}
              style={{ marginTop: 10, padding: 10 }}
            >
              <Text style={{ color: '#34B8FF', fontWeight: '600' }}>Tap to refresh</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!loading && matches?.length !== 0 && (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={renderMatchItem}
          contentContainerStyle={styles.cardContainer}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <Text style={styles.noMatchText}>No matches found</Text>
          }
        />
      )}
    </View>
  );
};

const liveMatchStyles = StyleSheet.create({
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 100,
  },
  teamScore: {
    color: '#34B8FF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  vsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  vs: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff4757',
  },
  matchStatus: {
    fontSize: 12,
    color: '#34B8FF',
    fontWeight: '600',
    marginTop: 5,
    backgroundColor: 'rgba(52, 184, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  venue: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  date: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  winner: {
    fontSize: 16,
    color: '#34B8FF',
    fontWeight: 'bold',
    marginTop: 10,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

const LiveMatch = () => {
  const navigation = useNavigation();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);

  const getLiveMatches = async () => {
    try {
      const userId = (await AsyncStorage.getItem('userUUID'))?.trim();
      if (userId) setUserId(userId);

      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) {
        navigation.navigate('Login');
        return;
      }

      setLoading(true);

      const response = await apiService({
        endpoint: 'matches/status',
        method: 'GET',
        params: { status: 'Live' },
      });

      if (response.success) {
        setMatches(response.data.data);
        setError(null);
      } else {
        setError('Failed to load live matches. Pull down to refresh.');
      }
    } catch (err) {
      setError('Failed to load live matches. Pull down to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getLiveMatches();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    getLiveMatches();
  };

  const liveMatchClickHandler = async (matchId, match) => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const creatorId = match.creatorName.id;

      if (userId === creatorId) {
        navigation.navigate('Scoring', { matchId });
      } else {
        navigation.navigate('CommentaryScorecard', { matchId });
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const renderMatchItem = ({ item }) => (
    <Pressable
      onPress={() => liveMatchClickHandler(item?.id, item)}
      style={({ pressed }) => [
        styles.card,
        { transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
    >
      <View style={{
        backgroundColor: '#ff475710',
        padding: 15,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: '#ff4757',
            marginRight: 8,
          }} />
          <Text style={{ color: '#ff4757', fontWeight: 'bold' }}>LIVE</Text>
        </View>
        <Text style={{ color: '#555', fontSize: 12 }}>
          {item?.tournamentResponse?.name || 'Tournament Match'}
        </Text>
      </View>

      <View style={styles.cardBody}>
        <View style={liveMatchStyles.teamRow}>
          <View style={{ alignItems: 'center' }}>
            <Image source={{ uri: item?.team1?.logoPath }} style={liveMatchStyles.logo} />
            <Text style={liveMatchStyles.teamName}>{item?.team1?.name}</Text>
            <Text style={[liveMatchStyles.teamScore, { color: '#ff4757' }]}>
              {item?.team1Score || 'N/A'}
            </Text>
          </View>

          <View style={liveMatchStyles.vsContainer}>
            <Text style={liveMatchStyles.vs}>VS</Text>
            <Text style={liveMatchStyles.matchStatus}>In Progress</Text>
          </View>

          <View style={{ alignItems: 'center' }}>
            <Image source={{ uri: item?.team2?.logoPath }} style={liveMatchStyles.logo} />
            <Text style={liveMatchStyles.teamName}>{item?.team2?.name}</Text>
            <Text style={[liveMatchStyles.teamScore, { color: '#ff4757' }]}>
              {item?.team2Score || 'N/A'}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 15 }}>
          <View style={styles.tournamentDetails}>
            <Icon name="location-on" size={18} color="#555" />
            <Text style={styles.tournamentContent}> {item?.venue || 'Venue not specified'}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.cardFooter, { backgroundColor: '#ff475710' }]}>
        <Text style={[styles.tournamentContent, { color: '#ff4757' }]}>
          Tap to {item?.creatorName?.id === userId ? 'score' : 'view'} match
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={{ flex: 1 }}>
      {loading && !refreshing && (
        <ActivityIndicator size="large" color="#34B8FF" style={styles.activityIndicator} />
      )}

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {!loading && matches?.length === 0 && (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <View style={{ alignItems: 'center', backgroundColor: 'white', margin: 4, borderRadius: 2, paddingVertical: 4 }}>
            <Icon name="sports-cricket" size={40} color="#888" />
            <Text style={styles.noMatchText}>No live matches right now</Text>
            <TouchableOpacity
              onPress={getLiveMatches}
              style={{ marginTop: 10, padding: 10 }}
            >
              <Text style={{ color: '#34B8FF', fontWeight: '600' }}>Tap to refresh</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!loading && matches?.length !== 0 && (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={renderMatchItem}
          contentContainerStyle={styles.cardContainer}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </View>
  );
};

const UpcomingMatch = () => {
  const navigation = useNavigation();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [userId, setUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const getUpcomingMatches = async () => {
    try {
      const userId = (await AsyncStorage.getItem('userUUID'))?.trim();
      if (userId) setUserId(userId);

      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) throw new Error('Please Login Again');

      setLoading(true);

      const response = await apiService({
        endpoint: 'matches/status',
        method: 'GET',
        params: { status: 'Upcoming' },
      });

      if (response.success) {
        setMatches(response.data.data);
        setError(null);
      } else {
        setError('Failed to load upcoming matches. Pull down to refresh.');
      }
    } catch (err) {
      setError('Failed to load upcoming matches. Pull down to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getUpcomingMatches();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    getUpcomingMatches();
  };

  const upcomingMatchClickHandler = async (matchId, match) => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const creatorId = match.creatorName.id;

      if (userId === creatorId) {
        navigation.navigate('Scoring', { matchId });
      } else {
        navigation.navigate('MatchScoreCard', { matchId });
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const renderMatchItem = ({ item }) => {
    const matchDate = item?.matchDate ? `${item?.matchDate[2]}-${item?.matchDate[1]}-${item?.matchDate[0]}` : 'N/A';

    return (
      <Pressable
        onPress={() => upcomingMatchClickHandler(item?.id, item)}
        style={({ pressed }) => [
          styles.card,
          { transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
      >
        <LinearGradient
          colors={['rgba(52, 184, 255, 0.1)', 'rgba(52, 184, 255, 0.05)']}
          style={styles.cardHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={[styles.tournamentName, { textAlign: 'center' }]}>
            {item?.tournamentResponse?.name || 'Tournament Match'}
          </Text>
        </LinearGradient>

        <View style={styles.cardBody}>
          <View style={liveMatchStyles.teamRow}>
            <View style={{ alignItems: 'center' }}>
              <Image source={{ uri: item?.team1?.logoPath }} style={liveMatchStyles.logo} />
              <Text style={liveMatchStyles.teamName}>{item?.team1?.name}</Text>
            </View>

            <View style={liveMatchStyles.vsContainer}>
              <Text style={[liveMatchStyles.vs, { color: '#34B8FF' }]}>VS</Text>
              <Text style={[liveMatchStyles.matchStatus, { backgroundColor: '#34B8FF10' }]}>
                Upcoming
              </Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Image source={{ uri: item?.team2?.logoPath }} style={liveMatchStyles.logo} />
              <Text style={liveMatchStyles.teamName}>{item?.team2?.name}</Text>
            </View>
          </View>

          <View style={{ marginTop: 15 }}>
            <View style={styles.tournamentDetails}>
              <Icon name="calendar-month" size={18} color="#555" />
              <Text style={styles.tournamentContent}> {matchDate}</Text>
            </View>
            <View style={styles.tournamentDetails}>
              <Icon name="location-on" size={18} color="#555" />
              <Text style={styles.tournamentContent}> {item?.venue || 'Venue not specified'}</Text>
            </View>
            <View style={styles.tournamentDetails}>
              <Icon name="access-time" size={18} color="#555" />
              <Text style={styles.tournamentContent}> {item?.matchTime || 'Time not specified'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.tournamentContent}>
            Tap to {item?.creatorName?.id === userId ? 'setup' : 'view'} match
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {loading && !refreshing && (
        <ActivityIndicator size="large" color="#34B8FF" style={styles.activityIndicator} />
      )}

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {!loading && matches?.length === 0 && (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <View style={{ alignItems: 'center', backgroundColor: 'white', margin: 4, borderRadius: 2, paddingVertical: 4 }}>
            <Icon name="event-available" size={40} color="#888" />
            <Text style={styles.noMatchText}>No upcoming matches scheduled</Text>
            <TouchableOpacity
              onPress={getUpcomingMatches}
              style={{ marginTop: 10, padding: 10 }}
            >
              <Text style={{ color: '#34B8FF', fontWeight: '600' }}>Tap to refresh</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!loading && matches?.length !== 0 && (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={renderMatchItem}
          contentContainerStyle={styles.cardContainer}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </View>
  );
};

const PastMatch = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const getPastMatches = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) throw new Error('Please Login Again');

      setLoading(true);

      const response = await apiService({
        endpoint: 'matches/status',
        method: 'GET',
        params: { status: 'Past' },
      });

      if (response.success) {
        setMatches(response.data.data);
        setError(null);
      } else {
        setError('Failed to load past matches. Pull down to refresh.');
      }
    } catch (err) {
      setError('Failed to load past matches. Pull down to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getPastMatches();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    getPastMatches();
  };

  const pastMatchClickHandler = (matchId) => {
    navigation.navigate('MatchScoreCard', { matchId });
  };

  const renderMatchItem = ({ item }) => {
    const matchDate = item?.matchDate ? `${item?.matchDate[2]}-${item?.matchDate[1]}-${item?.matchDate[0]}` : 'N/A';

    return (
      <Pressable
        onPress={() => pastMatchClickHandler(item?.id)}
        style={({ pressed }) => [
          styles.card,
          { transform: [{ scale: pressed ? 0.98 : 1 }] },
        ]}
      >
        <View style={[styles.cardHeader, { backgroundColor: 'rgba(0, 0, 0, 0.03)' }]}>
          <Text style={[styles.tournamentName, { textAlign: 'center' }]}>
            {item?.tournamentResponse?.name || 'Tournament Match'}
          </Text>
        </View>

        <View style={styles.cardBody}>
          <View style={liveMatchStyles.teamRow}>
            <View style={{ alignItems: 'center' }}>
              <Image source={{ uri: item?.team1?.logoPath }} style={liveMatchStyles.logo} />
              <Text style={liveMatchStyles.teamName}>{item?.team1?.name}</Text>
              <Text style={[liveMatchStyles.teamScore, { color: '#555' }]}>
                {item?.team1Score || 'N/A'}
              </Text>
            </View>

            <View style={liveMatchStyles.vsContainer}>
              <Text style={[liveMatchStyles.vs, { color: '#888' }]}>VS</Text>
              <Text style={[liveMatchStyles.matchStatus, { backgroundColor: 'rgba(0, 0, 0, 0.05)' }]}>
                Completed
              </Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Image source={{ uri: item?.team2?.logoPath }} style={liveMatchStyles.logo} />
              <Text style={liveMatchStyles.teamName}>{item?.team2?.name}</Text>
              <Text style={[liveMatchStyles.teamScore, { color: '#555' }]}>
                {item?.team2Score || 'N/A'}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 15 }}>
            <View style={styles.tournamentDetails}>
              <Icon name="calendar-month" size={18} color="#555" />
              <Text style={styles.tournamentContent}> {matchDate}</Text>
            </View>
            <View style={styles.tournamentDetails}>
              <Icon name="location-on" size={18} color="#555" />
              <Text style={styles.tournamentContent}> {item?.venue || 'Venue not specified'}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.cardFooter, { backgroundColor: 'rgba(0, 0, 0, 0.03)' }]}>
          <Text style={[styles.winnerText, { color: '#2ecc71' }]}>
            🏆 {item?.winner} won the match!
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {loading && !refreshing && (
        <ActivityIndicator size="large" color="#34B8FF" style={styles.activityIndicator} />
      )}

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {!loading && matches?.length === 0 && (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <View style={{ alignItems: 'center', backgroundColor: 'white', margin: 4, borderRadius: 2, paddingVertical: 4 }}>
            <Icon name="history" size={40} color="#888" />
            <Text style={styles.noMatchText}>No past matches found</Text>
            <TouchableOpacity
              onPress={getPastMatches}
              style={{ marginTop: 10, padding: 10 }}
            >
              <Text style={{ color: '#34B8FF', fontWeight: '600' }}>Tap to refresh</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!loading && matches?.length !== 0 && (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={renderMatchItem}
          contentContainerStyle={styles.cardContainer}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </View>
  );
};
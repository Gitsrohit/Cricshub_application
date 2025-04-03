import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
  StatusBar,
  Image,
  Pressable,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import backgroundImage from '../../../assets/images/cricsLogo.png';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const AllMatches = () => {
  const [activeTab, setActiveTab] = useState('MY');
  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage} resizeMode="cover">
      <LinearGradient colors={['rgba(0, 0, 0, 0.2)', 'rgba(54, 176, 303, 0.1)']} style={styles.gradientOverlay}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#34B8FF"
          translucent={true}
        />
        <View style={styles.header}>
          <LinearGradient
            colors={['#34B8FF', '#34B8FF']}
            style={styles.glassHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.searchBarContainer}>
              <Text style={styles.searchBar}>Search for matches...</Text>
            </View>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.toggleContainer}>
              {['MY', 'LIVE', 'UPCOMING', 'PAST'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.toggleButton,
                    activeTab === tab && styles.activeToggleButton,
                  ]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      activeTab === tab && styles.activeToggleText,
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </LinearGradient>
        </View>
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
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    height: 140,
    paddingTop: StatusBar.currentHeight || 0,
    backgroundColor: 'transparent',
  },
  glassHeader: {
    padding: 20,
    overflow: 'hidden',
    backgroundColor: '#34B8FF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  searchBarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  searchBar: {
    color: '#fff',
    fontSize: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  toggleButton: {
    paddingVertical: 5,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeToggleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  toggleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12
  },
  activeToggleText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    marginTop: 140,
    paddingHorizontal: 10,
  },
  cardContainer: {
    width: '100%',
    paddingTop: 50,
    padding: 10,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    overflow: 'hidden',
    margin: 10,
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    padding: 15,
  },
  tournamentDetails: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 10,
    borderBottomColor: '#E0E0E0',
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  tournamentContent: {
    color: '#555',
    fontSize: 16,
    marginVertical: 2,
  },
  contentSubHeading: {
    color: '#333',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  winnerText: {
    color: '#007BFF',
    fontSize: 16,
    fontWeight: 600,
  },
})

const MyMatch = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    getMyMatches();
  }, []);

  const getMyMatches = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const playerId = await AsyncStorage.getItem('userUUID');
      if (!token)
        throw new Error('Please Login Again');
      setLoading(true);
      const response = await axios.get(`https://score360-7.onrender.com/api/v1/matches/player/${playerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMatches(response.data);

    } catch (err) {
      setError('Failed to my matches');
    } finally {
      setLoading(false);
    }
  }

  const checkIsCreator = async (match) => {
    try {
      const creatorId = match.tournamentResponse.creatorName.id;
      const userId = await AsyncStorage.getItem('userUUID');
      if (creatorId === userId) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error in checkIsCreator:", error);
      return false;
    }
  };

  const matchCardClickHandler = (item) => {
    const matchId = item.id;
    navigation.navigate('MatchScoreCard', { matchId })
  }

  const renderMatchItem = ({ item }) => {
    const matchDate = item.matchDate ? `${item.matchDate[2]}-${item.matchDate[1]}-${item.matchDate[0]}` : 'N/A';

    return (
      <Pressable
        key={item.id}
        style={styles.card}
        onPress={() => matchCardClickHandler(item)}
      >
        <View style={liveMatchStyles.teamRow}>
          <Image source={{ uri: item.team1.logoPath }} style={liveMatchStyles.logo} />
          <View>
            <Text style={liveMatchStyles.teamName}>{item.team1.name}</Text>
            <Text style={{ color: '#555', fontSize: 12 }}>{item.team1Score || 'N/A'}</Text>
          </View>
          <Text style={liveMatchStyles.vs}>VS</Text>
          <View>
            <Text style={liveMatchStyles.teamName}>{item.team2.name}</Text>
            <Text style={{ color: '#555', fontSize: 12 }}>{item.team2Score || 'N/A'}</Text>
          </View>
          <Image source={{ uri: item.team2.logoPath }} style={liveMatchStyles.logo} />
        </View>

        <View style={{ borderWidth: 0.5, borderColor: '#34B8FF' }}></View>

        <View style={{ marginTop: 5 }}>
          <Text style={styles.tournamentContent}><Icon name="calendar-month" size={18} color="#555" /> Date: {matchDate}</Text>
          <Text style={styles.tournamentContent}><Icon name="flag" size={18} color="#555" /> Venue: {item.venue}</Text>
        </View>

        <View style={{ alignItems: 'center', marginTop: 10 }}>
          <Text style={styles.winnerText}>{item.winner ? `Winner: ${item.winner}` : 'Match Result Pending'}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {!loading && matches?.length === 0 && <Text style={styles.noMatchText}>No matches found</Text>}

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={renderMatchItem}
        contentContainerStyle={styles.cardContainer}
      />
    </View>
  );
};

const LiveMatch = () => {
  const navigation = useNavigation();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [isCreator, setIsCreator] = useState(false);
  const [strikerId, setStrikerId] = useState(null);
  const [nonStrikerId, setNonStrikerId] = useState(null);
  const [bowler, setBowler] = useState(null);
  const [selectedStrikerName, setSelectedStrikerName] = useState(null);
  const [selectedNonStrikerName, setSelectedNonStrikerName] = useState(null);
  const [selectedBowlerName, setSelectedBowlerName] = useState(null);
  const [battingTeamName, setBattingTeamName] = useState('');
  const [score, setScore] = useState(0);
  const [extras, setExtras] = useState(0);
  const [bowlingTeamName, setBowlingTeamName] = useState('');
  const [wicket, setWicket] = useState(0);
  const [battingTeamII, setBattingTeamII] = useState([]);
  const [bowlingTeamII, setBowlingTeamII] = useState([]);
  const [completedOvers, setCompletedOvers] = useState(0);
  const [currentBowlerName, setCurrentBowlerName] = useState(selectedBowlerName);
  const [strikerName, setStrikerName] = useState(selectedStrikerName);
  const [nonStrikerName, setNonStrikerName] = useState(selectedNonStrikerName);
  const [currentOver, setCurrentOver] = useState([]);
  const [availableBowlers, setAvailableBowlers] = useState([]);
  const [availableBatsmen, setAvailableBatsmen] = useState(battingTeamII?.filter(
    (player) => player?.ballsFaced === 0 && player?.playerId !== strikerId && player?.playerId !== nonStrikerId
  ).map(({ playerId, name }) => ({ playerId, name })));
  const [nonStrikerStats, setNonStrikerStats] = useState({ runs: 0, ballsFaced: 0 });
  const [strikerStats, setStrikerStats] = useState({ runs: 0, ballsFaced: 0 });
  const [bowlerStats, setBowlerStats] = useState({ ballsBowled: 0, wicketsTaken: 0, runsConceded: 0 });
  const [overDetails, setOverDetails] = useState(null);
  const [legalDeliveries, setLegalDeliveries] = useState(0);

  const getLiveMatches = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const userId = await AsyncStorage.getItem('userUUID');
      if (!token)
        throw new Error('Please Login Again');
      setLoading(true);
      const response = await axios.get(`https://score360-7.onrender.com/api/v1/matches/status`, {
        params: { status: 'Live' },
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatches(response.data);
      if (userId === response.data.creatorName.id) {
        setIsCreator(true);
      } else {
        setIsCreator(false);
      }
    } catch (err) {
      setError('Failed to load live matches');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getLiveMatches();
  }, []);

  const liveMatchClickHandler = async (matchId: string, match: any) => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const userId = (await AsyncStorage.getItem('userUUID')).trim();
      const creatorId = match.creatorName.id;
      if (userId === creatorId) {
        const response = await axios.get(`https://score360-7.onrender.com/api/v1/matches/matchstate/${matchId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const data = response.data;
        console.log(data);
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
        navigation.navigate('Scoring', { matchId, strikerId, nonStrikerId, bowler, selectedStrikerName, selectedNonStrikerName, selectedBowlerName, battingTeamName, score, bowlingTeamName, wicket, battingTeamII, bowlingTeamII, completedOvers });
      }
      else {
        navigation.navigate('MatchScoreCard', { matchId })
      }
    } catch (error) {

    }
  }

  const renderMatchItem = ({ item }) => (
    <Pressable onPress={() => liveMatchClickHandler(item.id, item)}>
      <View style={liveMatchStyles.card}>
        <View style={liveMatchStyles.teamRow}>
          <Image source={{ uri: item.team1.logoPath }} style={liveMatchStyles.logo} />
          <View>
            <Text style={liveMatchStyles.teamName}>{item.team1.name}</Text>
            <Text style={{ color: '#555', fontSize: 12 }}>{item.team1Score || 'N/A'}</Text>
          </View>
          <Text style={liveMatchStyles.vs}>VS</Text>
          <View>
            <Text style={liveMatchStyles.teamName}>{item.team2.name}</Text>
            <Text style={{ color: '#555', fontSize: 12 }}>{item.team2Score || 'N/A'}</Text>
          </View>
          <Image source={{ uri: item.team2.logoPath }} style={liveMatchStyles.logo} />
        </View>
        <Text style={liveMatchStyles.venue}>Venue: {item.venue}</Text>
        <Text style={liveMatchStyles.date}>
          Date: {item.matchDate[2]}-{item.matchDate[1]}-{item.matchDate[0]}
        </Text>
        <Text style={liveMatchStyles.winner}>{item.winner} won the match!</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={{ flex: 1 }}>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <Text style={liveMatchStyles.errorText}>{error}</Text>}
      {!loading && matches.length === 0 && <Text style={liveMatchStyles.errorText}>No matches</Text>}

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={renderMatchItem}
        contentContainerStyle={styles.cardContainer}
      />
    </View>
  )
};

const liveMatchStyles = StyleSheet.create({
  cardContainer: {
    padding: 10,
    alignItems: 'center'
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 10,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  vs: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff0000'
  },
  venue: {
    fontSize: 14,
    color: '#555'
  },
  date: {
    fontSize: 14,
    color: '#555'
  },
  winner: {
    fontSize: 14,
    color: '#007BFF',
    fontWeight: 'bold'
  },
})

const UpcomingMatch = () => {
  const navigation = useNavigation();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [strikerId, setStrikerId] = useState(null);
  const [nonStrikerId, setNonStrikerId] = useState(null);
  const [bowler, setBowler] = useState(null);
  const [selectedStrikerName, setSelectedStrikerName] = useState(null);
  const [selectedNonStrikerName, setSelectedNonStrikerName] = useState(null);
  const [selectedBowlerName, setSelectedBowlerName] = useState(null);
  const [battingTeamName, setBattingTeamName] = useState('');
  const [score, setScore] = useState(0);
  const [extras, setExtras] = useState(0);
  const [bowlingTeamName, setBowlingTeamName] = useState('');
  const [wicket, setWicket] = useState(0);
  const [battingTeamII, setBattingTeamII] = useState([]);
  const [bowlingTeamII, setBowlingTeamII] = useState([]);
  const [completedOvers, setCompletedOvers] = useState(0);
  const [currentBowlerName, setCurrentBowlerName] = useState(selectedBowlerName);
  const [strikerName, setStrikerName] = useState(selectedStrikerName);
  const [nonStrikerName, setNonStrikerName] = useState(selectedNonStrikerName);
  const [currentOver, setCurrentOver] = useState([]);
  const [availableBowlers, setAvailableBowlers] = useState([]);
  const [availableBatsmen, setAvailableBatsmen] = useState(battingTeamII?.filter(
    (player) => player?.ballsFaced === 0 && player?.playerId !== strikerId && player?.playerId !== nonStrikerId
  ).map(({ playerId, name }) => ({ playerId, name })));
  const [nonStrikerStats, setNonStrikerStats] = useState({ runs: 0, ballsFaced: 0 });
  const [strikerStats, setStrikerStats] = useState({ runs: 0, ballsFaced: 0 });
  const [bowlerStats, setBowlerStats] = useState({ ballsBowled: 0, wicketsTaken: 0, runsConceded: 0 });
  const [overDetails, setOverDetails] = useState(null);
  const [legalDeliveries, setLegalDeliveries] = useState(0);

  const getUpcomingMatches = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token)
        throw new Error('Please Login Again');
      setLoading(true);
      const response = await axios.get(`https://score360-7.onrender.com/api/v1/matches/status`, {
        params: { status: 'Upcoming' },
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatches(response.data);

    } catch (err) {
      setError('Failed to load upcoming matches');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getUpcomingMatches();
  }, []);

  const liveMatchClickHandler = async (matchId: string, match: any) => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const userId = (await AsyncStorage.getItem('userUUID')).trim();
      const creatorId = match.creatorName.id;
      if (userId === creatorId) {
        const response = await axios.get(`https://score360-7.onrender.com/api/v1/matches/matchstate/${matchId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const data = response.data;
        console.log(data);
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
        navigation.navigate('Scoring', { matchId, strikerId, nonStrikerId, bowler, selectedStrikerName, selectedNonStrikerName, selectedBowlerName, battingTeamName, score, bowlingTeamName, wicket, battingTeamII, bowlingTeamII, completedOvers });
      }
      else {
        navigation.navigate('MatchScoreCard', { matchId })
      }
    } catch (error) {

    }
  }

  const renderMatchItem = ({ item }) => (
    <Pressable onPress={() => liveMatchClickHandler(item.id, item)}>
      <View style={liveMatchStyles.card}>
        <View style={liveMatchStyles.teamRow}>
          <Image source={{ uri: item.team1.logoPath }} style={liveMatchStyles.logo} />
          <View>
            <Text style={liveMatchStyles.teamName}>{item.team1.name}</Text>
            <Text style={{ color: '#555', fontSize: 12 }}>{item.team1Score || 'N/A'}</Text>
          </View>
          <Text style={liveMatchStyles.vs}>VS</Text>
          <View>
            <Text style={liveMatchStyles.teamName}>{item.team2.name}</Text>
            <Text style={{ color: '#555', fontSize: 12 }}>{item.team2Score || 'N/A'}</Text>
          </View>
          <Image source={{ uri: item.team2.logoPath }} style={liveMatchStyles.logo} />
        </View>
        <Text style={liveMatchStyles.venue}>Venue: {item.venue}</Text>
        <Text style={liveMatchStyles.date}>
          Date: {item.matchDate[2]}-{item.matchDate[1]}-{item.matchDate[0]}
        </Text>
        <Text style={liveMatchStyles.winner}>{item.winner} won the match!</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={{ flex: 1 }}>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <Text style={liveMatchStyles.errorText}>{error}</Text>}
      {!loading && matches.length === 0 && <Text style={liveMatchStyles.errorText}>No matches</Text>}

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={renderMatchItem}
        contentContainerStyle={styles.cardContainer}
      />
    </View>
  )
};

const PastMatch = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);

  const getPastMatches = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token)
        throw new Error('Please Login Again');
      setLoading(true);
      const response = await axios.get(`https://score360-7.onrender.com/api/v1/matches/status`, {
        params: { status: 'Past' },
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatches(response.data);

    } catch (err) {
      setError('Failed to load live matches');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getPastMatches();
  }, []);

  const renderMatchItem = ({ item }) => (
    <View style={liveMatchStyles.card}>
      <View style={liveMatchStyles.teamRow}>
        <Image source={{ uri: item.team1.logoPath }} style={liveMatchStyles.logo} />
        <View>
          <Text style={liveMatchStyles.teamName}>{item.team1.name}</Text>
          <Text style={{ color: '#555', fontSize: 12 }}>{item.team1Score || 'N/A'}</Text>
        </View>
        <Text style={liveMatchStyles.vs}>VS</Text>
        <View>
          <Text style={liveMatchStyles.teamName}>{item.team2.name}</Text>
          <Text style={{ color: '#555', fontSize: 12 }}>{item.team2Score || 'N/A'}</Text>
        </View>
        <Image source={{ uri: item.team2.logoPath }} style={liveMatchStyles.logo} />
      </View>
      <Text style={liveMatchStyles.venue}>Venue: {item.venue}</Text>
      <Text style={liveMatchStyles.date}>
        Date: {item.matchDate[2]}-{item.matchDate[1]}-{item.matchDate[0]}
      </Text>
      <Text style={liveMatchStyles.winner}>{item.winner} won the match!</Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <Text style={liveMatchStyles.errorText}>{error}</Text>}
      {!loading && matches.length === 0 && <Text style={liveMatchStyles.errorText}>No matches</Text>}

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={renderMatchItem}
        contentContainerStyle={styles.cardContainer}
      />
    </View>
  );
};
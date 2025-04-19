import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Button,
  Alert,
  Pressable,
  ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
const backgroundImage = require('../../assets/images/cricsLogo.png');

const Tournaments = () => {
  const [activeTab, setActiveTab] = useState('MY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tournaments, setTournaments] = useState([]);

  const fetchTournaments = async (status) => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const userUUID = await AsyncStorage.getItem('userUUID');

      if (!token || (status === 'my' && !userUUID)) {
        throw new Error('Please login again');
      }

      const endpoint =
        status === 'MY'
          ? `https://score360-7.onrender.com/api/v1/tournaments/tournaments-play`
          : `https://score360-7.onrender.com/api/v1/tournaments/status`;

      const response = await axios.get(endpoint, {
        params: status !== 'MY' ? { status } : {},
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTournaments(response.data);
    } catch (err) {
      setError('Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments(activeTab.toUpperCase());
  }, [activeTab]);

  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage} resizeMode="cover">
      <LinearGradient colors={['rgba(0, 0, 0, 0.2)', 'rgba(54, 176, 303, 0.1)']} style={styles.gradientOverlay}>
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
          {loading ? (
            <ActivityIndicator size="large" color="#34B8FF" style={styles.loader} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            activeTab !== 'MY' ? <OthersTournaments tournaments={tournaments} tournamentTimeStatus={activeTab} /> : <MyTournaments tournaments={tournaments} />
          )}
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

export default Tournaments;

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
    marginTop: 10,
  },
  toggleButton: {
    paddingVertical: 10,
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
    padding: 10,
    overflow: 'hidden',
  },
  card: {
    // backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    overflow: 'hidden',
    marginVertical: 10,
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
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tournamentContent: {
    color: 'white',
    fontSize: 16,
    marginVertical: 2,
  },
  contentSubHeading: {
    color: 'white',
  },
  cardButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFF",
    marginVertical: 10,
  },
  cardButtonText: {
    textAlign: 'center',
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  contentCols: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  maintainPadding: {
    paddingHorizontal: 6,
  },
  loader: {
    marginTop: 60,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600'
  },
  myTournamentButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
    paddingHorizontal: 6,
  },
});

export const OthersTournaments = ({ tournaments, tournamentTimeStatus }) => {
  const navigation = useNavigation();
  const checkIsCreator = async (tournament) => {
    try {
      const creatorId = tournament.creatorName.id;
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
  const scheduleClickHandler = async (tournament) => {
    const isCreator = await checkIsCreator(tournament);
    const tab = 'MATCHES';
    const id = tournament.id;
    navigation.navigate('ManageTournaments', { id, isCreator, tab })
  }

  const pointsTableClickHandler = async (tournament) => {
    const isCreator = await checkIsCreator(tournament);
    const tab = 'POINTS TABLE';
    const id = tournament.id;
    navigation.navigate('ManageTournaments', { id, isCreator, tab })
  }

  return (
    <ScrollView contentContainerStyle={styles.cardContainer}>
      {tournaments.map((tournament) => {
        const sanitizedBannerUrl = tournament.banner.replace(
          'https://score360-7.onrender.com/api/v1/files/http:/',
          'https://'
        );
        return (
          <LinearGradient colors={["#0866AA", "#6BB9F0"]} key={tournament.id} style={styles.card}>
            <View style={styles.tournamentDetails}>
              <Image source={{ uri: sanitizedBannerUrl }} style={styles.cardImage} resizeMode='cover' />
              <View style={styles.cardContent}>
                <Text style={styles.tournamentName}>{tournament.name}</Text>
              </View>
            </View>
            {/* Combined Start Date and End Date */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <Text style={styles.tournamentContent}>
                <Icon name="calendar-month" color="white" size={20} />{' '}
                {`${tournament.startDate[2]}/${tournament.startDate[1]}/${tournament.startDate[0]} - ${tournament.endDate[2]}/${tournament.endDate[1]}/${tournament.endDate[0]}`}
              </Text>
              <Text style={styles.tournamentContent}>Overs: {tournament.type}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.tournamentContent}>
                <Icon name="sports-baseball" color="white" size={20} />: {tournament.ballType}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 10, justifyContent: 'flex-end' }}>
              {(tournamentTimeStatus === 'LIVE' || tournamentTimeStatus === 'UPCOMING') &&
                <>
                  <TouchableOpacity
                    style={styles.cardButton}
                    activeOpacity={0.8}
                    onPress={() => scheduleClickHandler(tournament)}
                  >
                    <Text style={styles.cardButtonText}>
                      Schedule
                    </Text>
                  </TouchableOpacity>
                </>
              }
              {(tournamentTimeStatus === 'LIVE' || tournamentTimeStatus === 'PAST') &&
                <>
                  <TouchableOpacity
                    style={styles.cardButton}
                    activeOpacity={0.8}
                    onPress={() => pointsTableClickHandler(tournament)}
                  >
                    <Text style={styles.cardButtonText}>
                      Points Table
                    </Text>
                  </TouchableOpacity>
                </>
              }
            </View>
          </LinearGradient>
        );
      })}
      {tournaments.length === 0 && <Text style={styles.errorText}>No matches</Text>}
    </ScrollView>
  )
}

export const MyTournaments = ({ tournaments }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const checkIsCreator = async (tournament) => {
    try {
      const creatorId = tournament.creatorName.id;
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

  const manageTournamentHandler = async (id: string, tournament) => {
    const isCreator = await checkIsCreator(tournament);
    const tab = 'INFO';
    navigation.navigate('ManageTournaments', { id, isCreator, tab });
  };

  const fetchTournaments = async (status) => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const userUUID = await AsyncStorage.getItem('userUUID');

      if (!token || (status === 'my' && !userUUID)) {
        throw new Error('Please login again');
      }

      const endpoint = `https://score360-7.onrender.com/api/v1/tournaments/user/${userUUID}`;

      const response = await axios.get(endpoint, {
        params: status !== 'MY' ? { status } : {},
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      tournaments = response.data;
    } catch (err) {
      setError('Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const deleteTournamentHandler = async (id) => {
    Alert.alert(
      'Delete Tournament',
      'Are you sure you want to delete this tournament?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            const token = await AsyncStorage.getItem('jwtToken');
            if (!token) {
              Alert.alert('Error', 'Please log in again.');
              return;
            }
            try {
              await axios.delete(`https://score360-7.onrender.com/api/v1/tournaments/${id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              Alert.alert('Success', 'Tournament deleted successfully.');
            } catch (error) {
              console.error('Error deleting tournament:', error?.response?.data || error.message);
              Alert.alert('Error', 'Failed to delete the tournament.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.cardContainer}>
      {tournaments.map((tournament) => {
        const sanitizedBannerUrl = tournament.banner.replace(
          'https://score360-7.onrender.com/api/v1/files/http:/',
          'https://'
        );
        return (
          <Pressable key={tournament.id} onPress={() => manageTournamentHandler(tournament.id, tournament)}>
            <LinearGradient
              colors={["#0866AA", "#6BB9F0"]}
              style={styles.card}>
              <View style={styles.tournamentDetails}>
                <Image source={{ uri: sanitizedBannerUrl }} style={styles.cardImage} resizeMode='cover' />
                <View style={styles.cardContent}>
                  <Text style={styles.tournamentName}>{tournament.name}</Text>
                  <Icon name="delete" size={24} color="white" onPress={() => deleteTournamentHandler(tournament.id)} />
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <Text style={styles.tournamentContent}><Icon name="calendar-month" color="white" size={20} /> From:  {tournament.startDate[2]}-{tournament.startDate[1]}-{tournament.startDate[0]}</Text>
                <Text style={styles.tournamentContent}>Overs:  {tournament.type}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.tournamentContent}><Icon name="calendar-month" color="white" size={20} /> To: {tournament.endDate[2]}-{tournament.endDate[1]}-{tournament.endDate[0]}</Text>
                <Text style={styles.tournamentContent}><Icon name="sports-baseball" color="white" size={20} />: {tournament.ballType}</Text>
              </View>
            </LinearGradient>
          </Pressable>
        );
      })}
      {tournaments.length === 0 && <Text style={styles.errorText}>No matches</Text>}
    </ScrollView>
  )
}
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
} from 'react-native';
import backgroundImage from '../../../assets/images/cricsLogo.png';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
})

const MyMatch = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    getMyMatches();
  }, []);

  const getMyMatches = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      const userUUID = await AsyncStorage.getItem('userUUID');
      if (!token)
        throw new Error('Please Login Again');
      setLoading(true);
      const response = await axios.get(`https://score360-7.onrender.com/api/v1/matches/${userUUID}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(response);
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

  return (
    <>
      <ScrollView contentContainerStyle={styles.cardContainer}>
        {matches.map((match) => {
          const sanitizedBannerUrl = match.banner.replace(
            'https://score360-7.onrender.com/api/v1/files/http:/',
            'https://'
          );
          return (
            <Pressable key={match.id} style={styles.card}
            // onPress={() => manageTournamentHandler(match.id, match)}
            >
              <View style={styles.tournamentDetails}>
                <Image source={{ uri: sanitizedBannerUrl }} style={styles.cardImage} resizeMode='cover' />
                <View style={styles.cardContent}>
                  <Text style={styles.tournamentName}>{match.name}</Text>
                  <Icon name="delete" size={24} color="#555"
                  // onPress={() => deleteTournamentHandler(match.id)}
                  />
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <Text style={styles.tournamentContent}><Icon name="calendar-month" color="#555" size={20} /> From:  {match.startDate[2]}-{match.startDate[1]}-{match.startDate[0]}</Text>
                <Text style={styles.tournamentContent}>Overs:  {match.type}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.tournamentContent}><Icon name="calendar-month" color="#555" size={20} /> To: {match.endDate[2]}-{match.endDate[1]}-{match.endDate[0]}</Text>
                <Text style={styles.tournamentContent}><Icon name="sports-baseball" color="#555" size={20} />: {match.ballType}</Text>
              </View>
            </Pressable>
          );
        })}
        {matches.length === 0 && <Text style={styles.errorText}>No matches</Text>}
      </ScrollView>
    </>
  )
};

const LiveMatch = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);

  const getLiveMatches = async () => {
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token)
        throw new Error('Please Login Again');
      setLoading(true);
      const response = await axios.get(`https://score360-7.onrender.com/api/v1/matches/status=LIVE`, {
        // params: { status: 'LIVE' },
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(response);
      setMatches(response.data);

    } catch (err) {
      setError('Failed to load live matches');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getLiveMatches();
  }, []);

  return (
    <>
      <ScrollView contentContainerStyle={styles.cardContainer}>
        {matches.map((match) => {
          const sanitizedBannerUrl = match.banner.replace(
            'https://score360-7.onrender.com/api/v1/files/http:/',
            'https://'
          );
          return (
            <Pressable key={match.id} style={styles.card}
            // onPress={() => manageTournamentHandler(match.id, match)}
            >
              <View style={styles.tournamentDetails}>
                <Image source={{ uri: sanitizedBannerUrl }} style={styles.cardImage} resizeMode='cover' />
                <View style={styles.cardContent}>
                  <Text style={styles.tournamentName}>{match.name}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <Text style={styles.tournamentContent}><Icon name="calendar-month" color="#555" size={20} /> From:  {match.startDate[2]}-{match.startDate[1]}-{match.startDate[0]}</Text>
                <Text style={styles.tournamentContent}>Overs:  {match.type}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.tournamentContent}><Icon name="calendar-month" color="#555" size={20} /> To: {match.endDate[2]}-{match.endDate[1]}-{match.endDate[0]}</Text>
                <Text style={styles.tournamentContent}><Icon name="sports-baseball" color="#555" size={20} />: {match.ballType}</Text>
              </View>
            </Pressable>
          );
        })}
        {matches.length === 0 && <Text style={styles.errorText}>No matches</Text>}
      </ScrollView>
    </>
  )
};

const UpcomingMatch = () => {
  return (
    <>
      <Text style={{ color: 'black', marginTop: 40 }}>Upcoming match</Text>
    </>
  )
};

const PastMatch = () => {
  return (
    <>
      <Text style={{ color: 'black', marginTop: 60 }}>Past match</Text>
    </>
  )
};
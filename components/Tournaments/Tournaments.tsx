import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Button, Alert, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.searchBar}>Search for matches...</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Toggle Buttons */}
      <ScrollView style={styles.toggleContainer} horizontal={true}>
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

      {/* Tournament Cards */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        activeTab !== 'MY' ? <OthersTournaments tournaments={tournaments} /> : <MyTournaments tournaments={tournaments} />
      )}
    </View>
  );
};

export default Tournaments;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002B3D',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#002233',
  },
  filterButton: {
    padding: 5,
  },
  filterText: {
    fontSize: 20,
    color: '#fff',
  },
  searchBar: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: '#01475E',
    padding: 10,
    color: '#fff',
    borderRadius: 5,
  },
  toggleContainer: {
    marginTop: 10,
    paddingVertical: 6,
    height: 66,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    backgroundColor: '#003344',
    borderRadius: 10,
    height: 44,
  },
  activeToggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    backgroundColor: '#004E62',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  toggleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  activeToggleText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  cardContainer: {
    width: '100%',
    padding: 10,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    margin: 10,
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    padding: 10,
  },
  tournamentDetails: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 5,
    borderBottomColor: 'grey',
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
    alignItems: 'center'
  },
  tournamentName: {
    color: 'grey',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tournamentContent: {
    color: 'black',
    fontSize: 16,
    marginVertical: 2,
  },
  contentSubHeading: {
    color: 'black',
  },
  contentCols: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  maintainPadding: {
    paddingHorizontal: 6
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  myTournamentButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
    paddingHorizontal: 6
  }
});

export const OthersTournaments = ({ tournaments }) => {
  const [expandedCards, setExpandedCards] = useState({});

  const toggleCardExpansion = (cardId) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  return (
    <ScrollView contentContainerStyle={styles.cardContainer}>
      {tournaments.map((tournament) => {
        const sanitizedBannerUrl = tournament.banner.replace(
          'https://score360-7.onrender.com/api/v1/files/http:/',
          'https://'
        );
        return (
          <View key={tournament.id} style={styles.card}>
            <View style={styles.tournamentDetails}>
              <Image source={{ uri: sanitizedBannerUrl }} style={styles.cardImage} resizeMode='cover' />
              <View style={styles.cardContent}>
                <Text style={styles.tournamentName}>{tournament.name}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <Text style={styles.tournamentContent}><Icon name="calendar-month" color="black" size={20} /> From:  {tournament.startDate[2]}-{tournament.startDate[1]}-{tournament.startDate[0]}</Text>
              <Text style={styles.tournamentContent}>Overs:  {tournament.type}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.tournamentContent}><Icon name="calendar-month" color="black" size={20} /> To: {tournament.endDate[2]}-{tournament.endDate[1]}-{tournament.endDate[0]}</Text>
              <Text style={styles.tournamentContent}><Icon name="sports-baseball" color="black" size={20} />: {tournament.ballType}</Text>
            </View>
            {expandedCards[tournament.id] && (
              <>
                <View style={styles.contentCols}>
                  <Text style={styles.tournamentContent}>Matches/Day: {tournament.matchesPerDay}</Text>
                  <Text style={styles.tournamentContent}>
                    <Text style={styles.contentSubHeading}>Teams:</Text>
                    {tournament.noOfTeams}
                  </Text>
                </View>
                <View style={styles.contentCols}>
                  <Text style={styles.tournamentContent}>{tournament.format}</Text>
                  <Text style={styles.tournamentContent}>
                    <Text style={styles.contentSubHeading}>Matches:</Text>
                    {tournament.numberOfMatches}
                  </Text>
                </View>
                <Text style={[styles.tournamentContent, styles.maintainPadding]} numberOfLines={2}>
                  Teams: {tournament.teamNames && Array.isArray(tournament.teamNames)
                    ? tournament.teamNames.map((teamName) => teamName.name).join(', ')
                    : 'No teams'}
                </Text>
                <Text style={[styles.tournamentContent, styles.maintainPadding]}>
                  <Text style={styles.contentSubHeading}>Venues:</Text>
                  {tournament.venues.map((venue, index) => (
                    <Text key={index}>
                      {index > 0 && ', '}
                      {`\u00A0${venue}`}
                    </Text>
                  ))}
                </Text>
              </>
            )}
            <Button
              color="#013A50"
              title={expandedCards[tournament.id] ? 'Show Less' : 'Show More'}
              onPress={() => toggleCardExpansion(tournament.id)}
            />
          </View>
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
    navigation.navigate('ManageTournaments', { id, isCreator });
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
          <Pressable key={tournament.id} style={styles.card} onPress={() => manageTournamentHandler(tournament.id, tournament)}>
            <View style={styles.tournamentDetails}>
              <Image source={{ uri: sanitizedBannerUrl }} style={styles.cardImage} resizeMode='cover' />
              <View style={styles.cardContent}>
                <Text style={styles.tournamentName}>{tournament.name}</Text>
                <Icon name="delete" size={24} color="black" onPress={() => deleteTournamentHandler(tournament.id)} />
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <Text style={styles.tournamentContent}><Icon name="calendar-month" color="black" size={20} /> From:  {tournament.startDate[2]}-{tournament.startDate[1]}-{tournament.startDate[0]}</Text>
              <Text style={styles.tournamentContent}>Overs:  {tournament.type}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.tournamentContent}><Icon name="calendar-month" color="black" size={20} /> To: {tournament.endDate[2]}-{tournament.endDate[1]}-{tournament.endDate[0]}</Text>
              <Text style={styles.tournamentContent}><Icon name="sports-baseball" color="black" size={20} />: {tournament.ballType}</Text>
            </View>
          </Pressable>
        );
      })}
      {tournaments.length === 0 && <Text style={styles.errorText}>No matches</Text>}
    </ScrollView>
  )
}
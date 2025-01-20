import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Tournaments = () => {
  const [activeTab, setActiveTab] = useState('MY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
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
        status === 'my'
          ? `https://score360-7.onrender.com/api/v1/tournaments/user/${userUUID}`
          : `https://score360-7.onrender.com/api/v1/tournaments`;

      const response = await axios.get(endpoint, {
        params: status !== 'my' ? { status } : {},
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
    fetchTournaments(activeTab.toLowerCase());
  }, [activeTab]);

  const toggleCardExpansion = (cardId) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

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
      <View style={styles.toggleContainer}>
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
      </View>

      {/* Tournament Cards */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.cardContainer}>
          {tournaments.map((tournament) => {
            const sanitizedBannerUrl = tournament.banner.replace(
              'https://score360-7.onrender.com/api/v1/files/http:/',
              'https://'
            );
            return (
              <View key={tournament.id} style={styles.card}>
                <Image source={{ uri: sanitizedBannerUrl }} style={styles.cardImage} />
                <View style={styles.cardContent}>
                  <Text style={styles.tournamentName}>{tournament.name}</Text>
                  <Text style={styles.tournamentContent}>🗓 {tournament.startDate} to {tournament.endDate}</Text>
                </View>
                {expandedCards[tournament.id] && (
                  <>
                    <View style={styles.contentCols}>
                      <Text style={styles.tournamentContent}>⚾ {tournament.ballType}</Text>
                      <Text style={styles.tournamentContent}>{tournament.format}</Text>
                    </View>
                    <Text style={[styles.tournamentContent, styles.maintainPadding]}>
                      <Text style={styles.contentSubHeading}>Matches/Day:</Text>
                      {tournament.matchesPerDay}
                    </Text>
                    <View style={styles.contentCols}>
                      <Text style={styles.tournamentContent}>
                        <Text style={styles.contentSubHeading}>Teams:</Text>
                        {tournament.noOfTeams}
                      </Text>
                      <Text style={styles.tournamentContent}>
                        <Text style={styles.contentSubHeading}>Matches:</Text>
                        {tournament.numberOfMatches}
                      </Text>
                    </View>
                    <Text style={[styles.tournamentContent, styles.maintainPadding]} numberOfLines={2}>{tournament.teamNames}</Text>
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
        </ScrollView>
      )}
    </View>
  );
};

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
    paddingTop: 40
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
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 6,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    backgroundColor: '#003344',
    borderRadius: 10,
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
    color: '#FFF', fontSize: 16, fontWeight: 'bold'
  },
  cardContainer: {
    width: '100%',
    padding: 10,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#013A50',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    paddingBottom: 10,
  },
  cardImage: {
    width: '100%',
    justifyContent: 'flex-end',
    height: 100,
  },
  cardContent: {
    paddingHorizontal: 6,
  },
  tournamentName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'semibold',
  },
  tournamentContent: {
    color: '#c6effe',
    fontSize: 16,
    marginVertical: 2,
  },
  contentSubHeading: {
    color: 'white',
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
});

export default Tournaments;
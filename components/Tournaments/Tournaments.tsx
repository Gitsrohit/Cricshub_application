import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Pressable,
  ImageBackground,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

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
      <LinearGradient 
        colors={['#1a73e8', '#0d47a1']} 
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.searchContainer}>
          <Icon name="search" size={24} color="#fff" style={styles.searchIcon} />
          <Text style={styles.searchText}>Search for matches...</Text>
        </View>
        
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
              onPress={() => setActiveTab(tab)}
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
            <ActivityIndicator size="large" color="#1a73e8" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="error-outline" size={40} color="#ff4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          activeTab !== 'MY' ? 
            <OthersTournaments tournaments={tournaments} /> : 
            <MyTournaments tournaments={tournaments} />
        )}
      </View>
    </View>
  );
};

const OthersTournaments = ({ tournaments }) => {
  const [expandedCards, setExpandedCards] = useState({});
  const navigation = useNavigation();

  const toggleCardExpansion = (cardId) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const navigateToTournament = (tournament) => {
    navigation.navigate('TournamentDetails', { tournament });
  };

  return (
    <ScrollView contentContainerStyle={styles.tournamentsContainer}>
      {tournaments.map((tournament) => {
        const sanitizedBannerUrl = tournament.banner.replace(
          'https://score360-7.onrender.com/api/v1/files/http:/',
          'https://'
        );
        
        return (
          <Pressable 
            key={tournament.id} 
            style={styles.tournamentCard}
            onPress={() => navigateToTournament(tournament)}
          >
            <Image 
              source={{ uri: sanitizedBannerUrl }} 
              style={styles.tournamentBanner} 
              resizeMode='cover'
            />
            
            <LinearGradient
              colors={['rgba(0,0,0,0.7)', 'transparent']}
              style={styles.bannerOverlay}
            />
            
            <View style={styles.tournamentContent}>
              <Text style={styles.tournamentName}>{tournament.name}</Text>
              
              <View style={styles.tournamentMeta}>
                <View style={styles.metaItem}>
                  <Icon name="calendar-today" size={16} color="#666" />
                  <Text style={styles.metaText}>
                    {`${tournament.startDate[2]}/${tournament.startDate[1]}/${tournament.startDate[0]}`}
                  </Text>
                </View>
                
                <View style={styles.metaItem}>
                  <Icon name="sports-cricket" size={16} color="#666" />
                  <Text style={styles.metaText}>{tournament.type} overs</Text>
                </View>
              </View>
              
              <View style={styles.tournamentMeta}>
                <View style={styles.metaItem}>
                  <Icon name="flag" size={16} color="#666" />
                  <Text style={styles.metaText}>{tournament.format}</Text>
                </View>
                
                <View style={styles.metaItem}>
                  <Icon name="groups" size={16} color="#666" />
                  <Text style={styles.metaText}>{tournament.noOfTeams} teams</Text>
                </View>
              </View>
              
              {expandedCards[tournament.id] && (
                <>
                  <View style={styles.divider} />
                  
                  <View style={styles.expandedContent}>
                    <Text style={styles.sectionTitle}>Teams</Text>
                    <Text style={styles.teamList}>
                      {tournament.teamNames && Array.isArray(tournament.teamNames)
                        ? tournament.teamNames.map((teamName) => teamName.name).join(', ')
                        : 'No teams'}
                    </Text>
                    
                    <Text style={styles.sectionTitle}>Venues</Text>
                    <Text style={styles.venueList}>
                      {tournament.venues.map((venue, index) => (
                        <Text key={index}>
                          {index > 0 && ', '}
                          {venue}
                        </Text>
                      ))}
                    </Text>
                  </View>
                </>
              )}
              
              <TouchableOpacity 
                style={styles.showMoreButton}
                onPress={() => toggleCardExpansion(tournament.id)}
              >
                <Text style={styles.showMoreText}>
                  {expandedCards[tournament.id] ? 'SHOW LESS' : 'SHOW MORE'}
                </Text>
                <Icon 
                  name={expandedCards[tournament.id] ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                  size={20} 
                  color="#1a73e8" 
                />
              </TouchableOpacity>
            </View>
          </Pressable>
        );
      })}
      
      {tournaments.length === 0 && (
        <View style={styles.emptyState}>
          <Icon name="emoji-events" size={60} color="#ddd" />
          <Text style={styles.emptyText}>No tournaments available</Text>
        </View>
      )}
    </ScrollView>
  );
};

const MyTournaments = ({ tournaments }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const checkIsCreator = async (tournament) => {
    try {
      const creatorId = tournament.creatorName.id;
      const userId = await AsyncStorage.getItem('userUUID');
      return creatorId === userId;
    } catch (error) {
      console.error("Error in checkIsCreator:", error);
      return false;
    }
  };

  const manageTournamentHandler = async (id, tournament) => {
    const isCreator = await checkIsCreator(tournament);
    navigation.navigate('ManageTournaments', { id, isCreator });
  };

  const deleteTournamentHandler = async (id) => {
    Alert.alert(
      'Delete Tournament',
      'Are you sure you want to delete this tournament?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
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
    <ScrollView contentContainerStyle={styles.tournamentsContainer}>
      {tournaments.map((tournament) => {
        const sanitizedBannerUrl = tournament.banner.replace(
          'https://score360-7.onrender.com/api/v1/files/http:/',
          'https://'
        );
        
        return (
          <Pressable 
            key={tournament.id} 
            style={styles.myTournamentCard}
            onPress={() => manageTournamentHandler(tournament.id, tournament)}
          >
            <Image 
              source={{ uri: sanitizedBannerUrl }} 
              style={styles.myTournamentImage} 
              resizeMode='cover'
            />
            
            <View style={styles.myTournamentContent}>
              <View style={styles.myTournamentHeader}>
                <Text style={styles.myTournamentName}>{tournament.name}</Text>
                <TouchableOpacity onPress={() => deleteTournamentHandler(tournament.id)}>
                  <Icon name="delete" size={24} color="#ff4444" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.myTournamentDetails}>
                <View style={styles.detailRow}>
                  <Icon name="calendar-today" size={16} color="#1a73e8" />
                  <Text style={styles.detailText}>
                    {`${tournament.startDate[2]}/${tournament.startDate[1]}/${tournament.startDate[0]} - ${tournament.endDate[2]}/${tournament.endDate[1]}/${tournament.endDate[0]}`}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Icon name="sports-cricket" size={16} color="#1a73e8" />
                  <Text style={styles.detailText}>{tournament.type} overs • {tournament.ballType}</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.manageButton}
                onPress={() => manageTournamentHandler(tournament.id, tournament)}
              >
                <Text style={styles.manageButtonText}>MANAGE TOURNAMENT</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        );
      })}
      
      {tournaments.length === 0 && (
        <View style={styles.emptyState}>
          <Icon name="emoji-events" size={60} color="#ddd" />
          <Text style={styles.emptyText}>You haven't joined any tournaments yet</Text>
          <TouchableOpacity style={styles.exploreButton}>
            <Text style={styles.exploreButtonText}>EXPLORE TOURNAMENTS</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  tabContainer: {
    paddingBottom: 5,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  activeTabButton: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderWidth: 1,
    borderColor: '#fff',
  },
  tabText: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingTop: 15,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  tournamentsContainer: {
    padding: 15,
    paddingBottom: 80,
  },
  tournamentCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  tournamentBanner: {
    width: '100%',
    height: 150,
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  tournamentContent: {
    padding: 15,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  tournamentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  expandedContent: {
    marginTop: 5,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 5,
  },
  teamList: {
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  venueList: {
    color: '#666',
    lineHeight: 20,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 5,
  },
  showMoreText: {
    color: '#1a73e8',
    fontWeight: 'bold',
    marginRight: 5,
  },
  myTournamentCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  myTournamentImage: {
    width: '100%',
    height: 120,
  },
  myTournamentContent: {
    padding: 15,
  },
  myTournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  myTournamentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  myTournamentDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  manageButton: {
    backgroundColor: '#1a73e8',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  manageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 25,
  },
  exploreButton: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
  },
  exploreButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Tournaments;
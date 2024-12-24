import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Importing the FontAwesome icons

// Reusable Match Card Component
const MatchCard = ({ teamAScore, matchStatus, isLive, teamBScore, showFooter, isPastMatch }) => (
  <View style={styles.cardContainer}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>Individual Match</Text>
      <Text style={styles.cardSubTitle}>Sindri, Dhanbad | 16-Dec-24 | 6 Ov.</Text>
      {isLive && <Text style={styles.liveBadge}>LIVE°</Text>}
    </View>
    <View style={styles.cardContent}>
      <View style={styles.divider} />
      <View style={styles.teamRow}>
        <Text style={styles.teamName}>Team A</Text>
        <Text style={styles.teamScore}>{teamAScore}</Text>
      </View>

      <View style={styles.teamRow}>
        <Text style={styles.teamName}>Team B</Text>
        <Text style={styles.teamScore}>{teamBScore || matchStatus}</Text>
      </View>

    </View>
    <View style={styles.divider} />
    {isPastMatch ? (
      <Text style={styles.matchFooter}>{matchStatus}</Text>
    ) : (
      showFooter && <Text style={styles.matchFooter}>Team A won the toss and elected to bat.</Text>
    )}
  </View>
);

const CricketAppScreen = () => {
  const [searchText, setSearchText] = useState(''); // State for search input
  const [selectedTab, setSelectedTab] = useState('LIVE'); // State for active tab

  // Sample data for Match Cards
  const liveMatchData = [
    { id: '1', teamAScore: '29/0 (1.5 Ov)', matchStatus: 'Yet to bat', isLive: true },
    { id: '2', teamAScore: '45/2 (4 Ov)', matchStatus: 'Yet to bat', isLive: true },
    { id: '3', teamAScore: '60/1 (5 Ov)', matchStatus: 'Yet to bat', isLive: true },
    { id: '4', teamAScore: '29/0 (1.5 Ov)', matchStatus: 'Yet to bat', isLive: true },
  ];

  const upcomingMatchData = [
    { id: '5', teamAScore: 'Match starts at 10:00 AM', matchStatus: 'UPCOMING', isLive: false },
    { id: '6', teamAScore: 'Match starts at 2:00 PM', matchStatus: 'UPCOMING', isLive: false },
    { id: '7', teamAScore: 'Match starts at 6:00 PM', matchStatus: 'UPCOMING', isLive: false },
  ];

  const pastMatchData = [
    { id: '8', teamAScore: '150/7 (20 Ov)', teamBScore: '153/7 (19.4 Ov)', matchStatus: 'Team B won by 3 wickets', isLive: false, isPastMatch: true },
    { id: '9', teamAScore: '180/5 (20 Ov)', teamBScore: '160/8 (20 Ov)', matchStatus: 'Team A won by 20 runs', isLive: false, isPastMatch: true },
    { id: '10', teamAScore: '200/3 (20 Ov)', teamBScore: '190/6 (20 Ov)', matchStatus: 'Team A won by 10 runs', isLive: false, isPastMatch: true },
  ];

  const matchData =
    selectedTab === 'LIVE'
      ? liveMatchData
      : selectedTab === 'UPCOMING'
      ? upcomingMatchData
      : pastMatchData;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        {/* Search Input */}
        <TextInput
          style={styles.searchBar}
          placeholder="Search for matches..."
          placeholderTextColor="#666"
          value={searchText}
          onChangeText={(text) => setSearchText(text)}
        />

        <TouchableOpacity>
          <Text style={styles.filterIcon}>⚲</Text>
        </TouchableOpacity>
      </View>

      {/* Buttons Section */}
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={selectedTab === 'LIVE' ? styles.buttonSelected : styles.button}
          onPress={() => setSelectedTab('LIVE')}
        >
          <Text
            style={
              selectedTab === 'LIVE' ? styles.buttonTextSelected : styles.buttonText
            }
          >
            LIVE
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={selectedTab === 'UPCOMING' ? styles.buttonSelected : styles.button}
          onPress={() => setSelectedTab('UPCOMING')}
        >
          <Text
            style={
              selectedTab === 'UPCOMING' ? styles.buttonTextSelected : styles.buttonText
            }
          >
            UPCOMING
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={selectedTab === 'PAST' ? styles.buttonSelected : styles.button}
          onPress={() => setSelectedTab('PAST')}
        >
          <Text
            style={
              selectedTab === 'PAST' ? styles.buttonTextSelected : styles.buttonText
            }
          >
            PAST
          </Text>
        </TouchableOpacity>
      </View>

      {/* Match Cards List */}
      <FlatList
        data={matchData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MatchCard
            teamAScore={item.teamAScore}
            matchStatus={item.matchStatus}
            isLive={item.isLive}
            teamBScore={item.teamBScore}
            showFooter={!item.isPastMatch}
            isPastMatch={item.isPastMatch}
          />
        )}
        contentContainerStyle={styles.listContainer}
      />

    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003344',
    
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#002233',
    paddingTop:40
    
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    
    alignItems: 'center',
    backgroundColor: '#004466',
    borderRadius: 20,
  },
  menuIcon: { fontSize: 24, color: '#FFFFFF' },
  searchBar: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    backgroundColor: 'rgba(128, 128, 128, 0.4)',
    borderRadius: 6,
    paddingHorizontal: 10,
    marginHorizontal: 12,
  },
  filterIcon: { fontSize: 24, color: '#FFFFFF' },
  buttonSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 6,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    backgroundColor: '#003344',
    borderRadius: 20,
  },
  buttonSelected: {
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
  buttonText: { color: '#AAA', fontSize: 16 },
  buttonTextSelected: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  listContainer: {
    padding: 16,
  },
  
  cardContainer: {
    backgroundColor: '#e6f9ff',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  cardHeader: {
    marginBottom: 8,
    position: 'relative',
  },
  liveBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    color: 'red',
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#CCC',
    marginVertical: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
  },
  cardContent: {
    marginTop: 8,
  },
  cardSubTitle: {
    fontSize: 12,
    color: '#888',
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  teamName: {
    fontSize: 14,
    color: '#444',
  },
  teamScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  matchFooter: {
    marginTop: 10,
    fontSize: 12,
    color: '#777',
  },
});

export default CricketAppScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';

const { width } = Dimensions.get('window');

const FantasyCricketHome = () => {
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [selectedMatch, setSelectedMatch] = useState(0);

  // Mock cricket matches data
  const matches = [
    {
      id: 1,
      team1: 'MI',
      team2: 'CSK',
      league: 'IPL 2023',
      time: 'Today, 7:30 PM',
      team1Logo: 'https://via.placeholder.com/50/0056b3/ffffff?text=MI',
      team2Logo: 'https://via.placeholder.com/50/ff9933/000000?text=CSK',
      contestCount: 12,
      isLive: false,
      isMulti: true,
    },
    {
      id: 2,
      team1: 'RCB',
      team2: 'KKR',
      league: 'IPL 2023',
      time: 'Tomorrow, 3:30 PM',
      team1Logo: 'https://via.placeholder.com/50/ff0000/ffffff?text=RCB',
      team2Logo: 'https://via.placeholder.com/50/9900cc/ffffff?text=KKR',
      contestCount: 8,
      isLive: false,
      isMulti: true,
    },
    {
      id: 3,
      team1: 'IND',
      team2: 'AUS',
      league: 'T20 World Cup',
      time: 'Live Now',
      team1Logo: 'https://via.placeholder.com/50/000080/ffffff?text=IND',
      team2Logo: 'https://via.placeholder.com/50/ffcc00/000000?text=AUS',
      contestCount: 15,
      isLive: true,
      isMulti: false,
    },
  ];

  const contests = [
    { id: 1, name: 'Mega Contest', prize: '₹1 Crore', entry: '₹39', spots: '50,000', filled: '78%', isGuaranteed: true },
    { id: 2, name: 'Winners Take All', prize: '₹5 Lakhs', entry: '₹99', spots: '5,000', filled: '45%', isGuaranteed: false },
    { id: 3, name: 'Double Money', prize: '₹2 Lakhs', entry: '₹25', spots: '10,000', filled: '92%', isGuaranteed: true },
  ];

  const tabs = ['Upcoming', 'Live', 'Completed'];

  const renderMatchCard = ({ item, index }) => (
    <TouchableOpacity 
      style={[
        styles.matchCard, 
        selectedMatch === index && styles.selectedMatchCard
      ]}
      onPress={() => setSelectedMatch(index)}
    >
      <View style={styles.matchHeader}>
        <Text style={styles.leagueText}>{item.league}</Text>
        {item.isLive && <View style={styles.liveBadge}><Text style={styles.liveText}>LIVE</Text></View>}
        {item.isMulti && <Text style={styles.multiText}>MULTI</Text>}
      </View>
      <View style={styles.teamsContainer}>
        <View style={styles.team}>
          <Image source={{ uri: item.team1Logo }} style={styles.teamLogo} />
          <Text style={styles.teamName}>{item.team1}</Text>
        </View>
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
          <Text style={styles.matchTime}>{item.time}</Text>
        </View>
        <View style={styles.team}>
          <Image source={{ uri: item.team2Logo }} style={styles.teamLogo} />
          <Text style={styles.teamName}>{item.team2}</Text>
        </View>
      </View>
      <View style={styles.contestInfo}>
        <Text style={styles.contestCount}>{item.contestCount} Contests</Text>
        <TouchableOpacity style={styles.createTeamButton}>
          <Text style={styles.createTeamText}>CREATE TEAM</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderContestCard = ({ item }) => (
    <TouchableOpacity style={styles.contestCard}>
      <View style={styles.contestHeader}>
        <Text style={styles.contestName}>{item.name}</Text>
        {item.isGuaranteed && <Text style={styles.guaranteedText}>Guaranteed</Text>}
      </View>
      <View style={styles.prizeContainer}>
        <View>
          <Text style={styles.prizeLabel}>Prize Pool</Text>
          <Text style={styles.prizeAmount}>{item.prize}</Text>
        </View>
        <View>
          <Text style={styles.prizeLabel}>Entry</Text>
          <Text style={styles.entryAmount}>{item.entry}</Text>
        </View>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${item.filled}` }]} />
      </View>
      <View style={styles.contestFooter}>
        <Text style={styles.spotsText}>{item.spots} spots</Text>
        <Text style={styles.filledText}>{item.filled} filled</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1a73e8" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerText}>Fantasy Cricket</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerButtonText}>₹100</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerButtonText}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab,
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
      </View>

      <ScrollView>
        {/* Matches */}
        <FlatList
          data={matches}
          renderItem={renderMatchCard}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.matchList}
        />

        {/* Selected Match Info */}
        <View style={styles.selectedMatchInfo}>
          <Text style={styles.selectedMatchTitle}>Contests for {matches[selectedMatch].team1} vs {matches[selectedMatch].team2}</Text>
          <TouchableOpacity style={styles.myTeamsButton}>
            <Text style={styles.myTeamsText}>MY TEAMS (0)</Text>
          </TouchableOpacity>
        </View>

        {/* Contests */}
        <FlatList
          data={contests}
          renderItem={renderContestCard}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          contentContainerStyle={styles.contestList}
        />

        {/* Practice Section */}
        <View style={styles.practiceContainer}>
          <Text style={styles.sectionTitle}>Practice Contests</Text>
          <View style={styles.practiceCard}>
            <Text style={styles.practiceText}>Create your free team and win cash prizes</Text>
            <TouchableOpacity style={styles.practiceButton}>
              <Text style={styles.practiceButtonText}>PLAY FREE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1a73e8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: 10,
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerButton: {
    backgroundColor: '#4285f4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 10,
  },
  headerButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a73e8',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: 'white',
  },
  tabText: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: 'white',
  },
  matchList: {
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  matchCard: {
    width: width * 0.8,
    backgroundColor: 'white',
    borderRadius: 8,
    marginRight: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedMatchCard: {
    borderWidth: 1,
    borderColor: '#1a73e8',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  leagueText: {
    color: '#333',
    fontWeight: 'bold',
  },
  liveBadge: {
    backgroundColor: 'red',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  multiText: {
    color: '#1a73e8',
    fontWeight: 'bold',
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  team: {
    alignItems: 'center',
    flex: 1,
  },
  teamLogo: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  teamName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  vsContainer: {
    alignItems: 'center',
  },
  vsText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#777',
  },
  matchTime: {
    fontSize: 12,
    color: '#1a73e8',
    marginTop: 5,
  },
  contestInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  contestCount: {
    color: '#777',
    fontSize: 12,
  },
  createTeamButton: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 4,
  },
  createTeamText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  selectedMatchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    marginVertical: 10,
  },
  selectedMatchTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  myTeamsButton: {
    borderWidth: 1,
    borderColor: '#1a73e8',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 4,
  },
  myTeamsText: {
    color: '#1a73e8',
    fontWeight: 'bold',
    fontSize: 12,
  },
  contestList: {
    paddingHorizontal: 15,
  },
  contestCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  contestName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  guaranteedText: {
    color: '#1a73e8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  prizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  prizeLabel: {
    color: '#777',
    fontSize: 12,
  },
  prizeAmount: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  entryAmount: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1a73e8',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#eee',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#1a73e8',
    borderRadius: 3,
  },
  contestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  spotsText: {
    color: '#777',
    fontSize: 12,
  },
  filledText: {
    color: '#1a73e8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  practiceContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  practiceCard: {
    backgroundColor: '#e8f0fe',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  practiceText: {
    flex: 1,
    color: '#1a73e8',
    fontWeight: 'bold',
  },
  practiceButton: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
  },
  practiceButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default FantasyCricketHome;
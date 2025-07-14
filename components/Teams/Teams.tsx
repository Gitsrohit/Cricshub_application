import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
<<<<<<< HEAD
  ImageBackground,
=======
>>>>>>> b04f0d0849597361c8765a299f92ba41369754c2
  StatusBar,
  RefreshControl,
  Animated,
  Easing,
  Dimensions
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from 'react-native-vector-icons/MaterialIcons';
import LottieView from 'lottie-react-native';
import apiService from "../APIservices";

const { width } = Dimensions.get('window');
const loaderAnimation = require('../../assets/loader.json');
const emptyTeamsAnimation = require('../../assets/empty.json');

const TeamPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const navigation = useNavigation();

  useEffect(() => {
    fetchTeams();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("userUUID");

      const response = await apiService({
        endpoint: "teams",
        method: "GET",
      });

      if (response.success && response.data?.data) {
        const filteredTeams = response.data.data.filter(
          (team) =>
            team.creator?.id === userId ||
            team.captain?.id === userId ||
            team.players?.some((player) => player?.id === userId)
        );
        setTeams(filteredTeams);
      } else {
        console.error("Failed to fetch teams:", response.error);
      }
    } catch (err) {
      console.error("Error fetching teams:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleTeamPress = async (teamId) => {
    navigation.navigate("TeamDetailsScreen", { teamId: teamId });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTeams();
  };

<<<<<<< HEAD
  const renderTeamCard = ({ item }) => (
    <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
      <TouchableOpacity
        onPress={() => handleTeamPress(item.id)}
        style={styles.card}
        activeOpacity={0.7}
      >
        <View style={styles.cardGradient}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.9)', 'rgba(240, 248, 255, 0.8)']}
            style={styles.gradientBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        </View>

        <View style={styles.cardContent}>
          <Image
            source={{ uri: item.logoPath || "https://via.placeholder.com/60x60" }}
            style={styles.teamLogo}
          // defaultSource={require('../../assets/images/team-placeholder.png')}
          />
          <View style={styles.teamInfo}>
            <Text style={styles.teamName} numberOfLines={1}>{item.name || "N/A"}</Text>
            <View style={styles.teamMeta}>
=======
  const renderTeamCard = ({ item, index }) => {
    const cardColor = index % 2 === 0 ? '#E1F5FE' : '#E8F5E9';
    const borderColor = index % 2 === 0 ? '#B3E5FC' : '#C8E6C9';

    return (
      <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity
          onPress={() => handleTeamPress(item.id)}
          style={[styles.card, { backgroundColor: cardColor, borderColor }]}
          activeOpacity={0.7}
        >
          <View style={styles.cardContent}>
            <Image
              source={{ uri: item.logoPath || "https://via.placeholder.com/60x60" }}
              style={styles.teamLogo}
            />
            <View style={styles.teamInfo}>
              <View style={styles.teamNameAndMembers}>
                <Text style={styles.teamName} numberOfLines={1}>{item.name || "N/A"}</Text>
                <View style={styles.memberContainer}>
                  <Icon name="people" size={14} color="#34B8FF" style={styles.peopleIcon} />
                  <Text style={styles.memberCount}>
                    {item.players?.length || 0}
                  </Text>
                </View>
              </View>
>>>>>>> b04f0d0849597361c8765a299f92ba41369754c2
              <View style={styles.captainContainer}>
                <Icon name="copyright" size={14} color="#005a7f" style={styles.copyrightIcon} />
                <Text style={styles.captain}>{item.captain?.name || "Unknown"}</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={24} color="#34B8FF" />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <LottieView
          source={loaderAnimation}
          autoPlay
          loop
          style={styles.loaderAnimation}
        />
      </View>
    );
  }

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#34B8FF"
        translucent={true}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.heading}>My Teams</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateTeam')}
            activeOpacity={0.7}
          >
            <Icon name="add" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>

        {teams.length > 0 ? (
          <FlatList
            data={teams}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTeamCard}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#34B8FF']}
                tintColor="#34B8FF"
              />
            }
            ListFooterComponent={<View style={styles.listFooter} />}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <LottieView
              source={emptyTeamsAnimation}
              autoPlay
              loop={false}
              style={styles.emptyAnimation}
            />
            <Text style={styles.emptyTitle}>No Teams Found</Text>
            <Text style={styles.emptySubtitle}>Create your first team to get started</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('CreateTeam')}
              activeOpacity={0.8}
            >
              <View style={[styles.createButtonSolid, { backgroundColor: '#34B8FF' }]}>
                <Icon name="add" size={24} color="#FFF" />
                <Text style={styles.createButtonText}>Create Team</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#34B8FF',
    paddingTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
<<<<<<< HEAD
    paddingTop: 50,
=======
>>>>>>> b04f0d0849597361c8765a299f92ba41369754c2
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    padding: 8,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
    textAlign: "center",
    flex: 1,
  },
  addButton: {
    padding: 8,
  },
  cardContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    height: 100,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: '#FFF',
    marginRight: 16,
  },
  teamInfo: {
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  teamNameAndMembers: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  teamName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#003b5c",
    flexShrink: 1,
    marginRight: 10,
  },
  teamMeta: { 
    flexDirection: 'row',
    alignItems: 'center',
  },
  captainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 90, 127, 0.1)', 
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  copyrightIcon: {
    marginRight: 4,
  },
  captain: {
    fontSize: 13,
    fontWeight: '600',
    color: "#005a7f",
  },
  memberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 184, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  peopleIcon: {
    marginRight: 4,
  },
  memberCount: {
    fontSize: 13,
    fontWeight: '600',
    color: "#005a7f",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#FFF'
  },
  loaderAnimation: {
    width: 150,
    height: 150,
  },
  listContent: {
    paddingBottom: 20,
    paddingTop: 10,
  },
  listFooter: {
    height: 30,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
  },
  emptyAnimation: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#005a7f',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  createButton: {
    width: '100%',
    maxWidth: 300,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonSolid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  createButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 10,
  },
});
export default TeamPage;
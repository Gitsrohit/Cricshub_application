import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, ImageBackground, StatusBar, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Icon from 'react-native-vector-icons/MaterialIcons';
import apiService from "../APIservices";
const backgroundImage = require('../../assets/images/cricsLogo.png');

const TeamPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchTeams();
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
    }
  };

  const handleTeamPress = async (teamId) => {
    try {
      const response = await apiService({
        endpoint: `teams/${teamId}`,
        method: "GET",
      });

      if (response.success && response.data?.data) {
        navigation.navigate("TeamDetailsScreen", { team: response.data.data });
      } else {
        console.error("Failed to fetch team details:", response.error);
      }
    } catch (err) {
      console.error("Error fetching team details:", err);
    }
  };

  const renderTeamCard = ({ item }) => (
    <TouchableOpacity onPress={() => handleTeamPress(item.id)} style={styles.card}>
      <Image
        source={{ uri: item.logoPath || "https://via.placeholder.com/60x60" }}
        style={styles.teamLogo}
      />
      <View style={styles.teamInfo}>
        <Text style={styles.teamName}>{item.name || "N/A"}</Text>
        <Text style={styles.captain}>Captain: {item.captain?.name || "Unknown"}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#005a7f" />
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
      <LinearGradient colors={['rgba(0, 0, 0, 0.2)', 'rgba(54, 176, 303, 0.1)']} style={styles.gradientOverlay}>
        <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
          <BlurView intensity={50} tint="light" style={styles.container}>
            {teams.length > 0 ? (
              <FlatList
                data={teams}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={() =>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: 30 }}>
                    <TouchableOpacity
                      style={{ padding: 5 }}
                      onPress={() => navigation.goBack()}
                      activeOpacity={0.7}
                    >
                      <Icon name="arrow-back" size={32} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.heading}>Teams</Text>
                  </View>
                }
                renderItem={renderTeamCard}
              />
            ) : (
              <View style={styles.fullWidthCardContainer}>
                <View
                  style={[
                    styles.createTeamCard,
                    styles.fullWidthCard
                  ]}
                >
                  <LinearGradient
                    colors={["#0866AA", "#6BB9F0"]}
                    style={styles.cardBackground}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Icon
                      name='group'
                      size={40}
                      color="#FFF"
                      style={styles.cardIcon}
                    />
                    <Text style={styles.createTeamCardTitle}>Create a Team</Text>
                    <TouchableOpacity
                      style={styles.cardButton}
                      onPress={() => navigation.navigate('CreateTeam')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.cardButtonText}>
                        Create
                      </Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              </View>
            )}
          </BlurView>
        </ImageBackground>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    opacity: 0.8
  },
  gradientOverlay: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20
  },
  heading: {
    width: '75%',
    fontSize: 22,
    fontWeight: "bold",
    color: "#005a7f",
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 15, borderRadius: 10, marginBottom: 10, alignItems: "center"
  },
  teamLogo: { width: 60, height: 60, borderRadius: 30, marginRight: 10 },
  teamInfo: { flex: 1 },
  teamName: { fontSize: 18, fontWeight: "bold", color: "#003b5c" },
  captain: { fontSize: 14, color: "#666" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  noTeamsText: { color: "#003b5c", textAlign: "center", marginTop: 20, fontSize: 16 },
  fullWidthCardContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: StatusBar?.currentHeight || 0,
    width: "100%",
  },
  createTeamCard: {
    // flex: 1,
    borderRadius: 15,
    margin: 10,
    height: 180,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  cardBackground: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  cardIcon: {
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 10,
    textAlign: "center",
  },
  cardButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FFF",
  },
  cardButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  createTeamCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 10,
    textAlign: "center",
  },
});

export default TeamPage;


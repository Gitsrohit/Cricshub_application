import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, ImageBackground, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
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
      const userId = await AsyncStorage.getItem('userUUID');
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await axios.get("https://score360-7.onrender.com/api/v1/teams", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const filteredTeams = response.data.data.filter((team) =>
        team.creator.id === userId ||
        team.captain.id === userId ||
        team.players.some((player) => player?.id === userId)
      );

      setTeams(filteredTeams);
    } catch (err) {
      console.error("Error fetching teams:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamPress = async (teamId) => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await axios.get(`https://score360-7.onrender.com/api/v1/teams/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigation.navigate("TeamDetailsScreen", { team: response.data.data });
    } catch (err) {
      console.error("Error fetching team details:", err.response?.data || err.message);
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
                ListHeaderComponent={() => <Text style={styles.heading}>Teams</Text>}
                renderItem={renderTeamCard}
              />
            ) : (
              <Text style={styles.noTeamsText}>No teams available</Text>
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
  heading: { fontSize: 22, fontWeight: "bold", color: "#005a7f", textAlign: "center", marginBottom: 10, marginTop: 30 },
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
});

export default TeamPage;


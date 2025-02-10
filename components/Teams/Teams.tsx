import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TeamPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await axios.get("https://score360-7.onrender.com/api/v1/teams", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTeams(response.data.data);
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
    <View style={styles.container}>
      <Text style={styles.heading}>Teams</Text>
      {teams.length > 0 ? (
        <FlatList
          data={teams}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTeamCard}
        />
      ) : (
        <Text style={styles.noTeamsText}>No teams available</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#003b5c", padding: 20},
  heading: { fontSize: 22, fontWeight: "bold", color: "#fff", textAlign: "center", marginBottom: 10 },
  card: { flexDirection: "row", backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 10, alignItems: "center" },
  teamLogo: { width: 60, height: 60, borderRadius: 30, marginRight: 10 },
  teamInfo: { flex: 1 },
  teamName: { fontSize: 18, fontWeight: "bold", color: "#003b5c" },
  captain: { fontSize: 14, color: "#666" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  noTeamsText: { color: "#fff", textAlign: "center", marginTop: 20, fontSize: 16 },
});

export default TeamPage;


import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Image,
  Modal,
  ActivityIndicator,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign } from "@expo/vector-icons";

const TeamDetailsScreen = ({ route }) => {
  const { team } = route.params;
  const [players, setPlayers] = useState(team.players || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const slideAnim = useRef(new Animated.Value(500)).current; 

  useEffect(() => {
    if (modalVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 500,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [modalVisible]);

  const fetchPlayers = async (query) => {
    if (!query.trim()) return; // Prevent empty search
    setLoading(true);
  
    try {
      const token = await AsyncStorage.getItem("jwtToken");

      const responses = await Promise.all([
        axios.get(`https://score360-7.onrender.com/api/v1/teams/players/search/name?name=${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`https://score360-7.onrender.com/api/v1/teams/players/search/phone?phone=${query}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
  
      const [nameResponse, phoneResponse] = responses;
  

      setSearchResults([
        ...nameResponse.data.data,
        ...phoneResponse.data.data,
      ]);
  
    } catch (err) {
      console.error("Error fetching players:", err);
      Alert.alert("Error", "Failed to fetch players.");
    } finally {
      setLoading(false);
    }
  };
  
  const addPlayer = async (player) => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const userId = await AsyncStorage.getItem("userId");
      await axios.post(
        `https://score360-7.onrender.com/api/v1/teams/${team.id}/${userId}`,
        { playerId: player.id, action: "Add" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPlayers([...players, player]);
      setModalVisible(false);
      Alert.alert("Success", "Player added successfully!");
    } catch (err) {
      console.error("Error adding player:", err);
      Alert.alert("Error", "Failed to add player.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.teamName}>{team.name}</Text>
      <FlatList
        data={players}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.playerCard}>
            {item.profilePic ? (
              <Image source={{ uri: item.profilePic }} style={styles.profilePic} />
            ) : null}
            <Text style={styles.playerName}>{item.name}</Text>
          </View>
        )}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>Add Player</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="none">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.searchBox}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search player..."
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    fetchPlayers(text);
                  }}
                />
                <AntDesign name="search1" size={20} color="gray" style={styles.searchIcon} />
              </View>
              {loading ? (
                <ActivityIndicator size="large" color="#000" />
              ) : (
                <FlatList
  data={searchResults}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <TouchableOpacity style={styles.searchResultItem} onPress={() => addPlayer(item)}>
      <Image
        source={
          item.profilePic
            ? { uri: item.profilePic }
            : require("../../assets/user_profile.png") 
        }
        style={styles.searchProfilePic}
      />
      <Text style={styles.playerName}>{item.name}</Text>
    </TouchableOpacity>
  )}
/>

              )}
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#003b5c" },
  teamName: { fontSize: 22, fontWeight: "bold", color: "#fff", textAlign: "center", marginBottom: 10 },
  playerCard: { flexDirection: "row", alignItems: "center", padding: 15, backgroundColor: "#f5f5f5", borderRadius: 10, marginBottom: 10 },
  profilePic: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  playerName: { fontSize: 18, color: "#333" },
  addButton: { backgroundColor: "#005a7f", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 10 },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "100%",
  },
  searchProfilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10, 
  },
  
  
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: {
    backgroundColor: "#fff",
    width: "100%",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 250,
    maxHeight: 400,
    alignItems: "center",
  },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#f0f0f0", borderRadius: 25, padding: 10, width: "90%" },
  searchInput: { flex: 1, paddingHorizontal: 10, fontSize: 16, color: "#333" },
  searchIcon: { padding: 5 },
  closeButton: { marginTop: 10, backgroundColor: "#d9534f", padding: 10, borderRadius: 5, width: "90%", alignItems: "center" },
  closeButtonText: { color: "#fff", fontWeight: "bold" },
});

export default TeamDetailsScreen;

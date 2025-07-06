import React, { useState, useEffect, useRef, useCallback } from "react";
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
  StatusBar,
  ImageBackground,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import apiService from "../APIservices";
const background = require('../../assets/images/cricsLogo.png');

const TeamDetailsScreen = ({ route }) => {
  const { team } = route.params;
  const [players, setPlayers] = useState(team.players || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const slideAnim = useRef(new Animated.Value(500)).current;
  const [canEdit, setCanEdit] = useState(false);

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

  const roleCheck = async () => {
    const userId = await AsyncStorage.getItem('userUUID');
    setCanEdit(userId === team.creator.id || userId === team.captain.id);
  }

  useEffect(() => {
    roleCheck();
  }, [])

  function debounce(func, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  const debouncedFetchPlayers = useCallback(
    debounce(async (query) => {
      if (!query.trim()) return;
      setLoading(true);
      try {
        const [nameRes, phoneRes] = await Promise.all([
          apiService({
            endpoint: 'teams/players/search/name',
            method: 'GET',
            params: { name: query.trim() },
          }),
          apiService({
            endpoint: 'teams/players/search/phone',
            method: 'GET',
            params: { phone: query.trim() },
          }),
        ]);

        const nameData = nameRes.success ? nameRes.data.data || [] : [];
        const phoneData = phoneRes.success ? phoneRes.data.data || [] : [];

        // Optional: avoid duplicate players
        const merged = [...nameData, ...phoneData];
        const uniquePlayers = Array.from(
          new Map(merged.map(player => [player.id, player])).values()
        );

        setSearchResults(uniquePlayers);
      } catch (err) {
        console.error('Error fetching players:', err);
        Alert.alert('Error', 'Failed to fetch players.');
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  const handleInputChange = (value) => {
    debouncedFetchPlayers(value);
  };

  const addPlayer = async (player) => {
    try {
      const response = await apiService({
        endpoint: `teams/${team.id}/${player.id}`,
        method: 'PUT',
        body: { playerId: player.id, action: 'Add' },
      });

      if (response.success) {
        setPlayers((prev) => [...prev, player]);
        setModalVisible(false);
        Alert.alert('Success', 'Player added successfully!');
      } else {
        console.error('API Error:', response.error);
        Alert.alert('Error', response.error?.message || 'Failed to add player.');
      }
    } catch (err) {
      console.error('Error adding player:', err);
      Alert.alert('Error', 'Failed to add player.');
    }
  };

  return (
    <>
      <StatusBar />
      <LinearGradient
        colors={['#000000', '#0A303B', '#36B0D5']}
        style={styles.gradient}
      >
        <ImageBackground
          source={background}
          style={styles.background}
          imageStyle={styles.backgroundImage}
        >
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
                          handleInputChange(text);
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
          {canEdit &&
            <TouchableOpacity style={styles.addButton} onPress={() => { if (canEdit) setModalVisible(true) }}>
              <Text style={styles.addButtonText}>Add Player</Text>
            </TouchableOpacity>
          }
        </ImageBackground>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    resizeMode: 'cover',
    opacity: 0.8,
  },
  container: {
    width: '80%',
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: '#fff',
    borderRadius: 15,
    flex: 1,
    marginTop: 40
  },
  teamName: { fontSize: 22, fontWeight: "bold", color: "#005a7f", textAlign: "center", marginBottom: 10 },
  playerCard: { flexDirection: "row", alignItems: "center", padding: 15, backgroundColor: "#36B0D5", borderRadius: 10, marginBottom: 10 },
  profilePic: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  playerName: { fontSize: 16, color: "#333" },
  addButton: { backgroundColor: "#005a7f", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 10, marginBottom: 20 },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    width: '100%'
  },
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
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)"
  },
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
  searchIcon: { padding: 5, color: "#003b5c" },
  closeButton: { marginTop: 10, backgroundColor: "#003b5c", padding: 10, borderRadius: 5, width: "90%", alignItems: "center" },
  closeButtonText: { color: "#fff", fontWeight: "bold" },
});

export default TeamDetailsScreen;

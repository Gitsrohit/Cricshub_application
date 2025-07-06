import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ImageBackground,
  Pressable,
  Modal,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import apiService from "../APIservices";

const SelectPlayingXI = ({ route }) => {
  const navigation = useNavigation();
  const { matchDetails, matchId } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [team1Details, setTeam1Details] = useState(null);
  const [team2Details, setTeam2Details] = useState(null);
  const [selectedTeam1, setSelectedTeam1] = useState([]);
  const [selectedTeam2, setSelectedTeam2] = useState([]);
  const [team1ModalVisible, setTeam1ModalVisible] = useState(true);
  const [team2ModalVisible, setTeam2ModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTeam1Players, setFilteredTeam1Players] = useState([]);
  const [filteredTeam2Players, setFilteredTeam2Players] = useState([]);

  const fetchTeamsDetails = async () => {
    const token = await AsyncStorage.getItem("jwtToken");
    if (!token) {
      setError("Please login again");
      return;
    }

    try {
      const [response1, response2] = await Promise.all([
        apiService({
          endpoint: `teams/${matchDetails.team1Id}`,
          method: 'GET',
        }),
        apiService({
          endpoint: `teams/${matchDetails.team2Id}`,
          method: 'GET',
        }),
      ]);

      if (response1.success && response2.success) {
        setTeam1Details(response1.data.data);
        setTeam2Details(response2.data.data);
        setFilteredTeam1Players(response1.data.data.players);
        setFilteredTeam2Players(response2.data.data.players);
      } else {
        setError("Sorry, unable to fetch one or both team details");
      }
    } catch (err) {
      setError("Sorry, unable to fetch team details");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamsDetails();
  }, []);

  const handleSearch = (query, team) => {
    setSearchQuery(query);
    const players = team === 1 ? team1Details.players : team2Details.players;
    const filtered = players.filter((player) =>
      player.name.toLowerCase().includes(query.toLowerCase())
    );
    team === 1
      ? setFilteredTeam1Players(filtered)
      : setFilteredTeam2Players(filtered);
  };

  const togglePlayerSelection = (team, playerId) => {
    const selectedTeam = team === 1 ? selectedTeam1 : selectedTeam2;
    const setSelectedTeam = team === 1 ? setSelectedTeam1 : setSelectedTeam2;

    setSelectedTeam((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : prev.length < 11
          ? [...prev, playerId]
          : prev
    );
  };

  const renderPlayerItem = ({ item, team }) => {
    const isSelected = (team === 1 ? selectedTeam1 : selectedTeam2).includes(
      item.id
    );
    return (
      <TouchableOpacity
        style={[styles.playerButton, isSelected && styles.selectedPlayer]}
        onPress={() => togglePlayerSelection(team, item.id)}
      >
        <View style={styles.playerInfoContainer}>
          <View style={styles.profileIconContainer}>
            <Image
              source={require("../../assets/defaultLogo.png")}
              style={styles.userImage}
            />
          </View>

          <Text
            style={[styles.playerText, isSelected && styles.selectedPlayerText]}
          >
            {item.name}
          </Text>
        </View>
        {isSelected && (
          <MaterialIcons
            name="check-circle"
            size={24}
            color="#fff"
            style={styles.checkIcon}
          />
        )}
      </TouchableOpacity>
    );
  };

  const handleStartMatch = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("Please login again");

      const response = await apiService({
        endpoint: `matches/${matchId}/start`,
        method: 'POST',
        body: {
          tournamentId: null,
          team1PlayingXIIds: selectedTeam1,
          team2PlayingXIIds: selectedTeam2,
        },
      });

      if (response.success) {
        setTeam1ModalVisible(false);
        setTeam2ModalVisible(false);
        navigation.navigate("Toss", { matchDetails, matchId });
      } else {
        setError("Failed to start match");
        setTeam2ModalVisible(true);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to start match");
      setTeam2ModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E83D1" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchTeamsDetails}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#000000", "#0A303B", "#36B0D5"]}
        style={styles.gradient}
      >
        <ImageBackground
          source={require("../../assets/images/cricsLogo.png")}
          resizeMode="cover"
          style={styles.background}
          imageStyle={styles.backgroundImage}
        >
          {/* Team 1 Selection Modal - Only show if team1ModalVisible is true and team2ModalVisible is false */}
          {team1ModalVisible && !team2ModalVisible && (
            <Modal visible={true} transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>
                    {team1Details?.name} - Select Playing XI
                  </Text>
                  <Text style={styles.selectedCount}>
                    Selected: {selectedTeam1.length}/11
                  </Text>

                  <TextInput
                    style={styles.searchBar}
                    placeholder="Search players..."
                    value={searchQuery}
                    onChangeText={(query) => handleSearch(query, 1)}
                  />

                  <FlatList
                    data={filteredTeam1Players}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => renderPlayerItem({ item, team: 1 })}
                    contentContainerStyle={styles.playerList}
                  />

                  <Pressable
                    style={[
                      styles.nextButton,
                      selectedTeam1.length !== 11 && styles.disabledButton,
                    ]}
                    onPress={() => {
                      setTeam1ModalVisible(false);
                      setTeam2ModalVisible(true);
                      setSearchQuery("");
                    }}
                    disabled={selectedTeam1.length !== 11}
                  >
                    <Text style={styles.nextButtonText}>
                      Continue to {team2Details?.name}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
          )}

          {/* Team 2 Selection Modal - Only show if team2ModalVisible is true */}
          {team2ModalVisible && (
            <Modal visible={true} transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>
                    {team2Details?.name} - Select Playing XI
                  </Text>
                  <Text style={styles.selectedCount}>
                    Selected: {selectedTeam2.length}/11
                  </Text>

                  <TextInput
                    style={styles.searchBar}
                    placeholder="Search players..."
                    value={searchQuery}
                    onChangeText={(query) => handleSearch(query, 2)}
                  />

                  <FlatList
                    data={filteredTeam2Players}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => renderPlayerItem({ item, team: 2 })}
                    contentContainerStyle={styles.playerList}
                  />

                  <Pressable
                    style={[
                      styles.nextButton,
                      selectedTeam2.length !== 11 && styles.disabledButton,
                    ]}
                    onPress={handleStartMatch}
                    disabled={selectedTeam2.length !== 11 || isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.nextButtonText}>Start Match</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            </Modal>
          )}
        </ImageBackground>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  gradient: {
    flex: 1,
    width: "100%",
  },
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    opacity: 0.8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#2E83D1",
    padding: 15,
    borderRadius: 8,
    width: "50%",
    alignItems: "center",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "90%",
    height: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    color: "#333",
  },
  selectedCount: {
    textAlign: "center",
    marginBottom: 15,
    color: "#666",
    fontSize: 16,
  },
  searchBar: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  playerList: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  playerButton: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedPlayer: {
    backgroundColor: "#2E83D1",
  },
  playerInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  playerProfileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: "#e0e0e0",
  },
  profileIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  playerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flexShrink: 1,
  },
  selectedPlayerText: {
    color: "#fff",
  },
  checkIcon: {
    marginLeft: 10,
  },
  nextButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#2E83D1",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 40,
    marginBottom: 5,
  },
});

export default SelectPlayingXI;
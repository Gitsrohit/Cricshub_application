import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  ImageBackground,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Performance = () => {
  const [playerData, setPlayerData] = useState({
    careerStats: {
      matchesPlayed: 0,
      hundreds: 0,
      fifties: 0,
      runsScored: 0,
      highestScore: "N/A",
      battingAverage: "N/A",
      strikeRate: "N/A",
      ballsFaced: 0,
      bowlingAverage: "N/A",
      economyRate: "N/A",
      overs: 0,
      ballsBowled: 0,
      bestBowlingFigures: "N/A",
      catchesTaken: 0,
      totalOuts: 0
    },
    totalSixes: 0,
    totalFours: 0,
    totalWickets: 0,
    role: "Player",
    name: "Player Name",
    email: "player@example.com",
    logoPath: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    fetchPlayerData();
  }, []);

  const fetchPlayerData = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("Authentication required");

      const response = await axios.get(
        "https://score360-7.onrender.com/api/v1/profile/current",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;
      setPlayerData({
        ...data,
        careerStats: {
          matchesPlayed: data.careerStats?.matchesPlayed || 0,
          hundreds: data.careerStats?.hundreds || 0,
          fifties: data.careerStats?.fifties || 0,
          runsScored: data.careerStats?.runsScored || 0,
          highestScore: data.careerStats?.highestScore || "N/A",
          battingAverage: data.careerStats?.battingAverage || "N/A",
          strikeRate: data.careerStats?.strikeRate || "N/A",
          ballsFaced: data.careerStats?.ballsFaced || 0,
          bowlingAverage: data.careerStats?.bowlingAverage || "N/A",
          economyRate: data.careerStats?.economyRate || "N/A",
          overs: data.careerStats?.overs || 0,
          ballsBowled: data.careerStats?.ballsBowled || 0,
          bestBowlingFigures: data.careerStats?.bestBowlingFigures || "N/A",
          catchesTaken: data.careerStats?.catchesTaken || 0,
          totalOuts: data.careerStats?.totalOuts || 0
        },
        totalSixes: data.totalSixes || 0,
        totalFours: data.totalFours || 0,
        totalWickets: data.totalWickets || 0,
        role: data.role || "Player",
        name: data.name || "Player Name",
        email: data.email || "player@example.com",
        logoPath: data.logoPath || null
      });

      animateContent();
    } catch (err) {
      setError(err.message || "Failed to load player data");
    } finally {
      setLoading(false);
    }
  };

  const animateContent = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  const renderStatCard = (value, label, iconName) => (
    <View style={styles.statCard}>
      <Icon name={iconName} size={20} color="#3498db" style={styles.statIcon} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderTabContent = () => {
    const { careerStats } = playerData;

    switch (activeTab) {
      case "overview":
        return (
          <View style={styles.tabContent}>
            <View style={styles.statsRow}>
              {renderStatCard(
                careerStats.matchesPlayed.toString(),
                "Matches",
                "calendar"
              )}
              {renderStatCard(
                careerStats.hundreds.toString(),
                "Centuries",
                "trophy"
              )}
              {renderStatCard(
                careerStats.fifties.toString(),
                "Half-Centuries",
                "star-half-o"
              )}
            </View>
            <View style={styles.statsRow}>
              {renderStatCard(
                careerStats.runsScored.toString(),
                "Runs",
                "bolt"
              )}
              {renderStatCard(
                playerData.totalSixes.toString(),
                "Sixes",
                "arrow-up"
              )}
              {renderStatCard(
                playerData.totalFours.toString(),
                "Fours",
                "arrow-right"
              )}
            </View>
          </View>
        );
      case "detailed":
        return (
          <View style={styles.tabContent}>
            <View style={styles.detailCard}>
              <View style={styles.sectionHeader}>
                <Icon name="trophy" size={20} color="#FFD700" />
                <Text style={styles.detailTitle}>Batting Statistics</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Highest Score:</Text>
                <Text style={styles.detailValue}>{careerStats.highestScore}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Batting Average:</Text>
                <Text style={styles.detailValue}>{careerStats.battingAverage}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Strike Rate:</Text>
                <Text style={styles.detailValue}>{careerStats.strikeRate}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Balls Faced:</Text>
                <Text style={styles.detailValue}>{careerStats.ballsFaced}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fifties:</Text>
                <Text style={styles.detailValue}>{careerStats.fifties}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Hundreds:</Text>
                <Text style={styles.detailValue}>{careerStats.hundreds}</Text>
              </View>
            </View>

            <View style={styles.detailCard}>
              <View style={styles.sectionHeader}>
                <Icon name="bullseye" size={20} color="#FF6347" />
                <Text style={styles.detailTitle}>Bowling Statistics</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Wickets:</Text>
                <Text style={styles.detailValue}>{playerData.totalWickets}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Bowling Average:</Text>
                <Text style={styles.detailValue}>{careerStats.bowlingAverage}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Economy Rate:</Text>
                <Text style={styles.detailValue}>{careerStats.economyRate}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Overs Bowled:</Text>
                <Text style={styles.detailValue}>{careerStats.overs}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Balls Bowled:</Text>
                <Text style={styles.detailValue}>{careerStats.ballsBowled}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Best Bowling:</Text>
                <Text style={styles.detailValue}>{careerStats.bestBowlingFigures}</Text>
              </View>
            </View>

            <View style={styles.detailCard}>
              <View style={styles.sectionHeader}>
                <Icon name="shield" size={20} color="#32CD32" />
                <Text style={styles.detailTitle}>Fielding Statistics</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Catches Taken:</Text>
                <Text style={styles.detailValue}>{careerStats.catchesTaken}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Outs:</Text>
                <Text style={styles.detailValue}>{careerStats.totalOuts}</Text>
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading Player Data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="exclamation-circle" size={40} color="#e74c3c" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPlayerData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../../assets/images/cricsLogo.png")}
      style={styles.container}
      resizeMode="cover"
      imageStyle={styles.backgroundImage}
    >
      <LinearGradient
        colors={["rgba(8, 102, 170, 0.2)", "rgba(107, 185, 240, 0.2)"]}
        style={styles.overlay}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <View style={styles.playerHeader}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatarWrapper}>
                  {playerData.logoPath ? (
                    <Image
                      source={{ uri: playerData.logoPath }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Icon name="user" size={50} color="#3498db" />
                    </View>
                  )}
                </View>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>{playerData.role}</Text>
                </View>
              </View>
              <Text style={styles.playerName}>{playerData.name}</Text>
              <Text style={styles.playerEmail}>{playerData.email}</Text>
            </View>

            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === "overview" && styles.activeTab,
                ]}
                onPress={() => setActiveTab("overview")}
              >
                <Icon
                  name="dashboard"
                  size={16}
                  color={activeTab === "overview" ? "#fff" : "#3498db"}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "overview" && styles.activeTabText,
                  ]}
                >
                  Overview
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === "detailed" && styles.activeTab,
                ]}
                onPress={() => setActiveTab("detailed")}
              >
                <Icon
                  name="bar-chart"
                  size={16}
                  color={activeTab === "detailed" ? "#fff" : "#3498db"}
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "detailed" && styles.activeTabText,
                  ]}
                >
                  Detailed
                </Text>
              </TouchableOpacity>
            </View>

            {renderTabContent()}
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginTop: StatusBar?.currentHeight || 0,
  },
  backgroundImage: {
    opacity: 0.8,
  },
  overlay: {
    flex: 1,
  },
  scrollContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  content: {
    flex: 1,
  },
  playerHeader: {
    alignItems: "center",
    marginBottom: 25,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f0f8ff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#3498db",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  roleBadge: {
    position: "absolute",
    bottom: 0,
    right: 10,
    backgroundColor: "#3498db",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  roleText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  playerName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
    textAlign: "center",
  },
  playerEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#3498db",
  },
  tabText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 8,
  },
  activeTabText: {
    color: "#fff",
  },
  tabContent: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    width: "30%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 3,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  detailCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 15,
    color: "#333",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: "#e74c3c",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 25,
    backgroundColor: "#3498db",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default Performance;
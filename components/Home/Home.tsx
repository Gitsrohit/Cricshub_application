import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  FlatList,
  ImageBackground,
  Dimensions,
  Image,
  TouchableWithoutFeedback,
} from "react-native";
import { MaterialIcons, FontAwesome, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");
const Home = () => {
  const navigation = useNavigation();
  const sidebarAnim = useRef(new Animated.Value(-width)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const [isSidebarVisible, setIsSidebarVisible] = React.useState(false);
  const [userName, setUserName] = useState("");
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const name = await AsyncStorage.getItem("userName");
        console.log("Fetched name from storage:", name);
        if (name) {
          setUserName(name);
        } else {
          console.log("No name found in storage");
        }
      } catch (error) {
        console.error("Failed to fetch user name:", error);
      }
    };

    fetchUserName();
  }, []);

  const sections = [
    {
      title: "Start a Match",
      buttonText: "Start",
      navigateTo: "InstantMatch",
      icon: "sports-cricket",
    },
    {
      title: "Host a Tournament",
      buttonText: "Host",
      navigateTo: "CreateTournaments",
      icon: "tour",
    },
    {
      title: "Create a Team",
      buttonText: "Create",
      navigateTo: "CreateTeam",
      icon: "group",
    },
    {
      title: "Fantasy Cricket",
      buttonText: "Explore",
      navigateTo: "FantasyCricketScreen",
      icon: "bar-chart",
    },
    {
      title: "Stream Match",
      buttonText: "Stream Now",
      navigateTo: "StreamMatch",
      icon: "live-tv",
      isFullWidth: true,
    },
  ];

  const animatedValues = sections.map(() => new Animated.Value(1));

  const handlePressIn = (index) => {
    Animated.spring(animatedValues[index], {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (index) => {
    Animated.spring(animatedValues[index], {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const toggleSidebar = () => {
    if (isSidebarVisible) {
      Animated.parallel([
        Animated.timing(sidebarAnim, {
          toValue: -width,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setIsSidebarVisible(false));
    } else {
      setIsSidebarVisible(true);
      Animated.parallel([
        Animated.timing(sidebarAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const closeSidebar = () => {
    if (isSidebarVisible) {
      toggleSidebar();
    }
  };

  const LogOutHandler = async () => {
    try {
      await AsyncStorage.removeItem('jwtToken');
      console.log('Token removed securely');
    } catch (error) {
      console.error('Error removing token:', error);
    } finally {
      navigation.navigate('Login');
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#34B8FF"
        translucent={true}
      />
      <ImageBackground
        source={require("../../assets/images/cricsLogo.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.container}>
          {isSidebarVisible && (
            <TouchableWithoutFeedback onPress={closeSidebar}>
              <Animated.View
                style={[
                  styles.overlay,
                  {
                    opacity: overlayAnim,
                  },
                ]}
              />
            </TouchableWithoutFeedback>
          )}
          <Animated.View
            style={[
              styles.sidebar,
              {
                transform: [{ translateX: sidebarAnim }],
              },
            ]}
          >
            <View style={styles.sidebarHeader}>
              <Image
                source={require("../../assets/defaultLogo.png")}
                style={styles.userImage}
              />
              <Text
                style={styles.sidebarTitle}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {userName}
              </Text>
            </View>

            {/* Sidebar Items */}
            <TouchableOpacity
              style={styles.sidebarItem}
              onPress={() => {
                navigation.navigate("Profile");
                closeSidebar();
              }}
            >
              <Ionicons name="person-outline" size={24} color="#333" />
              <Text style={styles.sidebarItemText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sidebarItem}
              onPress={() => {
                navigation.navigate("Performance");
                closeSidebar();
              }}
            >
              <Ionicons name="stats-chart-outline" size={24} color="#333" />
              <Text style={styles.sidebarItemText}>Performance</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sidebarItem}
              onPress={() => {
                navigation.navigate("Support");
                closeSidebar();
              }}
            >
              <Ionicons name="help-circle-outline" size={24} color="#333" />
              <Text style={styles.sidebarItemText}>Support & Help</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sidebarItem}
              onPress={() => {
                navigation.navigate("RateUs");
                closeSidebar();
              }}
            >
              <Ionicons name="star-outline" size={24} color="#333" />
              <Text style={styles.sidebarItemText}>Rate Us</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sidebarItem}
              onPress={() => {
                navigation.navigate("Settings");
                closeSidebar();
              }}
            >
              <Ionicons name="settings-outline" size={24} color="#333" />
              <Text style={styles.sidebarItemText}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sidebarItem}
              onPress={() => LogOutHandler()}
            >
              <Ionicons name="log-out-outline" size={24} color="#333" />
              <Text style={styles.sidebarItemText}>Logout</Text>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.sidebarFooter}>
              <Text style={styles.footerText}>cricshub @2025</Text>
            </View>
          </Animated.View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <View style={styles.topBar}>
              <TouchableOpacity onPress={toggleSidebar}>
                <MaterialIcons name="menu" size={30} color="#333" />
              </TouchableOpacity>
              <FontAwesome name="filter" size={24} color="#333" />
            </View>

            {/* Content */}
            <View style={styles.content}>
              <FlatList
                data={sections}
                numColumns={2}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => {
                  if (item.isFullWidth) {
                    return (
                      <View style={styles.fullWidthCardContainer}>
                        <Animated.View
                          style={[
                            styles.card,
                            styles.fullWidthCard,
                            {
                              transform: [{ scale: animatedValues[index] }],
                            },
                          ]}
                        >
                          <LinearGradient
                            colors={["#0866AA", "#6BB9F0"]}
                            style={styles.cardBackground}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                          >
                            <MaterialIcons
                              name={item.icon}
                              size={40}
                              color="#FFF"
                              style={styles.cardIcon}
                            />
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <TouchableOpacity
                              style={styles.cardButton}
                              onPressIn={() => handlePressIn(index)}
                              onPressOut={() => handlePressOut(index)}
                              onPress={() =>
                                navigation.navigate(item.navigateTo)
                              }
                              activeOpacity={0.8}
                            >
                              <Text style={styles.cardButtonText}>
                                {item.buttonText}
                              </Text>
                            </TouchableOpacity>
                          </LinearGradient>
                        </Animated.View>
                      </View>
                    );
                  } else {
                    return (
                      <Animated.View
                        style={[
                          styles.card,
                          {
                            transform: [{ scale: animatedValues[index] }],
                          },
                        ]}
                      >
                        <LinearGradient
                          colors={["#0866AA", "#6BB9F0"]}
                          style={styles.cardBackground}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        >
                          <MaterialIcons
                            name={item.icon}
                            size={40}
                            color="#FFF"
                            style={styles.cardIcon}
                          />
                          <Text style={styles.cardTitle}>{item.title}</Text>
                          <TouchableOpacity
                            style={styles.cardButton}
                            onPressIn={() => handlePressIn(index)}
                            onPressOut={() => handlePressOut(index)}
                            onPress={() => navigation.navigate(item.navigateTo)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.cardButtonText}>
                              {item.buttonText}
                            </Text>
                          </TouchableOpacity>
                        </LinearGradient>
                      </Animated.View>
                    );
                  }
                }}
              />
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

export const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
    marginTop: StatusBar?.currentHeight || 0,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 99,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width * 0.7,
    height: "100%",
    backgroundColor: "#FFF",
    zIndex: 100,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  sidebarHeader: {
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    width: '100%',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    maxWidth: '100%',
  },

  userImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  sidebarItemText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  sidebarFooter: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#888",
  },
  mainContent: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: 10,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    flex: 1,
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
  fullWidthCardContainer: {
    width: "100%",
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
});

export default Home;

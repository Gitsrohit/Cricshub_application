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
  Dimensions,
  Image,
  TouchableWithoutFeedback,
  Alert,
  Platform,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppGradients, AppColors } from "../../assets/constants/colors.js"; 

const { width, height } = Dimensions.get("window");

const Home = () => {
  const navigation = useNavigation();
  const sidebarAnim = useRef(new Animated.Value(-width)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
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
  })
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
      icon: "emoji-events",
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
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes, Logout",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("jwtToken"); 
              console.log("Token removed securely");
              navigation.navigate("Login"); 
            } catch (error) {
              console.error("Error removing token:", error);
              Alert.alert("Logout Failed", "Could not log out. Please try again.");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.appContainer}>
      <StatusBar
        barStyle="dark-content" 
        backgroundColor={AppColors.background}
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBarWrapper}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
              <Ionicons name="person-circle-outline" size={30} color={AppColors.blue} />
            </TouchableOpacity>
            <Image
              source={require("../../assets/images/textLogo.png")}
              style={styles.topBarImage}
              resizeMode="contain"
            />
          </View>

          {isSidebarVisible && (
            <TouchableWithoutFeedback onPress={closeSidebar}>
              <Animated.View
                style={[styles.overlay, { opacity: overlayAnim }]}
              />
            </TouchableWithoutFeedback>
          )}
        </View>
        <Animated.View
          style={[
            styles.sidebar,
            { transform: [{ translateX: sidebarAnim }] },
          ]}
        >
          <TouchableOpacity
            onPress={closeSidebar}
            style={styles.closeSidebarButton}
          >
            <Ionicons name="close" color={AppColors.black} size={28} />
          </TouchableOpacity>
          <View style={styles.sidebarHeader}>
            <Image
              source={require("../../assets/defaultLogo.png")} 
              style={styles.userImage}
            />
            <Text style={styles.sidebarTitle} numberOfLines={1}>
              {userName || "Guest User"}
            </Text>
          </View>
          {[
            { icon: "person-outline", text: "Profile", screen: "Profile" },
            {
              icon: "stats-chart-outline",
              text: "Performance",
              screen: "Performance",
            },
            {
              icon: "help-circle-outline",
              text: "Support",
              screen: "Support",
            },
            { icon: "star-outline", text: "Rate Us", screen: "RateUs" },
            {
              icon: "settings-outline",
              text: "Settings",
              screen: "Settings",
            },
            {
              icon: "globe-outline",
              text: "Web (WebSocket Test)",
              screen: "WebSocketTest",
            },
          ].map(({ icon, text, screen }) => (
            <TouchableOpacity
              key={screen}
              style={styles.sidebarItem}
              onPress={() => {
                navigation.navigate(screen);
                closeSidebar();
              }}
            >
              <Ionicons name={icon} size={24} color={AppColors.darkText} />
              <Text style={styles.sidebarItemText}>{text}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.sidebarItem} onPress={LogOutHandler}>
            <Ionicons name="log-out-outline" size={24} color={AppColors.error} /> 
            <Text style={styles.sidebarItemText}>Logout</Text>
          </TouchableOpacity>
          <View style={styles.sidebarFooter}>
            <Text style={styles.footerText}>cricshub @2025</Text>
          </View>
        </Animated.View>
        <View style={styles.mainContent}>
          <View style={styles.content}>
            <FlatList
              data={sections}
              numColumns={2} 
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
              renderItem={({ item, index }) => {
                return (
                  <Animated.View
                    style={[
                      styles.card,
                      item.isFullWidth ? styles.fullWidthCard : {},
                      {
                        transform: [{ scale: animatedValues[index] }], 
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={AppGradients.primaryCard} 
                      style={styles.cardBackground}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <MaterialIcons
                        name={item.icon}
                        size={40}
                        color={AppColors.white}
                        style={styles.cardIcon}
                      />
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <TouchableOpacity
                        style={styles.cardButton}
                        onPressIn={() => handlePressIn(index)}
                        onPressOut={() => handlePressOut(index)}
                        onPress={() => {
                          if (item.title === "Fantasy Cricket") {
                            Alert.alert(
                              "Coming Soon",
                              "Fantasy Cricket will be launched soon.",
                              [{ text: "Ok" }]
                            );
                          } else {
                            navigation.navigate(item.navigateTo);
                          }
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.cardButtonText}>
                          {item.buttonText}
                        </Text>
                      </TouchableOpacity>
                    </LinearGradient>
                  </Animated.View>
                );
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  topBarWrapper: {
    backgroundColor: AppColors.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    shadowColor: AppColors.black,
    elevation: 3,
    zIndex: 10, 
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 15,
    paddingVertical: 10, 
    minHeight: 56, 
  },
  menuButton: {
    paddingRight: 15,
    paddingVertical: 0,
  },
  topBarImage: {
    width: 120,
    height: 30, 
    marginLeft: 5,
  },

  mainContent: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width * 0.7, 
    height: "100%",
    backgroundColor: AppColors.white, 
    zIndex: 100,
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 20, 
    shadowColor: AppColors.black,
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  closeSidebarButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 20 : 10, 
    right: 10,
    padding: 10,
    zIndex: 101,
  },
  sidebarHeader: {
    marginBottom: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: AppColors.cardBorder,
    width: "100%",
    paddingBottom: 15,
  },
  userImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: AppColors.darkText,
    marginTop: 5,
    maxWidth: "100%",
    textAlign: "center",
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.cardBorder,
  },
  sidebarItemText: {
    fontSize: 16,
    color: AppColors.darkText,
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
    color: AppColors.lightText,
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
    borderColor: AppColors.cardBorder,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.75,
    shadowRadius: 4,
    elevation: 5, 
  },
  fullWidthCardContainer: {
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  fullWidthCard: {
    width: width - 40, 
    marginHorizontal: 10,
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
    color: AppColors.white,
    marginBottom: 10,
    textAlign: "center",
  },
  cardButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppColors.white,
  },
  cardButtonText: {
    color: AppColors.white,
    fontWeight: "600",
    fontSize: 14,
  },
});

export default Home;

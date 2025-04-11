import React, { useEffect, useRef, useState } from "react";
import { View, StatusBar, StyleSheet, Animated, TouchableOpacity, TouchableWithoutFeedback, Text, Image, Dimensions } from "react-native";
import { MaterialIcons, FontAwesome, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

const SideBar = ({ children }) => {
  const sidebarAnim = useRef(new Animated.Value(-width)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const [isSidebarVisible, setIsSidebarVisible] = React.useState(false);
  const navigation = useNavigation();
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
      <StatusBar barStyle="light-content" backgroundColor="#34B8FF" translucent={true} />

      <View style={{ backgroundColor: 'white' }}>
        {/* Top Bar Trigger */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={toggleSidebar}>
            <Ionicons name="menu" size={30} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Sidebar Overlay */}
        {isSidebarVisible && (
          <TouchableWithoutFeedback onPress={closeSidebar}>
            <Animated.View style={[styles.overlay, { opacity: overlayAnim }]} />
          </TouchableWithoutFeedback>
        )}
      </View>

      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-end' }}>
          <Ionicons name="close" color='black' size={24} onPress={closeSidebar} />
        </View>
        <View style={styles.sidebarHeader}>
          <Image source={require("../../assets/defaultLogo.png")} style={styles.userImage} />
          <Text style={styles.sidebarTitle} numberOfLines={1}>{userName}</Text>
        </View>

        {/* Sidebar Links */}
        {[
          { icon: "person-outline", text: "Profile", screen: "Profile" },
          { icon: "stats-chart-outline", text: "Performance", screen: "Performance" },
          { icon: "help-circle-outline", text: "Support", screen: "Support" },
          { icon: "star-outline", text: "Rate Us", screen: "RateUs" },
          { icon: "settings-outline", text: "Settings", screen: "Settings" },
        ].map(({ icon, text, screen }) => (
          <TouchableOpacity
            key={screen}
            style={styles.sidebarItem}
            onPress={() => {
              navigation.navigate(screen);
              closeSidebar();
            }}
          >
            <Ionicons name={icon} size={24} color="#333" />
            <Text style={styles.sidebarItemText}>{text}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.sidebarItem} onPress={LogOutHandler}>
          <Ionicons name="log-out-outline" size={24} color="#333" />
          <Text style={styles.sidebarItemText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.sidebarFooter}>
          <Text style={styles.footerText}>cricshub @2025</Text>
        </View>
      </Animated.View>

      {/* Main Page Content */}
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    paddingTop: StatusBar.currentHeight || 40,
    paddingHorizontal: 15,
    paddingBottom: 10,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
  },
  topBarTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  sidebar: {
    position: "absolute",
    top: StatusBar?.currentHeight || 0,
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
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
    zIndex: 50,
  },
  sidebarHeader: {
    marginBottom: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    width: '100%',
  },
  userImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    maxWidth: '100%',
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
    bottom: 10,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#888",
  },
});

export default SideBar;

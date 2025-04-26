import {
  Animated,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import React, { useRef, useState } from 'react';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const Header = () => {
  const navigation = useNavigation();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(width)).current;

  const openSidebar = () => {
    setSidebarVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: width,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSidebarVisible(false);
    });
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
      <View style={styles.headerContainer}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>
        <Pressable onPress={openSidebar}>
          <Ionicons name="person-circle-outline" size={30} color="black" />
        </Pressable>
      </View>

      {sidebarVisible && (
        <Animated.View
          style={[
            styles.sidebar,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
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
            onPress={() => LogOutHandler()}
          >
            <Ionicons name="log-out-outline" size={24} color="#333" />
            <Text style={styles.sidebarItemText}>Logout</Text>
          </TouchableOpacity>

        </Animated.View>
      )}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    marginTop: StatusBar?.currentHeight || 0,
    zIndex: 10,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: width * 0.7,
    height: '100%',
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
    elevation: 10,
    zIndex: 20,
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  sidebarItemText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
});

import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; // For gradient backgrounds

const Footer = () => {
  const [activeTab, setActiveTab] = useState('HOME'); 
  const navigation = useNavigation(); // Navigation context

  const footerTabs = [
    { key: 'MATCHES', icon: 'home', label: 'My Matches', route: 'Main', nestedRoute: 'MyMatches' },
    { key: 'TOURNAMENTS', icon: 'trophy', label: 'Tournaments', route: 'Main', nestedRoute: 'Tournaments' },
    { key: 'HOME', icon: 'home', label: 'Home', route: 'Main', nestedRoute: 'Home' },
    { key: 'TEAMS', icon: 'users', label: 'Teams', route: 'Main', nestedRoute: 'Teams' },
    // { key: 'SETTINGS', icon: 'cogs', label: 'Settings', route: 'Main', nestedRoute: 'Settings' },
  ];

  // Animation values for interactivity
  const animatedValues = footerTabs.map(() => new Animated.Value(1));

  const handleTabPress = (tab, index) => {
    setActiveTab(tab.key); // Update active tab
    Animated.spring(animatedValues[index], {
      toValue: 0.9,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(animatedValues[index], {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    });

    if (tab.route && tab.nestedRoute) {
      navigation.navigate(tab.route, { screen: tab.nestedRoute });
    } else {
      console.error(`Route or nested route not defined for tab: ${tab.key}`);
    }
  };

  return (
    <View style={styles.footer}>
      {footerTabs.map((tab, index) => (
        <TouchableOpacity
          key={tab.key}
          style={styles.footerButton}
          onPress={() => handleTabPress(tab, index)}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: animatedValues[index] }],
              },
            ]}
          >
            {activeTab === tab.key ? (
              <LinearGradient
                colors={['#4A90E2', '#6BB9F0']} // Blue gradient for active tab
                style={styles.activeCircle}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Icon name={tab.icon} size={28} color="#FFFFFF" />
              </LinearGradient>
            ) : (
              <>
                <Icon name={tab.icon} size={24} color="#333" /> {/* Dark gray icon for inactive tabs */}
                <Text style={styles.footerButtonText}>{tab.label}</Text>
              </>
            )}
          </Animated.View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 80, // Increased height for better spacing
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF', // Light background for footer
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0', // Subtle border
  },
  footerButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 60, // Fixed height for the button to avoid shifting
  },
  footerButtonText: {
    color: '#333', // Dark gray text for inactive tabs
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500', // Slightly bold text
  },
  activeCircle: {
    position: 'absolute',
    top: -20, // Circle positioned upwards
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // Keep active circle above other elements
    shadowColor: '#4A90E2', // Blue glow effect
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
});

export default Footer;
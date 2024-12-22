import React from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import CricketAppScreen from './components/My matches/CricketAppScreen';
import Tournaments from './components/Tournaments/Tournaments';
import Home from './components/Home/Home';
import Teams from './components/Teams/Teams';
import Settings from './components/Settings/Settings';
import Footer from './components/Footer';
import Registration from './components/Authentication/Registration';
import Login from './components/Authentication/Login'; // Import Login screen

// Create a Stack Navigator instance
const Stack = createStackNavigator();

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName="Login" // Set Login as the first screen
        >
          {/* Login screen */}
          <Stack.Screen name="Login" component={Login} />
          
          {/* Registration screen */}
          <Stack.Screen name="Registration" component={Registration} />

          {/* Screens with footer */}
          <Stack.Screen
            name="Main"
            component={MainScreens} // Separate component for screens with a footer
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
};

// Component for screens with a footer
const MainScreens = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MyMatches" component={CricketAppScreen} />
        <Stack.Screen name="Tournaments" component={Tournaments} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Teams" component={Teams} />
        <Stack.Screen name="Settings" component={Settings} />
      </Stack.Navigator>
      {/* Footer for all screens except Registration */}
      <View style={styles.footerContainer}>
        <Footer />
      </View>
    </SafeAreaView>
  );
};

// Style the footer container to keep it at the bottom
const styles = StyleSheet.create({
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff', // Optional: Footer background color
  },
});

export default App;

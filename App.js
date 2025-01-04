import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './components/Authentication/Login';
import Registration from './components/Authentication/Registration';
import CricketAppScreen from './components/My matches/CricketAppScreen';
import Tournaments from './components/Tournaments/Tournaments';
import Home from './components/Home/Home';
import Teams from './components/Teams/Teams';
import Settings from './components/Settings/Settings';
import Footer from './components/Footer'; // Footer component
import CreateTeam from './components/Teams/CreateTeam';
import CreateTournaments from './components/Tournaments/CreateTournaments';
const Stack = createStackNavigator();

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          {/* Authentication Screens */}
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Registration" component={Registration} />

          {/* Main App Screens */}
          <Stack.Screen name="Main" component={MainScreens} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
};

const MainScreens = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="MyMatches" component={CricketAppScreen} />
        <Stack.Screen name="Tournaments" component={Tournaments} />
        <Stack.Screen name="Teams" component={Teams} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="CreateTeam" component={CreateTeam} /> 
        <Stack.Screen name="CreateTournaments" component={CreateTournaments} /> 
      </Stack.Navigator>
      <Footer style={styles.footer} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
  },
});

export default App;

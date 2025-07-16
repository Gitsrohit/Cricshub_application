import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './components/Authentication/Login';
import Registration from './components/Authentication/Registration';
import CricketAppScreen from './components/My matches/CricketAppScreen';
import Tournaments from './components/Tournaments/Tournaments';
import Home from './components/Home/Home';
import WebSocketTest from './components/Home/WebSocketTest';

import Teams from './components/Teams/Teams';
import Profile from './components/Settings/Profile';
import Performance from './components/Settings/Performance';
import Footer from './components/Footer'; // Footer component
import CreateTeam from './components/Teams/CreateTeam';
import CreateTournaments from './components/Tournaments/CreateTournaments';
import ManageTournaments from './components/Tournaments/ManageTournaments';
import TeamDetailsScreen from './components/Teams/TeamDetailsScreen';
import InstantMatch from './components/My matches/ScheduleMatch/InstantMatch';
import SelectPlayingII from './components/My matches/SelectPlayingII';
import Toss from './components/My matches/Toss';
import Scoring from './components/My matches/Scoring';
import SelectRoles from './components/My matches/SelectRoles';
import AddPlayersToTeam from './components/Teams/AddPlayersToTeam';
import SelectRoles2ndInnings from './components/My matches/SelectRoles2ndInnings';
import AllMatches from './components/My matches/AllMatches/AllMatches';
import ScheduleMatch from './components/My matches/ScheduleMatch/ScheduleMatch';
import CommentaryScorecard from './components/My matches/CommentaryScorecard';
import FantasyCricketScreen from './components/Fantasy/FantasyHome';
import Contests from './components/Fantasy/Contests';
import ContestDetails from './components/Fantasy/ContestDetails';
import CreateContestTeam from './components/Fantasy/CreateContestTeam';
// import Performance from './components/Settings/Performance';

import ScoreCard from './components/My matches/ScoreCard';
import InternetConnectivityCheck from './components/InternetConnectivity';

const Stack = createStackNavigator();

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer>
        <InternetConnectivityCheck>
          <Stack.Navigator
            initialRouteName="Main"
            screenOptions={{ headerShown: false }}
          >
            {/* Authentication Screens */}
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Registration" component={Registration} />

            {/* Main App Screens */}
            <Stack.Screen name="Main" component={MainScreens} />
          </Stack.Navigator>
        </InternetConnectivityCheck>
      </NavigationContainer>
    </SafeAreaView>
  );
};

const MainScreens = () => {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="MyMatches" component={AllMatches} />
        <Stack.Screen name="Tournaments" component={Tournaments} />
        <Stack.Screen name="Teams" component={Teams} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Performance" component={Performance} />
        <Stack.Screen name="WebSocketTest" component={WebSocketTest} />

        <Stack.Screen name="CreateTeam" component={CreateTeam} />
        <Stack.Screen name="CreateTournaments" component={CreateTournaments} />
        <Stack.Screen name="ManageTournaments" component={ManageTournaments} />
        <Stack.Screen name="TeamDetailsScreen" component={TeamDetailsScreen} />
        <Stack.Screen name="InstantMatch" component={InstantMatch} />
        <Stack.Screen name="SelectPlayingII" component={SelectPlayingII} />
        <Stack.Screen name="Toss" component={Toss} />
        <Stack.Screen name="Scoring" component={Scoring} />
        <Stack.Screen name="SelectRoles" component={SelectRoles} />
        <Stack.Screen name="AddPlayersToTeam" component={AddPlayersToTeam} />
        <Stack.Screen name="SelectRoles2ndInnings" component={SelectRoles2ndInnings} />
        <Stack.Screen name="MatchScoreCard" component={ScoreCard} />
        <Stack.Screen name="ScheduleMatch" component={ScheduleMatch} />
        <Stack.Screen name="CommentaryScorecard" component={CommentaryScorecard} />
        <Stack.Screen name="FantasyCricketScreen" component={FantasyCricketScreen} />
        <Stack.Screen name="Contests" component={Contests} />
        <Stack.Screen name="ContestDetails" component={ContestDetails} />
        <Stack.Screen name="CreateContestTeam" component={CreateContestTeam} />
      </Stack.Navigator>
      <Footer style={styles.footer} />
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#002233', // Footer background color
    zIndex: 1, // Ensure footer is above other components
  },
});

export default App;
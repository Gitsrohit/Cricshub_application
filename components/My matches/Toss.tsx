import { ImageBackground, StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import stadiumBG from '../../assets/images/stadiumBG.jpg';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { BlurView } from 'expo-blur';

const Toss = ({ route }) => {
  const [matchDetails, setMatchDetails] = useState(null);
  const [tossWinner, setTossWinner] = useState('');
  const [choice, setChoice] = useState('');

  useEffect(() => {
    setMatchDetails(route.params.matchDetails);
  }, [])

  const handleTossSubmit = async () => {
    if (!tossWinner || !choice) {
      Alert.alert('Error', 'Please select both the toss winner and their choice.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (!token) throw new Error('Please login again');

      const response = await axios.post(
        `https://score360-7.onrender.com/api/v1/matches/${route.params.matchId}/toss`,
        { tossWinner, choice },
        { headers: { authorization: `Bearer ${token}` } }
      );

      Alert.alert('Success', 'Toss decision submitted successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit toss decision. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#000000', '#0A303B', '#36B0D5']} style={styles.gradient}>
        <ImageBackground source={stadiumBG} resizeMode="cover" style={styles.background}>
          <BlurView style={styles.instantMatchForm} intensity={50}>
            <Text style={styles.heading}>Toss Decision</Text>

            {/* Toss Winner Dropdown */}
            <Text style={styles.label}>Select Toss Winner:</Text>
            <Picker selectedValue={tossWinner} onValueChange={(itemValue) => setTossWinner(itemValue)} style={styles.picker}>
              <Picker.Item label="Select Team" value="" />
              <Picker.Item label={matchDetails?.team1Name} value={matchDetails?.team1Name} />
              <Picker.Item label={matchDetails?.team2Name} value={matchDetails?.team2Name} />
            </Picker>

            {/* Choice Dropdown */}
            <Text style={styles.label}>Choose Bat or Bowl:</Text>
            <Picker selectedValue={choice} onValueChange={(itemValue) => setChoice(itemValue)} style={styles.picker}>
              <Picker.Item label="Select Choice" value="" />
              <Picker.Item label="Bat" value="bat" />
              <Picker.Item label="Bowl" value="bowl" />
            </Picker>

            {/* Submit Button */}
            <Pressable style={styles.button} onPress={handleTossSubmit}>
              <Text style={styles.buttonText}>Submit Toss</Text>
            </Pressable>
          </BlurView>
        </ImageBackground>
      </LinearGradient>
    </View>
  );
};

export default Toss;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gradient: {
    flex: 1,
    width: '100%',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    width: '100%',
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  picker: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    marginBottom: 20,
    borderRadius: 6,
    overflow: 'hidden'
  },
  button: {
    backgroundColor: '#d9534f',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  instantMatchForm: {
    width: '90%',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'flex-start',
    overflow: 'hidden'
  },
});

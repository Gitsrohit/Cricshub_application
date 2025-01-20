import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
  Image,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const background = require('../../assets/images/bg.png');

const CreateTournament = () => {
  const [tournamentName, setTournamentName] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [format, setFormat] = useState('');
  const [ballType, setBallType] = useState('');
  const [overs, setOvers] = useState('');
  const [banner, setBanner] = useState(null);

  const getToken = async () => {
    try {
      return await AsyncStorage.getItem('jwtToken');
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  };

  const getUserUUID = async () => {
    try {
      return await AsyncStorage.getItem('userUUID');
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  };

  const handleCreateTournament = async () => {
    const userId = await getUserUUID();
    if (!tournamentName || !format || !ballType) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', tournamentName);
      formData.append('startDate', startDate.toISOString().split('T')[0]);
      formData.append('endDate', endDate.toISOString().split('T')[0]);
      formData.append('format', format);
      formData.append('ballType', ballType);
      formData.append('matchesPerDay', 1);
      formData.append('matchesPerTeam', 1);
      formData.append('venues[]', "Default Venue");

      if (banner) {
        const fileName = banner.split('/').pop();
        const fileType = fileName.split('.').pop();
        formData.append('banner', {
          uri: banner,
          name: 'banner',
          type: `image/${fileType}`,
        });
      } else {
        formData.append('banner', 'Default Banner');
      }

      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'Authentication token not found!');
        return;
      }

      const response = await fetch(`https://score360-7.onrender.com/api/v1/tournaments/${userId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (response.ok) {
        Alert.alert('Success', 'Tournament created successfully!');
      } else {
        const errorData = await response.json();
        Alert.alert('Error', `Failed to create the tournament. ${errorData.message}`);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status === 'granted') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1,
      });

      if (!result.canceled) {
        setBanner(result.assets[0].uri);
      }
    } else {
      alert('Permission to access media library is required!');
    }
  };

  return (
    <View style={styles.background}>
      <ImageBackground source={background} style={styles.logo} resizeMode="contain">
        <View style={styles.container}>
          <View style={styles.card}>
            {/* Banner Upload Field */}
            <TouchableOpacity onPress={pickImage} style={styles.bannerUploadContainer}>
              {banner ? (
                <Image source={{ uri: banner }} style={styles.bannerImage} />
              ) : (
                <Text style={styles.bannerUploadText}>Upload Banner</Text>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Tournament name"
              placeholderTextColor="#fff"
              value={tournamentName}
              onChangeText={setTournamentName}
            />

            <View style={styles.dateInputContainer}>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.placeholderText}>
                  {startDate ? startDate.toDateString() : 'Start Date'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={() => setShowStartDatePicker(true)}
              >
                <MaterialCommunityIcons name="calendar" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowStartDatePicker(false);
                  if (selectedDate) setStartDate(selectedDate);
                }}
              />
            )}

            <View style={styles.dateInputContainer}>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={styles.placeholderText}>
                  {endDate ? endDate.toDateString() : 'End Date'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={() => setShowEndDatePicker(true)}
              >
                <MaterialCommunityIcons name="calendar" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowEndDatePicker(false);
                  if (selectedDate) setEndDate(selectedDate);
                }}
              />
            )}

            {/* Format Picker */}
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={format}
                onValueChange={(itemValue) => setFormat(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Select Format" value="" />
                <Picker.Item label="Test" value="Test" />
                <Picker.Item label="T20" value="T20" />
                <Picker.Item label="50-50" value="50-50" />
                <Picker.Item label="Custom" value="Custom" />
              </Picker>
            </View>

            {format === 'Custom' && (
              <TextInput
                style={styles.input}
                placeholder="Enter no. of overs"
                placeholderTextColor="#aaa"
                value={overs}
                onChangeText={setOvers}
                keyboardType="numeric"
              />
            )}

            {/* Ball Type Picker */}
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={ballType}
                onValueChange={(itemValue) => setBallType(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Select Ball Type" value="" />
                <Picker.Item label="Tennis Ball" value="Tennis Ball" />
                <Picker.Item label="Season Ball" value="Season Ball" />
              </Picker>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleCreateTournament}
            >
              <Text style={styles.buttonText}>Create Tournament</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#003d99',
  },
  logo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    padding: 20,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    padding: 10,
    color: '#fff',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  placeholderText: {
    color: '#aaa',
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  picker: {
    color: '#fff',
    height: 50,
    paddingHorizontal: 10,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    position: 'absolute',
    right: 10,
    zIndex: 1,
  },
  bannerUploadContainer: {
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 10,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'cover',
  },
  bannerUploadText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default CreateTournament;

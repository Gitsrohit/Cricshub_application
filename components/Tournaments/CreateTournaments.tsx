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
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import moment from "moment";
import * as MediaLibrary from 'expo-media-library';
import apiService from '../APIservices';

const background = require('../../assets/images/cricsLogo.png');
const { height } = Dimensions.get('window');

const CreateTournament = ({ navigation }) => {
  const [tournamentName, setTournamentName] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [format, setFormat] = useState('');
  const [ballType, setBallType] = useState('');
  const [overs, setOvers] = useState('');
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

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
      const userId = await AsyncStorage.getItem('userUUID');
      return userId;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  };

  const handleCreateTournament = async () => {
    setLoading(true);
    const userId = await getUserUUID();
    if (!tournamentName || !format || !ballType) {
      Alert.alert('Error', 'Please fill all fields.');
      setLoading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("name", tournamentName);
      formData.append("startDate", startDate.toISOString().split('T')[0]);
      formData.append("endDate", endDate.toISOString().split('T')[0]);
      formData.append("format", format);
      formData.append("type", overs);
      formData.append("ballType", ballType);
      formData.append("matchesPerDay", "1");
      formData.append("matchesPerTeam", "1");
      formData.append("venues", "Default Venue");

      if (banner) {
        const fileName = banner.split('/').pop();
        const fileType = fileName.split('.').pop();
        formData.append("banner", {
          uri: banner,
          name: fileName,
          type: `image/${fileType}`,
        });
      } else {
        formData.append("banner", "Default Banner");
      }

      const response = await apiService({
        endpoint: `tournaments/${userId}`,
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.success) {
        navigation.navigate('Tournaments');
      } else {
        console.error("API error:", response.error);
        Alert.alert('Error', response.error?.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setLoading(false);
      setTournamentName('');
      setStartDate(new Date());
      setEndDate(new Date());
      setFormat('');
      setBallType('');
      setOvers('');
      setBanner(null);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResponse.status !== 'granted') {
      await requestPermission();
    }
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
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.2)', 'rgba(54, 176, 303, 0.1)']}
        style={styles.gradient}
      >
        <ImageBackground source={background} style={styles.backgroundImage} resizeMode="cover">
          <View style={styles.container}>
            <LinearGradient
              colors={['#4A90E2', '#6BB9F0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientCard}
            >
              <TouchableOpacity onPress={pickImage} style={styles.bannerUploadContainer}>
                {banner ? (
                  <Image source={{ uri: banner }} style={styles.bannerImage} />
                ) : (
                  <View style={styles.bannerPlaceholder}>
                    <MaterialCommunityIcons name="image-plus" size={40} color="#fff" />
                    <Text style={styles.bannerUploadText}>Upload Banner</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Tournament Name Input */}
              <TextInput
                style={styles.input}
                placeholder="Tournament Name"
                placeholderTextColor="#ccc"
                value={tournamentName}
                onChangeText={setTournamentName}
              />

              {/* Start Date Input */}
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.placeholderText}>
                  {startDate ? startDate.toDateString() : 'Start Date'}
                </Text>
              </TouchableOpacity>

              {showStartDatePicker && (
                <DateTimePicker
                  minimumDate={moment().toDate()}
                  value={startDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowStartDatePicker(false);
                    if (selectedDate) setStartDate(selectedDate);
                  }}
                />
              )}

              {/* End Date Input */}
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={styles.placeholderText}>
                  {endDate ? endDate.toDateString() : 'End Date'}
                </Text>
              </TouchableOpacity>

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
                  dropdownIconColor="#fff"
                >
                  <Picker.Item label="Select Format" value="" />
                  <Picker.Item label="Double Round Robin" value="DOUBLE_ROUND_ROBIN" />
                  <Picker.Item label="Single Round Robin" value="SINGLE_ROUND_ROBIN" />
                </Picker>
              </View>

              {/* Number of Overs Input */}
              <TextInput
                style={styles.input}
                placeholder="Number of Overs"
                placeholderTextColor="#ccc"
                value={overs}
                onChangeText={setOvers}
                keyboardType="numeric"
              />

              {/* Ball Type Picker */}
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={ballType}
                  onValueChange={(itemValue) => setBallType(itemValue)}
                  style={styles.picker}
                  dropdownIconColor="#fff"
                >
                  <Picker.Item label="Select Ball Type" value="" />
                  <Picker.Item label="Tennis Ball" value="Tennis Ball" />
                  <Picker.Item label="Season Ball" value="Season Ball" />
                </Picker>
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handleCreateTournament}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Create Tournament</Text>
                )}
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </ImageBackground>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1, // Ensures ScrollView takes full height
    minHeight: height, // Ensures minimum height is screen height
  },
  background: {
    flex: 1,
    backgroundColor: '#002B3D',
  },
  gradient: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gradientCard: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  input: {
    borderColor: '#fff',
    borderWidth: 1,
    padding: 10,
    color: '#fff',
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  placeholderText: {
    color: '#ccc',
    fontSize: 16,
  },
  pickerContainer: {
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  picker: {
    color: '#fff',
    height: 50,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  bannerUploadContainer: {
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    resizeMode: 'cover',
  },
  bannerPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerUploadText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
});

export default CreateTournament;
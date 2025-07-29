import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Platform,
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

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const CreateTournament = ({ navigation }) => {
  // Tournament state
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

  // Initialize media permissions
  useEffect(() => {
    (async () => {
      await requestPermission();
    })();
  }, [requestPermission]);

  const getToken = useCallback(async () => {
    try {
      return await AsyncStorage.getItem('jwtToken');
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  }, []);

  const getUserUUID = useCallback(async () => {
    try {
      return await AsyncStorage.getItem('userUUID');
    } catch (error) {
      console.error('Error retrieving user UUID:', error);
      return null;
    }
  }, []);

  const handleCreateTournament = useCallback(async () => {
    setLoading(true);
    const userId = await getUserUUID();

    if (!tournamentName || !format || !ballType) {
      Alert.alert('Error', 'Please fill all required fields.');
      setLoading(false);
      return;
    }

    if (startDate > endDate) {
      Alert.alert('Error', 'End date must be after start date.');
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
        Alert.alert('Success', 'Tournament created successfully!');
        navigation.navigate('Tournaments');
      } else {
        Alert.alert('Error', response.error?.message || 'Failed to create tournament');
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [tournamentName, startDate, endDate, format, overs, ballType, banner, getUserUUID, navigation]);

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your photos to select a banner image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (!result.canceled) {
      if (result.assets[0].fileSize > MAX_IMAGE_SIZE) {
        Alert.alert('Error', 'Image size should be less than 5MB');
        return;
      }
      setBanner(result.assets[0].uri);
    }
  }, []);

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
              {/* Banner Upload */}
              <TouchableOpacity onPress={pickImage} style={styles.bannerUploadContainer}>
                {banner ? (
                  <Image source={{ uri: banner }} style={styles.bannerImage} />
                ) : (
                  <View style={styles.bannerPlaceholder}>
                    <MaterialCommunityIcons name="image-plus" size={40} color="#fff" />
                    <Text style={styles.bannerUploadText}>Upload Tournament Banner</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Tournament Name */}
              <TextInput
                style={styles.input}
                placeholder="Tournament Name *"
                placeholderTextColor="#ccc"
                value={tournamentName}
                onChangeText={setTournamentName}
              />

              {/* Date Pickers */}
              <View style={styles.dateRow}>
                <TouchableOpacity
                  style={[styles.input, styles.dateInput]}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text style={styles.placeholderText}>
                    {moment(startDate).format('MMM D, YYYY')}
                  </Text>
                  <MaterialCommunityIcons name="calendar" size={20} color="#fff" />
                </TouchableOpacity>

                <Text style={styles.dateSeparator}>to</Text>

                <TouchableOpacity
                  style={[styles.input, styles.dateInput]}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={styles.placeholderText}>
                    {moment(endDate).format('MMM D, YYYY')}
                  </Text>
                  <MaterialCommunityIcons name="calendar" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowStartDatePicker(false);
                    if (selectedDate) {
                      setStartDate(selectedDate);
                      if (selectedDate > endDate) {
                        setEndDate(selectedDate);
                      }
                    }
                  }}
                />
              )}

              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="default"
                  minimumDate={startDate}
                  onChange={(event, selectedDate) => {
                    setShowEndDatePicker(false);
                    if (selectedDate) setEndDate(selectedDate);
                  }}
                />
              )}

              {/* Tournament Format */}
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={format}
                  onValueChange={setFormat}
                  style={styles.picker}
                  dropdownIconColor="#fff"
                >
                  <Picker.Item label="Select Tournament Format *" value="" />
                  <Picker.Item label="Double Round Robin" value="DOUBLE_ROUND_ROBIN" />
                  <Picker.Item label="Single Round Robin" value="SINGLE_ROUND_ROBIN" />
                  <Picker.Item label="Knockout" value="KNOCKOUT" />
                </Picker>
              </View>

              {/* Ball Type */}
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={ballType}
                  onValueChange={setBallType}
                  style={styles.picker}
                  dropdownIconColor="#fff"
                >
                  <Picker.Item label="Select Ball Type *" value="" />
                  <Picker.Item label="Tennis Ball" value="TENNIS" />
                  <Picker.Item label="Leather Ball" value="LEATHER" />
                </Picker>
              </View>

              {/* Number of Overs */}
              <TextInput
                style={styles.input}
                placeholder="Number of Overs"
                placeholderTextColor="#ccc"
                value={overs}
                onChangeText={setOvers}
                keyboardType="numeric"
              />

              {/* Create Tournament Button */}
              <TouchableOpacity
                style={[styles.button, styles.createButton]}
                onPress={handleCreateTournament}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="trophy" size={20} color="#fff" />
                    <Text style={styles.buttonText}> Create Tournament</Text>
                  </>
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
    flexGrow: 1,
    minHeight: height,
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
  bannerUploadContainer: {
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
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
  input: {
    borderColor: '#fff',
    borderWidth: 1,
    padding: 15,
    color: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    fontSize: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  dateSeparator: {
    color: '#fff',
    marginHorizontal: 10,
    fontSize: 16,
  },
  pickerContainer: {
    borderColor: '#fff',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  picker: {
    color: '#fff',
    height: 50,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  createButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  connectionStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  placeholderText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default CreateTournament;
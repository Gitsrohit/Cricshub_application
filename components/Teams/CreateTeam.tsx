import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useNavigation } from '@react-navigation/native';

const CreateTeam = () => {
  const [teamName, setTeamName] = useState('');
  const [logoUri, setLogoUri] = useState(null);
  const navigation = useNavigation();
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

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
        setLogoUri(result.assets[0].uri);
      }
    } else {
      alert('Permission to access media library is required!');
    }
  };

  const handleContinue = () => {
    if (!teamName.trim() || !logoUri) {
      Alert.alert('Error', 'Please fill in the team name and upload a logo.');
      return;
    }
    navigation.navigate('AddPlayersToTeam', {
      teamName,
      logoUri,
    });
  };

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#4A90E2', '#6BB9F0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCard}
        >
          <View style={styles.logoContainer}>
            <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
              <View style={styles.logoPlaceholder}>
                {logoUri ? (
                  <Image source={{ uri: logoUri }} style={styles.logo} />
                ) : (
                  <MaterialIcons name="add-a-photo" size={40} color="#4A90E2" />
                )}
              </View>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Team Name"
            placeholderTextColor="#999"
            value={teamName}
            onChangeText={setTeamName}
          />

          <TouchableOpacity onPress={handleContinue} style={styles.continueButton}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#fff', // Solid white background
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    alignItems: 'center',
    padding: 20,
  },
  gradientCard: {
    width: '90%',
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  input: {
    borderColor: '#ddd',
    borderWidth: 1,
    padding: 12,
    color: '#333',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  continueButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateTeam;

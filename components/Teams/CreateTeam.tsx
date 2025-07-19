import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useNavigation } from '@react-navigation/native';

const background = require('../../assets/images/cricsLogo.png');

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
   const handleWeb = () => {
    // if (!teamName.trim() || !logoUri) {
    //   Alert.alert('Error', 'Please fill in the team name and upload a logo.');
    //   return;
    // }
    navigation.navigate('WebSocketTest');
  };


  return (
    <ImageBackground source={background} style={styles.background}>
      <LinearGradient colors={['rgba(0, 0, 0, 0.2)', 'rgba(54, 176, 303, 0.1)']} style={styles.gradient}>
        <View style={styles.container}>
          <LinearGradient
            colors={['#4A90E2', '#6BB9F0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientCard}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoPlaceholder}>
                {logoUri ? (
                  <Image source={{ uri: logoUri }} style={styles.logo} />
                ) : (
                  <MaterialIcons name="add-a-photo" size={40} color="#fff" />
                )}
              </View>
              <TouchableOpacity onPress={pickImage} style={styles.uploadLogoButton}>
                <Text style={styles.uploadLogoText}>Upload Logo</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Team Name"
              placeholderTextColor="#ccc"
              value={teamName}
              onChangeText={setTeamName}
            />

            <TouchableOpacity onPress={handleContinue} style={styles.continueButton}>
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
             <TouchableOpacity onPress={handleWeb} style={styles.continueButton}>
              <Text style={styles.continueButtonText}>Web</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  gradient: {
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
    width: '90%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  uploadLogoButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
  },
  uploadLogoText: {
    color: '#fff',
  },
  input: {
    borderColor: '#fff',
    borderWidth: 1,
    padding: 10,
    color: '#fff',
    borderRadius: 5,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  continueButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default CreateTeam;
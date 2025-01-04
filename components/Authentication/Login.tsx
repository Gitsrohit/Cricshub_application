import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

const logo = require('/Users/iceberg/score/Frontend/assets/images/SCORE360.png');
const background = require('/Users/iceberg/score/Frontend/assets/images/bg.png');

const saveToken = async (token) => {
  try {
    if (token === undefined || token === null) {
      throw new Error('Token is undefined or null. Cannot save.');
    }
    const tokenString = typeof token === 'string' ? token : JSON.stringify(token);

    await AsyncStorage.setItem('jwtToken', tokenString);
    console.log('Token saved securely');
  } catch (error) {
    console.error('Error saving token securely:', error);
  }
};

const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('jwtToken');
    if (token) {
      console.log('Token retrieved successfully');
      console.log(token);
    } else {
      console.log('No token found');
    }
    return token;
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('jwtToken');
    console.log('Token removed securely');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

const Login = ({ navigation }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      alert('Please enter both Email and Password.');
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await axios.post(
        'https://score360-7.onrender.com/api/v1/auth/login',
        {
          username: formData.email,
          password: formData.password,
        }
      );
  
      console.log('API Response:', response.data); 
  
      if (response.data.success) {
        const token = response.data.data?.token;
        const userId = response.data.data?.user?.id; 
  
        if (!token || !userId) {
          throw new Error('Token or User ID is missing in the API response.');
        }
  
        console.log('Token:', token); 
        console.log('User ID:', userId); 
  
        await saveToken(token);
        await AsyncStorage.setItem('userUUID', userId);
  
        alert(`Welcome, ${formData.email}!`);
        navigation.replace('Main');
      } else {
        alert('Invalid credentials, please try again!');
      }
    } catch (error) {
      console.error('Login error:', error.response || error.message);
      if (error.response) {
        alert(`Error: ${error.response.status} - ${error.response.data.message}`);
      } else {
        alert('An error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  
  
  

  return (
    <LinearGradient
      colors={['#000000', '#0A303B', '#36B0D5']}
      style={styles.gradient}
    >
      <ImageBackground
        source={background}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.container}>
          <Image source={logo} style={styles.logo} />
          <BlurView intensity={50} tint="light" style={styles.loginContainer}>
            <View style={styles.glassyStroke}>
              <Text style={styles.title}>LOGIN</Text>
              <TextInput
                style={styles.input}
                placeholder="EMAIL"
                placeholderTextColor="#999"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                editable={!loading}
              />
              <TextInput
                style={styles.input}
                placeholder="PASSWORD"
                placeholderTextColor="#999"
                secureTextEntry
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                editable={!loading}
              />
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                <Text style={styles.loginButtonText}>
                  {loading ? 'Logging in...' : 'Login'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.signupText}>
                Don't have an account?{' '}
                <Text
                  style={styles.signupLink}
                  onPress={() => navigation.navigate('Registration')}
                >
                  Create a new account.
                </Text>
              </Text>
            </View>
          </BlurView>
        </View>
      </ImageBackground>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    resizeMode: 'cover',
    opacity: 0.8,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  loginContainer: {
    width: '90%',
    borderRadius: 15,
    overflow: 'hidden',
  },
  glassyStroke: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFF',
  },
  input: {
    width: '100%',
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
    color: '#333',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#004466',
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupText: {
    marginTop: 20,
    fontSize: 14,
    color: '#FFF',
  },
  signupLink: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
});

export default Login;

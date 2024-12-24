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
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient
import { BlurView } from 'expo-blur'; // Import BlurView for glassmorphism effect
import axios from 'axios';

const logo = require('/Users/iceberg/score/Frontend/assets/images/SCORE360.png');
const background = require('/Users/iceberg/score/Frontend/assets/images/bg.png');

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
        'https://d5f9-2405-201-a416-28cd-b8a7-f55d-8d9f-d25a.ngrok-free.app/api/v1/auth/login',
        {
          username: formData.email,
          password: formData.password,
        }
      );

      if (response.data.success) {
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
    opacity: 0.8, // Slight transparency for the background image
    height: '500%', // Reduce height for better appearance
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
    borderRadius: 15, // Smooth rounded corners
    overflow: 'hidden', // Ensure blur doesn't bleed outside
  },
  glassyStroke: {
    borderWidth: 2, // Semi-transparent border
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15, // Match container radius
    padding: 20, // Inner padding
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

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
import axios from 'axios'; // Import axios for API requests
import Registration from './Registration';
const logo = require('/Users/iceberg/score/Frontend/assets/images/SCORE360.png'); // Replace with your logo path
const background = require('/Users/iceberg/score/Frontend/assets/images/bg.png'); // Replace with your background image path

const Login = ({ navigation }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false); // For loading indicator

  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      alert('Please enter both Email and Password.');
      return;
    }

    setLoading(true); // Start loading

    // Make an API call to check if the user exists
    try {
      const response = await axios.post('https://75a5-2409-40e5-99-d714-90eb-25b2-6b0-51cb.ngrok-free.app/api/v1/auth/login', {
        username: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        // Successful login, navigate to Home screen
        alert(`Welcome, ${formData.email}!`);
        navigation.replace('CricketAppScreen'); // Replace 'Home' with your actual home screen name
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
      setLoading(false); // Stop loading
    }
  };

  return (
    <ImageBackground source={background} style={styles.background}>
      <View style={styles.container}>
        <Image source={logo} style={styles.logo} />
        <View style={styles.loginContainer}>
          <Text style={styles.title}>LOGIN</Text>
          <TextInput
            style={styles.input}
            placeholder="EMAIL"
            placeholderTextColor="#999"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            editable={!loading} // Disable input while loading
          />
          <TextInput
            style={styles.input}
            placeholder="PASSWORD"
            placeholderTextColor="#999"
            secureTextEntry
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            editable={!loading} // Disable input while loading
          />
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
            <Text style={styles.loginButtonText}>{loading ? 'Logging in...' : 'Login'}</Text>
          </TouchableOpacity>
          <Text style={styles.signupText}>
            Don't have an account?{' '}
            <Text style={styles.signupLink} onPress={() => navigation.navigate('Registration')}>
              Create a new account.
            </Text>
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  loginContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 40,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
    color: '#333',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#36B0D5',
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
    color: '#555',
  },
  signupLink: {
    color: '#004466',
    fontWeight: 'bold',
  },
});

export default Login;

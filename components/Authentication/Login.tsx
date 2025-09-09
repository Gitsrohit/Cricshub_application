import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Animated,
  Dimensions,
  Easing,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../APIservices'

const { height } = Dimensions.get('window');

const AppColors = {
  white: '#FFFFFF',
  blue: '#3498DB',
  background: '#F8F9FA',
  placeholder: '#A0A0A0',
  text: '#333333',
};

const appLogo = require('../../assets/images/iconLogo.png');
const downLogo = require('../../assets/images/textLogo.png');

const Login = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const logoAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(height * 0.1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(contentAnim, {
        toValue: 0,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = async () => {
    if (!phoneNumber) {
      Alert.alert('Validation Error', 'Please enter your phone number.');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService({
        endpoint: `auth/send`,
        method: 'POST',
        params: { phone: phoneNumber },
      });

      if (response.success) {
        Alert.alert('Success', 'OTP has been sent to your phone number.');
        navigation.navigate('OTP', { phoneNumber });
      } else {
        Alert.alert(
          'Error',
          `Error ${response.status}: ${response.error.message || 'Failed to send OTP.'}`
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please check your network connection.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={AppColors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoAnim,
                transform: [
                  { scale: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }
                ],
              }
            ]}
          >
            <Image
              source={appLogo}
              style={styles.logoImage}
            />
            <Image
              source={downLogo}
              style={styles.downLogoImage}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.formContainer,
              {
                transform: [{ translateY: contentAnim }]
              }
            ]}
          >
            <Text style={styles.welcomeText}>Welcome Aboard!</Text>
            <Text style={styles.tagline}>
              Transform your cricket experience with the ultimate platform for live scoring, YouTube streaming, tournament management, and fantasy cricket - all in one powerful app.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="PHONE NUMBER"
              placeholderTextColor={AppColors.placeholder}
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.button}
              onPress={handleGetStarted}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Processing...' : 'Get Started'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  keyboardAvoidingView: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  downLogoImage: {
    width: 200,
    height: 50,
    resizeMode: 'contain',
    marginTop: -10,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: AppColors.placeholder,
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 22,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: AppColors.white,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    color: AppColors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: AppColors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: AppColors.blue,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: AppColors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
    // Removed absolute positioning
  },
  buttonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Login;

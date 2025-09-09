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

const Otp = ({ route, navigation }) => {
  const { phoneNumber } = route.params;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);

  const otpInputs = useRef([]);

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

  const saveToken = async (token) => {
    try {
      if (token === undefined || token === null) {
        throw new Error('Token is undefined or null. Cannot save.');
      }
      const tokenString = typeof token === 'string' ? token : JSON.stringify(token);
      await AsyncStorage.setItem('jwtToken', tokenString);
    } catch (error) {
      console.error('Error saving token securely:', error);
    }
  };

  const handleOtpChange = (text, index) => {
    if (text.length > 1) {
      text = text.charAt(0);
    }
    
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text !== '' && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (text, index) => {
    if (text === '' && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otp.join('');
    console.log('Attempting to verify OTP:', fullOtp);
    console.log('Attempting to verify phone:', phoneNumber);
    if (fullOtp.length < 6) {
      Alert.alert('Validation Error', 'Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);

    try {
      const response = await apiService({
        endpoint: `auth/verify`,
        method: 'POST',
        params: {
          phone: phoneNumber,
          otp: fullOtp,
        },
      });

      if (response.success) {
        Alert.alert('Success', 'OTP verified successfully!');
        
        const token = response.data?.token;
        const userId = response.data?.user?.id;
        const name = response.data?.user?.name;

        if (!token || !userId) {
          throw new Error('Token or User ID is missing in the API response.');
        }

        await saveToken(token);
        await AsyncStorage.setItem('userUUID', userId);
        await AsyncStorage.setItem('userName', name);
        
        navigation.replace('Main');
      } else {
        if (response.status === 401) {
          Alert.alert(
            'Authentication Error',
            'Your session has expired or you are not authorized. Please restart the process.'
          );
        } else if (response.status === 400) {
          Alert.alert(
            'Invalid OTP',
            response.error.message || 'The entered OTP is incorrect or has expired. Please try again.'
          );
        } else {
          Alert.alert(
            'Error',
            `Error ${response.status}: ${response.error.message || 'Failed to verify OTP.'}`
          );
        }
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
            <Text style={styles.welcomeText}>OTP Verification</Text>
            <Text style={styles.tagline}>
              Please enter the 6-digit code sent to your phone number **{phoneNumber}**.
            </Text>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  style={styles.otpInput}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === 'Backspace') {
                      handleBackspace(digit, index);
                    }
                  }}
                  ref={el => otpInputs.current[index] = el}
                />
              ))}
            </View>
            <TouchableOpacity
              style={styles.button}
              onPress={handleVerifyOtp}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Verifying...' : 'Verify OTP'}
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  otpInput: {
    width: '15%',
    height: 50,
    backgroundColor: AppColors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    textAlign: 'center',
    fontSize: 20,
    color: AppColors.text,
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
  },
  buttonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Otp;

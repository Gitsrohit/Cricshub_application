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
import apiService from '../APIservices';
import { Ionicons } from '@expo/vector-icons'; 

const { height } = Dimensions.get('window');

const AppColors = {
  white: '#FFFFFF',
  blue: '#3498DB',
  background: '#F8F9FA',
  placeholder: '#A0A0A0',
  text: '#333333',
  darkBlue: '#1F2A44', 
  gray: '#CCCCCC',
  red: '#FF0000',
};

const appLogo = require('../../assets/images/iconLogo.png');
const downLogo = require('../../assets/images/textLogo.png');

const Otp = ({ route, navigation }) => {
  const { phoneNumber } = route.params;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60); // 60 seconds timer
  const [canResend, setCanResend] = useState(false);

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

  // Timer effect
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [timer]);

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

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setResendLoading(true);
    
    try {
      const response = await apiService({
        endpoint: `auth/send`,
        method: 'POST',
        params: {
          phone: phoneNumber,
        },
      });

      if (response.success) {
        Alert.alert('Success', 'OTP has been resent to your phone number.');
        setTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        otpInputs.current[0]?.focus();
      } else {
        Alert.alert(
          'Error',
          response.error.message || 'Failed to resend OTP. Please try again.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please check your network connection.');
      console.error(error);
    } finally {
      setResendLoading(false);
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

        const token = response.data?.data?.token;
        const userId = response.data?.data?.user?.id;
        const name = response.data?.data?.user?.name;
        const isOldUser = response.data?.data?.user?.email;

        if (!token || !userId) {
          throw new Error('Token or User ID is missing in the API response.');
        }

        await saveToken(token);
        await AsyncStorage.setItem('userUUID', userId);
        await AsyncStorage.setItem('userName', name);

        if (isOldUser) {
          navigation.replace('Main');
        } else {
          navigation.replace('registerForm');
        }
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

  const handleGoBack = () => {
    navigation.goBack();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={AppColors.background} />

      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Ionicons name="arrow-back" size={24} color={AppColors.darkBlue} />
      </TouchableOpacity>
      
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
            
            {/* Resend OTP Section */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              {canResend ? (
                <TouchableOpacity 
                  onPress={handleResendOtp} 
                  disabled={resendLoading}
                >
                  <Text style={styles.resendLink}>
                    {resendLoading ? 'Sending...' : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.timerText}>
                  Resend in {formatTime(timer)}
                </Text>
              )}
            </View>
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
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: AppColors.white,
    shadowColor: AppColors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
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
    marginBottom: 20,
  },
  buttonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  resendText: {
    fontSize: 14,
    color: AppColors.placeholder,
  },
  resendLink: {
    fontSize: 14,
    color: AppColors.blue,
    fontWeight: 'bold',
  },
  timerText: {
    fontSize: 14,
    color: AppColors.red,
    fontWeight: 'bold',
  },
});

export default Otp;
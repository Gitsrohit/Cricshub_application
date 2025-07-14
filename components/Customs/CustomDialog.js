import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
const CustomDialog = ({
  visible,
  title,
  message,
  type = 'success',
  onClose,
  showIcon = true,
  duration = 3000,
  position = 'top'
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const statusBarHeight = StatusBar.currentHeight || 0;
  const toastPosition = statusBarHeight + 20; 

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: toastPosition,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const bgColor = type === 'success' ? '#4CAF50' : '#F44336';
  const iconName = type === 'success' ? 'check-circle' : 'error';

  return (
    <SafeAreaView style={styles.safeArea} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.toastContainer,
          {
            backgroundColor: bgColor,
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
            top: position === 'top' ? 0 : undefined,
            bottom: position === 'bottom' ? 20 : undefined
          }
        ]}
      >
        <View style={styles.contentContainer}>
          {showIcon && (
            <MaterialIcons
              name={iconName}
              size={24}
              color="white"
              style={styles.icon}
            />
          )}
          <View style={styles.textContainer}>
            {title && <Text style={styles.title}>{title}</Text>}
            <Text style={styles.message}>{message}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 9999,
  },
  toastContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  message: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default CustomDialog;
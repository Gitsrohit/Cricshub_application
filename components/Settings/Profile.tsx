import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Feather"; // modern icons
import * as ImagePicker from "expo-image-picker";
import apiService from "../APIservices";
import axios from "axios";

const { width } = Dimensions.get("window");
const PlaceholderAnimation = ({ style, shouldAnimate }) => {
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    if (!shouldAnimate) {
      animation.setValue(0);
      return;
    }

    const loopAnimation = () => {
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (shouldAnimate) loopAnimation();
      });
    };

    loopAnimation();
    return () => animation.stopAnimation();
  }, [shouldAnimate]);

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View style={[styles.placeholderContainer, style]}>
      <Animated.View
        style={[
          styles.placeholderAnimation,
          { transform: [{ translateX }] },
        ]}
      />
    </View>
  );
};
const Notification = ({ message, type, visible }) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim]);

  if (!visible) return null;

  const bgColor = type === "success" ? "#4CAF50" : "#F44336";

  return (
    <Animated.View
      style={[
        styles.notificationContainer,
        { opacity: fadeAnim, backgroundColor: bgColor },
      ]}
    >
      <Icon
        name={type === "success" ? "check-circle" : "alert-circle"}
        size={20}
        color="#fff"
        style={styles.notificationIcon}
      />
      <Text style={styles.notificationText}>{message}</Text>
    </Animated.View>
  );
};

const Settings = ({ navigation }) => {
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    email: "",
    role: "",
    profilePicture: null,
  });
  const [loading, setLoading] = useState(true);
  const [editField, setEditField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  const showNotification = (message, type = "success") => {
    setNotification({ visible: true, message, type });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) {
        showNotification("Please login again", "error");
        return;
      }

      const response = await apiService({
        endpoint: "profile/current",
        method: "GET",
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to load profile data");
      }

      const profileData = response.data.data || response.data;

      setProfile({
        name: profileData.name || "",
        phone: profileData.phone || profileData.phoneNumber || "",
        email: profileData.email || "",
        role: profileData.role || "",
        profilePicture: profileData.logoPath
          ? `${profileData.logoPath}?${new Date().getTime()}`
          : null,
      });
    } catch (err) {
      console.error("Profile fetch error:", err);
      showNotification("Failed to load profile data", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateProfileData = async (updatedData) => {
    try {
      setIsUpdating(true);
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) {
        showNotification("Please login again", "error");
        return false;
      }
  
      const response = await apiService({
        endpoint: "profile/update",
        method: "PUT",
        body: updatedData,
      });
  
      if (!response.success) {
        throw new Error(response.error || "Failed to update profile");
      }

      setProfile((prev) => ({
        ...prev,
        ...updatedData,
      }));
  
      showNotification("Profile updated successfully");
      return true;
    } catch (err) {
      console.error("Update error:", err);
      showNotification("Failed to update profile", "error");
      return false;
    } finally {
      setIsUpdating(false);
    }
  };
  

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showNotification("Photo access permission required", "error");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setIsUploading(true);
        const newImageUri = result.assets[0].uri;

        setProfile((prev) => ({
          ...prev,
          profilePicture: newImageUri,
        }));

        const formData = new FormData();
        formData.append("profilePicture", {
          uri: newImageUri,
          type: "image/jpeg",
          name: "profile.jpg",
        });

        const token = await AsyncStorage.getItem("jwtToken");
        await axios.put(
          "https://score360-7.onrender.com/api/v1/profile/update",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        showNotification("Profile picture updated successfully");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      fetchProfile();
      showNotification("Failed to update profile picture", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (field) => {
    setEditField(field);
    setTempValue(profile[field]);
  };

  const handleSave = async () => {
    if (!tempValue.trim()) {
      showNotification("Field cannot be empty", "error");
      return;
    }
  
    let updatedData = {};
  
    if (editField === "phone") {
      updatedData = { phoneNumber: tempValue };
    } else if (editField === "name") {
      updatedData = { name: tempValue };
    }
  
    const success = await updateProfileData(updatedData);
    if (success) setEditField(null);
  };
  

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={["#34B8FF", "#0575E6"]}
          style={styles.gradientOverlay}
        >
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 200 }} />
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Notification
        visible={notification.visible}
        message={notification.message}
        type={notification.type}
      />
      <StatusBar
        barStyle="light-content"
        backgroundColor="#34B8FF"
        translucent={true}
      />
      <LinearGradient
        colors={["#34B8FF", "#0575E6"]}
        style={styles.gradientOverlay}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            style={{ padding: 5 }}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" size={26} color="white" />
          </TouchableOpacity>

          <View style={styles.profileContainer}>
            <TouchableOpacity
              style={styles.profileImageContainer}
              onPress={pickImage}
              disabled={isUploading}
            >
              {profile.profilePicture ? (
                <>
                  <Image
                    source={{ uri: profile.profilePicture }}
                    style={styles.profileImage}
                  />
                  {isUploading && (
                    <View style={styles.uploadOverlay}>
                      <ActivityIndicator size="large" color="#fff" />
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Icon name="user" size={60} color="#fff" />
                </View>
              )}
              <View style={styles.editPhotoButton}>
                <Icon name="camera" size={18} color="#fff" />
              </View>
            </TouchableOpacity>

            <View style={styles.infoContainer}>
              {["name", "phone"].map((field) => (
                <View style={styles.infoItem} key={field}>
                  {editField === field ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        style={styles.editInput}
                        value={tempValue}
                        onChangeText={setTempValue}
                        placeholder={`Enter your ${field}`}
                        autoFocus
                        keyboardType={field === "phone" ? "phone-pad" : "default"}
                      />
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                      >
                        {isUpdating ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Icon name="check" size={18} color="#fff" />
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => setEditField(null)}
                      >
                        <Icon name="x" size={18} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>
                        {field === "name" ? "Name:" : "Phone:"}
                      </Text>
                      <Text style={styles.infoValue}>{profile[field]}</Text>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEdit(field)}
                      >
                        <Icon name="edit-2" size={16} color="#34B8FF" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}

              <View style={styles.infoItem}>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>
                    {profile.email || "Not set"}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Role:</Text>
                  <Text style={styles.infoValue}>{profile.role}</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: StatusBar.currentHeight || 0,
    flex: 1,
  },
  gradientOverlay: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 0,
  },
  profileContainer: {
    alignItems: "center",
    marginTop: 30,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 30,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#34B8FF",
    shadowOpacity: 0.6,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 4 },
  },
  profileImagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  uploadOverlay: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  editPhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#34B8FF",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  infoContainer: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  infoItem: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 15,
  },
  infoTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoLabel: {
    color: "#333",
    fontSize: 16,
    fontWeight: "bold",
    width: 80,
  },
  infoValue: {
    color: "#555",
    fontSize: 16,
    flex: 1,
    marginLeft: 10,
  },
  editButton: {
    marginLeft: 10,
    padding: 6,
    backgroundColor: "rgba(52,184,255,0.1)",
    borderRadius: 8,
  },
  editContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  editInput: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    padding: 10,
    color: "#000",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 25,
    padding: 10,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: "#F44336",
    borderRadius: 25,
    padding: 10,
    marginLeft: 5,
  },
  notificationContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1000,
  },
  notificationIcon: {
    marginRight: 10,
  },
  notificationText: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
  },
});

export default Settings;

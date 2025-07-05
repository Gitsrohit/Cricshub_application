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
  ImageBackground,
  Dimensions,
  StatusBar,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";
import backgroundImage from "../../assets/images/cricsLogo.png";

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
        name={type === "success" ? "check-circle" : "exclamation-circle"}
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

      const response = await axios.get(
        "https://score360-7.onrender.com/api/v1/profile/current",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
      let errorMessage = "Failed to load profile data";
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = "Session expired. Please login again";
        } else {
          errorMessage = err.response.data?.message || errorMessage;
        }
      }
      showNotification(errorMessage, "error");
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

      const response = await axios.put(
        "https://score360-7.onrender.com/api/v1/profile/update",
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedProfile = response.data.data || response.data;
      setProfile((prev) => ({
        ...prev,
        ...updatedData,
        profilePicture: updatedProfile.profilePicturePath
          ? `${updatedProfile.profilePicturePath}?${new Date().getTime()}`
          : prev.profilePicture,
      }));

      showNotification("Profile updated successfully");
      return true;
    } catch (err) {
      console.error("Update error:", err);
      let errorMessage = "Failed to update profile";
      if (err.response) {
        errorMessage = err.response.data?.message || errorMessage;
      }
      showNotification(errorMessage, "error");
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
        const response = await axios.put(
          "https://score360-7.onrender.com/api/v1/profile/update",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const updatedProfile = response.data.data || response.data;
        setProfile((prev) => ({
          ...prev,
          name: updatedProfile.name || prev.name,
          phone:
            updatedProfile.phone || updatedProfile.phoneNumber || prev.phone,
          profilePicture: updatedProfile.profilePicturePath
            ? `${updatedProfile.profilePicturePath}?${new Date().getTime()}`
            : newImageUri,
        }));

        showNotification("Profile updated successfully");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      fetchProfile();
      showNotification(
        err.response?.data?.message || "Failed to update profile picture",
        "error"
      );
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

    const updatedData = {
      [editField]: tempValue,
    };

    const success = await updateProfileData(updatedData);
    if (success) {
      setEditField(null);
    }
  };

  const handleCancelEdit = () => {
    setEditField(null);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const renderPlaceholderField = (widthPercent = 70) => {
    return (
      <View style={styles.placeholderField}>
        <PlaceholderAnimation
          style={{ width: `${widthPercent}%` }}
          shouldAnimate={loading}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ImageBackground
          source={backgroundImage}
          style={styles.backgroundImage}
          imageStyle={styles.backgroundImageStyle}
        >
          <LinearGradient
            colors={["rgba(8, 102, 170, 0.2)", "rgba(107, 185, 240, 0.2)"]}
            style={styles.gradientOverlay}
          >
            <ScrollView contentContainerStyle={styles.scrollContent}>
              <View style={styles.profileContainer}>
                {/* Profile Image Placeholder */}
                <View style={styles.profileImageContainer}>
                  <View style={[styles.profileImagePlaceholder, styles.placeholderImage]}>
                    <PlaceholderAnimation
                      style={styles.placeholderImageAnimation}
                      shouldAnimate={loading}
                    />
                  </View>
                </View>

                {/* Info Placeholders */}
                <View style={styles.infoContainer}>
                  <View style={styles.infoItem}>
                    {renderPlaceholderField(60)}
                  </View>
                  <View style={styles.infoItem}>
                    {renderPlaceholderField(50)}
                  </View>
                  <View style={styles.infoItem}>
                    {renderPlaceholderField(70)}
                  </View>
                  <View style={styles.infoItem}>
                    {renderPlaceholderField(40)}
                  </View>
                </View>
              </View>
            </ScrollView>
          </LinearGradient>
        </ImageBackground>
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
      <ImageBackground
        source={backgroundImage}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <LinearGradient
          colors={["rgba(8, 102, 170, 0.2)", "rgba(107, 185, 240, 0.2)"]}
          style={styles.gradientOverlay}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <TouchableOpacity
              style={{ padding: 5 }}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Icon name="arrow-left" size={24} color="black" />
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
                      source={{
                        uri: profile.profilePicture,
                        cache: "reload",
                      }}
                      style={styles.profileImage}
                      onError={() => fetchProfile()}
                    />
                    {isUploading && (
                      <View style={styles.uploadOverlay}>
                        <ActivityIndicator size="large" color="#fff" />
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Image
                      source={require("../../assets/defaultLogo.png")}
                      style={styles.userImage}
                    />
                  </View>
                )}
                <View style={styles.editPhotoButton}>
                  <Icon name="camera" size={16} color="#fff" />
                </View>
              </TouchableOpacity>

              <View style={styles.infoContainer}>
                <View style={styles.infoItem}>
                  {editField === "name" ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        style={styles.editInput}
                        value={tempValue}
                        onChangeText={setTempValue}
                        autoFocus
                        placeholder="Enter your name"
                      />
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Icon name="check" size={18} color="#fff" />
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancelEdit}
                        disabled={isUpdating}
                      >
                        <Icon name="times" size={18} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Name:</Text>
                      <Text style={styles.infoValue}>{profile.name}</Text>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEdit("name")}
                        disabled={isUpdating || isUploading}
                      >
                        <Icon name="pencil" size={16} color="#4e8cff" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                <View style={styles.infoItem}>
                  {editField === "phone" ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        style={styles.editInput}
                        value={tempValue}
                        onChangeText={setTempValue}
                        keyboardType="phone-pad"
                        autoFocus
                        placeholder="Enter your phone"
                      />
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSave}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Icon name="check" size={18} color="#fff" />
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancelEdit}
                        disabled={isUpdating}
                      >
                        <Icon name="times" size={18} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Phone:</Text>
                      <Text style={styles.infoValue}>{profile.phone}</Text>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEdit("phone")}
                        disabled={isUpdating || isUploading}
                      >
                        <Icon name="pencil" size={16} color="#4e8cff" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Email Field (read-only) */}
                <View style={styles.infoItem}>
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>Email:</Text>
                    <Text style={styles.infoValue}>
                      {profile.email || "Not set"}
                    </Text>
                  </View>
                </View>

                {/* Role Field (read-only) */}
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
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: StatusBar.currentHeight || 0,
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  backgroundImageStyle: {
    opacity: 0.9,
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
    overflow: "hidden",
  },
  placeholderImageAnimation: {
    position: "absolute",
    width: "100%",
    height: "100%",
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
    backgroundColor: "#4e8cff",
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
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    padding: 5,
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
    borderRadius: 8,
    padding: 10,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: "#F44336",
    borderRadius: 8,
    padding: 10,
    marginLeft: 5,
  },
  notificationContainer: {
    position: "absolute",
    top: 40,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  notificationIcon: {
    marginRight: 10,
  },
  notificationText: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
  },
  userImage: {
    width: 160,
    height: 160,
    borderRadius: 40,
    marginBottom: 10,
  },
  placeholderContainer: {
    height: 20,
    backgroundColor: "#e1e1e1",
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
  },
  placeholderAnimation: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  placeholderField: {
    height: 20,
    marginBottom: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  placeholderImage: {
    backgroundColor: "#e1e1e1",
  },
});

export default Settings;
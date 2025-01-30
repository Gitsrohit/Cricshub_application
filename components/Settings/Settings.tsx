import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  SafeAreaView,
  ImageBackground,
  TextInput,
  Modal,
  Pressable,
  Button,
  TouchableOpacity,
  Image,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import bgImage from "../../assets/images/bg.png";
import { LinearGradient } from "expo-linear-gradient";
import IconSet from "react-native-vector-icons/FontAwesome";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";

const Settings = () => {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({
    name: "",
    phoneNumber: "",
    profilePicturePath: "",
  });

  const myIcon = <IconSet name="user" size={80} color="#fff" />;

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("Please login again");

      const response = await axios.get(
        "https://score360-7.onrender.com/api/v1/profile/current",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProfile(response.data);
      setUpdatedProfile({
        name: response.data.name,
        phoneNumber: response.data.phone,
        profilePicturePath: response.data.profilePicturePath || "",
      });
      setError("");
    } catch (err) {
      setError("Failed to load profile information");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status === "granted") {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1,
      });

      if (!result.canceled) {
        setUpdatedProfile((prev) => ({
          ...prev,
          profilePicturePath: result.assets[0].uri,
        }));
      }
    } else {
      alert("Permission to access media library is required!");
    }
  };

  const updateProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("Please login again");

      await axios.put(
        "https://score360-7.onrender.com/api/v1/profile/update",
        updatedProfile,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      // setProfile((prev) => ({ ...prev, ...updatedProfile }));
      setModalVisible(false);
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.settings}>
      <LinearGradient
        colors={['#000000', '#0A303B', '#36B0D5']}
        style={styles.gradient}
      >
        <ImageBackground
          source={bgImage} // Dynamically set the image source
          style={styles.cardBackground} // Added shadow styling
          imageStyle={styles.cardImage}
        >
          <View style={styles.settingsContent}>
            <View style={styles.userImageContainer}>
              <View style={styles.userImage}>{myIcon}</View>
              <Pressable
                style={styles.editIconContainer}
                onPress={() => setModalVisible(true)}
              >
                <IconSet name="edit" size={20} color="#fff" />
              </Pressable>
            </View>

            <View style={styles.namePhone}>
              <Text style={styles.headerHeading}>Name: <Text style={styles.headerValue}>{profile.name}</Text></Text>
              <Text style={styles.headerHeading}>Phone: <Text style={styles.headerValue}>{profile.phone}</Text></Text>
            </View>

            <BlurView intensity={80} style={styles.blurContainer}>
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>Player Statistics</Text>
            </BlurView>

            <BlurView intensity={180} style={styles.statisticsBlurContainer}>
              <Text style={styles.playerRole}>{profile.role}</Text>

              <View style={styles.statisticsContainer}>
                <Text style={styles.statisticsHeading}>Total Matches: </Text>
                <Text style={styles.statisticsValue}>{profile.totalMatchesPlayed}</Text>
              </View>

              <View style={styles.statisticsContainer}>
                <Text style={styles.statisticsHeading}>Total Runs: </Text>
                <Text style={styles.statisticsValue}>{profile.totalRuns}</Text>
              </View>

              <View style={styles.statisticsContainer}>
                <Text style={styles.statisticsHeading}>Total Wickets: </Text>
                <Text style={styles.statisticsValue}>{profile.totalWickets}</Text>
              </View>

              <View style={styles.statisticsContainer}>
                <Text style={styles.statisticsHeading}>Total 100: </Text>
                <Text style={styles.statisticsValue}>{profile.total100s}</Text>
              </View>

              <View style={styles.statisticsContainer}>
                <Text style={styles.statisticsHeading}>Total 50: </Text>
                <Text style={styles.statisticsValue}>{profile.total50s}</Text>
              </View>

              <View style={styles.statisticsContainer}>
                <Text style={styles.statisticsHeading}>Total Sixes: </Text>
                <Text style={styles.statisticsValue}>{profile.total50s}</Text>
              </View>

              <View style={styles.statisticsContainer}>
                <Text style={styles.statisticsHeading}>Total Fours: </Text>
                <Text style={styles.statisticsValue}>{profile.total50s}</Text>
              </View>
            </BlurView>
          </View>
        </ImageBackground>
      </LinearGradient>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Profile</Text>
            <TouchableOpacity onPress={pickImage} style={styles.userUpdatedImage}>
              {updatedProfile.profilePicturePath !== "" ? (
                <Image resizeMode="cover" source={{ uri: updatedProfile.profilePicturePath }} style={styles.bannerImage} />
              ) : (
                <Pressable style={styles.imagePickerButton} onPress={pickImage}>
                  <Text style={styles.imagePickerButtonText}>Pick Profile Picture</Text>
                </Pressable>
              )}
            </TouchableOpacity>
            <View style={styles.modalInputLabelContainer}>
              <Text style={styles.modalTitle}>Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Name"
                value={updatedProfile.name}
                onChangeText={(text) =>
                  setUpdatedProfile((prev) => ({ ...prev, name: text }))
                }
              />
            </View>
            <View style={styles.modalInputLabelContainer}>
              <Text style={styles.modalTitle}>Phone</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Phone Number"
                value={updatedProfile.phoneNumber}
                onChangeText={(text) =>
                  setUpdatedProfile((prev) => ({ ...prev, phoneNumber: text }))
                }
              />
            </View>

            <View style={styles.modalActions}>
              <Button title="Save" onPress={updateProfile} />
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  blurContainer: {
    padding: 6,
    borderRadius: 10,
    width: '60%',
    textAlign: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: 30,
    marginBottom: 30,
  },
  cardBackground: {
    width: '100%',
    height: '100%',
    marginBottom: 35,
  },
  cardImage: {
    resizeMode: 'cover',
    opacity: 0.5,
    borderRadius: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  gradient: {
    flex: 1,
  },
  headerHeading: {
    fontSize: 14,
    color: '#fff',
  },
  headerValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  imagePickerButton: {
    width: 100,
    height: 100,
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'black',
    marginTop: 10,
    marginBottom: 10
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  modalActions: {
    flexDirection: 'row',
    gap: 4
  },
  modalContainer: {
    overflow: 'hidden',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  modalContent: {
    height: 400,
    width: '80%',
    borderRadius: 20,
    backgroundColor: 'white',
    padding: 20,
    overflow: 'hidden',
  },
  modalInput: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'black',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalInputLabelContainer: {
    marginBottom: 10,
  },
  namePhone: {
    marginTop: 10,
  },
  playerRole: {
    marginBottom: 10,
    fontSize: 20,
    color: '#4e545c',
    textAlign: 'center'
  },
  settings: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  settingsContent: {
    flex: 1,
    marginVertical: 40,
    alignItems: 'center',
  },
  statisticsBlurContainer: {
    width: '80%',
    overflow: 'hidden',
    borderRadius: 10,
    padding: 10,
  },
  statisticsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  statisticsHeading: {
    fontSize: 20,
    color: '#4e545c',
    textAlign: 'left'
  },
  statisticsValue: {
    fontSize: 20,
    color: 'black',
    textAlign: 'right'
  },
  userImage: {
    backgroundColor: '#002B46',
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    borderRadius: '100%',
    borderWidth: 1,
    borderColor: '#fff'
  },
  userUpdatedImage: {
    marginTop: 10,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    borderRadius: '100%',
    borderWidth: 1,
    borderColor: '#fff'
  },
  userImageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  editIconContainer: {},
});